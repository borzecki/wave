import * as THREE from 'three';
import React, { useState, useCallback, useRef } from 'react';

import {
    curry,
    findIndex,
    propEq,
    adjust,
    assoc,
    sum,
    map,
    append,
    fromPairs
} from 'ramda';
import { Canvas, useFrame } from 'react-three-fiber';
import * as perlin from './perlin';
import Effects from './Effects';
import './styles.css';

const Waves = ({ groups, noisefn, ...props }) => {
    const mesh = useRef();
    useFrame(state => {
        const time = state.clock.getElapsedTime();
        // mesh.current.rotation.x = Math.sin(time / 4);
        // mesh.current.rotation.y = Math.sin(time / 2);
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

const NumberControlGroup = ({ name, value, setValue, step }) => (
    <div className="control-group">
        <label htmlFor={name}>{name}</label>
        <input
            name={name}
            type="number"
            value={value}
            step={step}
            onChange={event => setValue(event.target.value)}
        />
    </div>
);

const Control = ({ controlGroups, setValue }) => (
    <div className="controls">
        {controlGroups.map((controls, i) => (
            <ControlGroup key={i} setValue={setValue(i)} controls={controls} />
        ))}
    </div>
);

const ControlGroup = ({ controls, setValue }) => (
    <div className="control">
        {controls.map(control => (
            <NumberControlGroup
                key={control.name}
                setValue={setValue(control.name)}
                {...control}
            />
        ))}
    </div>
);

function App() {
    const [down, set] = useState(false);

    const [groups, setGroups] = useState([
        [
            { name: 'coefficient', value: 0.08, step: 0.01 },
            { name: 'magnitude', value: 18, step: 1 },
            { name: 'speed', value: 0, step: 1 },
            { name: 'move', value: 2, step: 1 }
        ]
    ]);

    const setValue = curry((groupIndex, name, value) => {
        const controlIndex = findIndex(
            propEq('name', name),
            groups[groupIndex]
        );
        const updated = adjust(
            groupIndex,
            () =>
                adjust(
                    controlIndex,
                    () =>
                        assoc('value', value, groups[groupIndex][controlIndex]),
                    groups[groupIndex]
                ),
            groups
        );
        setGroups(updated);
    });
    const addControl = () =>
        setGroups(
            append(
                [
                    { name: 'coefficient', value: 0.08, step: 0.01 },
                    { name: 'magnitude', value: 18, step: 1 },
                    { name: 'speed', value: 0, step: 1 },
                    { name: 'move', value: 2, step: 1 }
                ],
                groups
            )
        );

    const mouse = useRef([0, 0]);
    const onMouseMove = useCallback(
        ({ clientX: x, clientY: y }) =>
            (mouse.current = [
                x - window.innerWidth / 2,
                y - window.innerHeight / 2
            ]),
        []
    );
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <>
            <Canvas
                shadowMap
                pixelRatio={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
                camera={{
                    rotation: [(60 * Math.PI) / 180, 0, 0],
                    position: [0, -80, 40]
                }}
                onMouseMove={onMouseMove}
                onMouseUp={() => set(false)}
                onMouseDown={() => set(true)}
                gl={{
                    alpha: false,
                    antialias: true,
                    logarithmicDepthBuffer: true
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor('D0D0D0');
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.outputEncoding = THREE.sRGBEncoding;
                }}
            >
                <fog attach="fog" args={['black', 10, 200]} />
                <Waves
                    groups={groups}
                    noisefn={perlin.perlin3}
                    position={[0, 0, -10]}
                    scale={[1.5, 1, 1]}
                />

                <ambientLight intensity={1} />
                <Effects down={down} />
            </Canvas>
            <div className="add-control" onClick={addControl}>
                +
            </div>
            <Control controlGroups={groups} setValue={setValue} />
        </>
    );
}

export default App;
