//I suck at react,m just follow a sandbox:
//https://codesandbox.io/s/react-three-fiber-boilerplate-cannon-change-instance-property-mt917w?from-embed=&file=/src/App.jsx
//import { Stats, OrbitControls } from '@react-three/drei'
//import { Canvas } from '@react-three/fiber'
import { useRef, useState, useMemo} from 'react'
//import { Debug, Physics, useBox, usePlane } from '@react-three/cannon'
//import { useControls } from 'leva'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { degToRad } from 'three/src/math/MathUtils'
//import { useState } from 'react'
import { useLayoutEffect } from 'react'

import SimplexNoise from "../lib/simplexNoise.js";
import HexGrid from '../lib/HexGrid.js'
const simplexNoise = new SimplexNoise(Math.random);
const hex = new HexGrid();
// function Plane(props) {
//   usePlane(() => ({ ...props }))
// }

//import niceColors from 'nice-color-palettes'
const tempColor = new THREE.Color( Math.random() * 0xffffff )
// color = new THREE.Color( 0xffffff );
// color.setHex( Math.random() * 0xffffff );
const data = Array.from({ length: 1000 }, () => ({ color: new THREE.Color( Math.random() * 0xffffff ), scale: 1 }))


//const parentCallback = "poopybuttfaace"

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //              SETTING UP WORLD OBJECTS
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////












var needsUpdate = false
var hoveredInstanceID = -1
// get_inital_world_data()
// console.log(worldTiles)
export var InstancedBoxes = ({entities,worldInfo,worldTiles,clickFunction}) => {
//function InstancedBoxes({worldInfo,worldTiles,choosemessage}){

  const worldRadius = worldInfo.worldRadius
  const totalGridSize = worldInfo.totalGridSize


  const [hovered, set] = useState()
  const colorArray = useMemo(() => Float32Array.from(new Array(1000).fill().flatMap((_, i) => tempColor.set(data[i].color).toArray())), [])
  //const ref = useRef()
  const tempObject = new THREE.Object3D()
  
  const worldMeshRef = useRef()
  const prevRef = useRef()
  const entityMeshRef = useRef()
  useLayoutEffect(() => void (prevRef.current = hovered), [hovered])
  //const gridWidth = 100
  //const totalGrid = gridWidth*gridWidth
  useFrame((state) => {
  //if (ref){
    // if(needsUpdate === false){
    //   return
    // }
    //const time = state.clock.getElapsedTime()
    let i = 0
    const hexRadius = 0.5
    const distToFlat = hexRadius*Math.cos(degToRad(30))//tan(30)
    const angSideDist = hexRadius + hexRadius*0.5//Math.sin(degToRad(30))
    const Dx = 2*distToFlat
    const Dz = angSideDist
    const noiseScale = 0.025
    const maxHeight = 5


    //const keysOfWorld = Object.keys(worldTiles)
    for (let indx = 0; indx < Object.keys(worldTiles).length; indx++){
      //var offset = false
      //if(x%2==1){offset = true}
      const tileKey = Object.keys(worldTiles)[indx]
      const yPos = worldTiles[tileKey]["noise"]
      const id = parseInt(tileKey)
      
      tempObject.position.set(worldTiles[tileKey]["posX"], maxHeight*yPos, worldTiles[tileKey]["posY"])
      //tempObject.rotation.y = Math.sin(x / 4 + i) + Math.sin(y / 4 + i) + Math.sin(z / 4 + i)
      //tempObject.rotation.z = tempObject.rotation.y * 2
      
      if (hovered !== prevRef.Current) {
        ;(id === hovered ? tempColor.setRGB(10, 10, 10) : tempColor.set(data[id].color)).toArray(colorArray, id * 3)
        worldMeshRef.current.geometry.attributes.color.needsUpdate = true
      }
      // const scale = (data[id].scale = THREE.MathUtils.lerp(data[id].scale, id === hovered ? 2.5 : 1, 0.1))
      // tempObject.scale.setScalar(scale)


      tempObject.updateMatrix()
      worldMeshRef.current.setMatrixAt(id, tempObject.matrix)
    }
    worldMeshRef.current.instanceMatrix.needsUpdate = true
    needsUpdate = false//turn off updates
  //})
  
  

  /////////////////////////////////////////////////
  //      code for entities          
  ///////////////////////////////////////////////
  //
  // This is difficult as they can disappear
  
    const amountOfEntities = Object.keys(entities).length
    for (const key of Object.keys(entities)){
      var instID = entities[key].instID
      // if(instID == -1){
      //   //then an instance ID has not been assigned for this model
        
      // }
      const tileID = hex.IDFromGridPos(entities[key].gridPos, worldInfo.worldRadius)
      const tileKey = String(tileID)
      const yPos = worldTiles[tileKey]["noise"]
      tempObject.position.set(worldTiles[tileKey]["posX"], maxHeight*yPos, worldTiles[tileKey]["posY"])

      tempObject.updateMatrix()
      entityMeshRef.current.setMatrixAt(instID, tempObject.matrix)

    }
    entityMeshRef.current.instanceMatrix.needsUpdate = true

  
  })
  needsUpdate = true


  return (
    <>
      <instancedMesh
      ref={worldMeshRef}
      args={[null, null, totalGridSize]}
      onPointerMove={(e) => (e.stopPropagation(), set(e.instanceId))}
      onPointerOver={e => {
        e.stopPropagation()
        // ...
        hoveredInstanceID = e.instanceId
      }}
      onPointerDown={e => {
        e.stopPropagation()
        // ...
        //if we are here then we are clicking a land tile
        //change 1st param to typeID_to_word["land"]
        clickFunction(2, e.instanceId)
      }}
      onPointerOut={(e) => set(undefined)}
      //onPointerMove={(e)=>{if (e.instanceId == hoveredInstanceID) }}
      // onClick={(e)=>choosemessage("ChildString", e.instanceId)}
      >
        <cylinderGeometry args={[worldInfo.tileRadius, worldInfo.tileRadius, worldInfo.tileHeight, 6, 2]} >
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </cylinderGeometry>
        <meshBasicMaterial toneMapped={false} vertexColors />
      </instancedMesh>

      <instancedMesh
      ref={entityMeshRef}
      args={[null, null, totalGridSize]}>
        <boxGeometry args={[0.2, 10, 0.2]} />
        <meshBasicMaterial toneMapped={false} vertexColors />
      </instancedMesh>

    </>
  )
}
//export default InstancedBoxes




//really we want to only load the worldTiles that are within
// range and for each of those we check
// the structureID and entityID then load those if needed


//or we need a more complicted way of loading meshes, we need to group instances together basded on mesh models and
//make an instance for each type