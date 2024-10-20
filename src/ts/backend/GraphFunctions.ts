// import {PriorityQueue} from "./PriorityQueue";
// import {Graph} from "./Graph";
// import {OSMTypes, OSMNodeId} from "./OSMTypes";
//
//
//
//
// // Heuristic function (Euclidean distance)
// function euclideanDistance(node1, node2, graph) {
//     const [x1, y1] = graph.getNodeCoord(node1);
//     const [x2, y2] = graph.getNodeCoord(node2);
//     return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
// }
//
// // Custom weight function combining edge weight with Euclidean distance
// function customWeight(node1, node2, graph) {
//     const edgeWeight = graph.getEdgeWeight(node1, node2);
//     return edgeWeight + euclideanDistance(node1, node2, graph);
// }
//
// // A* algorithm with progress yielding
// export function* astarWithProgress(graph: Graph<OSMTypes>, startId: OSMNodeId, goalId: OSMNodeId) {
//     const openSet = new PriorityQueue<OSMNodeId>();
//     openSet.enqueue(0, startId);
//
//     const cameFrom = {};
//     const gScore = Object.fromEntries(Object.keys(graph.nodes).map(node => [node, Infinity]));
//     gScore[startId] = 0;
//
//     const fScore = Object.fromEntries(Object.keys(graph.nodes).map(node => [node, Infinity]));
//     fScore[startId] = euclideanDistance(startId, goalId, graph);
//
//     const openSetHash = new Set([startId]);
//
//     while (!openSet.isEmpty()) {
//         const current = openSet.dequeue();
//         if (current === null) { throw Error("Invalid state")}
//
//         openSetHash.delete(current);
//
//         if (current === goalId) {
//             yield { status: 'goal_reached', current };
//             return reconstructPath(cameFrom, current);
//         }
//
//         const adjacentNodes = graph.adjacent(current);
//
//         for (let neighbor of graph.adjacent(current)) {
//             const tentativeGScore = gScore[current] + customWeight(current, neighbor, graph);
//
//             if (tentativeGScore < gScore[neighbor]) {
//                 cameFrom[neighbor] = current;
//                 gScore[neighbor] = tentativeGScore;
//                 fScore[neighbor] = gScore[neighbor] + euclideanDistance(neighbor, goalId, graph);
//
//                 if (!openSetHash.has(neighbor)) {
//                     openSet.enqueue(fScore[neighbor], neighbor);
//                     openSetHash.add(neighbor);
//                     yield { status: 'exploring', startNode: current, endNode: neighbor, edgeWeight: graph.getEdgeWeight(current, neighbor) };
//                 }
//             }
//         }
//     }
//
//     yield { status: 'no_path' };
//     return null;
// }
//
// // Reconstruct the path from the 'cameFrom' map
// function reconstructPath(cameFrom, current) {
//     const totalPath = [current];
//     while (cameFrom[current] !== undefined) {
//         current = cameFrom[current];
//         totalPath.push(current);
//     }
//     return totalPath.reverse();
// }
