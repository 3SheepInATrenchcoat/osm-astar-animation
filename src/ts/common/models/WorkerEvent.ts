import {GraphData, GraphEdge, GraphNode, GraphLocation} from "./GraphTypes";
import {SerializedGraph} from "graphology-types"

export interface GetGraphEvent {
    type: "getGraph"
}

export interface ChangeGraphEvent {
    type: "changeGraph"
    location: GraphLocation
}

export interface ReturnGraphEvent {
    type: "returnGraph"
    graph: SerializedGraph<GraphNode, GraphEdge, GraphData>
}

export interface GraphReadyEvent {
    type: "readyGraph"
}


export interface GraphNotReadyEvent {
    type: "notReadyGraph"
}




export type WorkerGetEvent = GetGraphEvent | ChangeGraphEvent;
export type WorkerReturnEvent = ReturnGraphEvent | GraphReadyEvent | GraphNotReadyEvent;