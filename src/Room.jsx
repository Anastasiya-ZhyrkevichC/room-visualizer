import { RoomProvider, useRoom, PositionAdjuster } from "./RoomProvider";

import * as THREE from 'three';


const Wall = ({position, rotation, size}) => {
    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={size} />
            <meshStandardMaterial color="lightgray" />
        </mesh>
    );
}

const LeftVerticalWall = ({position, size}) => {
    const rotation = [0, Math.PI / 2, 0];
    return <Wall position={position} rotation={rotation} size={size}/>
}

const RightVerticalWall = ({position, size}) => {
    const rotation = [0, -Math.PI / 2, 0];
    return <Wall position={position} rotation={rotation} size={size}/>
}

const BackWall = ({position, size}) => {
    const rotation = [0, 0, 0];
    return <Wall position={position} rotation={rotation} size={size}/>
}

const Floor = ({position, size}) => {
    const rotation = [-Math.PI / 2, 0, 0];
    return <Wall position={position} rotation={rotation} size={size}/>
}


// Decided to have a room, left-below corner in (-length / 2, 0, 0) position.
// Later I can move that corner to any other place using `RoomProvider` and `PositionAdjuster`
// All objects have centers in the center of the object.
const Room = ({ length, width, height }) => {

    return (
        <>
            <RoomProvider length={length} width={width} height={height}>
                <PositionAdjuster>
                    {/* Walls */}
                    <LeftVerticalWall position={[0, height / 2, width / 2]} size={[width, height]} />
                    <RightVerticalWall position={[length, height / 2, width / 2]} size={[width, height]} />
                    <BackWall position={[length/ 2, height / 2, 0]} size={[length, height]} />

                    {/* Floor */}
                    <Floor position={[length / 2, 0, width / 2]} size={[length, width]}/>


                </PositionAdjuster>
            </RoomProvider>
        </>
    );
}


export default Room;
