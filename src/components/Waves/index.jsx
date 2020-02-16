import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { sum, map, fromPairs } from 'ramda';

const Waves = ({ groups, noisefn, rotateMode, ...props }) => {
    const mesh = useRef();
    useFrame(state => {
        const time = state.clock.getElapsedTime();

        // on mouse down release the kraken
        if (rotateMode) {
            mesh.current.rotation.x = Math.sin(time / 4);
            mesh.current.rotation.y = Math.sin(time / 2);
        } else {
            mesh.current.rotation.x = 0;
            mesh.current.rotation.y = 0;
        }
        const groupObjects = map(
            group => fromPairs(map(({ name, value }) => [name, value], group)),
            groups
        );
        for (var i = 0; i < mesh.current.geometry.vertices.length; i++) {
            const { x, y } = mesh.current.geometry.vertices[i];
            const groupValues = map(
                ({ coefficient, magnitude, speed, move }) =>
                    noisefn(
                        x * coefficient,
                        y * coefficient + time * move,
                        time * speed
                    ) * magnitude,
                groupObjects
            );
            mesh.current.geometry.vertices[i].z = sum(groupValues);
        }
        mesh.current.geometry.verticesNeedUpdate = true;
    });
    return (
        <group {...props}>
            <mesh ref={mesh}>
                <planeGeometry attach="geometry" args={[100, 200, 200, 200]} />
                <meshPhongMaterial attach="material" color="red" wireframe />
            </mesh>
        </group>
    );
};

export default Waves;
