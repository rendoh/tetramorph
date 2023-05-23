varying float vHue;
varying float vFogDepth;

vec3 hsb2rgb( in vec3 c ){
  vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                            6.0)-3.0)-1.0,
                    0.0,
                    1.0 );
  rgb = rgb*rgb*(3.0-2.0*rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  gl_FragColor = vec4(hsb2rgb(vec3(
    mix(.17, .28, vHue),
    .7,
    pow(vFogDepth, 2.) 
  )), 1.);

}
