import { Attributes } from "graphology-types";
import { NodeProgram, ProgramInfo } from "sigma/rendering";
import { NodeDisplayData, RenderParams } from "sigma/types";
import { floatColor } from "sigma/utils";

import FRAGMENT_SHADER_SOURCE from "./nonode-frag.glsl";
import VERTEX_SHADER_SOURCE from "./nonode-vert.glsl";

const { UNSIGNED_BYTE, FLOAT } = WebGLRenderingContext;

const UNIFORMS = ["u_sizeRatio", "u_correctionRatio", "u_matrix"] as const;

const PI = Math.PI;


/**
 * Renders no Node.
 * This only happens to work, it is copied directly from {@link https://github.com/jacomyal/sigma.js/blob/721e45c0a31db9cf47b88ccbc41a0b71793a1af7/packages/storybook/stories/1-core-features/5-custom-rendering/index.ts}.
 * I don't know why it doesn't render, but since I set up to make the node invisible it did end up achieving my goal (by accident).
 *
 * @experimental
 */
export class NoNodeProgram<
    N extends Attributes = Attributes,
    E extends Attributes = Attributes,
    G extends Attributes = Attributes,
> extends NodeProgram<(typeof UNIFORMS)[number], N, E, G> {
    getDefinition() {
        return {
            VERTICES: 6,
            VERTEX_SHADER_SOURCE: VERTEX_SHADER_SOURCE,
            FRAGMENT_SHADER_SOURCE: FRAGMENT_SHADER_SOURCE,
            METHOD: WebGLRenderingContext.TRIANGLES,
            UNIFORMS,
            ATTRIBUTES: [
                { name: "a_position", size: 2, type: FLOAT },
                { name: "a_size", size: 1, type: FLOAT },
                { name: "a_color", size: 4, type: UNSIGNED_BYTE, normalized: true },
                { name: "a_id", size: 4, type: UNSIGNED_BYTE, normalized: true },
            ]
        };
    }

    processVisibleItem(nodeIndex: number, startIndex: number, data: NodeDisplayData) {
        const array = this.array;

        array[startIndex++] = data.x;
        array[startIndex++] = data.y;
        array[startIndex++] = data.size;
        array[startIndex++] = floatColor(data.color);
        array[startIndex++] = nodeIndex;
    }

    setUniforms(params: RenderParams, { gl, uniformLocations }: ProgramInfo): void {
        const { u_sizeRatio, u_pixelRatio, u_matrix } = uniformLocations;

        gl.uniform1f(u_sizeRatio, params.sizeRatio);
        gl.uniform1f(u_pixelRatio, params.pixelRatio);
        gl.uniformMatrix3fv(u_matrix, false, params.matrix);
    }
}