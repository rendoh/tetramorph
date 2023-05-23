import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LoopSubdivision } from 'three-subdivide';

import { clock } from '../core/clock';
import { sizes } from '../core/sizes';
import duckGlbPath from './duck.glb?url';
import fishGlbPath from './fish.glb?url';
import foxGlbPath from './fox.glb?url';
import fragmentShader from './fragment.glsl';
import vertexShader from './vertex.glsl';

gsap.registerPlugin(ScrollTrigger);

const maxTriangles = 6000;

function lerp(x: number, y: number, p: number) {
  return x + (y - x) * p;
}

/**
 * TODO: update layout to be more responsive on resize if やる気が出たら
 */

export class Practice {
  public readonly scene = new THREE.Scene();
  private material?: THREE.ShaderMaterial;
  private geometry?: THREE.BufferGeometry;
  private abortController = new AbortController();
  private loader = new GLTFLoader();
  private ctx?: gsap.Context;
  private mouse = new THREE.Vector2();
  constructor() {
    this.resize();
    this.initMesh();
    window.addEventListener(
      'mousemove',
      (e) => {
        this.mouse.x = (e.clientX / sizes.width) * 2 - 1;
        this.mouse.y = -(e.clientY / sizes.height) * 2 + 1;
      },
      {
        signal: this.abortController.signal,
      },
    );
  }

  private async loadModel(path: string) {
    return new Promise<GLTF>((resolve) => {
      this.loader.load(path, (gltf) => {
        resolve(gltf);
      });
    });
  }

  public resize() {
    this.setInitialLayout();
    this.scene.scale.setScalar(Math.min(sizes.width / 1500, 1));
  }

  private async getDuck() {
    const gltf = await this.loadModel(duckGlbPath);
    for (const child of gltf.scene.children[0].children) {
      if (child instanceof THREE.Mesh) {
        const scale = 5;
        (child.geometry as THREE.BufferGeometry).translate(0, -80, 0);
        (child.geometry as THREE.BufferGeometry).scale(scale, scale, scale);
        (child.geometry as THREE.BufferGeometry).rotateY(-Math.PI / 2);
        const geo = LoopSubdivision.modify(child.geometry, 2, {
          flatOnly: true,
          maxTriangles,
        });
        child.geometry.dispose();
        child.material.dispose();
        return {
          position: geo.attributes.position.array as Float32Array,
          uv: geo.attributes.uv.array as Float32Array,
          normal: geo.attributes.normal.array as Float32Array,
          texture: child.material.map,
        };
      }
    }
    throw new Error();
  }

  private async getFish() {
    const gltf = await this.loadModel(fishGlbPath);
    for (const child of gltf.scene.children) {
      if (child instanceof THREE.Mesh) {
        const scale = 2000;
        (child.geometry as THREE.BufferGeometry).rotateY(Math.PI - Math.PI / 6);
        (child.geometry as THREE.BufferGeometry).translate(0, -0.125, 0);
        (child.geometry as THREE.BufferGeometry).scale(scale, scale, scale);
        const geo = LoopSubdivision.modify(child.geometry, 2, {
          flatOnly: true,
          maxTriangles,
        });
        geo.dispose();
        child.geometry.dispose();
        child.material.dispose();
        return {
          position: geo.attributes.position.array as Float32Array,
          uv: geo.attributes.uv.array as Float32Array,
          normal: geo.attributes.normal.array as Float32Array,
          texture: child.material.map,
        };
      }
    }
    throw new Error();
  }

  private async getFox() {
    const gltf = await this.loadModel(foxGlbPath);
    for (const child of gltf.scene.children) {
      if (child instanceof THREE.Mesh) {
        const scale = 8;
        (child.geometry as THREE.BufferGeometry).translate(0, -40, 0);
        (child.geometry as THREE.BufferGeometry).scale(scale, scale, scale);
        const geo = LoopSubdivision.modify(child.geometry, 2, {
          flatOnly: true,
          maxTriangles,
        });
        geo.dispose();
        child.geometry.dispose();
        child.material.dispose();
        return {
          position: geo.attributes.position.array as Float32Array,
          uv: geo.attributes.uv.array as Float32Array,
          normal: geo.attributes.normal.array as Float32Array,
          texture: child.material.map,
        };
      }
    }
    throw new Error();
  }

