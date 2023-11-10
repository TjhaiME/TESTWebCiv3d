const fragmentShader = `
varying vec2 vUv;
varying float vFaction;
void main() {
  bool cond1 = (vUv[0] > 0.5);//false;
  // if (vUv[0] > 0.6){
  //   cond1 = true;
  // }
  bool cond2 = (vUv[1] > 0.5);//false;
  // if (vUv[1] > 0.6){
  //   cond1 = true;
  // }

  if (cond1 && cond2){
    //NONE
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  }else if(cond1 && !cond2){
    //SKIN
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }else if(!cond1 && cond2){
    //ROBES
    gl_FragColor = vec4(vFaction, 0.0, 1.0-vFaction, 1.0);
  }else{
    //EYES
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }

  //gl_FragColor = vec4(float(id)/100.0, float(id)/100.0, float(id)/100.0, 1.0);
  //gl_FragColor = vec4(vFaction, vUv[0], vUv[1], 1.0);
  //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`


export default fragmentShader
