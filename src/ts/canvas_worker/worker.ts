import {WorkerEvent} from "../common/models/WorkerEvent";
import {maxFpsWrapper} from "./AnimationWrapper";
import {MultiGraph} from "graphology";
import {OSMEdge, OSMEdgeId, OSMNode, OSMType} from "../common/models/OSMTypes";

import data from "../common/data/example.json"


class DrawWorker {
    canvas: OffscreenCanvas
    private graph: MultiGraph<OSMNode, OSMEdge>


    constructor(canvas: OffscreenCanvas, maxFps: number) {
        this.canvas = canvas
        this.graph = new MultiGraph<OSMNode, OSMEdge>()


        data.elements.forEach((element: OSMType) => {
            if (element.type === "node") {
                this.graph.addNode(element.id, element)
            }

            if (element.type === "way") {
                element.nodes
                    .slice(0, -1)
                    .map((id: OSMEdgeId, index: number) => [id, element.nodes[index + 1]])
                    .forEach(([start, end]) => {
                        try {
                            this.graph.addEdge(start, end, element)
                        } catch (e) {
                            console.error(e)
                        }
                    })

            }
        })


        requestAnimationFrame(maxFpsWrapper(this.runAnimation.bind(this), maxFps))
    }


    resize(width: number, height: number) {
        if (this.canvas == null) {
            return
        }

        this.canvas.height = height
        this.canvas.width = width
    }


    runAnimation(deltaTime: number) {
        let context = this.canvas.getContext("2d")




        // console.log(deltaTime)
    }

}


let worker: DrawWorker | null = null

onmessage = (message: MessageEvent<WorkerEvent>) => {
    const data = message.data
    console.log(data)

    if (data.type == "init") {
        worker = new DrawWorker(data.canvas, data.maxFps)
    }
    if (data.type == "resize") {
        worker?.resize(data.width, data.height)
    }
}
