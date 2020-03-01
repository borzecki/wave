import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { sum, map, fromPairs } from 'ramda';
import { simplex3, perlin3 } from '../../perlin';

const getNoiseFn = { simplex: simplex3, perlin: perlin3 };

const Waves = ({ groups, rotateMode, ...props }) => {
    const mesh = useRef();
    const groupObjects = map(
        group => fromPairs(map(({ name, value }) => [name, value], group)),
        groups
    );
    useFrame(state => {
        const time = state.clock.getElapsedTime();

        // release the kraken on mouse down
        if (rotateMode) {
            mesh.current.rotation.x = Math.sin(time / 4);
            mesh.current.rotation.y = Math.sin(time / 2);
        } else {
            mesh.current.rotation.x = 0;
            mesh.current.rotation.y = 0;
        }
        for (var i = 0; i < mesh.current.geometry.vertices.length; i++) {
            const { x, y } = mesh.current.geometry.vertices[i];
            const groupValues = map(
                ({ coefficient, magnitude, speed, move, method }) =>
                    getNoiseFn[method](
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
