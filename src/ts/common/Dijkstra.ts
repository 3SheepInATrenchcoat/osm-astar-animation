import {isGraph} from "graphology-utils";
import {createEdgeWeightGetter, MinimalEdgeMapper} from "graphology-utils/getters";
import {Heap} from "mnemonist";
import Graph, {Attributes} from "graphology-types";
import {DistanceFromStart, MaxDistance, NodeKey} from "./models/GraphTypes";

const DEFAULT_WEIGHT_ATTRIBUTE = 'weight';

function DIJKSTRA_HEAP_COMPARATOR(a: [number, number, string], b: [number, number, string]): number {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;

    if (a[1] > b[1]) return 1;
    if (a[1] < b[1]) return -1;

    if (a[2] > b[2]) return 1;
    if (a[2] < b[2]) return -1;

    return 0;
}




/**
 * Adapted from {@link https://github.com/graphology/graphology/blob/b5cd9a2f59016a0a124433c479b570af1f858b71/src/shortest-path/dijkstra.js#L182}
 */
function abstractDijkstraMultisource<
    NodeAttributes extends DistanceFromStart | Attributes,
    EdgeAttributes extends DistanceFromStart | Attributes,
    GraphAttributes extends MaxDistance | Attributes
>(
    graph: Graph<NodeAttributes, EdgeAttributes, GraphAttributes>,
    sources: NodeKey[],
    getEdgeWeight: keyof EdgeAttributes | MinimalEdgeMapper<number, EdgeAttributes> | null,
    cutoff: number,
    paths: {[key: NodeKey]: NodeKey[]},
) {
    if (!isGraph(graph))
        throw new Error(
            'dijkstra: invalid graphology instance.'
        );

    const _graph = <Graph<DistanceFromStart, DistanceFromStart, MaxDistance>>graph

    _graph.setAttribute("start", sources)

    // fix since `keyof EdgeAttributes` also allows numbers
    getEdgeWeight = createEdgeWeightGetter(
        <string | MinimalEdgeMapper<number, EdgeAttributes>>getEdgeWeight || DEFAULT_WEIGHT_ATTRIBUTE
    ).fromMinimalEntry;

    let maxDistance = 0
    const distances: Map<NodeKey, number> = new Map<NodeKey, number>()
    const seen: {[key: string]: number} = {}
    const fringe = new Heap(DIJKSTRA_HEAP_COMPARATOR);

    let count = 0;

    for (let sourceIndex = 0, l = sources.length; sourceIndex < l; sourceIndex++) {
        const node = sources[sourceIndex];
        seen[node] = 0;
        fringe.push([0, count++, node]);

        if (paths) paths[node] = [node];
    }

    while (fringe.size) {
        const [distance, _, node] = fringe.pop()!

        if (node in distances) continue;

        distances.set(node, distance);
        graph.setNodeAttribute(node, "distanceFromStart", distance)
        if (maxDistance < distance) {
            maxDistance = distance;
            graph.setAttribute("maxDistance", distance);
        }


        const edges = graph.outboundEdges(node);

        for (let j = 0, m = edges.length; j < m; j++) {
            const edge = edges[j];
            const oppositeNode = graph.opposite(node, edge);
            const cost = getEdgeWeight(edge, graph.getEdgeAttributes(edge)) + distance;

            if (cutoff && cost > cutoff) continue;

            if (distances.has(oppositeNode) && cost < distances.get(oppositeNode)!) {
                throw Error(
                    'dijkstra: contradictory paths found. Do some of your edges have a negative weight?'
                );
            }

            if (!(oppositeNode in seen) || cost < seen[oppositeNode]) {
                // means we haven't seen the other side of the edge (so we haven't been there)
                // OR the cost to get there from here is less than any other path found to get there.
                //      had we been there, that would have been the definite shortest path (so we haven't been there)
                // not having been there means that the current node is closer than the opposite node
                // so the shortest path to the edge is the same as the shortest path to this node
                graph.setEdgeAttribute(edge, "distanceFromStart", distance)
                graph.setEdgeAttribute(edge, "firstSeenDistance", distance)


                const firstSeenDistance = graph.getNodeAttribute(oppositeNode,"firstSeenDistance")
                if (firstSeenDistance == null || firstSeenDistance > distance){
                    graph.setNodeAttribute(oppositeNode,"firstSeenDistance", distance)
                }

                seen[oppositeNode] = cost;
                fringe.push([cost, count++, oppositeNode]);

                if (paths) paths[oppositeNode] = paths[node].concat(oppositeNode);
            }
        }
    }

    return distances;
}


export function graphSetSingleSourceDistances<NodeAttributes extends {distanceFromStart: number} | Attributes, EdgeAttributes extends Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    source: NodeKey,
    getEdgeWeight: keyof EdgeAttributes | MinimalEdgeMapper<number, EdgeAttributes> | null = null
): [{[key: NodeKey]: NodeKey[]}, Map<NodeKey, number>] {
    const paths: {[key: NodeKey]: NodeKey[]} = {};

    const distances = abstractDijkstraMultisource(graph, [source], getEdgeWeight, 0, paths);

    return [paths, distances];
}