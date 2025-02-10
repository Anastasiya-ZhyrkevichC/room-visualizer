import { RoomProvider, useRoom } from "./RoomProvider";

import * as THREE from 'three';




const VerticalWall = ({position, size}) => {
    const { X, Y, Z } = useRoom();

    const rotation = [0, Math.PI / 2, 0];

    const roomPosition = new THREE.Vector3(X, Y, Z);
    const elemPosition = new THREE.Vector3(...position);

    const addup = roomPosition.clone().add(elemPosition);

    console.log(position, X, Y, Z, addup, roomPosition);


    return (
        <mesh position={addup} rotation={rotation}>
            <planeGeometry args={size} />
            <meshStandardMaterial color="lightgray" />
        </mesh>
    );
}




const Room = ({ length, width, height }) => {

    return (
        <>
            <RoomProvider length={length} width={width} height={height}>

                {/* Walls */}
                <VerticalWall position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} size={[height, width]} />
            </RoomProvider>
        </>
    );
}


export default Room;
