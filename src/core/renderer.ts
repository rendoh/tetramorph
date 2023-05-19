import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { camera } from './camera';
import { sizes } from './sizes';

class Renderer {
  public readonly canvas = document.createElement('canvas');
  public renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
  public readonly scene = new THREE.Scene();
  private controls = new OrbitControls(camera.camera, this.canvas);

  constructor() {
    this.initCanvas();
    this.resize();
    this.controls.enableDamping = true;
  }

  private initCanvas() {
    this.canvas.style.display = 'block';
    document.body.appendChild(this.canvas);
  }

  public resize() {
    camera.resize();
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(sizes.pixelRatio);
  }

  public update() {
    this.controls.update();
    this.renderer.render(this.scene, camera.camera);
  }

  public dispose() {
    this.controls.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}

export const renderer = new Renderer();
