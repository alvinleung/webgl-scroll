#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
 
uniform vec2 u_resolution;
uniform float u_delta;
uniform float u_time;
uniform float u_scroll;
uniform vec2 u_mouse;


// our textures coming from p5
uniform sampler2D tex0;

void main() {
    vec2 coord = (gl_FragCoord.xy / u_resolution.xy); 
    gl_FragColor = vec4(u_mouse.x/coord.x, coord.x * (sin(u_time *.005 +coord.y) + 1.1),0,1.0);
}