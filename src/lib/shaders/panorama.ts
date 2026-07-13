export const vertex = `
#version 300 es
// layout (location = 0) in vec3 a_position;
in vec4 a_position;

out vec4 v_position;

uniform mat4 u_projection;
uniform mat4 u_view;

void main() {
  v_position = a_position;
  gl_Position = a_position;
  gl_Position.z = 1.0;
}
`;

export const fragment = `
#version 300 es
precision highp float;

in vec4 v_position;
out vec4 outColor;

uniform samplerCube u_skybox;
uniform mat4 u_viewDirectionProjectionInverse;

void main() {
  vec4 t = u_viewDirectionProjectionInverse * v_position;
  outColor = texture(u_skybox, normalize(t.xyz / t.w));
}
`;
