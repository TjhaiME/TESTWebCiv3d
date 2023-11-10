const vertexShader = `


const float displacement_scale = 0.5;

const float PI = 3.14159265;
float curve(float dir) {
  return (sin((PI / 2.0) + (dir * 10.0) / (PI * 2.0))) / 10.0;
}

vec3 curve_x(vec3 vert) {
  return vec3(vert.x, vert.y - curve(vert.x), vert.z);
}

vec3 curve_z(vec3 vert) {
  return vec3(vert.x, vert.y + curve(vert.z), vert.z);
}
void main() {





  vec4 originalVertex = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 vertex = originalVertex.xyz;

  vertex.y = sign(vertex.y);
  vertex *= vec3(1.0, 0.02, 1.0);

  vertex = curve_x(vertex);
  vertex = curve_z(vertex);

  vertex.y += step(length(originalVertex.xz), 0.7) * 0.7;

  gl_Position = vec4(vertex, 1.0);//mix(originalVertex, vec4(vertex, 1.0), 1.0);
  }`

export default vertexShader
