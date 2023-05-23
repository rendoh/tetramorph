#include ./cnoise-3d.glsl

uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;
// duck
attribute vec3 duckPosition;
attribute vec2 duckUv;
attribute vec3 duckNormal;
uniform sampler2D uDuckTexture;
// fish
attribute vec3 fishPosition;
attribute vec2 fishUv;
attribute vec3 fishNormal;
uniform sampler2D uFishTexture;
uniform float uFishStrength;
// fox
attribute vec3 foxPosition;
attribute vec2 foxUv;
attribute vec3 foxNormal;
uniform sampler2D uFoxTexture;
uniform float uFoxStrength;

varying float vHue;
varying float vFogDepth;

void main() {
  vec3 targetPosition;
  targetPosition = mix(duckPosition, fishPosition, uFishStrength);
  targetPosition = mix(targetPosition, foxPosition, uFoxStrength);

  vec2 targetUv;
  targetUv = mix(duckUv, fishUv, uFishStrength);
  targetUv = mix(targetUv, foxUv, uFoxStrength);

  vec3 targetNormal;
  targetNormal = mix(duckNormal, fishNormal, uFishStrength);
  targetNormal = mix(targetNormal, foxNormal, uFoxStrength);

  float brightness;
  float duckBrightness = length(texture2D(uDuckTexture, duckUv).rgb);
  float fishBrightness = length(texture2D(uFishTexture, fishUv).rgb) + 1.25;
  float foxBrightness = length(texture2D(uFoxTexture, foxUv).rgb) + .5;
  brightness = mix(duckBrightness, fishBrightness, uFishStrength);
  brightness = mix(brightness, foxBrightness, uFoxStrength);

  vec4 target2dPos = (projectionMatrix * modelViewMatrix * vec4(targetPosition, 1.0));
  vec2 ndc = (target2dPos.xyz / target2dPos.w).xy;
  float dist = distance(ndc, uMouse);
  float distanceStrength = 1. - clamp(dist, 0., 1.);

  float scale = brightness * 2. + 1. + pow(distanceStrength, 7.) * 14.;
  vec3 pos = position * scale;

  float rotateProgress = uTime * 1. + cnoise(targetPosition * .04);
  pos = vec3(
    pos.x * cos(rotateProgress) - pos.y * sin(rotateProgress),
    pos.y * cos(rotateProgress) + pos.x * sin(rotateProgress),
    pos.z
  );

  targetPosition += targetNormal * pow(distanceStrength, 5.) * 30.;
  pos += targetPosition;

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);

  vUv = targetUv;
  vHue = cnoise(pos * 0.01 + uTime * 1.);

  vec3 tmpPos = (modelViewMatrix * instanceMatrix * vec4(pos, 1.0)).xyz;
  float linerPos = length(vec3(0., 0., 0.) - tmpPos) * (1. / (1800. - 0.));
  vFogDepth = clamp((1. - linerPos) / (1. - 0.), 0., 1.);
}
