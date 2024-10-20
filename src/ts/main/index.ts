import {InitEvent, ResizeEvent} from "../common/models/WorkerEvent";


export function app() {
    console.log("TypeScript works");


    startDraw()



}


function startDraw() {
    let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement | null;
    if (canvas == null)
        return

    let offscreenCanvas = canvas.transferControlToOffscreen()

    const worker = new Worker(new URL('../canvas_worker/worker.ts', import.meta.url))
    window.addEventListener("resize", (event) => {
        let canvas = document.getElementById("mainCanvas") as HTMLCanvasElement | null;

        if (canvas == null)
            return

        const resizeEvent: ResizeEvent = {
            type: "resize",
            width: window.innerWidth,
            height: window.innerHeight
        }

        worker.postMessage(resizeEvent);
    })


    const drawEvent: InitEvent = {
        type: "init",
        canvas: offscreenCanvas,
        maxFps: 0
    }

    worker.postMessage(drawEvent, [offscreenCanvas]);
}