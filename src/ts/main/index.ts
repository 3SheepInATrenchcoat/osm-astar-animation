import {GetGraphEvent, WorkerReturnEvent} from "../common/models/WorkerEvent";
import Sigma from "sigma";
import Graph from "graphology";
import {GraphEdge, GraphNode} from "../common/models/GraphTypes";
import {NodeDisplayData} from "sigma/types";
import {NoNodeProgram} from "./Programs/NoNode/NoNodeProgram";

export function app() {
    console.log("TypeScript works");


    startDraw()

}


let sigma: Sigma<GraphNode, GraphEdge> | null = null;

function startDraw() {
    let canvas = document.getElementById("sigmaContainer") as HTMLElement | null;
    if (canvas == null)
        return


    const worker = new Worker(new URL('../canvas_worker/worker.ts', import.meta.url))
    worker.onmessage = (e: MessageEvent<WorkerReturnEvent>) => {
        const data = e.data;

        if (data.type == "returnGraph") {
            let graph = new Graph<GraphNode, GraphEdge>()
            graph = graph.import(data.graph)

            console.log(graph)

            sigma = new Sigma<GraphNode, GraphEdge>(graph, canvas, {
                nodeReducer: (node, data) => {
                    let ret: Partial<NodeDisplayData> = {
                        ...data,
                        size: 0,
                        color: "red",
                        type: "circle"
                    };

                    return ret
                },
                edgeReducer: (edge, data) => {
                    return {
                        ...data,
                        size: 1
                    }
                },
                nodeProgramClasses: {
                    noNode: NoNodeProgram<GraphNode, GraphEdge>
                }
            })

            sigma.on("enterNode", (event) => {
                console.log("enterNode", event);
            })

        }

    }

    const drawEvent: GetGraphEvent = {
        type: "getGraph"
    }

    worker.postMessage(drawEvent);
}