  private async initMesh() {
    const [duck, fish, fox] = await Promise.all([
      await this.getDuck(),
      await this.getFish(),
      await this.getFox(),
    ]);

    const geometry = new THREE.TetrahedronGeometry(1);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: clock.elapsed / 1000 },
        uMouse: { value: this.mouse.clone() },
        uDuckTexture: { value: duck.texture },
        uFishTexture: { value: fish.texture },
        uFoxTexture: { value: fox.texture },
        uFishStrength: { value: 0 },
        uFoxStrength: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      wireframe: true,
    });
    const amount = Math.max(
      duck.position.length / 3,
      fish.position.length / 3,
      fox.position.length / 3,
    );
    const getAttributes = (data: {
      position: Float32Array;
      uv: Float32Array;
      normal: Float32Array;
    }) => {
      const position = new Float32Array(amount * 3);
      const uv = new Float32Array(amount * 2);
      const normal = new Float32Array(amount * 3);
      for (let i = 0; i < amount; i++) {
        const wrapIndex = i % (data.position.length / 3);
        position[i * 3 + 0] = data.position[wrapIndex * 3 + 0];
        position[i * 3 + 1] = data.position[wrapIndex * 3 + 1];
        position[i * 3 + 2] = data.position[wrapIndex * 3 + 2];
        uv[i * 2 + 0] = data.uv[wrapIndex * 2 + 0];
        uv[i * 2 + 1] = data.uv[wrapIndex * 2 + 1];
        normal[i * 3 + 0] = data.normal[wrapIndex * 3 + 0];
        normal[i * 3 + 1] = data.normal[wrapIndex * 3 + 1];
        normal[i * 3 + 2] = data.normal[wrapIndex * 3 + 2];
      }
      return {
        positionAttribute: new THREE.InstancedBufferAttribute(position, 3),
        uvAttribute: new THREE.InstancedBufferAttribute(uv, 2),
        normalAttribute: new THREE.InstancedBufferAttribute(normal, 3),
      };
    };
    const duckAttributes = getAttributes(duck);
    const fishAttributes = getAttributes(fish);
    const foxAttributes = getAttributes(fox);
    geometry.setAttribute('duckPosition', duckAttributes.positionAttribute);
    geometry.setAttribute('duckUv', duckAttributes.uvAttribute);
    geometry.setAttribute('duckNormal', duckAttributes.normalAttribute);
    geometry.setAttribute('fishPosition', fishAttributes.positionAttribute);
    geometry.setAttribute('fishUv', fishAttributes.uvAttribute);
    geometry.setAttribute('fishNormal', fishAttributes.normalAttribute);
    geometry.setAttribute('foxPosition', foxAttributes.positionAttribute);
    geometry.setAttribute('foxUv', foxAttributes.uvAttribute);
    geometry.setAttribute('foxNormal', foxAttributes.normalAttribute);

    const mesh = new THREE.InstancedMesh(geometry, material, amount);
    this.scene.add(mesh);
    this.material = material;
    this.geometry = geometry;
    this.createTimeline();
  }

  private setInitialLayout() {
    this.scene.position.z = sizes.width / 12;
    this.scene.position.x = sizes.width / 5;
    this.scene.position.y = -sizes.width / 6;
    this.scene.rotation.y = -Math.PI / 3;
  }

  private createTimeline() {
    const { material } = this;
    if (!material) throw new Error('material is not defined');
    this.ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2,
            invalidateOnRefresh: true,
          },
        })
        .to(this.scene.position, {
          x: () => -sizes.width / 4,
          y: () => -sizes.width / 24,
          z: 0,
        })
        .to(
          this.scene.rotation,
          {
            y: Math.PI / 2.6,
          },
          '<',
        )
        .to(
          material.uniforms.uFishStrength,
          {
            value: 1,
          },
          '-=0.4',
        )
        .to(this.scene.position, {
          x: () => sizes.width / 12,
          y: () => -sizes.width / 24,
          z: 0,
        })
        .to(
          this.scene.rotation,
          {
            y: -Math.PI / 4,
            duration: 1,
          },
          '<',
        )
        .to(
          material.uniforms.uFoxStrength,
          {
            value: 1,
          },
          '<+=0.2',
        );
    });
  }

  public update() {
    if (this.material) {
      this.material.uniforms.uTime.value = clock.elapsed / 1000;
      this.material.uniforms.uMouse.value.x = lerp(
        this.material.uniforms.uMouse.value.x,
        this.mouse.x,
        0.1,
      );
      this.material.uniforms.uMouse.value.y = lerp(
        this.material.uniforms.uMouse.value.y,
        this.mouse.y,
        0.1,
      );
    }
  }

  public dispose() {
    this.material?.dispose();
    this.geometry?.dispose();
    this.abortController.abort();
    this.ctx?.revert();
  }
}
