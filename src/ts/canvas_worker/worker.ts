import {GraphData, GraphEdge, GraphNode, WorkerGetEvent} from "../common";
import Graph from "graphology";
import {GraphWorker} from "./GraphWorker";


const graphWorker = new GraphWorker()
let graph: Graph<GraphNode, GraphEdge, GraphData> | null = null;
onmessage = (message: MessageEvent<WorkerGetEvent>) => {
    const data = message.data

    if (data.type == "changeGraph"){
        graphWorker.changeGraph(data)
    }

    if (data.type == "getGraph") {
        graphWorker.getGraph(data)
    }
}

