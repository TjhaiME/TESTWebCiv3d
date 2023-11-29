//CODE STRUCTURE:
//imports
//global variables
//dictionaries
//TASKS - tasks for units and buildings
//APP = start of APP.jsx export (highest scope state variables)
//FUNCS = useful javascript functions (that need to be in APP dues to state variables)
//    -> UI = UI functions
//JSX = functions that return JSX elements for rendering to the screen
//END = end of app.jsx export, can put global functions underneath


import { Suspense, useMemo, useState , useRef} from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { Physics } from '@react-three/rapier';
//import { useFrame } from '@react-three/fiber';
//import { Suspense } from '@react-three/rapier';
import { tw, css } from 'twind/css'
import { Flex, Box } from '@react-three/flex'
//components:
import { Canvas, useFrame } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { RBody } from './components/RBody';
import { miniplexTest } from './components/miniplexTest';
import { KeyboardControls } from '@react-three/drei';
import { Cylinder, Text} from '@react-three/drei';
import { jsonWorld } from './components/jsonWorld';
import { Enemies } from './components/Enemies';
import { LevelA } from './components/LevelA';
import { Blob } from './components/Blob';
import { StarSphere } from './components/starSphere';
import { OrbitControls, CycleRaycast, Html } from '@react-three/drei';
import {InstancedBoxes} from './components/Instancing';

import { Player } from './components/Player';
import { SkySphere } from './components/skySphere';
import { Color,MathUtils } from "three";
//import { MathUtils } from "three";

import SimplexNoise from "./lib/simplexNoise.js";
import HexGrid from './lib/HexGrid.js'
const simplexNoise = new SimplexNoise(Math.random);
const hex = new HexGrid();

// export const Controls = {
//   forward: "forward",
//   back: "back",
//   left: "left",
//   right: "right",
//   jump: "jump",
// }

// export const keyboardMap = [
//   { name: "forward", keys: ["ArrowUp", "KeyW"] },
//   { name: "backward", keys: ["ArrowDown", "KeyS"] },
//   { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
//   { name: "rightward", keys: ["ArrowRight", "KeyD"] },
//   { name: "jump", keys: ["Space", "KeyE"] },
//   { name: "run", keys: ["Shift"] },
//   // Optional animation key map
//   { name: "action1", keys: ["1"] },
//   { name: "action2", keys: ["2"] },
//   { name: "action3", keys: ["3"] },
//   { name: "action4", keys: ["KeyF"] },
// ];
// export const keyboardMap = {
//   { name: "forward", keys: ["ArrowUp", "KeyW"] },
//   { name: "backward", keys: ["ArrowDown", "KeyS"] },
//   { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
//   { name: "rightward", keys: ["ArrowRight", "KeyD"] },
//   { name: "jump", keys: ["Space"] },
//   { name: "run", keys: ["Shift"] },
//   // Optional animation key map
//   { name: "action1", keys: ["1"] },
//   { name: "action2", keys: ["2"] },
//   { name: "action3", keys: ["3"] },
//   { name: "action4", keys: ["KeyF"] },
// };


// import fragmentShader from './shaders/tut3FragShad.js';//3=blob
// import vertexShader from './shaders/tut3VertShad.js';

let playerFaction = 0
//let chosenTileID = 0
//let chosenThing = [0,-1]
let menuContext = 0;
let lastMenuContext = 0;
let lastHoveredID = Infinity;
let storedChosenID = -1; //so when we need to click a seperate entity we can remember who we are clicking it for
let storedTaskID = -1;
//let gameState = 0
//let  [gameState, setGameState] = useState("ParentString")
// function setGameState(newGameState){
//   gameState = newGameState

// }
const gameStateIntToStr = {
  0 : "default",//select something to do state (or look around the world)
  1 : "orders"//give a unit orders by selecting a point in the world to "walk" to
  //2 : "buildMenu",//choose task for structure
}

