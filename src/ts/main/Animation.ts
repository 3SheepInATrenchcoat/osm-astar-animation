import {GraphData, GraphEdge, GraphNode} from "../common/models/GraphTypes";
import Graph from "graphology";
import Sigma from "sigma";
import {NodeDisplayData} from "sigma/types";
import {NoNodeProgram} from "./Programs/NoNode/NoNodeProgram";
import {GraphContainer} from "./GraphContainer";
import {firstValueFrom, timestamp} from "rxjs";
import {
    buildExactGraphAnimation,
    buildFPSGraphAnimation,
    FPSGraphAnimationData,
    GraphAnimationData
} from "../common/models/AnimationTypes";

abstract class CustomAnimation implements Disposable {

    private _running = false
    
    get running(): boolean {
        return this._running;
    }

    private set running(value: boolean) {
        if (this._running != value) {
            console.debug(`Switching running value from ${this._running} to ${value}`);
        }
        
        this._running = value;
    }

    async start() {
        if (this.running) {
            return
        }

        let previousTimestamp = 0;

        await this.startHook()


        const customAnimation: CustomAnimation = this;
        function initialRunner(timestamp: number) {
            customAnimation.running = true;
            requestAnimationFrame(runner.bind(customAnimation));
            previousTimestamp = timestamp;

            customAnimation.draw(0)
        }

        function runner(timestamp: number) {
            if (!customAnimation.running) {
                return
            }

            requestAnimationFrame(runner.bind(customAnimation));
            customAnimation.draw(timestamp - previousTimestamp);
        }

        requestAnimationFrame(initialRunner.bind(customAnimation));
    }

    protected async restart() {
        if (!this.running) {
            return
        }
        

        this.running = false;
        await this.start()
    }

    protected async stop(){
        this.running = false
    }


    protected async startHook(){}


    abstract draw(deltaTime: number): void;
    abstract [Symbol.dispose](): void;
}


export class GraphAnimation extends CustomAnimation {
    private _graphData: GraphAnimationData<GraphNode, GraphEdge, GraphData> | null = null;

    private sigmaGraph: Graph<GraphNode, GraphEdge, GraphData> = new Graph<GraphNode, GraphEdge, GraphData>();
    private sigma: Sigma<GraphNode, GraphEdge, GraphData>;
    private graphContainer: GraphContainer;

    totalTime: number = 0

    constructor(canvas: HTMLCanvasElement, graphContainer: GraphContainer) {
        super();

        this.graphContainer = graphContainer;

        // TODO unsubscribe
        this.graphContainer.graph$.subscribe((graph) => {
            this._graphData = buildFPSGraphAnimation(buildExactGraphAnimation(graph), 10)
            this.sigmaGraph.clear()
        })

        this.sigma = new Sigma<GraphNode, GraphEdge, GraphData>(this.sigmaGraph, canvas, {
            nodeReducer: (node, data) => {
                let ret: Partial<NodeDisplayData> = {
                    ...data,
                    type: "noNode",
                    hidden: data.distanceFromStart == null || this.shouldHideNode(data.distanceFromStart)
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
            },

        })

        this.sigma.on("enterNode", (event) => {
            console.debug("enterNode", event);
        })
    }

    protected async startHook() {
        await super.startHook();

        console.debug("Called Start Hook")

        this.totalTime = 0
        await firstValueFrom(this.graphContainer.next())
    }


    protected shouldHideNode(distance: number): boolean {
        return this.totalTime < distance * 1000
    }


    draw(deltaTime: number) {
        const previousTime = this.totalTime;
        this.totalTime += deltaTime;

        if (this._graphData == null)
            return

        // TODO graph add





        this.sigma.refresh({
            skipIndexation: true    // labelGrid & program indexation are skipped (can be used if you haven't modified x, y, zIndex & size)
        })

        // restart when last node was shown
        if (!this.shouldHideNode(this._graphData.attributes.maxDistance))
            this.restart()
    }

    [Symbol.dispose](): void {
        this.stop()
        this.sigma.kill()
        this.sigmaGraph.clear()
    }


}