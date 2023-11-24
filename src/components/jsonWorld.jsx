import * as THREE from "three"
import { extend } from '@react-three/fiber'
import { RigidBody } from "@react-three/rapier"


// const entityDefault = {
//     position: { x: 0, y: 0, z: 0 },
//     velocity: { x: 0, y: 0, z: 0 },
//     health: {
//         current: 100,
//         max: 100
//     },
//     paused: true,
//     faction: 1
// }
let entities = {}



function create_enemy_components(){
    let amount= 10
    //let enComponents = []
    for(let i=0;i<amount;i++){
        let newPos = {x: 2*i, y:1, z:2*i}
        let enemyComp = {
            position: newPos,
            velocity: { x: 0, y: 0, z: 0},
            health: { current: 100, max: 100 },
            faction: 1
          }
          entities[String(i)] = enemyComp

          
    }
    
}

// function add_component_list(toWorld, compList){
//     for (let i=0;i<compList.length;i++){
//         let enemyComp = compList[i]
        
//     }
// }

// function return_enemy_JSX(myPos, myKey){
    

//     return(<RigidBody type="fixed" name="floor" key={myKey}><Box position={[myPos.x,myPos.y,myPos.z]} args={[1,1,1]}><meshStandardMaterial color="springgreen" /></Box></RigidBody>)
// }


// function get_enemy_JSXs(){
//     //now we have to somehow use this data to render a scene
//     //add_component_list(create_enemy_components)
//     create_enemy_components()
//     const posEntities = world.with("position")
//     let newPos = new THREE.Vector3()
//     let enemyJSXList = []
//     for (const thisEntity of entities.entries()) {
//         let myPos = thisEntity.position
//         newPos.set[position.x,position.y,position.z]
//         let myKey = ECS.world.id(entity)
//         enemyJSXList.push(return_enemy_JSX(myPos, myKey))
//       }
//     return enemyJSXList
// }


export const jsonWorld = () => {
    create_enemy_components()
    return(
        <>
        <ambientLight intensity={0.5} />
        <OrbitControls />


        <RigidBody type="fixed" name="floor">
            <Box position={[1,1,0]} args={[10,1,10]}>
                <meshStandardMaterial color="springgreen" />
            </Box>
        </RigidBody>
        {
        entities.keys().map((eKey) => (
            <RigidBody>
                <Box position={[entities[eKey].position.x,entities[eKey].position.y,entities[eKey].position.z]} args={[1,1,1]}>
                    <meshStandardMaterial color="springgreen" />
                </Box>
            </RigidBody>
        )
            )
        }
        

        </>
    )
}