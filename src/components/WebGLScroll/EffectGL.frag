#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
 
uniform vec2 u_resolution;
uniform float u_delta;
uniform float u_time;
uniform float u_scroll;

// our textures coming from p5
uniform sampler2D tex0;

void main() {
    vec2 coord = (gl_FragCoord.xy / u_resolution.xy); 
    gl_FragColor = vec4(0, coord.x,0,1.0);
}