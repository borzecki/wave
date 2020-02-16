import * as THREE from 'three';
import React, { useState, useEffect } from 'react';

import { curry, findIndex, propEq, adjust, assoc, append, remove } from 'ramda';
import { Canvas } from 'react-three-fiber';

import Control from './components/Control';
import Waves from './components/Waves';
import Effects from './components/Effects';

import { perlin3 } from './perlin';
import './styles.css';

const defaultGroup = [
    { name: 'coefficient', value: 0.04, step: 0.01 },
    { name: 'magnitude', value: 14, step: 1 },
    { name: 'speed', value: 1, step: 1 },
    { name: 'move', value: 2, step: 1 }
];

const App = () => {
    const [mouseDown, setMouseDown] = useState(false);

    const [groups, setGroups] = useState([defaultGroup]);

    const setValue = curry((groupIndex, name, value) => {
        const group = groups[groupIndex];
        const controlIndex = findIndex(propEq('name', name), group);
        const updateControl = () =>
            adjust(
                controlIndex,
                () => assoc('value', value, group[controlIndex]),
                group
            );
        const updated = adjust(groupIndex, updateControl, groups);
        setGroups(updated);
    });

    const addControl = () => setGroups(append(defaultGroup, groups));
    const removeControl = i => setGroups(remove(i, 1, groups));

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
                <ambientLight intensity={1} />
                <Waves
                    rotateMode={mouseDown}
                    groups={groups}
                    noisefn={perlin3}
                    position={[0, 0, -10]}
                    scale={[1.5, 1, 1]}
                />
                <Effects down={mouseDown} />
            </Canvas>
            <Control
                controlGroups={groups}
                setValue={setValue}
                onAdd={addControl}
                onRemove={removeControl}
            />
        </>
    );
};

export default App;
