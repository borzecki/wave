import * as THREE from 'three';
import React, { useState, useReducer } from 'react';

import { curry } from 'ramda';
import { Canvas } from 'react-three-fiber';

import Control from './components/Control';
import Waves from './components/Waves';
import Effects from './components/Effects';

import reducer, { initial } from './reducer';

import './styles.css';

const App = () => {
    const [mouseDown, setMouseDown] = useState(false);

    const [groups, dispatch] = useReducer(reducer, initial);

    const setValue = curry((groupIndex, name, value) => {
        dispatch({ type: 'UPDATE_GROUP', groupIndex, name, value });
    });

    const addControl = () => dispatch({ type: 'ADD_GROUP' });
    const removeControl = i =>
        dispatch({ type: 'REMOVE_GROUP', groupIndex: i });

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
