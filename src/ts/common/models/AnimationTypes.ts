import {NodeKey, DistanceFromStart} from "./GraphTypes";
import {Attributes, SerializedGraph} from "graphology-types";


export interface ExactGraphAnimationData<
    NodeAttributes extends DistanceFromStart,
    EdgeAttributes extends DistanceFromStart,
    GraphAttributes extends Attributes
> {
    type: "exact"

    attributes: GraphAttributes
    steps: Map<number, GraphStep<NodeAttributes, EdgeAttributes>[]>
}

export interface FPSGraphAnimationData<
    NodeAttributes extends DistanceFromStart,
    EdgeAttributes extends DistanceFromStart,
    GraphAttributes extends Attributes
> {
    type: "fps"
    fps: number

    attributes: GraphAttributes
    steps: Map<number, GraphStep<NodeAttributes, EdgeAttributes>[]>
}



export interface GraphNodeStep<
    NodeAttributes,
> {
    type: "node"
    start: number

    key: NodeKey
    attributes: NodeAttributes
}

export interface GraphEdgeStep<
    EdgeAttributes
> {
    type: "edge"

    start: number
    source: NodeKey
    target: NodeKey

    attributes: EdgeAttributes
}


export type GraphStep<
    NodeAttributes,
    EdgeAttributes,
> =
    | GraphNodeStep<NodeAttributes>
    | GraphEdgeStep<EdgeAttributes>


export type GraphAnimationData<
    NodeAttributes extends DistanceFromStart,
    EdgeAttributes extends DistanceFromStart,
    GraphAttributes extends Attributes
> =
    | ExactGraphAnimationData<NodeAttributes, EdgeAttributes, GraphAttributes>
    | FPSGraphAnimationData<NodeAttributes, EdgeAttributes, GraphAttributes>


export function buildFPSGraphAnimation<
    NodeAttributes extends DistanceFromStart,
    EdgeAttributes extends DistanceFromStart,
    GraphAttributes extends Attributes
> (
    graphAnimation: GraphAnimationData<NodeAttributes, EdgeAttributes, GraphAttributes>,
    fps: number): FPSGraphAnimationData<NodeAttributes, EdgeAttributes, GraphAttributes>  {

    const steps = new Map<number, GraphStep<NodeAttributes, EdgeAttributes>[]>

    graphAnimation.steps.forEach((value, key) => {
        const newKey: number = Math.floor(key * fps) / fps

        let step: GraphStep<NodeAttributes, EdgeAttributes>[]
        if (steps.has(key))
            step = steps.get(key)!
        else
            step = []


        steps.set(newKey, step.concat(value))
    })

    return {
        type: "fps",
        fps: fps,

        attributes: graphAnimation.attributes,
        steps: steps,
    }
}


export function buildExactGraphAnimation<
    NodeAttributes extends DistanceFromStart,
    EdgeAttributes extends DistanceFromStart,
    GraphAttributes extends Attributes>
(graph: SerializedGraph<NodeAttributes, EdgeAttributes, GraphAttributes>): ExactGraphAnimationData<NodeAttributes, EdgeAttributes, GraphAttributes> {

    const steps = new Map<number, GraphStep<NodeAttributes, EdgeAttributes>[]>

    graph.nodes.forEach(serializedNode => {
        const node = serializedNode.key
        const attributes = serializedNode.attributes!

        if (attributes.firstSeenDistance == null)
            return


        let step: GraphStep<NodeAttributes, EdgeAttributes>[]
        if (steps.has(attributes.firstSeenDistance))
            step = steps.get(attributes.firstSeenDistance)!
        else
            step = []

        step.push({
            type: "node",
            start: attributes.firstSeenDistance,

            key: node,
            attributes: attributes,
        })

        steps.set(attributes.firstSeenDistance, step)
    })

    graph.edges.forEach(serializedEdge => {
        const edge = serializedEdge.key
        const attributes = serializedEdge.attributes!
        const source = serializedEdge.source
        const target = serializedEdge.target


        if (attributes.firstSeenDistance == null)
            return



        let step: GraphStep<NodeAttributes, EdgeAttributes>[]
        if (steps.has(attributes.firstSeenDistance))
            step = steps.get(attributes.firstSeenDistance)!
        else
            step = []


        step.push({
            type: "edge",

            start: attributes.firstSeenDistance,

            source: source,
            target: target,

            attributes: attributes,
        })

        steps.set(attributes.firstSeenDistance, step)
    })


    return {
        type: "exact",
        attributes: graph.attributes,
        steps: steps
    }

}