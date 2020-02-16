import * as THREE from 'three';
import React, { useState, useRef, useEffect } from 'react';

import {
    curry,
    findIndex,
    propEq,
    adjust,
    assoc,
    sum,
    map,
    append,
    fromPairs,
    remove
} from 'ramda';

import { Canvas, useFrame } from 'react-three-fiber';
import * as perlin from './perlin';
import Effects from './Effects';
import './styles.css';

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

const Control = ({ controlGroups, setValue, onRemove }) => (
    <div className="controls">
        {controlGroups.map((controls, i) => (
            <ControlGroup
                key={i}
                onRemove={() => onRemove(i)}
                setValue={setValue(i)}
                controls={controls}
            />
        ))}
    </div>
);

const ControlGroup = ({ controls, setValue, onRemove }) => (
    <div className="control">
        <div className="remove-control" onClick={onRemove}>
            -
        </div>
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
    const [mouseDown, setMouseDown] = useState(false);

    const [groups, setGroups] = useState([]);

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
                    { name: 'coefficient', value: 0.04, step: 0.01 },
                    { name: 'magnitude', value: 14, step: 1 },
                    { name: 'speed', value: 1, step: 1 },
                    { name: 'move', value: 2, step: 1 }
                ],
                groups
            )
        );

    const removeControl = i => setGroups(remove(i, 1, groups));

    useEffect(() => addControl(), []);

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
                onMouseUp={() => setMouseDown(false)}
                onMouseDown={() => setMouseDown(true)}
                gl={{
                    alpha: false,
                    antialias: true,
                    logarithmicDepthBuffer: true
                }}
                onCreated={({ gl }) => {
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.outputEncoding = THREE.sRGBEncoding;
                }}
            >
                <fog attach="fog" args={['black', 10, 200]} />
                <Waves
                    rotateMode={mouseDown}
                    groups={groups}
                    noisefn={perlin.perlin3}
                    position={[0, 0, -10]}
                    scale={[1.5, 1, 1]}
                />
                <ambientLight intensity={1} />
                <Effects down={mouseDown} />
            </Canvas>
            <div className="add-control" onClick={addControl}>
                +
            </div>
            <Control
                controlGroups={groups}
                setValue={setValue}
                onRemove={removeControl}
            />
        </>
    );
}

export default App;
