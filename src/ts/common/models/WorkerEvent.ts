export interface GetGraphEvent {
    type: "getGraph"
}

export interface ReturnGraphEvent {
    type: "returnGraph"
    graph: any
}



export type WorkerGetEvent = GetGraphEvent
export type WorkerReturnEvent = ReturnGraphEvent