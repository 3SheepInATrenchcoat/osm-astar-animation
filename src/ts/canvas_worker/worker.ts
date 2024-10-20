import {ReturnGraphEvent, WorkerGetEvent} from "../common/models/WorkerEvent";
import {UndirectedGraph} from "graphology";
import {OSMEdgeId, OSMType} from "../common/models/OSMTypes";

// import exampleOSMData from "../common/data/example.json"
import exampleOSMData from "../common/data/apeldoorn.json"
import {GraphEdge, GraphNode} from "../common/models/GraphTypes";


onmessage = (message: MessageEvent<WorkerGetEvent>) => {
    const data = message.data
    console.log(data)

    if (data.type == "getGraph") {
        let graph = new UndirectedGraph<GraphNode, GraphEdge>()

        exampleOSMData.elements.forEach((element: OSMType) => {
            if (element.type === "node") {
                graph.addNode(element.id, {
                    x: element.lon,
                    y: element.lat
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
                            graph.addEdge(start, end, {})
                        } catch (e) {
                            console.error(e)
                        }
                    })

            }
        })

        const ret: ReturnGraphEvent = {
            type: "returnGraph",
            graph: graph.export()
        }

        postMessage(ret)
    }
}