function remove_array_element(array,element){
  //console.log("remove_array_element function")
  let newArray = array.map((x) => x);
  const index = newArray.indexOf(element);
  //console.log("before")
  //console.log(newArray)
  if (index > -1) { // only splice array when item is found
    newArray.splice(index, 1); // 2nd parameter means remove one item only
  }
  //let newArray = structuredClone(array)
  // console.log(array)
  // console.log("element = "+element)
  // console.log("finalArray = ")
  //console.log("after")
  //console.log(newArray)
  return newArray
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//              SETTING UP WORLD OBJECTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let worldTiles = {}
let tileDefault = {
  "q" : 0,//cube coords
  "r" : 0,
  "noise" : 0,
  "ogNoise":0,//original noise
  "posX" : 0,
  "posY" : 0,
  "entityID":-1, //only 1 per tile
  "structID":-1, //if -1 then it is not occupied (//structID is 8 chars, structureID is more)
  "yields":{
    "food" : 0, //FIDS(I) -> FPGD and LuxID
    //"production" : 0, //production is based on things we build for the city centre
    "salt" : 0, //rare resources always wanted for trade
    "diversity" : 0.5, //how much science boosts we get from this tile
    "luxuryID" : -1, //if it has a luxuryresource give its ID
  },//trees, mineral etc
  "colorHexStr" : 0xffffff,
  "extraState" : 0,//if we are part of a path we should change colour
}




let worldInfo = {
  "worldRadius":10,//tiles to left and right up and down
  "totalGridSize":441,//saved in code based on worldRadius
  "tileRadius" : 0.5,//physical radius of hex tile
  "tileHeight" : 5,
  "minNoise" : -2,//min height
  "maxNoise" : 1,//max height
  "noiseScale" : 0.05,//when putting gridPos into simplexNoise.noise2D() we need to scale it so its closer
  "dugYieldMod" : 3,//the amount of material yielded from digging a tile
  "digNoiseAmount" : 0.1,//amount the land goes down in noise value when dug
  "digDiversitySub" : 0.15,//amount of biodiversity lost by digging the land
  "workDiversitySub" : 0.05,//amount of biodiversity lost by working the land
  "maxDistrictDist" : 3,//max distance from city centre that you can build districts
  "foodConsumeRate" : 0.2,//food that each population eats per turn
  "noFoodMortalityPenalty" : 0.1,
  "noFoodHappinessPenalty" : 0.1,
  "foodHappinessMax" : 0.5,
  "baseGrowthRate" : 0.8,//if fed we contribute this much to increasing population each turn (multiplied by happiness)
  "modelIDToHat" : { //needs to be in worldInfo so we an access it in instances.js
    "-1": "null",
    "0" : "mage",
    "1" : "melee",
    "2" : "rice"
  },
  "nextDecorID" : {
    //when we set an ID for the next hat we need to increment one of these
    "null" : 0,
    "mage" : 0,
    "melee" : 0,
    "rice" : 0
  }
  //"maxHeight" : 5,
}//so we only have to change worldRadius and NOT totalGridSize

/* //to apply this to get the next instID:
const decorType = worldInfo.modelIDToHat[modelID]
const decorInstID = worldInfo.nextDecorID[decorType]
worldInfo.nextDecorID[decorType]++
entities[entityKey].decorID = decorInstID
*/


worldInfo.totalGridSize = (2*worldInfo.worldRadius+1)*(2*worldInfo.worldRadius+1)


function get_inital_world_data(){
  const worldRadius = worldInfo.worldRadius
  const totalGridSize = (2*worldRadius+1)*(2*worldRadius+1)
  const hexRad = worldInfo.tileRadius
  const sqrtThree = Math.sqrt(3)
  //use cube coordinates or axial
  //https://www.redblobgames.com/grids/hexagons/
  //3 axes q,r,s; q+r+s=0
  //loop(for all q)loop(for all r){s=-r-q}{}
  
  let i=0
  for(let q=-worldRadius;q<worldRadius+1;q++){
    for(let r=-worldRadius;r<worldRadius+1;r++){
      const s = hex.getLastCubeCoord(q,r)
      const tileKey = String(i)
      //const intID = parseInt(tileKey)
      worldTiles[tileKey] = structuredClone(tileDefault)
      worldTiles[tileKey]["q"] = q
      worldTiles[tileKey]["r"] = r
      const noiseScale = worldInfo.noiseScale
      worldTiles[tileKey]["noise"] = simplexNoise.noise2D(noiseScale*q,noiseScale*r)
      worldTiles[tileKey]["ogNoise"] = worldTiles[tileKey]["noise"]
      const myPos = hex.axialToFlatPos(q,r, hexRad)
      worldTiles[tileKey]["posX"] = myPos[0]
      worldTiles[tileKey]["posY"] = myPos[1]
      const rand = randNumber_for_tile(tileKey)//in [0,1]
      const totalYield = 4
      worldTiles[tileKey]["yields"].food = rand*totalYield
      worldTiles[tileKey]["yields"].salt = rand*totalYield
      const rand2 = 0.5*randNumber_for_tile(tileKey,2)//in [-0.5 0.5]
      worldTiles[tileKey]["yields"].diversity = 0.5 + rand2



      //worldTiles[tileKey]["colorHexStr"] = Math.random() * 0xffffff
      const noise = worldTiles[tileKey]["noise"]
      let newColour = 0xffffff
      if(noise < -0.8){
        newColour = 0x000000
      }else if(noise <-0.6){
        newColour = 0x12086F
      }else if(noise <-0.4){
        newColour = 0x2B358F
      }else if(noise <-0.3){
        newColour = 0xcdaa7f
      }else if(noise <-0.2){
        newColour = 0x6E260
      }else if(noise <0.6){
        newColour = 0x228B22*(1+0.02*noise)
      }
      worldTiles[tileKey]["colorHexStr"] = newColour
      console.log("ID="+i+" gridPos[q,r]=["+q+","+r+"]")
      const newID = hex.IDFromGridPos([q,r], worldInfo.worldRadius)

      console.log("getIDFromGridPos="+newID)
      i++
    }
  }
  //(3,2)=(q,r) => is the vector sum of 3*q and 2*r as basis vectors

}


function get_inital_random_entity_data(){
  const worldRadius = worldInfo.worldRadius
  let i=0
  for(let q=-worldRadius;q<worldRadius+1;q++){
    for(let r=-worldRadius;r<worldRadius+1;r++){
      if(Math.random()*10 < 2){
        //spawn entity on that tile
        spawnEntity(0, i%2, [q,r])
        i++
      }
    }
  }
  
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////////////////////////////
//              Game Data Objects
//////////////////////////////////////////////////////////////////////////////////////////
//make UI to add entities and structures to scene
const gameStateEnum = {
  "default" : 0,
  "orders" : 1
}
const subStateEnum = {
  "0" : {
    "default":0
  },
  "1" : {
    "moveUnit":0,
    "chooseAtkTarget":1,
    "chooseBuildSpot":2
  }
}



let trees = {}
//populate an array full of trees for different tiles
const treeDefault = {
  "type" : 0,
  "amount" : 1,
  "gridPos" : [0,0]
}




let entities = {}//all the units/entities in the world
const entityDefault = {
  "instID" : -1,
  "name" : "entityInstX",
  "gridPos":[0,0],
  "modelID": -1,//type of decoration
  "decorID" : -1,//instID of decoration
  "faction":0,
  "unitTypeID":0,
  //level:0,//do with stat mult
  "statMult":{
  //e.g. "atk" : 1.2,
  /*so we can loop through this object and see if we need to adjust the value of any of our stats*/
  },
  "supplies":{},//get from suppliesDefault
  //"haveMoved":false,
  "haveAttacked":false,
  "MP":100, //movement points we get more each turn.//should br a max though
  "extraActionAmmo" :[1],//[1,1,...],/*must be same size as the unitType.extraActionIDs array.*/
  "HP":100,//unitType.maxHP,
  "sleeping":false,//so we can skip turn
  "tasks":[]//we need to record what the player wants us to do.
}

let unitTypes = {
  "0":{//we need a default to test code
    "MPPerTurn":10,
    "maxMP":200,//maximum amount of movement points
    "maxHP": 20,
    "atk": 5,
    "def": 1,
    "range": 1,
    "accuracy":0.9,
    "extraActionIDs":[0,1,2],//add special attacks /e.g. building
    //will need an object elsewhere to get data on their effects.
    "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
    "terrainType": 0, // is it a land unit, sea unit or air unit etc.
    "name" : "workerUnit",
    "modelID" : 2
    
  },
  "1":{//we need a default to test code
    "MPPerTurn":10,
    "maxMP":200,//maximum amount of movement points
    "maxHP": 20,
    "atk": 5,
    "def": 1,
    "range": 2,
    "accuracy":0.8,
    "extraActionIDs":[],//add special attacks /e.g. building
    //will need an object elsewhere to get data on their effects.
    "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
    "terrainType": 0, // is it a land unit, sea unit or air unit etc.
    "name" : "rangedUnit",
    "modelID" : 1
    
  },
  "2":{//we need a default to test code
    "MPPerTurn":10,
    "maxMP":200,//maximum amount of movement points
    "maxHP": 20,
    "atk": 5,
    "def": 1,
    "range": 2,
    "accuracy":0.8,
    "extraActionIDs":[],//add special attacks /e.g. building
    //will need an object elsewhere to get data on their effects.
    "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
    "terrainType": 0, // is it a land unit, sea unit or air unit etc.
    "name" : "meleeUnit",
    "modelID" : 0
    
  }
}//static info on various unitTypes
const unitTypeDefault ={
  //for each unitTypeID we have extra data that doesn't change
  "MPPerTurn":10,
  "maxMP":200,//maximum amount of movement points
  "maxHP": 100,
  "atk": 1,
  "def": 1,
  "range": 1,
  "accuracy":0.9,
  "extraActionIDs":[],//add extraActions /
  //will need an object elsewhere to get data on their effects.
  "weaknessID": 0,// for scissorspaperrock things. (Need to represent strengths and weakness somehow)
  "terrainType": 0, // is it a land unit, sea unit or air unit etc.
  "name" : "nullUnit",
  "modelID" : -1
  

}

const suppliesDefault = {
  "food" : 0,//food for feeding population
  "salt" : 0,//currency for trade
  "wood" : 0,//renewable building material
  "soil" : 0,//top layer of non-renewable building materials
  "sand" : 0,//top layer beach
  "ltStone" : 0,//just under layer
  "hvStone" : 0,//very under layer
  "ltMetal" : 0,//mixed in lightStone layer
  "hvMetal" : 0,//mixed in denseStone layer
  "crystal" : 0//mixed throughout
}

let structures = {}
const structureDefault = { //default for instance based information on structures
  //some of these should be in a townData
  "name" : "null_struct_name",
  "instID":-1,
  "typeID":0,//for static info
  //below is for instance specific info
  "faction":0,
  "HP":100,
  "maintenance":100,// slowly ticks down
  "garrison":[],// entityIDs in town. 
  "currentTaskID":[],
  "doingTask": false,
  "underSiege": false,
  // "inventory":{
  //   //extraActionID:ammo
  // },//for restocking
  "suppliesPerTurn":{},//get from suppliesDefault
  "housing" : 0,
  //we will need stats for speed at which we do tasks.
  "statMult":{
    //e.g. "atk" : 1.2,
    /*so we can loop through this object and see if we need to adjust the value of any of our stats*/
    },

  "modelID" : 0,
  "sleeping":false,
  "tasks":[],//we need to record what the player wants us to do.
  "taskStatus":0,// it is set to the production amount then an amount is removed each turn until it gets to zero and it is complete
  "townKey" : "-1",
  "upgradeSlots" : 3,
}


// structureTypes[structTypeID]["maxHP"]
let structureTypes = {
  "0":{
    "maxHP":100,
    "def":5,
    "atk":10,
    "range":2,
    "production":5,
    "taskIDs":[0,-1],//make worker
    "name":"cityCentre",
    "capitalStruct" : true,
    "upgradeSlots" : 5
  },
  "1":{
    "maxHP":50,
    "def":1,
    "atk":1,
    "range":1,
    "production":2,
    "taskIDs":[],//build more housing
    "name":"neighbourhood",
    "capitalStruct" : false,
    "upgradeSlots" : 5
  },
  "2":{
    "maxHP":50,
    "def":10,
    "atk":15,
    "range":2,
    "production":3,
    "taskIDs":[1,2],//make soldiers
    "name":"militaryDistrict",
    "capitalStruct" : false,
    "upgradeSlots" : 3
  },
}//Holds static information about structures
//I should be the person populating it
const structureTypeDefault={
  "maxHP":100,
  "def":1,
  "atk":1,
  "range":1,
  "production":1,
  //"taskData":{},
  "taskIDs":[],//+for Units -ve up to 10 districts, -11+ upgrades
  "name":"nullStruct",
  "capitalStruct" : false,
  "upgradeSlots" : 5

}

let towns = {}
const townDefault = {
  "population" : 1,
  "nextPopCount" : 1, //decrease over time until we hit 0
  "happiness" : 1,
  "mortality" : 0.1,
  "deathCount" : 0,//when it gets to one we lose a population
  "production" : 1,
  "districtIDs" : [],//the first is always cityCentre
  "inventory" : {//if put here, can be transferred instantly from district
    //extraActionID:ammo
  },//for restocking
  "supplies" : {},//get from suppliesDefault
  //"storedFood" : 1,
  "foodWasteRate" : 0.1,
  "name" : "insert town name",
  "faction" : -1,
}

function setUpTownFromCityCentre(structKey){
  const newTownKey = String(towns.length)
  structures[structKey].townKey = newTownKey
  towns[newTownKey] = structuredClone(townDefault)
  towns[newTownKey].districtIDs.push(structKey)
  towns[newTownKey].supplies = structuredClone(suppliesDefault)
  towns[newTownKey].name = new_random_building_name("town")
  towns[newTownKey].faction = structures[structKey].faction
  return newTownKey
}

let factionData = {}
const factionDataDefault = {
  "friends" : [],
  "allies" : [],
  "wars" : [],
  "colours" : [],
  "townKeys" : []
  
  }

///////////////////////////
/////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

     /////////   ///     /////    // //   /////    
        //     //_//    //  /    // //   //  / 
       //     // //      \\     //\\      \\ 
      //     // //     \\//    //  \\   \\// 

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////
///////////////////////////

const structureTaskData = {
  ////////////////////////////
  //      Make Unit Tasks    (build new entity)
  ////////////////////////////
  "0" : {  
    "name" : "Build Worker",
    "funcStr" : "build_unit",
    "parameters" : [0],//worker
    "damage" : 0,
    "range" : 0,
    "checkEntity" : true,
    "isUpgrade" : false
  },
  "1" : {  
    "name" : "Build Ranged ",
    "funcStr" : "build_unit",
    "parameters" : [1],//ranged
    "damage" : 0,
    "range" : 0,
    "checkEntity" : true,
    "isUpgrade" : false
  },
  "2" : {  
    "name" : "Build Melee ",
    "funcStr" : "build_unit",
    "parameters" : [2],//melee
    "damage" : 0,
    "range" : 0,
    "checkEntity" : true,
    "isUpgrade" : false
  },
  /////////////////////////////////////////
  //       Build District Tasks    (build new structure)
  ///////////////////////////////////////
  "-1" : {  
    "name" : "Build Neighbourhood District ",
    "funcStr" : "setUp_district",
    "parameters" : [1],//housing
    "damage" : 0,
    "range" : 0,
    "checkEntity" : false,
    "isUpgrade" : false
  },
  //////////////////////////////////////
  //      Structure Upgrade Tasks   (DONT build new structure)
  ////////////////////////////////////
  "-11" : {  
    "name" : "Upgrade Defense (Small)",
    "funcStr" : "upgradeStat",
    "parameters" : ["def",1],
    "damage" : 0,
    "range" : 0,
    "checkEntity" : false,
    "isUpgrade" : false
  },
}
const structureTaskDefault = {
  "name" : "build unit",
  "funcStr" : "build_unit",
  "parameters" : [0],
  "damage" : 0,
  "range" : 0,
  "checkEntity" : false,
  "isUpgrade" : false
}

const extraActionsData = {//includes buildings and bombs etc all one use things
  "0" : {  
    "name" : "Build City Centre",
    "funcStr" : "build_building",
    "parameters" : [0],
    "damage" : 0,
    "range" : 0
  },
  "1" : {  
    "name" : "Work Land",
    "funcStr" : "work_land",
    "parameters" : [],
    "damage" : 0,
    "range" : 0
  },
  "2" : {  
    "name" : "Dig Land",
    "funcStr" : "dig_land",
    "parameters" : [],
    "damage" : 0,
    "range" : 0
  },
}

const extraActionDefault = {
  "name" : "build building",
  "funcStr" : "build_building", //will call build_building(entityKey,0)
  "parameters" : [0],
  "damage" : 0,
  "range" : 0
}


// //use eval(functionName + "()"); to call a function from a string
// //use eval(funcStr + "("+parameter+")"); to call a function from a string
// function evaluateExtraAction(entityKey, extraActionID){
//   //
//   const extraActionKey = String(extraActionID)
//   console.log("extraActionKey = "+extraActionKey)
//   console.log(extraActionsData[extraActionKey])
//   let extraActionString = extraActionsData[extraActionKey]["funcStr"]
//   extraActionString += "("
//   extraActionString += String(entityKey)
//   for(let i=0;i<extraActionsData[extraActionKey]["parameters"].length;i++){
//     // if(i!=0){ //if we have entityID as the first variable then wealways need the comma
//     extraActionString += ","
//     // }
//     const param = extraActionsData[extraActionKey]["parameters"][i]
//     extraActionString += param

//   }
//   extraActionString += ")"
//   //
//   const returnVal = eval(extraActionString)
//   return returnVal
// }
// function evaluateStructureTask(structureKey, structureTaskID){
//   //
//   const structureTaskKey = String(structureTaskID)
//   console.log("structureTaskKey = "+structureTaskKey)
//   console.log(structureTaskData[structureTaskKey])
//   let structureTaskString = structureTaskData[structureTaskKey]["funcStr"]
//   structureTaskString += "("
//   structureTaskString += String(structureKey)
//   for(let i=0;i<structureTaskData[structureTaskKey]["parameters"].length;i++){
//     // if(i!=0){ //if we have entityID as the first variable then wealways need the comma
//     structureTaskString += ","
//     // }
//     const param = structureTaskData[structureTaskKey]["parameters"][i]
//     structureTaskString += param

//   }
//   structureTaskString += ")"
//   //
//   console.log("structureTaskString = "+ structureTaskString)
//   const returnVal = eval(structureTaskString)
//   return returnVal
// }

//////////////////////////////////
//The functions below say they arent used but they are called by strings using above functions
////////////////////////////////

/////////////////////
// Entity tasks
///////////////////

function build_building(entityKey,structTypeID){
  //add new structure to structures of type structType
  //we can get info like position anf faction from entityID
  const faction = entities[entityKey]["faction"]
  const gridPos = entities[entityKey]["gridPos"]
  const newStructID = create_structure(structTypeID, faction, gridPos)

}
function work_land(entityKey){
  //work the salt and food from the land
  const gridPos = entities[entityKey].gridPos
  const tileID = hex.IDFromGridPos(gridPos, worldInfo.worldRadius)
  const tileKey = String(tileID)

  if(worldInfo[tileKey].structID != -1){
    //we cant forage for natural things if there is a building there
    return
  }

  const diversityYield = worldTiles[tileKey].yields.diversity
  const foodYield = worldTiles[tileKey].yields.food
  const saltYield = worldTiles[tileKey].yields.salt
  console.log("saltYield = ", saltYield)
  console.log("before foraging, supplies = ")
  console.log(entities[entityKey].supplies)
  entities[entityKey].supplies["food"] += foodYield + diversityYield*foodYield
  entities[entityKey].supplies["salt"] += saltYield
  entities[entityKey].MP = 0
  worldTiles[tileKey].yields.diversity -= worldInfo.workDiversitySub
  console.log("just foraged: supplies for entity " + entityKey + " = ")
  console.log(entities[entityKey].supplies)
}
function dig_land(entityKey){
  //dig the land for building resources
  //figure out a deterministic way to decide what we get at that height
  const gridPos = entities[entityKey].gridPos
  const tileID = hex.IDFromGridPos(gridPos, worldInfo.worldRadius)
  const tileKey = String(tileID)
  if(worldTiles[tileKey].structID != -1){
    //we cant dig if there is a building there
    return
  }
  let suppliesIGot = get_dug_materials(tileKey)
  //put in the entities supplies
  let countOfZeros = Object.keys(suppliesIGot).length
  console.log("suppliesIGot = ")
  console.log(suppliesIGot)
  for (let supplyKey of Object.keys(suppliesIGot)){
    //add to entityInventory
    if(suppliesIGot[supplyKey] == 0){
      countOfZeros -= 1
    }
    entities[entityKey].supplies[supplyKey] += suppliesIGot[supplyKey]
  }
  if(countOfZeros <= 0){
    //we got no materials so this shouldnt count as a turn
    return
  }
  //TODO:get entitiy to walk back home
  entities[entityKey].MP = 0
  //make the land go down a step (stop at a minimum)
  worldTiles[tileKey].yields.diversity -= worldInfo.digDiversitySub
  if (worldTiles[tileKey].yields.diversity <= 0){
    worldTiles[tileKey].yields.diversity = 0
  }

  worldTiles[tileKey].noise -= worldInfo.digNoiseAmount
  console.log("just dug: supplies for entity " + entityKey + " = ")
  console.log(entities[entityKey].supplies)
}


/////////////////////
// Structure tasks
///////////////////


function build_unit(structureKey,unitTypeID){
  //add new structure to structures of type structType
  //we can get info like position anf faction from entityID
  const faction = structures[structureKey]["faction"]
  const gridPos = structures[structureKey]["gridPos"]
  //const newStructID = create_structure(structTypeID, faction, gridPos)
  const newEntityID = spawnEntity(unitTypeID, faction, gridPos)

}

const districtTypeEnum = {
  "housing" : 0,
  "military" : 1,
  "food" : 2,
  "salt" : 3,
  "industry" : 4,
  //etc
}
const structTypeFromDistrictType = {
  "housing" : -1,
} 

///more tasks inside app(){} due to satte variable scope


function getKeyByValue(object, value) { 
  return Object.keys(object).find(key => 
      object[key] === value); 
} 

function new_random_building_name(typeString){
  const firstParts = ["The", "El", "2nd Best", "Grandest", "Your Local", "Ye Olde"]
  const secondParts = ["Grand", "Magical", "Bougois", "Cheap", "Community", "NGO", "Military", "Unwelcoming"]
  let lastParts = []
  if (typeString == "struct"){
    lastParts = ["Shop", "Shoppe", "Palace", "Hotel", "Restaurant", "Place of Meeting", "Church"]
  }else if (typeString == "entity"){
    lastParts = ["Being", "(Wo)Man", "Dude", "Dingus", "The cool guy", "Thing", "Sheila"]
  }else if (typeString == "town"){
    lastParts = ["Anarchasyndacalist Commune", "Universe", "Slavecamp", "Land Of The Free", "O' Wales", "Land", "Kingdom"]
  }

  
  const newName = firstParts[Math.floor(Math.random*firstParts.length)] + secondParts[Math.floor(Math.random*secondParts.length)] + lastParts[Math.floor(Math.random*lastParts.length)]
  return newName
}


//////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//    Game Functions         Data Manipulation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*Along with the instanceID we should also pass the context, that is, which type of thing we are selecting. Or from which dictionary/instance is the ID for*/

const typeID_to_word = {
  0:"structure",
  1:"entity",
  2:"land"
}




function moveEntityToTile(entityID, newGridPos){

  const oldGridPos = entities[String(entityID)].gridPos
  //change info in entityDic
  entities[String(entityID)].gridPos = newGridPos
  
  const oldTileID = hex.IDFromGridPos(oldGridPos, worldInfo.worldRadius)
  const newTileID = hex.IDFromGridPos(newGridPos, worldInfo.worldRadius)
  
  //remove entity from worldTiles[String(oldTileID)].entities[]
  //add entity to worldTiles[String(newTileID)].entities[]
  worldTiles[String(oldTileID)].entityID = -1;//no one is here now
  worldTiles[String(newTileID)].entityID = entityID;
  
}
  // If we pass different props to the child it should notice when they change and render differently 
  // We need an instance for units too.
  
  
function create_structure(structureTypeID, faction, gridPos, townKey = -1){
  //make a default structure
  //populate bits we can
  const structID = Object.keys(structures).length
  structures[String(structID)] = structuredClone(structureDefault)
  structures[String(structID)].gridPos = gridPos
  structures[String(structID)].typeID = structureTypeID
  structures[String(structID)]["name"] = new_random_building_name("struct")
  structures[String(structID)]["faction"] = faction
  //structures[String(structID)].suppliesPerTurn = structuredClone(suppliesDefault)
  //Health = maxhealth
  structures[String(structID)].HP = structureTypes[String(structureTypeID)].maxHP
  structures[String(structID)].instID = structID
  structures[String(structID)].upgradeSlots = structureTypes[String(structureTypeID)].upgradeSlots
  //others are probably needed too
  worldTiles[String(hex.IDFromGridPos(gridPos, worldInfo.worldRadius))].structID = structID


  if(structureTypes[String(structureTypeID)].capitalStruct == false){
    if(townKey == -1){
      console.log("ERROR, forgot to pass a townKey variable for a non capital structure")
      debugger
    }
    structures[String(structID)].townKey = townKey
  }else{
    //it is a capital city so we should make a new town
    const newTownKey = setUpTownFromCityCentre(String(structID))
    structures[String(structID)].townKey = newTownKey
  }

  return structID

}
  
  
function spawnEntity(unitTypeID, faction, gridPos){
  const entityID = Object.keys(entities).length
  const entityKey = String(entityID)
  worldTiles[String(hex.IDFromGridPos(gridPos, worldInfo.worldRadius))].entityID = entityID
  entities[entityKey] = structuredClone(entityDefault)
  entities[entityKey].unitTypeID = unitTypeID
  entities[entityKey].instID = entityID//it might change but it starts as our ID
  entities[entityKey].faction = faction
  entities[entityKey].gridPos = gridPos
  entities[entityKey].supplies = structuredClone(suppliesDefault)

  const typeModelID = unitTypes[unitTypeID].modelID
  
  //the modelID is the type of decoration we have
  //if there are no unused IDs then we get a new one
  const decorType = worldInfo.modelIDToHat[typeModelID]
  const decorInstID = worldInfo.nextDecorID[decorType]
  worldInfo.nextDecorID[decorType]++
  entities[entityKey].modelID = typeModelID
  entities[entityKey].decorID = decorInstID
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //entities[entityKey].decorID = get_new_decorInstID()


  return entityID
  //entities[entityKey].MP = 1
}

// function getTileIDFromGridPos(gridPos){
//   return gridPos[0] + ((2*worldInfo.worldRadius)+ 1)*gridPos[1]
// }//TEST




////////////////////////////////////////////////////////////////////////////////////////////////////////////

get_inital_world_data()
//NEED to check gridPos
get_inital_random_entity_data()
console.log("worldTiles")
console.log(worldTiles)
console.log("entities")
console.log(entities)
let lastHoveredPath = [] //for saving a dijkstra path



function App() {
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //             AA            PPPPP        PPPPP
  //            A__A           P___P        P___P
  //           A    A          P            P
  //          A      A         P            P
  //
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////
  // Initialise state variables


  let [gameState, setGameState] = useState(0)
  let [subState, setSubState] = useState(0)//when we want the same general gameState but different sub methods
  //setGameState(0)
  let extraMessage = ""
  let [message, setMessage] = useState("ParentString")
  let [tileText, setTileTextObj] = useState({"0":"Game Start"})

  let [stateTest, changeTstSte] = useState(false)
  function changeState(){
    changeTstSte(!stateTest)
  }//doesnt update everything else it seems
  //can we put all variables that should force an update
  // inside a state object?
  // const initialState = {
  //   "gameState" : 0,
  //   "chosenThing" : [0,-1],
  //   "chosenTileID" : 0,
  //   "menuContext" : 0
  // }
  // let [stateObj, setMyStateObject] = useState(initialState)
  // function setStateObj(objsToUpdate){
  //   let newState = structuredClone(stateObj)
  //   for (key of Object.keys(objsToUpdate)){
  //     newState[key] = objsToUpdate[key]
  //   }
  //   setMyStateObject(newState)
  // }//So we want to use setStateObj(objsToUpdate)
  //where e.g. objsToUpdate = {"gameState":2}
  //Then change all versions of gameState to be from this
  // const initialChosens = {
  //   "Thing" : [0,-1],
  //   "TileID" : 0,
  // }
  // let [chosen, setMyChosens] = useState(initialChosens)

  //let [gameState, setGameState] = useState(0)
  // let chosenTileID = 0
  // let chosenThing = [0,-1]
   let [chosenTileID, setChosenTileID] = useState(0)
   let [chosenThing, setChosenThing] = useState([0,-1])


  /////////////////////////////////////////////////////////////////////
  // END INITIALISATION OF STATE VARIABLES
 /////////////////////////////////////////////////////////////////////


 /////////////////////////////////////////////////////////////////////////////////////////////////////////
 //
 //              FFFFFFFFF    UU     UU    NNNN     NN     CCCCCCCCC      SSSSSSS
 //              FF           UU     UU    NN  N    NN     CC      C      SS
 //              FFFFFF       UU     UU    NN   N   NN     CC               SS
 //              FF           UU     UU    NN    N  NN     CC                SS
 //              FF            UU   UU     NN     N NN     CC      C           SS
 //              FF             UUUUU      NN      NNN     CCCCCCCCC      SSSSSSS
 //
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////
 //functions that deal with state variables that do NOT return JSX elements
 ///////////////////////////////////////

 function clickFunction(typeID, instID){
    //click function for default game state
    setMessage("we just clicked"+typeID_to_word[typeID]+String(instID))
    //chosenTileID = instID
    setChosenTileID(instID)
    const tileKey = String(instID)
    //worldTiles[tileKey].noise += 0.1//TEST

    //if the tile has an entity or a structure or both
    const hasEntity = (worldTiles[tileKey].entityID != -1)
    const hasStructure = (worldTiles[tileKey].structID != -1)

    if (hasEntity && hasStructure){
      //then if one is selected we want to choose the other
      if (typeID_to_word[chosenThing[0]] == "entity"){
        //structure selected so choose the entity on the tile
        // chosenThing[0] = 1 //entity
        // chosenThing[1] = worldTiles[tileKey].entityID
        setChosenThing([0,worldTiles[tileKey].structID])
      }else{
        //entity selected so choose the structure
        setChosenThing([1,worldTiles[tileKey].entityID])
      }
    }else if(hasEntity == false && hasStructure == true){
      //choose struct on tile
      setChosenThing([0,worldTiles[tileKey].structID])
    }else if(hasEntity == true && hasStructure == false){
      setChosenThing([1,worldTiles[tileKey].entityID])
    }else{
      //its just an empty tile
      //do nothing
    }
  }

  function moveHoverFunction(instID){
    if(instID === lastHoveredID){
      return []
    }
    //lastHoveredID = instID do at bottom
    //EG move unit
    const entityID = chosenThing[1]
    const tileKey = String(instID)
    //const entityKey = String(entityID)
    //BAD
    //entities[entityKey].gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
    const currentTile = entities[String(entityID)].gridPos
    const finalTile = [worldTiles[tileKey].q,worldTiles[tileKey].r]
    const newPath = find_path_on_grid_with_dijkstra_algorithim(currentTile, finalTile)
    console.log("new dijkstra path to ",finalTile," = ")
    console.log(newPath)
    //delete the highlight state on the old tiles
    //if lastHoveredPath.length == 0?
    for (let tileIndex = 0;tileIndex < lastHoveredPath.length;tileIndex++){
      const tile = lastHoveredPath[tileIndex]
      const tileID = hex.IDFromGridPos(tile,worldInfo.worldRadius)
      const otherTileKey = String(tileID)
      worldTiles[otherTileKey].extraState = 0
    }//set the highlight state on the new ones
    for (let tileIndex = 0;tileIndex < newPath.length;tileIndex++){
      const tile = newPath[tileIndex]
      const tileID = hex.IDFromGridPos(tile,worldInfo.worldRadius)
      const otherTileKey = String(tileID)
      worldTiles[otherTileKey].extraState = 1
      console.log("Is part of the path ", tileID)
      changeState()
    }
    lastHoveredPath = newPath
    //now the game should be able to  know if we want to higihlight the path
    lastHoveredID = instID
    let textObj = {}
    for (let tileIndex = 0;tileIndex < newPath.length;tileIndex++){
      const tile = newPath[tileIndex]
      const tileID = hex.IDFromGridPos(tile,worldInfo.worldRadius)
      const otherTileKey = String(tileID)
      textObj[otherTileKey] = String(tileIndex)
    }
    //create text for UI
    setTileTextObj(textObj)
    console.log("text object updated")

    return lastHoveredPath
  }
  function nullHoverFunction(instID){
    return []
  }



        ////////////////////////////////////////////////          /       /-\
        //              Attacking stuff                          /       |   |
        ////////////////////////////////////////////////        /)        \_/

  function get_absolute_stats(entityKey){
    const unitTypeID = entities[entityKey].unitTypeID
    //get base stats for unit type (static data)
    const baseStats = ["atk", "def", "range", "accuracy"]
    // let absoluteStats = {
    //   "atk" : unitTypes[String(unitTypeID)].atk,
    //   "def" : unitTypes[String(unitTypeID)].def,
    //   "range" : unitTypes[String(unitTypeID)].range,
    // }
    let absoluteStats = {}
    for (let statKey of baseStats){
      absoluteStats[statKey] = unitTypes[String(unitTypeID)][statKey]
    }
    //apply stat multipliers
    for(let statKey of Object.keys(entities[entityKey].statMult)){
      absoluteStats[statKey] *= entities[entityKey].statMult[statKey]
    }
    //Need to apply other modifiers like HP lowering attack or defense and terrain etc
    return absoluteStats
  
  }
  
  function attack_between_entities(entityKey1,entityKey2){
    //entityKey1 attacks first then entitiyKey2 attacks
    // let stats1 = get_absolute_stats(entityKey1)
    // let stats2 = get_absolute_stats(entityKey2) //DO EACH TIME
    ////entityKey1 attacks first 
    one_direction_attack(entityKey1,entityKey2)
  
  
    ////then entitiyKey2 attacks back
    one_direction_attack(entityKey2,entityKey1)
  
  
  }
  
  function one_direction_attack(attackerKey,defenderKey){
    let attackerStats = get_absolute_stats(attackerKey)
    let defenderStats = get_absolute_stats(defenderKey)
    //get damage
    const damage = attackerStats["atk"]/defenderStats["def"]
    entity_take_damage(damage,defenderKey)
  
  }
  
  function entity_take_damage(damage, entityKey){
    entities[entityKey].HP -= damage
    console.log("entity ", entityKey, " took ", damage, " damage, and now has HP = ", entities[entityKey].HP )
    if (entities[entityKey].HP <= 0){
      entity_dies(entityKey)
    }
  }
  
  function entity_dies(entityKey){
    //tell the tile we are on that we arent on it anymore
    const gridPos = entities[entityKey].gridPos
    const tileID = hex.IDFromGridPos(gridPos,worldInfo.worldRadius)
    worldTiles[String(tileID)].entityID = -1


    delete entities[entityKey]
  }

  ///////////////////////////////////             ////////
  //                                                //
  //   Tasks                                       //
  //            (That need state variables)       //
  // 
  /////////////////////////////////////////

  ///eval task functions
//use eval(functionName + "()"); to call a function from a string
//use eval(funcStr + "("+parameter+")"); to call a function from a string
function evaluateExtraAction(entityKey, extraActionID){
  //
  const extraActionKey = String(extraActionID)
  console.log("extraActionKey = "+extraActionKey)
  console.log(extraActionsData[extraActionKey])
  let extraActionString = extraActionsData[extraActionKey]["funcStr"]
  extraActionString += "("
  extraActionString += String(entityKey)
  for(let i=0;i<extraActionsData[extraActionKey]["parameters"].length;i++){
    // if(i!=0){ //if we have entityID as the first variable then wealways need the comma
    extraActionString += ","
    // }
    const param = extraActionsData[extraActionKey]["parameters"][i]
    extraActionString += param

  }
  extraActionString += ")"
  //
  const returnVal = eval(extraActionString)
  return returnVal
}
function evaluateStructureTask(structureKey, structureTaskID){
  //
  const structureTaskKey = String(structureTaskID)
  console.log("structureTaskKey = "+structureTaskKey)
  console.log(structureTaskData[structureTaskKey])
  let structureTaskString = structureTaskData[structureTaskKey]["funcStr"]
  structureTaskString += "("
  structureTaskString += String(structureKey)
  for(let i=0;i<structureTaskData[structureTaskKey]["parameters"].length;i++){
    // if(i!=0){ //if we have entityID as the first variable then wealways need the comma
    structureTaskString += ","
    // }
    const param = structureTaskData[structureTaskKey]["parameters"][i]
    structureTaskString += param

  }
  structureTaskString += ")"
  //
  console.log("structureTaskString = "+ structureTaskString)
  const returnVal = eval(structureTaskString)
  return returnVal
}

//actual tasks start below
//      /////
//       /
//      /
  function setUp_district(structureKey,structTypeID){
    //if(districtType == districtTypeEnum["housing"]){//housing
    //we need to go into tile select mode
    //to select a spot that is apprpriate
    //then build the chosen district
    console.log("in set up build district function")
    setGameState(gameStateEnum["orders"])
    setSubState(subStateEnum[gameStateEnum["orders"]]["chooseBuildSpot"])
    storedChosenID = parseInt(structureKey);
    storedTaskID = structTypeID;
    //}
  }
  
  function actually_build_district(tileKey, faction){
    //add new structure to structures of type structType
    //we can get info like position anf faction from entityID
    //const faction = structures[entityKey]["faction"]
    const gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
    const capitalCityID = storedChosenID
    const townKey = structures[String(capitalCityID)].townKey
  
    //const structTypeID = structTypeFromDistrictType[getKeyByValue(districtTypeEnum, storedTaskID)]
    const structTypeID = storedTaskID
    const newStructID = create_structure(structTypeID, faction, gridPos, townKey)
  
  
  }



  ///////////////////////////////////////
  //
  //                           U U  III
  //                     \     U U   I
  //        -------------->    U U   I
  //                     /     UUU  III
  //
  ////////////////////////////////////////
  //Arrow functions for use in UI and on screen buttons etc
  //////////////////////////////////////
  const setUp_selectMovePos = () => {
    console.log("we have to choose a spot to move to")
    const newGameState = gameStateEnum["orders"]
    setGameState(newGameState)//orders
    setSubState(subStateEnum[String(newGameState)]["moveUnit"])
    //setStateObj({"gameState":1})
    return
  }
  const setUp_selectAttackTarget = () =>{
    console.log("we have to choose a target to attack")
    storedChosenID = chosenThing[1]
    const newGameState = gameStateEnum["orders"]
    setGameState(newGameState)//orders
    setSubState(subStateEnum[String(newGameState)]["chooseAtkTarget"])
    //setStateObj({"gameState":1})
    return
  }
  // const setUp_extraAction = () => {

  // }

  const setUp_chooseTaskForStructure = () => {
    console.log("choose a task for a structure to do")
    setGameState(gameStateEnum["default"]) //structure
    //setStateObj({"gameState":2})
    return
  }

  const menuExitButton = () => {
    setGameState(gameStateEnum["default"])//go to default game mode
    //stateObj.gameState=0//go to default game mode
  }
  const menuBackButton = () => {
    menuContext=lastMenuContext//go to previous menu
  }
  const setUp_chooseBuildingTask = () => {
    console.log("insert building tasks here")
  }


  //We need a button that we can click to select the next entity or structure that hasnt given orders
  //function next_thing_that_needs_orders(){
  const next_thing_that_needs_orders = () => {
    const faction = playerFaction
    console.log("finding next available thing")
    let selectedStructure = false
    let selectedID = -1
    //check all structures I control
    //get the next one that hasnt had an issue ordered
    let structureKeys = Object.keys(structures)
    let entityKeys = Object.keys(entities)
    const selectedType = typeID_to_word[chosenThing[0]]
    if(selectedType === "structure"){ //should do it the reverse way
      structureKeys = remove_array_element(structureKeys,String(chosenThing[1]))
    }
    else if(selectedType === "entity"){ 
      entityKeys = remove_array_element(entityKeys,String(chosenThing[1]))
    }
    for(const structKey of structureKeys){
      if(structures[structKey].faction != faction){//console.log("not right faction");
        continue}
      if(structures[structKey].sleeping == true){//console.log("is sleeping");
        continue}
      if(structures[structKey].doingTask == true){//console.log("already busy");
        continue}
      //if we get to this point it means we need to give this structure a task
      selectedStructure = true
      selectedID = parseInt(structKey)
      //chosenThing = [0,selectedID]
      setChosenThing([0,selectedID])
      return chosenThing
    }
    //Now we need to do the same for entities
    console.log("entityKeys = ")
    console.log(entityKeys)
    for(const entityKey of entityKeys){
      console.log("entityID = "+entityKey)
      if(entities[entityKey].faction != faction){//console.log("not right faction");
      continue}
      if(entities[entityKey].sleeping == true){//console.log("is sleeping");
      continue}
      if(entities[entityKey].haveAttacked == true){//console.log("has attacked already");
      continue} //if above MP then we cant retreat after attacking
      if(entities[entityKey].MP <= 0){//console.log("out of movement points");
      entities[entityKey].MP = 0;continue}
      
      //if we get to this point it means we need to give this structure a task
      selectedStructure = false
      console.log("entityKey = "+entityKey)
      selectedID = parseInt(entityKey)
      //chosenThing = [1,selectedID]
      setChosenThing([1,selectedID])
      return chosenThing
    }
    if(selectedID === -1){
      //dont change chosenThing
      return chosenThing
    }

    if(selectedStructure == true){
      //chosenThing = [0,selectedID]
      setChosenThing([0,selectedID])
    }else{
      //chosenThing = [1,selectedID]
      setChosenThing([1,selectedID])
    }

    return [selectedStructure,selectedID]
  } //if return[1] == -1 it means no units/structures were found that need orders
    //if return[1] >= 0 we have found an ID, if return[0] == true it means this ID refers to a structure (else entity)



  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //
  //            JJJJJJJJJJJJJ            SSSSSSSS              XX     XX
  //                 JJ                 SS      S               XX   XX
  //                 JJ                   SSSSS                   XXX
  //            JJ   JJ                       SSS                XX XX
  //             JJ  JJ                 S       S               XX   XX
  //               JJJ                   SSSSSSS               XX     XX      
  //
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  //       Functions that return JSX elements for actual rendering (and helper functions)
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  function get_contextual_UI(){
    //return a JSX element that is the HTML layout for the different buttons needed
    const selectedType = typeID_to_word[chosenThing[0]]
    let UIContextualButtonsJSX = <></>
    let extraButtonList = []
    if(selectedType === "entity"){
      const entityKey = String(chosenThing[1])
      const entityType = entities[entityKey].unitTypeID
      const extraActionIDs = unitTypes[entityType].extraActionIDs
      for(let i=0;i<extraActionIDs.length;i++){
        const extraActionID = extraActionIDs[i]
        console.log("buttonGeneration: extraActionID = "+ extraActionIDs[i])
        const singleButtonJSX = <button type="button" onClick={() => evaluateExtraAction(entityKey, extraActionID)} className="UI_contextual" id={"extra"+String(i)} key={"extra"+String(i)}>{extraActionsData[extraActionIDs[i]].name}</button>
        extraButtonList.push(singleButtonJSX)
      }

      UIContextualButtonsJSX = (
      <>
      <button type="button" onClick={setUp_selectMovePos} className="UI_contextual" id="moveUnit">Move Unit</button>
      <button type="button" onClick={setUp_selectAttackTarget} className="UI_contextual" id="attackButton">Attack</button>
      {extraButtonList}
      </>
      )
      //can I make an array of buttons using specialAmmo and then put building stuff in there
    }
    else if(selectedType === "structure"){
      UIContextualButtonsJSX = (
      <>
      <button type="button" onClick={setUp_chooseTaskForStructure} className="UI_contextual" id="openBuildMenu">building menu</button>
      </>
      )
    }
    // else{
  
    // }
  
    return (
        <div id="ui_sideBar">
          <p>UI for {selectedType} {chosenThing[1]}</p>
          <p>{extraMessage}</p>
          <button type="button" onClick={next_thing_that_needs_orders} className="UI_button" id="nextButton">Next Thing!</button>
          {UIContextualButtonsJSX}
        </div>
  
    )
  }
  
  

  

  // const map = useMemo(() => [
  //   { name: Controls.forward, keys:["ArrowUp", "KeyW"] },
  //   { name: Controls.back, keys:["ArrowDown", "KeyS"] },
  //   { name: Controls.left, keys:["ArrowLeft", "KeyA"] },
  //   { name: Controls.right, keys:["ArrowRight", "KeyD"] },
  //   { name: Controls.jump, keys:["Space"] },
  // ],[]);
  
  
  //const map = useMemo(() => keyboardMap,[]);


  // const BaseShaderTest = () => {
  //   //const mesh = useRef();
  //   return (
  //     <mesh position={[0,2,0]}>
  //     <sphereGeometry args={[1]} />
  //     <shaderMaterial
  //       fragmentShader={fragmentShader}
  //       vertexShader={vertexShader}
  //     />
  //   </mesh>
  //   );
  // };
  // const MovingPlane = () => {
  //   // This reference will give us direct access to the mesh
  //   const mesh = useRef();
  
  //   const uniforms = useMemo(
  //     () => ({
  //       u_time: {
  //         value: 0.0,
  //       },
  //       u_colorA: { value: new Color("#FFE486") },
  //       u_colorB: { value: new Color("#FEB3D9") },
  //     }), []
  //   );
  
  //   useFrame((state) => {
  //     const { clock } = state;
  //     mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
  //   });
  
  //   return (
  //     <mesh ref={mesh} position={[0, 2, 0]} rotation={[-Math.PI / 2, 0.5, 1]} scale={1.5}>
  //       <planeGeometry args={[1, 1, 16, 16]} />
  //       <shaderMaterial
  //         fragmentShader={fragmentShader}
  //         vertexShader={vertexShader}
  //         uniforms={uniforms}
  //         wireframe={false}
  //       />
  //     </mesh>
  //   );
  // };


  





  function chooseTileForTask(typeID, instID){
    if (subState == subStateEnum[String(gameState)]["moveUnit"]){
      ////MOVE UNIT STATE
      //EG move unit
      const entityID = chosenThing[1]
      const tileKey = String(instID)
      //const entityKey = String(entityID)
      //BAD
      //entities[entityKey].gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
      const currentTile = entities[String(entityID)].gridPos
      const finalTile = [worldTiles[tileKey].q,worldTiles[tileKey].r]
      // const newPath = find_path_on_grid_with_dijkstra_algorithim(currentTile, finalTile)
      // console.log("new dijkstra path = ")
      // console.log(newPath)
      const hasEntity = (worldTiles[tileKey].entityID != -1)
      const hasStructure = (worldTiles[tileKey].structID != -1)
      if (hasEntity || hasStructure){
        //then we CANNOT move here
        //if its an enemy we should attack? or should that eb a seperate button?
        //or after we move we can check if there are any possible attacks in 
        //our range then prompt the choose attack state
        return
      }
      moveEntityToTile(entityID, finalTile)
      entities[String(entityID)].MP = 0
      setGameState(gameStateEnum["default"])//"default"
      //setStateObj({"gameState":0})
      //GOOD - give AI a task to walk to that tile (might be multiple steps, show the steps),
      // do a contextual interaction on that tile, e.g. attack or garrison, then
      // tell the system that this AI has done its thing (reduce MP)
      //
    }else if (subState == subStateEnum[String(gameState)]["chooseAtkTarget"]){
      //we can only attack targets we can hit
      //we should already be showing which units
      const myID = chosenThing[1]//storedChosenID
      const tileKey = String(instID)
      if(worldTiles[tileKey].structID != -1){//chose structure
        //different type of attack involved
        //do later
        return
      }else if(worldTiles[tileKey].entityID != -1){//chose entity
        //how do I keep the old chosenEntityID while learning the new one
        const enemyID = worldTiles[tileKey].entityID
        const enemyKey = String(enemyID)
        //const enemyID = chosenThing[1]
        const myKey = String(myID)
        const myTile = entities[myKey].gridPos
        const chosenTile = [worldTiles[tileKey].q,worldTiles[tileKey].r]
        //is it within range
        const myStats = get_absolute_stats(myKey)
        const range = myStats.range
        if(entities[myKey].faction == entities[enemyKey].faction){
          return//if allies
        }
        if (hex.distanceAxial(myTile, chosenTile) > range){
          return//if too far
        }
        //maybe some other check conditions
        //if we make it here we should attack
        let canEnemyAtkBack = true
        const enemyStats = get_absolute_stats(enemyKey)
        const enemyRange = enemyStats.range
        if (hex.distanceAxial(myTile, chosenTile) > enemyRange){
          canEnemyAtkBack = false
        }

        if(canEnemyAtkBack==true){
          attack_between_entities(myKey, enemyKey)
        }else{
          one_direction_attack(entityKey1,entityKey2)
        }

      entities[myKey].MP = 0
      setGameState(gameStateEnum["default"])


      }else{
        //chose other type of thing
        return
      }
      
    }else if(subState == subStateEnum[String(gameState)]["chooseBuildSpot"]){
      const myID = chosenThing[1]//storedChosenID
      const tileKey = String(instID)
      if(worldTiles[tileKey].structID != -1){//tile occupied
        return
      }else if(worldTiles[tileKey].entityID != -1){//tile occupied
        if (!check_if_faction_allies(structures[String(myID)].faction, entities[String(worldTiles[tileKey].entityID)].faction)){
          //tile is occupied by an enemy unit
          //this will be annoying when city states stand in your land etc
          //should change to areFactionsAtWar
          return
        }
        //dont return if its a friendly unit
      }

      //if we get it means the tile isnt occupied
      const myKey = String(myID)
      const myTile = structures[myKey].gridPos
      const chosenTile = [worldTiles[tileKey].q,worldTiles[tileKey].r]
      if(hex.distanceAxial(myTile, chosenTile) > worldInfo.maxDistrictDist){
        return
      }
      //if we get here we are in range
      //now build district there
      actually_build_district(tileKey, structures[myKey].faction)
      structures[myKey]["doingTask"] = true
      structures[myKey]["taskStatus"] = 5//districtBuildCost
      setGameState(gameStateEnum["default"])

    }else{
      console.log("ERROR SUBSTATE IS NOT RECOGNISED, subState = ", subState)
    }
  }

  let selectPos = [0,10,0]
  function upSelectPos(){
    selectPos[1] = selectPos[1]+0.5
  }

  let jsxDiv = (
  <div display="block" 
    className={tw(
      css`
        @apply absolute inset-0 pt-20 md:px-14 text-menu-text z-10 bg-black bg-opacity-40 md:bg-transparent;
        @media screen and (-webkit-min-device-pixel-ratio: 0) and (min-resolution: 0.001dpcm) {
          -webkit-transform: rotate3d(0, 1, 0, 357deg);
        }
      `
    )}
  >
    <div className="flex flex-col md:flex-row h-4/6 overflow-y-scroll no-scrollbar focus:outline-none">
      <p>message is {message}</p>
    </div>
  </div>
)
  

  function get_contextual_CanvasJSX(){
    const gameStateStr = gameStateIntToStr[gameState]
    //const gameStateStr = gameStateIntToStr[stateObj.gameState]
    const lightIntensity = 0.5
    let canvasJSX = <></>
    if (gameStateStr === "orders"){
      extraMessage = "where should the unit move?"
      //I can change the function thats called on InstancedBoxes to instead move the unit to that spot
      canvasJSX = (
        <>
          <ambientLight intensity={lightIntensity} />
          <InstancedBoxes
            clickFunction={chooseTileForTask}
            hoverFunction={moveHoverFunction}
            worldTiles={worldTiles}
            worldInfo={worldInfo}
            entities={entities}
            structures={structures}
          />
          <OrbitControls/>
        </>
      )
    }
    // else if (gameStateStr === "buildMenu"){
    //   extraMessage = "choose a task for this structure"
    //   //make a menu appear that we can click
    //   //its okay to overlay a new DOM here and lose mouse input underneatyh as long as we have an exit button
    //   canvasJSX = (
    //     <>
    //       <ambientLight intensity={lightIntensity} />
    //       <InstancedBoxes
    //         clickFunction={clickFunction}
    //         hoverFunction={nullHoverFunction}
    //         worldTiles={worldTiles}
    //         worldInfo={worldInfo}
    //         entities={entities}
    //         structures={structures}
    //       />
    //       <OrbitControls/>
    //     </>
    //   )
    // }
    else{//if (gameStateStr === "default"){
      extraMessage = "in default game state"
      canvasJSX = (
        <>
          <ambientLight intensity={lightIntensity} />
          <InstancedBoxes
            clickFunction={clickFunction}
            hoverFunction={nullHoverFunction}
            worldTiles={worldTiles}
            worldInfo={worldInfo}
            entities={entities}
            structures={structures}
          />
          <OrbitControls/>
        </>
      )
    }
    return canvasJSX
  }
  
  function get_menu_JSX(){
    let menuOverlayJSX = <><div className="overlayMenu" id="buildMenu" disabled="disabled"></div></>
    if (gameState == gameStateEnum["orders"]){
      return menuOverlayJSX
    }
    if (chosenThing[0] == 0){//structure chosen//(gameState === 2){//buildMenu
    //if (stateObj.gameState === 2){//buildMenu
      console.log("in menu, game state = ", gameState)
      let buildingTasksJSX = []
      if(chosenThing[1] == -1){
        return menuOverlayJSX
      }
      const structKey = String(chosenThing[1])
      const structTypeKey = String(structures[structKey].typeID)
      const possibleTasks = structureTypes[structTypeKey]["taskIDs"]
      for(let taskID of possibleTasks){
        const scopedTaskID = taskID
        const taskKey = String(taskID)
        console.log("taskID= "+ taskKey)
        const taskData = structureTaskData[taskKey]
        
        let buttonClickable = true
        if(taskData.checkEntity == true){
          const gridPos = structures[structKey].gridPos
          const tileID = hex.IDFromGridPos(gridPos,worldInfo.worldRadius)
          if(worldTiles[String(tileID)].entityID != -1){
            buttonClickable = false
          }
        }
        if(buttonClickable==true){
          //this doesnt work because react doesnt update but if I kick you out of this menu because you have chosen a task for the structure then it could work
          buildingTasksJSX.push(
            //if its an entity we are making we only want to do it if there is no one standing on the structure
            <button type="button" className="buildMenuButton" id={taskData.name} key={"task"+scopedTaskID} onClick={() => evaluateStructureTask(structKey, scopedTaskID)}>{taskData.name}</button>
          )
        }else{
          buildingTasksJSX.push(
            //we could give it a different id or something so it can have a different background color
            <button type="button" className="buildMenuButton" id={taskData.name} key={"task"+scopedTaskID} onClick={() => evaluateStructureTask(structKey, scopedTaskID)} disabled>{taskData.name}</button>
          )
        }
        

      }
      menuOverlayJSX = (
      <>
        <div className="overlayMenu" id="buildMenu">
  
          <div id="menuHeader">
            <p>Build Menu</p>
            <button type="button" className="headerButton" id="exitButton" onClick={menuExitButton}>Exit Menu</button>
            <button type="button" className="headerButton" id="backButton" onClick={menuBackButton}>Previous Menu</button>
          </div>
  
          <div id="menuBody">
            <button type="button" className="buildMenuButton" id="chooseBuildingTaskMaster" onClick={setUp_chooseBuildingTask}>Choose Task</button>
            {buildingTasksJSX}
          </div>
  
        </div>
      </>
      )
    }
    return menuOverlayJSX
  }

  function get_inCanvasUI(){
    //If we have a chosen tile -> show it 
    const emptyJSXArray = <></>
    let inCanvasUI_JSXArray = []
    const chosenID = chosenThing[1]
    if(chosenID == -1){
      return emptyJSXArray
    }
    let gridPos = []
    if (chosenThing[0] == 0){//structure
      gridPos = structures[String(chosenID)].gridPos
    }else if (chosenThing[0] == 1){//entity
      gridPos = entities[String(chosenID)].gridPos
    }else{
      return emptyJSXArray
    }
    let worldPos = get_tile_pos(gridPos)
    //selected thing UI
    inCanvasUI_JSXArray.push(
    <Cylinder position={worldPos} args={[worldInfo.tileRadius, worldInfo.tileRadius, 10*worldInfo.tileHeight*2, 6, 2]} key={"chosenThingUI"}>
      <meshPhongMaterial color="springgreen" opacity={0.4} transparent />
    </Cylinder>
    )
    //potential attack targets
    if (gameState == gameStateEnum["orders"] && subState == subStateEnum[gameStateEnum["orders"]]["chooseAtkTarget"]){
      console.log("trying to get attack ui")
      //we want to highlight all the possible enemies
      const myKey = String(chosenID)
      const myStats = get_absolute_stats(myKey)
      const range = myStats.range
      const myGridPos = entities[myKey].gridPos
      const gridPosInRange = hex.get_circle_of_gridPos(myGridPos, range, worldInfo.worldRadius)
      console.log("gridPosInRange = ")
      console.log(gridPosInRange)
      let targetTileKeys = []
      const myFaction = entities[String(chosenThing[1])].faction
      for (let gridPos of gridPosInRange){
        const tileID = hex.IDFromGridPos(gridPos,worldInfo.worldRadius)
        const tileKey = String(tileID)
        let isValidEnemy = false
        if (worldTiles[tileKey].structID != -1){
          //it has a structure
          const structKey = String(worldTiles[tileKey].structID)
          isValidEnemy = !check_if_faction_allies(myFaction,structures[structKey].faction)
        }else if (worldTiles[tileKey].entityID != -1){
          //it has a unit
          const entitiyKey = String(worldTiles[tileKey].entityID)
          isValidEnemy = !check_if_faction_allies(myFaction,entities[entitiyKey].faction)
        }

        if (isValidEnemy == true){
          targetTileKeys.push(tileKey)
        }
      }
      console.log("targetTileKeys = ")
      console.log(targetTileKeys)
      //now we have targetTileKeys
      for(let tileKey of targetTileKeys){
        const gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
        let worldPos = get_tile_pos(gridPos)
        inCanvasUI_JSXArray.push(
          <Cylinder position={worldPos} args={[worldInfo.tileRadius, worldInfo.tileRadius, 10*worldInfo.tileHeight*2, 6, 2]} key={"enemyAt"+tileKey}>
            <meshPhongMaterial color="red" opacity={0.4} transparent />
          </Cylinder>
        )
      }
    }
    

    return inCanvasUI_JSXArray
  }

  function get_worldTilesText_JSX(){
    //so when we are doing movement or something we want to load text on the screen
    //let text_JSX = <></>
    let text_JSX_Array = []
    let tileKeys = Object.keys(tileText)
    if (tileKeys.length == 0){
      return text_JSX_Array
    }
    //else we have text we want to render to the canvas
    console.log("trying to print text onto canvas")
    //BUT DOES NOT WORK!!!
    let count = 0
    for (let tileKey of tileKeys){
      //how to append to a JSX element
      const gridPos = [worldTiles[tileKey].q,worldTiles[tileKey].r]
      const world2Pos = hex.axialToFlatPos(worldTiles[tileKey].q,worldTiles[tileKey].r, worldInfo.tileRadius)
      //console.log("world2Pos = ", world2Pos)
      const worldPos = [world2Pos[0],worldTiles[tileKey].noise*worldInfo.tileHeight+0.65,world2Pos[1]]
      // console.log("worldPos = ", worldPos)
      // console.log("tileKey = ", tileKey, " text = ", tileText[tileKey])
      //need to rotate it
      text_JSX_Array.push(
      <Text
       position={worldPos}
       scale={[1, 1, 1]}
       color="black"
       key={String(count)}
       rotation={[0.5*Math.PI,Math.PI,0]}
      >
       {tileText[tileKey]}
      </Text>
      )
      count++
    }
    return text_JSX_Array
  }

  //////////////////////////////////////////////////////////////
  //   End of JSX functions and helper functions
  /////////////////////////////////////////////////////////////
  // now we actually apply them
  ////////////////////////////////////////////////////////////
  const GAME_JSX = get_contextual_CanvasJSX()
  const UI_JSX = get_contextual_UI()
  const menuOverlayJSX = get_menu_JSX()
  const inCanvasUI_JSX = get_inCanvasUI()
  const worldTilesText_JSX = get_worldTilesText_JSX()
  ///////////////////////////////////////////////////////////
  //
  //           EEEEEEE          NNNN     NN       DDDDD
  //           EE               NN  NN   NN       DD   DD
  //           EEEEE            NN   NN  NN       DD    DD
  //           EE               NN    NN NN       DD   DD
  //           EEEEEEE          NN     NNNN       DDDDDD
  //
  ///////////////////////////////////////////////////////////
  // Actually return the game to render to the screen
  //////////////////////////////////////////////////////////
  // return (
  //   <>
  //   <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
      
  //     {GAME_JSX}
  //     {inCanvasUI_JSX}
  //     {worldTilesText_JSX}
  //   </Canvas>
  //   {UI_JSX}
  //   {menuOverlayJSX}
  //   </>
  // )


  return (
    <>
      <div id="sideUI">
        {UI_JSX}
      </div>
    
      <div id="main">
        <div id="topUI">
          <h1>Insert data here</h1>
        </div>
        <div id="canvas">
          <Canvas shadows camera={{position:[-10,10,0]}} intensity={0.4}>
        
            {GAME_JSX}
            {inCanvasUI_JSX}
            {worldTilesText_JSX}
          </Canvas>
        </div>
        <div id="bottomUI">
          {menuOverlayJSX}
        </div>
      </div>
    
    
    
    </>
  )


}
export default App


function get_tile_pos(gridPos){
  const actual2Pos = hex.axialToFlatPos(gridPos[0],gridPos[1], worldInfo.tileRadius)
  const gridID = hex.IDFromGridPos(gridPos, worldInfo.worldRadius)
  console.log("gridID = "+ gridID)
  return [actual2Pos[0], worldTiles[String(gridID)].noise*worldInfo.tileHeight, actual2Pos[1]]
}















// WebCiv TODO: 29 Oct
// 1)Make a flood fill algorithm to find a path to target 
// Probably have to re run it every turn
// 2)Make a movement point relative to height system.
// 3)make a contextual menu for structures and options and info etc
// 4) Make "animation" gameState to move units. (Should we include an option to skip, for fast players)
// 5)Make tile overlay to visualise path
// 6)Make attack and defend system.
// 7)Make contextual selection when we click a tile, and show on the UI when we hover (attack or move or cantMove).
// 8)Make game options menu
// 9)Make save and load system in JSON
// 10)move static dictionaries to external file
// 11)

//(1(a))
/* could get my code from godot and convert or just write a new*/

//(/1)





//((3)a)
/*we need a way of telling the menu what to load.
menu should be a game state.
but menu state could be a seperate object*/





//(/3)


// 5) load an opaque mesh overlay witnh instancing
// or make it an arrow or dotted line that grows to cover all the tiles until we change direction. need a seprrate image/mesh for the attack/move on final tile
// obstacles:
// structures and entities that are not in yours ir an allies faction are impasssable
// structs and ents that are are allowed to be walked past but not la.ded on at the end of your turn. we need to select the tile to move/attack there anyways so we can do this check before doing pathfinding.
// entities are the same 
// wheb we hover over a tile to move to.
// check
// worldTiles[tileKey] 

// ((4)a)
// when changing gameState to anim
// we should chwck if user hasbt turned off that option


// if (gameState === 3){/*animate
//   each frame we send a slightly adjusted vec3 position ti the mesh eaxh turn, to look like continous movement
//   each step is speed*basisVecror*/
//   //that is each one has a dir of +-1*[q,r,s] which is 6 values for 3ach 6 adjacent tiles
//   //a path is a collection of targetPoints that are straight lines from each other

// }







//NEED TO CONVERT DIJKSTRA TO WORKING WITH JAVASCRIPT AND TO WORK IN THE CONTEXT OF THE NEW GAME WORLD AND HEX MAP

function travelDifficulty(currentGridPos, nextGridPos){
  //console.log("travelDifficulty function")
  //console.log(currentGridPos+ " to ")
  //console.log(nextGridPos)
  const currentGridID = hex.IDFromGridPos(currentGridPos, worldInfo.worldRadius)
  const nextGridID = hex.IDFromGridPos(nextGridPos, worldInfo.worldRadius)
  //console.log(currentGridID+ " to "+ nextGridID)
  
  return Math.abs( worldTiles[currentGridID].noise*worldInfo.tileHeight - worldTiles[nextGridID].noise*worldInfo.tileHeight )
	//return Math.abs( worldTiles[hex.IDFromGridPos(currentGridPos, worldInfo.worldRadius)].noise - worldTiles[hex.IDFromGridPos(nextGridPos, worldInfo.worldRadius)].noise )
}
function find_path_on_grid_with_dijkstra_algorithim(initialVertex, finalVertex){ //vertexGridSize is sideVertices
  console.log("find_path_on_grid_with_dijkstra_algorithim from ",initialVertex," to ",finalVertex)
  //pass
  //// Dijkstra’s Algorithm
  //// Set each node's position to infinity, I am doing this as I run into them in the while loop
    //for each node in the graph
  function gridPosToStrKey(myGridPos){
    return String(initialVertex[0]) + "," + String(initialVertex[1])
  }
  
  function myArraySorter(a,b){
    //a and b are arrays with 2 elements
    //we want it to sort so the lowest distance is at the back of the array (so we pop back not pop front so we dont need to re-index)
    if (a[0] > b[0]){
      return -1
    }
    else if ((a[0] === b[0])){
      return 0
    }
    else{
      return 1
    }
  }
  
  function addArrays(arrA,arrB){
    let newArray = []
    for(let i=0;i<arrA.length;i++){
      newArray.push(arrA[i]+arrB[i])
    }
    return newArray
  }

  let data = {} //declared in while loop
  let dataDefault = {
    "distanceFromStart" : Infinity,
    "directionToStart" : null
  }
  //	for vertexKey in vertexData.keys():
  //		//set the node's distance to infinity
  ////		vertexData[vertexKey].dijkstra.distanceFromTown = dicData.config.infinity
  ////		//already set by default
  ////		// set the node's parent to none
  ////		vertexData[vertexKey].dijkstra.directionToTown = null
  //		data[vertexKey] = structuredClone(dataDefault)
  let directionsDic = { //THIS WILL NOT WORK THE SAME AS THE OTHER ONE
    0 : [0,0],
    1 : [-1,0],
    2 : [0,-1],
    3 : [1,-1],
    4 : [1,0],
    5 : [0,1],//?
    6 : [-1,1],//?
  }
  const axialDirectionsArray = [ //for enum
    [0,0],[-1,0],[0,-1],[1,-1],[1,0],[0,1],[-1,1]
  ]
  const axialDirectionsObj = { //for enum
  "0,0":0,
  "-1,0":1,
  "0,-1":2,
  "1,-1":3,
  "1,0":4,
  "0,1":5,
  "-1,1":6
  }
  const adjacentHexCubeMods = [
    [-1,0,1],[0,-1,1],[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0]
  ]//equaivalent to below
  const adjacentHexAxialMods = [
    [-1,0],[0,-1],[1,-1],[1,0],[0,1],[-1,1]
  ]
    
    //// Create an unexplored set
    //let the unexploredSet equal a set of all the nodes
  let unexploredVertices = [] // vertexData.keys().duplicate(true) //these are strings...
  let exploredVertices = []
  //	for initialVert in initialVertices:
  //		//let index = sideVertices*initialVert[0] + initialVert[1]
  //		vertexData[String(initialVert[0] + "," + initialVert[1])].dijkstra.distanceFromTown = 0
  //		vertexData[String(initialVert[0] + "," + initialVert[1])].dijkstra.directionToTown = dicData.directionsEnum[Vector2(0,0)]
  //
  //		unexploredVertices.push([0, initialVert])
    data[String(initialVertex[0] + "," + initialVertex[1])] = structuredClone(dataDefault)
    data[String(initialVertex[0] + "," + initialVertex[1])]["distanceFromStart"] = 0
    data[String(initialVertex[0] + "," + initialVertex[1])]["directionToStart"] = 0//=axialDirectionsArray.indexOf([0,0])//directionsEnum[[0,0]]
    let initialElement = [0, initialVertex]
    unexploredVertices.push(initialElement)
    
    let endCondition = false
    //console.log("about to start while loop")
    while(!endCondition){//while the unexploredSet is not empty //this only works for fully connected maps
      //console.log("in while loop")
      //// Get the current node
      //do I have to sort the vertices for every loop?
      //unexploredVertices.sort_custom(Callable(MyCustomSorter, "sort_descending")) //seems very inefficient, we choose sort_descending so we can pop_back
      //console.log("before sort")
      //console.log(unexploredVertices)
      unexploredVertices.sort(myArraySorter)
      //console.log("unexploredVertices")
      //print_array(unexploredVertices)
      let current_decision_and_vertex = unexploredVertices[unexploredVertices.length-1]
      unexploredVertices = unexploredVertices.toSpliced(unexploredVertices.length-1,1)
      //unexploredVertices.splice(unexploredVertices.length-1,1)
      //let current_decision_and_vertex = unexploredVertices.pop();//_back()//    let the currentNode equal the node with the smallest distance
      //console.log("after pop")
      //print_array(unexploredVertices)
      ////console.log("current_decision_and_vertex = ")
      ////console.log(current_decision_and_vertex)
      let currentVertex = current_decision_and_vertex[1]
      //console.log("currentVertex = "+ currentVertex)
      exploredVertices.push(currentVertex)
      data[String(currentVertex[0] + "," + currentVertex[1])]["distanceFromStart"] = current_decision_and_vertex[0]  //record the distance for later
      
      
      for (const dir of adjacentHexAxialMods){// for each neighbor (still in unexploredSet) to the currentNode
        //let neighbour = currentVertex + dir
        let neighbour = addArrays(currentVertex,dir)
        //if not inBounds(neighbour):
        //if (!worldData.custom_inBounds(neighbour, vertexGridSize)){
        if (!worldTiles.hasOwnProperty(hex.IDFromGridPos(neighbour,worldInfo.worldRadius))){
          continue
        }
        //        // Calculate the new distance
        let newDistance = current_decision_and_vertex[0] + travelDifficulty(currentVertex, neighbour)
        if (exploredVertices.includes(neighbour)){
          continue
        }
        if (!data.hasOwnProperty(String(neighbour[0] + "," + neighbour[1]))){
          data[String(neighbour[0] + "," + neighbour[1])] = structuredClone(dataDefault)
        }
        let oldDistance = data[String(neighbour[0] + "," + neighbour[1])]["distanceFromStart"]
        if (oldDistance == Infinity){
          unexploredVertices.push([oldDistance, neighbour])
        }
        if (newDistance < oldDistance){
          data[String(neighbour[0] + "," + neighbour[1])]["distanceFromStart"] = newDistance
          //data[String(neighbour[0] + "," + neighbour[1])]["directionToStart"] = axialDirectionsArray.indexOf([-1*dir[0],-1*dir[1]])//set neighbor's parent to currentNode
          //const dirIndex = axialDirectionsArray.indexOf([-1*dir[0],-1*dir[1]])
          const dirIndex = axialDirectionsObj[String(-1*dir[0])+","+String(-1*dir[1])]
          data[String(neighbour[0] + "," + neighbour[1])]["directionToStart"] = dirIndex//set neighbor's parent to currentNode
          
          
          //console.log("unexploredVertices = ")
          //print_array(unexploredVertices)
          //console.log("element to find = ")
          //print_array([[oldDistance, neighbour]])
          //maybe unexploredVertices is only saving one entry not multiple
          const oldArrayElement = [oldDistance, neighbour]
          //let neighbourIndex = unexploredVertices.indexOf(oldArrayElement)
          const indexOfArrayElement = (element) => {
            //if (element[0] === oldDistance){
            if (element[1][0] == neighbour[0] && element[1][1] == neighbour[1]){
              return true
            }
           // }
          }//Alternate to indexOf
          let neighbourIndex = unexploredVertices.findIndex(indexOfArrayElement)
          
          //THIS ONE THROWS AN ERROR
          //console.log(neighbourIndex)
          //console.log("unexploredVertices["+neighbourIndex+"]")
          //says neighbourIndex is -1, probably from indexOf throwing an error
          //console.log(unexploredVertices[neighbourIndex])
          unexploredVertices[neighbourIndex][0] = newDistance
        }
      }
      //check if we should end
      if (currentVertex[0] == finalVertex[0] && currentVertex[1] == finalVertex[1]){
        endCondition = true //reached the end
        //console.log("reached end")
      }
      if (unexploredVertices.length <= 0){
        endCondition = true
        //console.log("ran out of vertices to explore")
      }
    }
    //console.log("while loop ends")
    
    //while loop ends
    //now actually get path
    //now the while loop is finished we need to reconstruct a path from the startNode to endNode
    let tempPath = []
    let endTrace = false
    let currentVertex = finalVertex
    tempPath.push(currentVertex)
    while (endTrace == false){
      //let prevVertex = currentVertex + directionsDic[ data[String(currentVertex[0]+ "," +currentVertex[1])]["directionToStart"] ]//previousNodes[currentNode]
      
      //NEW PROBLEM HERE:
      //addArrays fails why?
      //console.log("currentVertex = "+currentVertex)
      const dirToStartID = data[String(currentVertex[0]+ "," +currentVertex[1])]["directionToStart"]
      //console.log("dirToStartID = "+dirToStartID)
      const dirToStart = directionsDic[dirToStartID]
      //console.log("dirToStart = "+dirToStart)
      let prevVertex = addArrays(currentVertex,dirToStart)//previousNodes[currentNode]
      //console.log("previousVertex = ", prevVertex)
  //		if prevVertex == null:
  //			endTrace = true
  //			//console.log("tempPathFind has failed")
  //			tempPath = []
      if (prevVertex[0] == initialVertex[0] && prevVertex[1] == initialVertex[1]){
        //console.log("tempPathFind is a success")
        endTrace = true
      }
  //			tempPath.push(prevVertex)
  //			currentNode = prevVertex
  //		else: //valid middle tempPath element
  //			tempPath.push(prevVertex)
  //			currentNode = prevVertex
      tempPath.push(prevVertex)
      currentVertex = prevVertex
    }
    //path is from end to start, we need to reverse it so it goes from start to end
    //console.log("tempPath = ", tempPath)
    //let tempPath = path.duplicate()
    //let vertexPath = worldData.array_invert(tempPath)
    let vertexPath = tempPath.reverse()
    // let stringPath = []
    // for(const vert of vertexPath){
    //   stringPath.push(String(vert[0]+ "," +vert[1]))
    // }
    //path = path.reverse() //THIS IS ILLEGAL
    //console.log("stringPath = ", stringPath)
    return vertexPath
  }
  
  function print_array(printArray){
    console.log("printing an array of length "+printArray.length)
    for(let i=0;i<printArray.length;i++){
      if (typeof printArray[i] == "object"){
        for (let j=0;j<printArray[i].length;j++){
          
          if (typeof printArray[i] == "object"){
            console.log("element ["+i+", "+j+"] = ["+printArray[i][j]+"]")
          }else{
            console.log("element ["+i+", "+j+"] = "+printArray[i][j])
          }
        }
      }else{
      console.log("element ["+i+"] = "+printArray[i])
      }
    }
  }


  function check_if_faction_allies(faction1,faction2){
    if (faction1 == faction2){
      return true
    }
    return false
  }


  function  get_dug_materials(tileKey){
    let dugMaterials = structuredClone(suppliesDefault)
    let currentHeight = worldTiles[tileKey].noise
    if(currentHeight < worldInfo.minNoise){
      //TODO do elsewhere so we dont even click the button
      return dugMaterials
    }
    let ogHeight = worldTiles[tileKey].ogNoise
    //if we have minNoise, and maxNoise is ogNoise
    // if in first 0.3:top layer material
    // if in next 0.3:light materials
    // else hvy materials and crystals
    //let randNumber = simplexNoise.noise()
    //const noiseScale = worldInfo.noiseScale
    const randNumber = randNumber_for_tile(tileKey)//, randType = 0, normalised = true)
    const distanceDown = ogHeight - currentHeight
    const distanceRemain = currentHeight - worldInfo.minNoise
    const totalDist = distanceDown + distanceRemain
    const proportionDown = distanceDown/totalDist
    if(proportionDown < 0.33){
      //top soil, get material from world, is it sand or soil etc, mixed with light stone
      //TODO get soil type
      dugMaterials.soil = randNumber*worldInfo.dugYieldMod
      dugMaterials.ltStone = (1-randNumber)*worldInfo.dugYieldMod
    }else if(proportionDown < 0.66){
      //light stone
      dugMaterials.ltStone = randNumber*worldInfo.dugYieldMod
      dugMaterials.ltMetal = (1-randNumber)*worldInfo.dugYieldMod
    }else{
      dugMaterials.hvStone = randNumber*worldInfo.dugYieldMod
      //we also need crystal
      const randNum2 = randNumber_for_tile(tileKey,2,false)
      let leftOverAmount = (1-randNumber)*worldInfo.dugYieldMod
      if (randNum2 <= 0){
        dugMaterials.hvMetal = randNum2*leftOverAmount
      }else{//randNum2 in [0,1] chances are its small, so we want it to be the crystal proportion
        dugMaterials.hvMetal = (1-randNum2)*leftOverAmount
        dugMaterials.crystal = randNum2*leftOverAmount
      }
    }
    // console.log("dug materials = ")
    // console.log(dugMaterials)
    return dugMaterials
  }

  function randNumber_for_tile(tileKey, randType = 0, normalised = true){
    //deterministic random numbers
    if(randType == -1){//normal noise
      let randNumber = simplexNoise.noise2D(noiseScale*q,noiseScale*r)
      if(normalised==false){
        return randNumber//in [-1,1]
      }
      return 0.5*(randNumber+1)// in [0,1]
    }
    if(randType == 0){ //flip gridPos
      const noiseScale = worldInfo.noiseScale
      let randNumber = simplexNoise.noise2D(noiseScale*worldTiles[tileKey].r,noiseScale*worldTiles[tileKey].q)
      if(normalised==false){
        return randNumber//in [-1,1]
      }
      return 0.5*(randNumber+1)// in [0,1]

    }else if(randType == 1){ //3d noise based on tilePos
      const noiseScale = worldInfo.noiseScale
      let randNumber = simplexNoise.noise3D(noiseScale*worldTiles[tileKey].q,noiseScale*worldInfo.tileHeight*worldTiles[tileKey].noise,noiseScale*worldTiles[tileKey].r)
      if(normalised==false){
        return randNumber//in [-1,1]
      }
      return 0.5*(randNumber+1)// in [0,1]
    }
    else if(randType == 2){ //2d noise with strange variables
      const noiseScale = worldInfo.noiseScale
      let randNumber = simplexNoise.noise2D(noiseScale*worldInfo.tileHeight*worldTiles[tileKey].noise,noiseScale**worldInfo.tileHeight*worldTiles[tileKey].ogNoise)
      if(normalised==false){
        return randNumber//in [-1,1]
      }
      return 0.5*(randNumber+1)// in [0,1]
    }
  }




//{}
  //When we finish our turn we have to restore MP and increase task status
  //we want to do all things then have ai do their things then have a button appear to end all turns
  function end_of_all_turns(){

    //FOR ALL ENTITIES
    for(entityKey of Object.keys(entities)){
      //restore values
    typeID = entities[entityKey].unitTypeID
    //if healthy
    entities[entityKey].HP += entities[entityKey].HPperTurn
          if(climbing){
      //if we are flagged as climbing then we save our MP until we hav3 enough to climb a hill
            entities[entityKey].MP += entities[entityKey].maxMP
    }else{
      entities[entityKey].MP = entities[entityKey].maxMP
    }
    }
    

    //FOR ALL STRUCTURES
    for(structKey of Object.keys(structures)){
      if( structures[structKey].doingTask){//FIX
        //add (subtract) production to task
        //see if task is complete
        let townKey = structures[structKey].townKey
        structures[structKey].taskStatus -= towns[townKey].production
        if (structures[structKey].taskStatus <= 0){
          //DO AND REMOVE CURRENT TASK

          //FIX
          //ACTUALLY DO TASK!!!!
          //RUN FUNCTION NOW THAT TIMER IS FINISHED

          //SET UP NEXT TASK
          if(structures[structKey].tasks.length == 0){
            structures[structKey].taskStatus = 0
            structures[structKey].doingTask = false
          }else{
            //we have a new task
            //need to set to the production value of the new task
            let newProductionValue = 0 //FIX
            structures[structKey].taskStatus = newProductionValue
          }
        }
      }
      //restore some health
      //if HP < maxHP then add HPPerTurn
    }

    //FOR ALL TOWNS
    for(townKey of Object.keys(towns)){
      let wellFed = false
      let foodConsumedThisTurn = 0
      //remove food from food wastage
      foodConsumedThisTurn += towns[townKey].supplies.food * towns[townKey].foodWasteRate//all food wastes
      //remove food from population
      foodConsumedThisTurn += towns[townKey].population * worldInfo.foodConsumeRate
      //if not enough food then happiness goes down
      if (towns[townKey].supplies.food <= foodConsumedThisTurn){
        if(towns[townKey].supplies.food <= Math.floor(0.5*foodConsumedThisTurn)){
          towns[townKey].happiness -= worldInfo.noFoodMortalityPenalty
        }
        towns[townKey].happiness -= worldInfo.noFoodHappinessPenalty
        if (towns[townKey].happiness <= 0){
          towns[townKey].happiness = 0
        }
        //out of food, people get scared and mortality rises happiness goes down
        wellFed = false
        towns[townKey].supplies.food = 0
      }else{
        towns[townKey].supplies.food -= foodConsumedThisTurn
        wellFed = true
        //we still have food in storage
        //happiness goes up to a maximum
        towns[townKey].happiness += worldInfo.noFoodHappinessPenalty //Increase happiness by same amount
        if(towns[townKey].happiness >= foodHappinessMax){
          towns[townKey].happiness = foodHappinessMax
        }
      }
      
      //deathCount += mortality
      towns[townKey].deathCount += towns[townKey].mortality
      if (towns[townKey].deathCount >= 1){
        if (towns[townKey].population >= 2){
          //something should happen if we lose all our population
          towns[townKey].population -= 1
        }
        towns[townKey].deathCount = 0
      }

      //we also need population to go up
      //based on happiness and food etc
      //wellFed = false
      let wellFedInt = wellFed ? 1 : 0;

      towns[townKey].nextPopCount -= wellFedInt*worldInfo.baseGrowthRate*towns[townKey].happiness//goes down, if hits zero we get a new population
      if(towns[townKey].nextPopCount <= 0){
        towns[townKey].population += 1
        towns[townKey].nextPopCount = towns[townKey].population
      }
    }


    //FOR ALL FACTIONS
  }

let factions = {}
const factionDefault = {
  "AI" : true,
  "relations" : {}, //faction Relations
  "personality" : {}, //personality Traits for AI
}