#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
 
uniform vec2 u_resolution;
uniform float u_delta;
uniform float u_time;
uniform float u_scroll;
uniform float u_scroll_velocity;
uniform vec2 u_mouse;

uniform sampler2D u_texture;
varying float vScroll;

void main() {
    vec2 coord = (gl_FragCoord.xy / u_resolution.xy);
    vec4 pixel = texture2D(u_texture, coord);

    gl_FragColor = pixel;

    // gl_FragColor = vec4(u_mouse.x/coord.x, coord.x * (sin(u_time *.005 +coord.y) + 1.1),0,1.0);
}