const vertexShader = `
varying vec2 vUv;
attribute float aFaction;
varying float vFaction;
void main() {
  vUv = uv;
  vFaction = aFaction;
  // if (uv.y >0.6){ //seems to just affect the hat
  //   gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0);
  //   gl_Position *= vec4(5,1,1,1);
  // }else{
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.0);
  //}
  }`

export default vertexShader
