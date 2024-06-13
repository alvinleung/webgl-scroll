const glMatrixList = `
vec3
Vec3
mat4
Mat4
vec2
Vec2
`;

// a list of class list that ignore
module.exports = {
  classes: ["proxy", ...glMatrixList.split("\n")],
};
