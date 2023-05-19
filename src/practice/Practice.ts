import * as THREE from 'three';

import { clock } from '../core/clock';
import { renderer } from '../core/renderer';
import { sizes } from '../core/sizes';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

export class Practice {
  public readonly scene = new THREE.Scene();
  private material: THREE.ShaderMaterial;
  private geometry: THREE.BufferGeometry;
  private abortController = new AbortController();
  private resolution = new THREE.Vector2(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );
  private mouse = new THREE.Vector2();
  constructor() {
    const { geometry, material } = this.initMesh();
    this.geometry = geometry;
    this.material = material;
    this.initListeners();
  }

  private initMesh() {
    const torusGeometry = new THREE.TorusGeometry(200, 100, 32, 64);

    const geometry = new THREE.TetrahedronGeometry(2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: clock.elapsed / 1000 },
      },
      vertexShader,
      fragmentShader,
    });
    const amount = torusGeometry.attributes.position.count;
    const mesh = new THREE.InstancedMesh(geometry, material, amount);

    const matrix = new THREE.Matrix4();
    const torusPos = (() => {
      const pos = torusGeometry.attributes.position;
      if (!('array' in pos)) {
        throw new Error('not buffer geometry ');
      }
      return pos.array;
    })();
    for (let i = 0; i < amount; i++) {
      matrix.makeTranslation(
        torusPos[i * 3],
        torusPos[i * 3 + 1],
        torusPos[i * 3 + 2],
      );
      mesh.setMatrixAt(i, matrix);
    }
    this.scene.add(mesh);
    return {
      geometry,
      material,
    };
  }

  public update() {
    this.material.uniforms.uTime.value = clock.elapsed / 1000;
  }

  public dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.abortController.abort();
  }

  private initListeners() {
    window.addEventListener(
      'mousemove',
      ({ clientX, clientY }) => {
        this.mouse.x = (clientX / sizes.width) * 2 - 1;
        this.mouse.y = -(clientY / sizes.height) * 2 + 1;
      },
      {
        signal: this.abortController.signal,
      },
    );
    window.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        this.mouse.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
        this.mouse.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
      },
      {
        passive: false,
        signal: this.abortController.signal,
      },
    );
    sizes.addEventListener(
      'resize',
      () => {
        this.resolution.x = sizes.width * sizes.pixelRatio;
        this.resolution.y = sizes.height * sizes.pixelRatio;
      },
      {
        signal: this.abortController.signal,
      },
    );
  }
}
