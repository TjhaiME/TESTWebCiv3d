import { Box, OrbitControls, Sphere, Torus, useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, quat} from '@react-three/rapier';
import { useRef, useState } from 'react'
//import { Mesh } from 'three' //Typescript
import * as THREE from "three"

import fragmentShader from '../shaders/fragmentShader';
import vertexShader from '../shaders/vertexShader';

let numOfEnemies = 10;//higher to demonstrate how arrays can be used to make multiple JSX elements

let enemiesDic = make_initial_enemy_list();

// import Ecctrl, { EcctrlAnimation } from "ecctrl";
// //convert player to EC-ctrl


function convert_single_to_JSX(eKey){
    let myKey = enemiesDic[eKey].key
    let myPos = [enemiesDic[eKey].pos.x,enemiesDic[eKey].pos.y,enemiesDic[eKey].pos.z]
    let myCol = enemiesDic[eKey].col
    return(
        <RigidBody name="enemy" key={myKey}>
            <Box position={myPos} args={[0.5,1,0.5]}>
                <meshStandardMaterial color={myCol} />
            </Box>
        </RigidBody>
    )
}
// function convert_wholeDic_to_JSX(){
//     let jsxArray = []
//     for(let eKey of Object.keys(enemiesDic)){
//         let arrayVal = convert_single_to_JSX(eKey)
//         jsxArray.push(arrayVal)
//     }
//     return jsxArray
// }
function get_rand_col(){
    let x=Math.round(0xffffff * Math.random()).toString(16);
    let y=(6-x.length);
    let z="000000";
    let z1 = z.substring(0,y);
    let colour= "#" + z1 + x;
    return colour
}

function make_initial_enemy_list(){
    let newEnemiesDic = {}
    for (let i=0;i<numOfEnemies;i++){
        let posX = 0.35*i
        let posY = 0.3*i
        let posZ = -0.35*i
        let myKey = "key"+i
        let myCol = get_rand_col()
        let enemyDicEntry = {
            pos:{x:posX,y:posY,z:posZ},
            key:myKey,
            col:myCol
        }
        //arrayOfEnemiesPos.push(enemyDicEntry)
        newEnemiesDic[myKey] = enemyDicEntry
    }
    return newEnemiesDic
}

function add_new_enemy(){
    let i = numOfEnemies//nextID
    let posX = 0.35*i
    let posY = 0.3*i
    let posZ = -0.35*i
    let myKey = "key"+i
    let myCol = get_rand_col()
    let enemyDicEntry = {
        pos:{x:posX,y:posY,z:posZ},
        key:myKey,
        col:myCol
    }
    enemiesDic[myKey] = enemyDicEntry
    numOfEnemies++
}
export const Enemies = () => {
    const [hover, setHover] = useState(false);
    //const cube = useRef();
    const kicker = useRef();
    const [start,setStart]= useState(false);
    // const jump = () => {
    //     //console.log("trying to jump, isOnFloor.current = "+isOnFloor.current)
    //     if (!isOnFloor.current){
    //         //console.log("CANT JUMP: not on floor")//for some reason having this console log here caused wakeUp to work better
    //         return
    //     }
    //     //cube.current.wakeUp()//sleeping RBs dont respond to impulses
    //     //cube.current.applyImpulse({x:0,y:5,z:0});
    //     isOnFloor.current = false
    //     //numOfEnemies += 1
    //     add_new_enemy()
    // };

    // const jumpPressed = useKeyboardControls((state) => state.jump);
    // //const jumpPressed = useKeyboardControls((state) => state[Controls.jump]);
    // const forwardPressed = useKeyboardControls((state) => state.forward);
    // const backPressed = useKeyboardControls((state) => state.back);
    // const leftPressed = useKeyboardControls((state) => state.left);
    // const rightPressed = useKeyboardControls((state) => state.right);

    // const handleMovement = () => {
    //     if (!isOnFloor.current){
    //         return;
    //     }// {console.log("applying planar impulse")}
    //     let dirPressed = false
    //     let dir = {x:0,y:0,z:0}
    //     if (rightPressed) {
    //         dirPressed = true
    //         dir = {x:0.1,y:0,z:0}
    //     }if (leftPressed) {
    //         dirPressed = true
    //         dir = {x:-0.1,y:0,z:0}
    //     }if (forwardPressed) {
    //         dirPressed = true
    //         dir = {x:0,y:0,z:0.1}
    //     }if (backPressed) {
    //         dirPressed = true
    //         dir = {x:0,y:0,z:0.1}
    //     }if (dirPressed) {
    //         cube.current.applyImpulse(dir);
    //         console.log("moving in "+JSON.stringify(dir)+" direction")
    //     }

    // }

    //const speed = useRef(2.5)

    useFrame((_state,delta) => {
        // if (jumpPressed){
        //     jump();
        // }
        //handleMovement();

        // if (!start) {
        //     return
        // }
        // const curRotation = quat(kicker.current.rotation());
        // const incRotation = new THREE.Quaternion().setFromAxisAngle(
        //     new THREE.Vector3(0,1,0), delta*speed.current
        // );
        // curRotation.multiply(incRotation);
        // kicker.current.setNextKinematicRotation(curRotation);
    
        // speed.current += 0.2*delta

    })

    //const isOnFloor = useRef(true)

    //const arrayOfEnemiesPos = []
    
    //console.log("doing update")
    //make_initial_enemy_list()
    // let enemyKeys = Object.keys(enemiesDic)
    // let jsxArray = convert_wholeDic_to_JSX()

    return (
        <>

        {//jsxArray
        Object.keys(enemiesDic).map((eKey) => (
        <RigidBody name="enemy" key={enemiesDic[eKey].key}>
            <Box position={[enemiesDic[eKey].pos.x,enemiesDic[eKey].pos.y,enemiesDic[eKey].pos.z]} args={[0.5,1,0.5]}>
                <meshStandardMaterial color={enemiesDic[eKey].col} />
            </Box>
        </RigidBody>
        )
        )
        /*arrayOfEnemiesPos.map((enemyDic) => (
        <RigidBody name="enemy" key={enemyDic.key}>
            <Box position={[enemyDic.pos.x,enemyDic.pos.y,enemyDic.pos.z]} args={[0.5,1,0.5]}>
                <meshStandardMaterial color={enemyDic.col} />
            </Box>
        </RigidBody>
        )
        ) */
        }

        </>
    )
}


