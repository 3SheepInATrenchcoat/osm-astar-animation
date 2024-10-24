import {GraphAnimation} from "./Animation";
import {GraphContainer} from "./GraphContainer";
import {GraphLocation} from "../common";


export function app() {
    startDraw()
}
let graphAnimation: GraphAnimation | null = null;

function startDraw() {
    let canvas = document.getElementById("sigmaContainer") as HTMLCanvasElement | null;


    if (canvas == null)
        return

    const graphContainer = new GraphContainer()
    graphAnimation = new GraphAnimation(canvas, graphContainer)

    graphAnimation.start()
    graphContainer.setLocation(GraphLocation.Findorff)
}