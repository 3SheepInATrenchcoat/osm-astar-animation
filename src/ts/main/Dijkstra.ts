import {isGraph} from "graphology-utils";
import {createEdgeWeightGetter, MinimalEdgeMapper} from "graphology-utils/getters";
import {Heap} from "mnemonist";
import Graph, {Attributes} from "graphology-types";

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
function abstractDijkstraMultisource<NodeAttributes extends {distanceFromStart: number} | Attributes, EdgeAttributes extends Attributes>(
    graph: Graph<NodeAttributes, EdgeAttributes>,
    sources: string[],
    getEdgeWeight: keyof EdgeAttributes | MinimalEdgeMapper<number, EdgeAttributes> | null,
    cutoff: number,
    target: string | null,
    paths: {[key: string]: string[]},
) {
    if (!isGraph(graph))
        throw new Error(
            'dijkstra: invalid graphology instance.'
        );

    if (target && !graph.hasNode(target))
        throw new Error(
            `dijkstra: the "${target}" target node does not exist in the given graph.`
        );



    // fix since `keyof EdgeAttributes` also allows numbers
    getEdgeWeight = createEdgeWeightGetter(
        <string | MinimalEdgeMapper<number, EdgeAttributes>>getEdgeWeight || DEFAULT_WEIGHT_ATTRIBUTE
    ).fromMinimalEntry;

    const distances: {[key: string]: number} = {}
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

        distances[node] = distance;
        graph.setNodeAttribute(node, "distanceFromStart", distance)

        if (node === target) break;

        const edges = graph.outboundEdges(node);

        for (let j = 0, m = edges.length; j < m; j++) {
            const edge = edges[j];
            const oppositeNode = graph.opposite(node, edge);
            const cost = getEdgeWeight(edge, graph.getEdgeAttributes(edge)) + distances[node];

            if (cutoff && cost > cutoff) continue;

            if (oppositeNode in distances && cost < distances[oppositeNode]) {
                throw Error(
                    'dijkstra: contradictory paths found. Do some of your edges have a negative weight?'
                );
            } else if (!(oppositeNode in seen) || cost < seen[oppositeNode]) {
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
    source: string,
    getEdgeWeight: keyof EdgeAttributes | MinimalEdgeMapper<number, EdgeAttributes> | null = null
) {
    const paths = {};

    abstractDijkstraMultisource(graph, [source], getEdgeWeight, 0, null, paths);

    return paths;
}