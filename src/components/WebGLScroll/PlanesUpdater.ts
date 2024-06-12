import { subscribe } from "valtio";
import { Plane, ScrollItems } from "./VirtualScroll";
import { CleanupProtocol } from "./utils/CleanupProtocol";
import * as twgl from "twgl.js";
import { deleteTwglBufferInfo } from "./utils/deleteTwglBufferInfo";

/**
 * PlaneUpdater class acts as a glue between the valtio state
 * which hold all the items and the actual WebGL rendering, it provide
 * a list of renderable planes to the renderer.
 */
export class PlanesUpdater implements CleanupProtocol {
  private planesBufferInfo: twgl.BufferInfo[] = [];
  private unsubscribeScrollItems: Function;

  constructor({
    items,
    gl,
  }: {
    items: ScrollItems;
    gl: WebGLRenderingContext;
  }) {
    this.unsubscribeScrollItems = subscribe(
      items,
      (() => this.updatePlanesBuffer(gl, items)).bind(this)
    );
  }

  private updatePlanesBuffer(gl: WebGLRenderingContext, items: ScrollItems) {
    // cleanup previous
    this.planesBufferInfo.forEach((bufferInfo) => {
      deleteTwglBufferInfo(gl, bufferInfo);
    });

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this.planesBufferInfo = Object.values(items).map((plane, index) => {
      const { ndcX, ndcY, ndcWidth, ndcHeight } = this.mapToNDCTopLeft(
        plane,
        windowWidth,
        windowHeight
      );

      // console.log(plane);
      const leftEdge = ndcX;
      const rightEdge = ndcX + ndcWidth;
      const topEdge = ndcY;
      const bottomEdge = ndcY - ndcHeight;

      // const width = plane.width / windowWidth;
      // const height = plane.width / windowHeight;

      const arr = {
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

      //TODO: create cleanup for this function to avoid memory leak
      return twgl.createBufferInfoFromArrays(gl, arr);
    });
  }

  private mapToNDCTopLeft(
    plane: Plane,
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

  public getPlanesBufferInfo() {
    return this.planesBufferInfo;
  }

  cleanup(): void {
    this.unsubscribeScrollItems();
  }
}
