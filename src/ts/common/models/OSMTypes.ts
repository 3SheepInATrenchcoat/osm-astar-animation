export type OSMNodeId = number
export type OSMEdgeId = number

export interface OSMNode {
    type: "node"
    id: OSMNodeId;
    lon: number;
    lat: number;
}

export interface OSMEdge {
    "type": "way",
    "id": OSMEdgeId,
    "nodes": OSMNodeId[],
    "tags": {
        [key: string]: string | undefined

        "highway": string
        "maxspeed": string | undefined
    }
}

export interface OSM {
    version: number,
    generator: string,
    "osm3s": {
        "timestamp_osm_base": string,
        "timestamp_areas_base": string,
        "copyright": string
    },
    "elements": OSMType[]
}



export type OSMType = OSMNode | OSMEdge