import Graph, {UndirectedGraph} from "graphology";
import {
    apeldoornData,
    ChangeGraphEvent,
    findorffData,
    GetGraphEvent,
    GraphData,
    GraphEdge,
    GraphNode,
    GraphNotReadyEvent,
    GraphReadyEvent,
    graphSetSingleSourceDistances, GraphLocation,
    OSM,
    OSMEdgeId,
    OSMType,
    ReturnGraphEvent
} from "../common";
import {Coordinates} from "sigma/types";
import {
    combineLatest,
    distinctUntilChanged,
    map,
    Observable,
    of,
    Subject, Subscription,
    switchMap
} from "rxjs";
import {DeltaTimeSpliterator} from "../common/DeltaTimeSpliterator";
import {MultiMap} from "mnemonist";

export class GraphWorker {
    locationSubject = new Subject<GraphLocation>();
    nextGraphSubject = new Subject<void>();

    private _graphSubscription: Subscription;

    constructor() {
        const locationSwitcher = this.locationSubject.pipe(
            distinctUntilChanged(),
            switchMap((location) => {
                return this.generateGraph(location)
            })
        )



        const graph$ = combineLatest([
            locationSwitcher,
            this.nextGraphSubject
        ]).pipe(
            switchMap(([graph]) => {
                return this.generateDistances(graph)
            })
        )

        this._graphSubscription = graph$.subscribe((graph) => {
            const ret: ReturnGraphEvent = {
                type: "returnGraph",
                graph: graph.export()
            }

            postMessage(ret)
        })


    }

    static haversineDistance(a: Coordinates, b: Coordinates): number {
        const toRad = (value: number) => (value * Math.PI) / 180; // Convert degrees to radians
        const R = 6371; // Radius of the Earth in kilometers


        const dx = b.x - a.x
        const dy = b.y - a.y

        const dLat = toRad(dy);
        const dLon = toRad(dx);
        const d =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(a.y)) * Math.cos(toRad(b.y)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1 - d));
        return R * c; // Distance in kilometers
    }

    static euclideanDistance(a: Coordinates, b: Coordinates): number {
        const dx = a.x - b.x
        const dy = a.y - b.y

        return Math.sqrt(dx * dx + dy * dy)
    }

    changeGraph(data: ChangeGraphEvent) {
        this.locationSubject.next(data.location)
    }

    getGraph(data: GetGraphEvent) {
        this.nextGraphSubject.next()
    }


    generateGraph(location: GraphLocation): Observable<Graph<GraphNode, GraphEdge, GraphData>> {
        return this.getOSMData(location)
            .pipe(
                map((OSMData) => {
                    const graph = new UndirectedGraph<GraphNode, GraphEdge, GraphData>()
                    graph.setAttribute("location", location)

                    OSMData.elements.forEach((element: OSMType) => {
                        if (graph == null) {
                            throw new Error("Invalid State (shouldn't happen)")
                        }

                        if (element.type === "node") {
                            graph.addNode(element.id, {
                                x: element.lon,
                                y: element.lat,

                                distanceFromStart: null,
                                firstSeenDistance: null
                            })
                        }

                        if (element.type === "way") {
                            element.nodes
                                .slice(0, -1)
                                .map((id: OSMEdgeId, index: number) => [id, element.nodes[index + 1]])
                                .forEach(([start, end]) => {
                                    if (graph == null) {
                                        throw new Error("Invalid State (shouldn't happen)")
                                    }

                                    try {
                                        if (graph.areNeighbors(start, end)) {
                                            return
                                        }
                                        graph.addEdge(start, end, {
                                            speed: 20,

                                            distanceFromStart: null,
                                            firstSeenDistance: null,
                                        })
                                    } catch (e) {
                                        console.error(e)
                                    }
                                })
                        }
                    })

                    return graph
                })
            )

    }

    generateDistances(graph: Graph<GraphNode, GraphEdge, GraphData>): Observable<Graph<GraphNode, GraphEdge, GraphData>> {
        // TODO make this cancelable

        const nodes = graph.nodes()
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];

        const [paths, distances] = graphSetSingleSourceDistances(graph, startNode, (edge) => {
            const [from, to] = graph.extremities(edge)

            const distance = GraphWorker.haversineDistance(
                graph.getNodeAttributes(from),
                graph.getNodeAttributes(to)
            )

            return distance * 1000
        })

        console.log(distances)
        const event: GraphReadyEvent = {
            type: "readyGraph",
        }

        const groupedMap = new MultiMap<number, string>()

        Array
            .from(distances.entries())
            .sort(([, d1], [, d2]) => d1 - d2)
            .forEach(([node, distance]) => {
                groupedMap.set(distance, node)
            })


        postMessage(event)

        return of(graph)
    }


    getOSMData(location: GraphLocation): Observable<OSM> {
        if (location == "Findorff") {
            return of(findorffData)
        }
        if (location == "Apeldoorn") {
            return of(<OSM>apeldoornData)
        }

        return of(<OSM>apeldoornData)
    }

    raiseNotReadyEvent() {
        const ret: GraphNotReadyEvent = {
            type: "notReadyGraph",
        }
        postMessage(ret)
    }

}