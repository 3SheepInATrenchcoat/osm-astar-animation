import {ReturnGraphEvent, WorkerGetEvent} from "../common/models/WorkerEvent";
import {UndirectedGraph} from "graphology";
import {OSMEdgeId, OSMType} from "../common/models/OSMTypes";

import exampleOSMData from "../common/data/example.json"
// import exampleOSMData from "../common/data/apeldoorn.json"
import {GraphEdge, GraphNode} from "../common/models/GraphTypes";
import {graphSetSingleSourceDistances} from "../main/Dijkstra";
import {Coordinates} from "sigma/types";


onmessage = (message: MessageEvent<WorkerGetEvent>) => {
    const data = message.data
    console.log(data)

    if (data.type == "getGraph") {
        let graph = new UndirectedGraph<GraphNode, GraphEdge>()

        exampleOSMData.elements.forEach((element: OSMType) => {
            if (element.type === "node") {
                graph.addNode(element.id, {
                    x: element.lon,
                    y: element.lat,

                    distanceFromStart: 0
                })
            }

            if (element.type === "way") {
                element.nodes
                    .slice(0, -1)
                    .map((id: OSMEdgeId, index: number) => [id, element.nodes[index + 1]])
                    .forEach(([start, end]) => {
                        try {
                            if (graph.areNeighbors(start, end)) {
                                return
                            }
                            graph.addEdge(start, end, {
                                speed: 20
                            })
                        } catch (e) {
                            console.error(e)
                        }
                    })
            }
        })
        // start node 1570775760

        const nodes = graph.nodes()
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];


        graphSetSingleSourceDistances(graph, startNode, (edge, attr) => {
            const [from, to] = graph.extremities(edge)

            const distance = haversineDistance(
                graph.getNodeAttributes(from),
                graph.getNodeAttributes(to)
            )

            const weight = distance * 1000

            return weight

        })


        const ret: ReturnGraphEvent = {
            type: "returnGraph",
            graph: graph.export()
        }

        postMessage(ret)
    }
}

function haversineDistance(a: Coordinates, b: Coordinates): number {
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


function euclideanDistance(a: Coordinates, b: Coordinates) {
    const dx = a.x - b.x
    const dy = a.y - b.y

    return Math.sqrt(dx * dx + dy * dy)
}