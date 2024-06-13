#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
 

attribute vec4 a_position;
uniform float u_scroll;
uniform vec2 u_resolution;
uniform float u_time;

varying vec3 vVertexPosition;
varying float vScroll;

void main() {

  // need to multiply by 2 because screen space(pixel coord) to NDC(normalized device coord)
  vScroll = u_scroll * 2.0 / u_resolution.y;
  gl_Position = vec4(a_position.x, a_position.y - vScroll, a_position.z, a_position.w);
  vVertexPosition = a_position.xyz;
}