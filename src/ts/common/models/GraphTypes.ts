export enum GraphLocation {
    Findorff = "Findorff",
    Apeldoorn = "Apeldoorn",
}

export type NodeKey = string


export interface DistanceFromStart {
    distanceFromStart: number | null
    firstSeenDistance: number | null
}
export interface MaxDistance {
    maxDistance: number
    start: NodeKey[]
}



export interface GraphNode extends DistanceFromStart {
    x: number;
    y: number;
}

export interface GraphEdge extends DistanceFromStart {
    speed: number;
}

export interface GraphData extends MaxDistance{
    location: GraphLocation
}
