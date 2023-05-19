#include ./cnoise-3d.glsl;

uniform float uTime;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  float scale = cnoise(pos + uTime * 1.) * 3. ;
  pos = pos + pos * scale;


  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);

  vUv = uv;
}
