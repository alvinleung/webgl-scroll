import { snapshot, subscribe } from "valtio";
import { ScrollItems } from "./VirtualScroll";
import { CleanupProtocol } from "./utils/CleanupProtocol";
import * as twgl from "twgl.js";
import { deleteTwglBufferInfo } from "./utils/deleteTwglBufferInfo";
import PlaneInfo from "./PlaneInfo";
import ShaderProgram from "./rendering/shader/ShaderProgram";
import { Texture } from "./rendering/texture/Texture";

interface PlanesUpdaterConfig {
  items: ScrollItems;
  gl: WebGLRenderingContext;
}

type PlaneRenderInfo = {
  buffer: twgl.BufferInfo;
  shaderProgram: ShaderProgram;
  uniforms: { [key: string]: any };
};

/**
 * PlaneUpdater class acts as a glue between the valtio state
 * which hold all the items and the actual WebGL rendering, it provide
 * a list of renderable planes to the renderer.
 */
export class PlanesUpdater implements CleanupProtocol {
  private planesBufferInfo: twgl.BufferInfo[] = [];
  private unsubscribeScrollItems: Function;
  private gl: WebGLRenderingContext;

  private _planes: PlaneInfo[] | undefined;

  constructor({ items, gl }: PlanesUpdaterConfig) {
    this.gl = gl;
    this.unsubscribeScrollItems = subscribe(
      items,
      (() => this.updatePlanesBuffer(gl, items)).bind(this)
    );
    // trigger the initial update
    this.updatePlanesBuffer(gl, items);
  }

  private updatePlanesBuffer(gl: WebGLRenderingContext, items: ScrollItems) {
    // cleanup previous
    this.cleanupPlaneBuffer();

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this._planes = Object.values(items);

    // create a quad
    this.planesBufferInfo = Object.values(items).map((plane, index) => {
      const arr = this.getQuadInNDC(plane, windowWidth, windowHeight);
      return twgl.createBufferInfoFromArrays(gl, arr);
    });
  }

  private getQuadInNDC(
    plane: PlaneInfo,
    windowWidth: number,
    windowHeight: number
  ) {
    const { ndcX, ndcY, ndcWidth, ndcHeight } = this.mapToNDCTopLeft(
      plane,
      windowWidth,
      windowHeight
    );

    const leftEdge = ndcX;
    const rightEdge = ndcX + ndcWidth;
    const topEdge = ndcY;
    const bottomEdge = ndcY - ndcHeight;

    return {
      a_position: [
        leftEdge,
        topEdge,
        0,
        rightEdge,
        topEdge,
        0,
        leftEdge,
        bottomEdge,
        0,
        leftEdge,
        bottomEdge,
        0,
        rightEdge,
        topEdge,
        0,
        rightEdge,
        bottomEdge,
        0,
      ],
    };
  }

  private mapToNDCTopLeft(
    plane: PlaneInfo,
    screenWidth: number,
    screenHeight: number
  ) {
    const { x, y, width, height } = plane;

    // Convert the top-left corner to centered NDC coordinates
    const ndcX = (x / screenWidth) * 2 - 1;
    const ndcY = 1 - (y / screenHeight) * 2;

    const ndcWidth = (width / screenWidth) * 2;

    const ndcHeight = (height / screenHeight) * 2;

    return {
      ndcX,
      ndcY,
      ndcWidth,
      ndcHeight,
    };
  }

  private cleanupPlaneBuffer() {
    const gl = this.gl;
    this.planesBufferInfo.forEach((bufferInfo) => {
      deleteTwglBufferInfo(gl, bufferInfo);
    });
  }

  public getPlaneRenderInfo(
    gl: WebGLRenderingContext,
    index: number
  ): PlaneRenderInfo | null {
    if (this._planes === undefined) return null;

    const plane = this._planes[index];

    const processedUniforms: { [key: string]: any } = {};
    for (const uniformKey in plane.uniforms) {
      const uniformValue = plane.uniforms[uniformKey];
      const isUniformTexture = uniformValue instanceof Texture;
      if (!isUniformTexture) {
        processedUniforms[uniformKey] = uniformValue;
        continue;
      }
      const tex = uniformValue.getTexture(gl);

      if (!uniformValue.isTextureReady) {
        processedUniforms[uniformKey] = Texture.empty.getTexture(gl);
      }
      processedUniforms[uniformKey] = tex;
    }

    return {
      shaderProgram: plane.shaderProgram,
      buffer: this.planesBufferInfo[index],
      uniforms: processedUniforms,
    };
  }

  get planesCount() {
    return this._planes?.length || 0;
  }

  cleanup(): void {
    this.cleanupPlaneBuffer();
    this.unsubscribeScrollItems();
  }
}
