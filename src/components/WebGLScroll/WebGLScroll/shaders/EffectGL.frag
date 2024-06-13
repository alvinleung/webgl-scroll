#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform sampler2D u_texture;
varying float vScroll;

void main() {
    // Normalize the coordinates (0.0 to 1.0)
    vec2 coord = gl_FragCoord.xy / u_resolution.xy;
    
    // Adjust the y-coordinate for scrolling based on vScroll
    float adjustedVScroll = mod(vScroll, 1.0);
    vec2 scrollCoord = vec2(coord.x, coord.y + adjustedVScroll);
    
    // Wrap the y-coordinate to ensure it remains in the range [0, 1]
    scrollCoord.y = mod(scrollCoord.y, 1.0);
    
    // Sample the texture using the adjusted coordinates
    vec4 pixel = texture2D(u_texture, scrollCoord);

    // Output the final color
    gl_FragColor = pixel;

    // Uncomment for testing other parameters
    // gl_FragColor = vec4(u_mouse.x / coord.x, coord.x * (sin(u_time * .005 + coord.y) + 1.1), 0, 1.0);
}