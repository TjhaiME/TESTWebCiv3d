export class HexGrid {
  constructor(){}





  axialToFlatPos(q,r, hexRad){
    const sqrtThree = Math.sqrt(3)
    //3 axes q,r,s; q+r+s=0
    //(3,2)=(q,r) => is the vector sum of 3*q and 2*r as basis vectors
    // const qBasis = [sqrtThree*hexRad,0]
    // const rBasis = [0.5*sqrtThree*hexRad,1.5*hexRad]

    const qBasis = [sqrtThree,0] // for pointy top
    const rBasis = [0.5*sqrtThree,1.5]//* by hexRad later
    // const qBasis = [1.5,0.5*sqrtThree] // for flat top
    // const rBasis = [0,sqrtThree]//* by hexRad later

    const flatPos = [hexRad*(qBasis[0]*q+rBasis[0]*r), hexRad*(qBasis[1]*q+rBasis[1]*r)] // matrix multiply size*[qBasis,rBasis]*[q,r] (column vectors)
    return flatPos
  }
  axialToCube(q,r){
    return [q,r,-q-r]
  }
  getLastCubeCoord(q,r){
    return -q-r
  }
    
    
    
    
    
  cube_round(fracQ,fracR,fracS){
    var q = round(fracQ)
    var r = round(fracR)
    var s = round(fracS)

    var q_diff = abs(q - fracQ)
    var r_diff = abs(r - fracR)
    var s_diff = abs(s - fracS)

    if (q_diff > r_diff && q_diff > s_diff){
    q = -r-s
    }
    else if (r_diff > s_diff){
    r = -q-s
    }
    else{
    s = -q-r
    }
    return [q, r, s]
  }
    
  IDFromGridPos(gridPos, worldRadius){
    //if passed as gridPos = [q,r]
    //console.log("In Hex Math gridPos = "+gridPos)
    const newID = (gridPos[1]+worldRadius) + ((2*worldRadius)+ 1)*(gridPos[0]+worldRadius);
    //console.log("newID = "+newID)
    //console.log()
    return newID
  }//TEST

  is_in_bounds(gridPos,worldRadius){
    if (gridPos[0] <= -worldRadius || gridPos[1] <= -worldRadius){
      return false
    }else if (gridPos[0] >= worldRadius || gridPos[1] >= worldRadius){
      return false
    }
    return true
  }


  cube_subtract(a, b){
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  }
  cube_distance(a, b){
    var vec = this.cube_subtract(a, b)
    return (Math.abs(vec[0]) + Math.abs(vec[1]) + Math.abs(vec[2])) / 2
    // or: (abs(a.q - b.q) + abs(a.r - b.r) + abs(a.s - b.s)) / 2
  }
  distanceAxial(gridPosA,gridPosB){
    const cube1 = this.axialToCube(gridPosA[0],gridPosA[1])
    const cube2 = this.axialToCube(gridPosB[0],gridPosB[1])
    return this.cube_distance(cube1, cube2)
  }
  get_circle_of_gridPos(centrePos, range, worldRadius){
    var results = []
    for(var dq=-range;dq<=range;dq++){ //each -N ≤ q ≤ +N:
      for(var dr=Math.max(-range, -dq-range);dr<=Math.min(range,-dq+range);dr++){// each max(-N, -q-N) ≤ r ≤ min(+N, -q+N)
        const newPos = [centrePos[0] + dq, centrePos[1] + dr]
      console.log("newPos = "+newPos)
        if (this.is_in_bounds(newPos,worldRadius)){
          results.push(newPos)
        }
      }
    }
    return results
  }

}
export default HexGrid;












/*
function axialHexToFlatPos(q,r, hexRad){
  const sqrtThree = Math.sqrt(3)
  //3 axes q,r,s; q+r+s=0
  //(3,2)=(q,r) => is the vector sum of 3*q and 2*r as basis vectors
  // const qBasis = [sqrtThree*hexRad,0]
  // const rBasis = [0.5*sqrtThree*hexRad,1.5*hexRad]

  const qBasis = [sqrtThree,0] // for pointy top
  const rBasis = [0.5*sqrtThree,1.5]//* by hexRad later
  // const qBasis = [1.5,0.5*sqrtThree] // for flat top
  // const rBasis = [0,sqrtThree]//* by hexRad later

  const flatPos = [hexRad*(qBasis[0]*q+rBasis[0]*r), hexRad*(qBasis[1]*q+rBasis[1]*r)] // matrix multiply size*[qBasis,rBasis]*[q,r] (column vectors)
  return flatPos
}
function axialHexToCubeHex(q,r){
  return [q,r,-q-r]
}
function getLastCubeCoord(q,r){
  return -q-r
}





function cube_round(fracQ,fracR,fracS){
  var q = round(fracQ)
  var r = round(fracR)
  var s = round(fracS)

  var q_diff = abs(q - fracQ)
  var r_diff = abs(r - fracR)
  var s_diff = abs(s - fracS)

  if (q_diff > r_diff && q_diff > s_diff){
    q = -r-s
  }
  else if (r_diff > s_diff){
    r = -q-s
  }
  else{
    s = -q-r
  }
  return [q, r, s]
}
*/