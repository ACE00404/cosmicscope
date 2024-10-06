import React, { useState, useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

const ConstellationDrawer = ({ onSave }) => {
  const [points, setPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const { camera, raycaster, mouse, scene } = useThree();
  const planeRef = useRef();

  useFrame(() => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(planeRef.current);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      scene.cursor = 'crosshair';
      if (isDrawing) {
        setPoints(prevPoints => [...prevPoints, point]);
      }
    } else {
      scene.cursor = 'default';
    }
  });

  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsDrawing(true);
    setPoints([]);
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    setIsDrawing(false);
    if (points.length > 1) {
      const newName = prompt('Enter constellation name:');
      if (newName) {
        onSave({ name: newName, points });
        setPoints([]);
      }
    }
  };

  return (
    <>
      <mesh 
        ref={planeRef} 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial />
      </mesh>
      {points.map((point, index) => (
        <mesh key={index} position={point}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      ))}
      {points.length > 1 && (
        <Line
          points={points}
          color="yellow"
          lineWidth={2}
          dashed={false}
        />
      )}
    </>
  );
};

export default ConstellationDrawer;