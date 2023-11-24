//I suck at react,m just follow a sandbox:
//https://codesandbox.io/s/react-three-fiber-boilerplate-cannon-change-instance-property-mt917w?from-embed=&file=/src/App.jsx
//import { Stats, OrbitControls } from '@react-three/drei'
//import { Canvas } from '@react-three/fiber'
import { useRef, useState, useMemo, Suspense} from 'react'
//import { Debug, Physics, useBox, usePlane } from '@react-three/cannon'
//import { useControls } from 'leva'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { degToRad } from 'three/src/math/MathUtils'
//import { useState } from 'react'
import { useLayoutEffect } from 'react'


import SimplexNoise from "../lib/simplexNoise.js";
import HexGrid from '../lib/HexGrid.js'

import {Model} from '../assets/entities/unitTest.jsx'
import { Sphere, useGLTF } from '@react-three/drei'

import fragmentShader from '../shaders/fragmentShaderTest.js';//3=blob
import vertexShader from '../shaders/vertexShaderInstanceDefault.js';

import hatFragmentShader from '../shaders/fragmentShaderDefault.js';//3=blob
import hatVertexShader from '../shaders/vertexShaderInstanceDefault.js';

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

const unitGeoScale = 0.25








let hoverPath = []
let totalGridSize = 1000 //set in code below
let needsUpdate = false
let hoveredInstanceID = -1
// get_inital_world_data()
// console.log(worldTiles)
export let InstancedBoxes = ({entities,structures,worldInfo,worldTiles,clickFunction, hoverFunction}) => {
//function InstancedBoxes({worldInfo,worldTiles,choosemessage}){

  const worldRadius = worldInfo.worldRadius
  totalGridSize = worldInfo.totalGridSize


  const [hovered, setHovered] = useState()
  //let colorArray = useMemo(() => Float32Array.from(new Array(1000).fill().flatMap((_, i) => tempColor.set(data[i].color).toArray())), [])
  let colorArray = useMemo(() => Float32Array.from(new Array(Object.keys(worldTiles).length).fill().flatMap((_, i) => tempColor.setHex(worldTiles[String(i)].colorHexStr).toArray())), [])
  
  //const ref = useRef()
  const tempObject = new THREE.Object3D()
  
  const worldMeshRef = useRef()
  const prevRef = useRef()
  let entityMeshRef = useRef()
  let structureMeshRef = useRef()


  let mageHatMeshRef = useRef()
  let meleeHatMeshRef = useRef()
  let riceHatMeshRef = useRef()

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
    //const maxHeight = 5 //use worldInfo.tileHeight


    //const keysOfWorld = Object.keys(worldTiles)
    for (let indx = 0; indx < Object.keys(worldTiles).length; indx++){
      //console.log("loop for index ", indx)
      //let offset = false
      //if(x%2==1){offset = true}
      const tileKey = Object.keys(worldTiles)[indx]
      const yPos = worldTiles[tileKey]["noise"]
      const id = parseInt(tileKey)
      //console.log("loop for id ", id)
      
      //tempObject.position.set(worldTiles[tileKey]["posX"], worldInfo.tileHeight*yPos, worldTiles[tileKey]["posY"])
      tempObject.position.set(worldTiles[tileKey]["posX"], worldInfo.tileHeight*yPos - 0.5*worldInfo.tileHeight, worldTiles[tileKey]["posY"])
      //tempObject.rotation.y = Math.sin(x / 4 + i) + Math.sin(y / 4 + i) + Math.sin(z / 4 + i)
      //tempObject.rotation.z = tempObject.rotation.y * 2

    
      if (true){//(hovered !== prevRef.Current) {//prevRef.current) {//capitalised in undefined but it works
        //;(id === hovered ? tempColor.setRGB(10, 10, 10) : tempColor.set(data[id].color)).toArray(colorArray, id * 3)
        
        //;(id === hovered ? tempColor.setRGB(10, 10, 10) : tempColor.setHex(worldTiles[String(id)].colorHexStr)).toArray(colorArray, id * 3)
        //worldMeshRef.current.geometry.attributes.color.needsUpdate = true
        if(id === hovered){
          //console.log("hovered tile is ", id)
          //only this one plays
          tempColor.setRGB(10, 10, 10).toArray(colorArray, id * 3)
        }
        //else if(worldTiles[tileKey].eventState == 1){ //path to tile
        //   tempColor.setRGB(8, 8, 8).toArray(colorArray, id * 3)
        //   console.log("path tile is ", id)
        //}
        else{
          //console.log("default tile is ", id)
          tempColor.setHex(worldTiles[String(id)].colorHexStr).toArray(colorArray, id * 3)
        }
        //console.log("hoverPath = ", hoverPath)
        if (Array.isArray(hoverPath)){
          for(let k = 0; k < hoverPath.length;k++){
            const myID = hex.IDFromGridPos(hoverPath[k], worldInfo.worldRadius)
            tempColor.setRGB(10, 1, 10).toArray(colorArray, myID * 3)
          }
        }
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
    if (entityMeshRef != undefined){
      for (const key of Object.keys(entities)){
        let instID = entities[key].instID
        // if(instID == -1){
        //   //then an instance ID has not been assigned for this model
          
        // }
        const tileID = hex.IDFromGridPos(entities[key].gridPos, worldInfo.worldRadius)
        const tileKey = String(tileID)
        const yPos = worldTiles[tileKey]["noise"]
        tempObject.position.set(worldTiles[tileKey]["posX"], worldInfo.tileHeight*yPos, worldTiles[tileKey]["posY"])

        tempObject.updateMatrix()
        entityMeshRef.current.setMatrixAt(instID, tempObject.matrix)
        
        const modelID = entities[key].modelID//modelID tells us what type of model for decoration
        const decorID = entities[key].decorID//instance of decoration
        if(worldInfo.modelIDToHat[String(modelID)] == "mage"){
          mageHatMeshRef.current.setMatrixAt(decorID, tempObject.matrix)
        }else if(worldInfo.modelIDToHat[String(modelID)] == "melee"){
          meleeHatMeshRef.current.setMatrixAt(decorID, tempObject.matrix)
        }else if(worldInfo.modelIDToHat[String(modelID)] == "rice"){
          riceHatMeshRef.current.setMatrixAt(decorID, tempObject.matrix)
        }

      }
        entityMeshRef.current.instanceMatrix.needsUpdate = true
        mageHatMeshRef.current.instanceMatrix.needsUpdate = true
        meleeHatMeshRef.current.instanceMatrix.needsUpdate = true
        riceHatMeshRef.current.instanceMatrix.needsUpdate = true
    }

  /////////////////////////////////////////////////
  //      code for structures        
  ///////////////////////////////////////////////
  const amountOfStructures = Object.keys(structures).length
  if (true){//(structureMeshRef != undefined){
    for (const key of Object.keys(structures)){
      let instID = structures[key].instID
      // if(instID == -1){
      //   //then an instance ID has not been assigned for this model
        
      // }
      const tileID = hex.IDFromGridPos(structures[key].gridPos, worldInfo.worldRadius)
      const tileKey = String(tileID)
      const yPos = worldTiles[tileKey]["noise"]
      tempObject.position.set(worldTiles[tileKey]["posX"], worldInfo.tileHeight*yPos, worldTiles[tileKey]["posY"])

      tempObject.updateMatrix()
      structureMeshRef.current.setMatrixAt(instID, tempObject.matrix)

    }
    structureMeshRef.current.instanceMatrix.needsUpdate = true
  }


  
  })
  needsUpdate = true

  // // //get colour array
  // for(const tileKey in Object.keys(worldTiles)){
  //   const id = parseInt(tileKey)
  //   if (worldTiles[tileKey].eventState == 1){
  //     tempColor.setRGB(10, 10, 10).toArray(colorArray, id * 3)
      
  //   }else{
  //     tempColor.set(data[id].color).toArray(colorArray, id * 3)
  //   }
  // }
  // //worldMeshRef.current.geometry.attributes.color.needsUpdate = true
  // worldMeshRef.current.instanceMatrix.needsUpdate = true

  //get the path as a variable
  /////////////////////////////////////////////////////////////////////
  ///////    Entity function stuffz
  ///////////////////////////////////////////////////////////////////////////
  //Draw all entities
  const entitiesJSXResult = EntitiesJSX_withRef(entities)
  const entitiesJSX = entitiesJSXResult[0]
  entityMeshRef = entitiesJSXResult[1]
  ///////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////
  ///////    Start of decorations
  ///////////////////////////////////////////////////////////////////////////
  let hat_GLTFStrings = {
    "mage" : "/src/assets/entities/mageHat.glb",
    "melee" : "/src/assets/entities/meleeHat.glb",
    "rice" : "/src/assets/entities/riceHat.glb"
  }
  let hatRefs = {
    "melee" : undefined,
    "mage" : undefined,
    "rice" : undefined
  }
  let decorationJSXArray = [<></>,<></>,<></>]

  for (let modelID of [0,1,2]){
    const decorType = worldInfo.modelIDToHat[modelID]
    // console.log("decorType = "+decorType)
    // console.log("pathToDecoration = ")
    // console.log(hat_GLTFStrings[decorType])
    const hatJSXResult = get_decoration_instanceJSX(modelID, hat_GLTFStrings[decorType], entities)
    //decorationJSXArray.push(mageHatJSXResult[0])//order doesnt matter at this point
    decorationJSXArray[modelID] = hatJSXResult[0]//order doesnt matter at this point
    hatRefs[decorType] = hatJSXResult[1]
  }//assign references
    mageHatMeshRef = hatRefs["mage"]
    meleeHatMeshRef = hatRefs["melee"]
    riceHatMeshRef = hatRefs["rice"]


    // const { mageHatNodes, mageMaterials } = useGLTF("/src/assets/entities/mageHat.glb");
    // const { meleeHatNodes, meleeMaterials } = useGLTF("/src/assets/entities/meleeHat.glb");
    // const { riceHatNodes, riceMaterials } = useGLTF("/src/assets/entities/riceHat.glb");

  /////////////////////////////////////////////////////////////////////
  ///////    End of decorations
  ///////////////////////////////////////////////////////////////////////////
  return (
    <>
      <instancedMesh
      ref={worldMeshRef}
      args={[null, null, totalGridSize]}
      onPointerMove={(e) => (e.stopPropagation(), setHovered(e.instanceId))}
      onPointerOver={e => {
        e.stopPropagation()
        // ...
        hoveredInstanceID = e.instanceId
        //hoverFunction(e.instanceId)
        hoverPath = hoverFunction(e.instanceId)//cant seem to set it
      }}
      //onPointerDown={e => {
      onPointerUp={e => {
        e.stopPropagation()
        // ...
        //if we are here then we are clicking a land tile
        //change 1st param to typeID_to_word["land"]
        clickFunction(2, e.instanceId)
      }}
      onPointerOut={(e) => setHovered(undefined)}
      //onPointerMove={(e)=>{if (e.instanceId == hoveredInstanceID) }}
      // onClick={(e)=>choosemessage("ChildString", e.instanceId)}
      >
        <cylinderGeometry args={[worldInfo.tileRadius, worldInfo.tileRadius, worldInfo.tileHeight, 6, 2]} >
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        {/* <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
          We need something like this for entities so we can pass faction,level or something
          so we can knowhow to colour them
        */}
        </cylinderGeometry>
        <meshBasicMaterial toneMapped={false} vertexColors />
      </instancedMesh>

      {/* <instancedMesh
      ref={entityMeshRef}
      args={[unitGeo, null, totalGridSize]}> */}
        {/* <cylinderGeometry args={[0.3*worldInfo.tileRadius, 0.3*worldInfo.tileRadius, 1.5, 5, 2]} >
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </cylinderGeometry> */}
        {/* <meshBasicMaterial toneMapped={false} vertexColors /> */}
        {/* <shaderMaterial toneMapped={false} vertexColors
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        /> */}
      {/* </instancedMesh> */}
      {/* <Suspense fallback={null}>
          <Nodes ref={entityMeshRef}/>
      </Suspense> */}
      {entitiesJSX}
      {decorationJSXArray}
      <Model />
      {/*hat shader test*/}
      {/* <Sphere position={[0,10,0]} args={[6,128]}>
        <shaderMaterial toneMapped={false} vertexColors
          vertexShader={hatVertexShader}
          fragmentShader={hatFragmentShader}
        />
      </Sphere> */}
      {/* load structures */}
      <instancedMesh
      ref={structureMeshRef}
      args={[null, null, totalGridSize]}>
        <boxGeometry args={[0.8*worldInfo.tileRadius, worldInfo.tileHeight, 0.8*worldInfo.tileRadius]}></boxGeometry>
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












function Nodes() {
  //https://codesandbox.io/s/elated-lumiere-exsvq?file=/src/App.jsx
  const { nodes, materials } = useGLTF("/src/assets/entities/UnitWithAtlasMaterial.glb");
  const geo = nodes.Unit.geometry.clone();

  // const defaultTransform = new THREE.Matrix4()
  // .makeRotationX( Math.PI )
  // .multiply( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
  // geo.applyMatrix4( defaultTransform );

  //unitGeo.computeVertexNormals();
  //unitGeo.scale(worldInfo.tileRadius, worldInfo.tileRadius, worldInfo.tileRadius);


  geo.computeVertexNormals();
  geo.scale(0.5, 0.5, 0.5);

  // console.log(
  //   "nodes:",
  //   nodes,
  //   "materials:",
  //   materials,
  //   // "nodes.TableMed.geometry:",
  //   // nodes.TableMed.geometry
  //   "geo",
  //   geo
  // );

  const ref = useRef();

  // useLayoutEffect(() => {
  //   console.log("useLayoutEffect");
  //   const transform = new THREE.Matrix4();
  //   for (let i = 0; i < numberOfNodes; ++i) {
  //     transform.setPosition(...nodeData[i].position);
  //     ref.current.setMatrixAt(i, transform);
  //   }
  // }, [nodeData]);

  return (
    <instancedMesh ref={ref} args={[geo, null, totalGridSize]}>
      <meshNormalMaterial attach="material" />
      {/* <boxGeometry args={[0.8, 0.8, 0.8]}></boxGeometry> */}
      {/* <meshBasicMaterial attachArray="material" color={"#FCC"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#0B0"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} /> */}
    </instancedMesh>
  );
}

function EntitiesJSX_withRef(entities) {
  //https://codesandbox.io/s/elated-lumiere-exsvq?file=/src/App.jsx
  //const { nodes, materials } = useGLTF("/src/assets/entities/UnitWithAtlasMaterial.glb");
  //const geo = nodes.Unit.geometry.clone();
  const baseEntityModelPath = "/src/assets/entities/betterUnitDecimated_forExportNOHAT.glb";
  const { nodes, materials } = useGLTF(baseEntityModelPath);
  const geo = nodes.Unit.geometry.clone();
  // const defaultTransform = new THREE.Matrix4()
  // .makeRotationX( Math.PI )
  // .multiply( new THREE.Matrix4().makeScale( 1, 1, 1 ) );
  // geo.applyMatrix4( defaultTransform );

  //function get_base_factionArray(){
  const amount = Object.keys(entities)
  let facArr = []
  for (let key of Object.keys(entities)){
    //get data for uniform for shader
    facArr.push(entities[key].faction)
    //return facArr
    // let flt32Array = Float32Array.from(facArr)
    // let int8Arr = Uint8Array.from(facArr)
    // //(() => Float32Array.from(new Array(Object.keys(worldTiles).length).fill().flatMap((_, i) => tempColor.setHex(worldTiles[String(i)].colorHexStr).toArray())), [])
    // return flt32Array
    //return int8Arr
  }

  const factionArray = facArr//get_base_factionArray()
  
  //unitGeo.computeVertexNormals();
  //unitGeo.scale(worldInfo.tileRadius, worldInfo.tileRadius, worldInfo.tileRadius);

  let instancedGeometry = new THREE.InstancedBufferGeometry()
  Object.keys(geo.attributes).forEach(attributeName=>{
    instancedGeometry.attributes[attributeName] = geo.attributes[attributeName]
  })
  instancedGeometry.index = geo.index
  const baseMaxSize = Object.keys(entities).length//1000
  if(factionArray.length < baseMaxSize){
    for(let i=factionArray.length;i<baseMaxSize;i++){
      factionArray.push(-1)
    }
  }
  let flt32Array = Float32Array.from(factionArray)
  let int8Arr = Uint8Array.from(factionArray)
  instancedGeometry.maxInstancedCount = baseMaxSize
  //const myFactionArray = new Uint8Array(baseMaxSize*1)

  instancedGeometry.setAttribute(//addAttribute(
    'aFaction',
    new THREE.InstancedBufferAttribute( flt32Array, 1, true )
  )

  // geo.computeVertexNormals();
  // geo.scale(0.5, 0.5, 0.5);

  instancedGeometry.computeVertexNormals();
  //instancedGeometry.scale(0.5, 0.5, 0.5);
  instancedGeometry.scale(unitGeoScale, unitGeoScale, unitGeoScale);

  // console.log(
  //   "nodes:",
  //   nodes,
  //   "materials:",
  //   materials,
  //   // "nodes.TableMed.geometry:",
  //   // nodes.TableMed.geometry
  //   "geo",
  //   geo,
  //   "instancedGeometry",
  //   instancedGeometry
  // );

  const ref = useRef();

  // useLayoutEffect(() => {
  //   console.log("useLayoutEffect");
  //   const transform = new THREE.Matrix4();
  //   for (let i = 0; i < numberOfNodes; ++i) {
  //     transform.setPosition(...nodeData[i].position);
  //     ref.current.setMatrixAt(i, transform);
  //   }
  // }, [nodeData]);



 
  return [(
    <instancedMesh ref={ref} args={[instancedGeometry, null, totalGridSize]}>
      {/* <instancedBufferAttribute attach="attributes-faction" args={[factionArray, 1]} /> */}
      {/* <meshNormalMaterial attach="material" /> */}
      
      <shaderMaterial toneMapped={false} vertexColors
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      {/* <boxGeometry args={[0.8, 0.8, 0.8]}></boxGeometry> */}
      {/* <meshBasicMaterial attachArray="material" color={"#FCC"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#0B0"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} />
      <meshBasicMaterial attachArray="material" color={"#D42A1F"} /> */}
    </instancedMesh>
  ), ref];
}


function get_decoration_instanceJSX(modelID, GLTFString, entities){
    //Draw all decorations
    let keysOfThisType = []
    for (let key of Object.keys(entities)){
      //get data for clothing decorations
      if (entities[key].modelID == modelID){
        keysOfThisType.push(key)
      }
    }
    // console.log("GLTFString = ")
    // console.log(GLTFString)
    const { nodes, materials } = useGLTF(GLTFString);
    //const { nodes, materials } = useGLTF("src/assets/entities/UnitWithAtlasMaterial.glb");
    // const { mageHatNodes, mageMaterials } = useGLTF("/src/assets/entities/mageHat.glb");
    // const { meleeHatNodes, meleeMaterials } = useGLTF("/src/assets/entities/meleeHat.glb");
    // const { riceHatNodes, riceMaterials } = useGLTF("/src/assets/entities/riceHat.glb");

    // console.log(
    //   "hatNodes:",
    //   nodes,
    //   "hatMaterials:",
    //   materials,
    // );

    const hatGeo = nodes.Hat.geometry.clone();
    //const hatGeo = nodes.Unit.geometry.clone();
    hatGeo.computeVertexNormals();
    //instancedGeometry.scale(0.5, 0.5, 0.5);
    hatGeo.scale(unitGeoScale, unitGeoScale, unitGeoScale);
    const ref = useRef();
    return [(
      <instancedMesh ref={ref} args={[hatGeo, null, totalGridSize]} key={"Hat"+modelID}>
        {/* <instancedBufferAttribute attach="attributes-faction" args={[factionArray, 1]} /> */}
        {/* <meshNormalMaterial attach="material" /> */}
        
        <shaderMaterial toneMapped={false} vertexColors
            vertexShader={hatVertexShader}
            fragmentShader={hatFragmentShader}
          />
      </instancedMesh>
    ), ref];
}

