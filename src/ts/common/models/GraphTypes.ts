export enum GraphBuildState {
    NotFound,
    Building,
    Connected
}





export interface GraphNode {
    x: number;
    y: number;

    distanceFromStart: number
}

export interface GraphEdge {
    speed: number;
}