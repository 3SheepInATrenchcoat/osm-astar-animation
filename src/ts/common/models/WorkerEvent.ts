export interface ResizeEvent {
    type: "resize"
    width: number
    height: number
}

export interface InitEvent {
    type: "init"
    canvas: OffscreenCanvas
    maxFps: number
}



export type WorkerEvent = ResizeEvent | InitEvent