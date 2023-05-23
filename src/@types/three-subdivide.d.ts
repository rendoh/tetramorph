declare module 'three-subdivide' {
  import * as THREE from 'three';

  interface LoopSubdivisionParams {
    split?: boolean;
    uvSmooth?: boolean;
    preserveEdges?: boolean;
    flatOnly?: boolean;
    maxTriangles?: number;
  }

  export class LoopSubdivision {
    static modify(
      geometry: THREE.BufferGeometry | THREE.Geometry,
      iterations: number,
      params?: LoopSubdivisionParams,
    ): THREE.BufferGeometry | THREE.Geometry;
  }
}
