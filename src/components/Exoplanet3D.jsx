import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, Text, Stars, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import constellationsData from '../data/constellations.json';

// Convert RA/DEC to 3D Cartesian coordinates
const raDecToCartesian = (ra, dec, radius = 10) => {
  const phi = (90 - dec) * (Math.PI / 180);
  const theta = ra * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
};

const ConstellationGroup = ({ constellation, onHover }) => {
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    onHover(constellation.name);
  }, [constellation.name, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover(null);
  }, [onHover]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = constellation.lines.flatMap(line => {
      const star1 = constellation.stars.find(star => star.name === line[0]);
      const star2 = constellation.stars.find(star => star.name === line[1]);
      if (star1 && star2) {
        const start = raDecToCartesian(star1.ra, star1.dec);
        const end = raDecToCartesian(star2.ra, star2.dec);
        return [...start, ...end];
      }
      return [];
    });
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, [constellation]);

  return (
    <group onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {constellation.stars.map((star, starIndex) => {
        const [x, y, z] = raDecToCartesian(star.ra, star.dec);
        return (
          <Sphere key={starIndex} position={[x, y, z]} args={[0.05, 16, 16]}>
            <meshStandardMaterial attach="material" color={hovered ? "yellow" : "white"} />
          </Sphere>
        );
      })}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial attach="material" color={hovered ? "yellow" : "white"} />
      </lineSegments>
    </group>
  );
};

const UserConstellation = ({ constellation, onHover }) => {
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    onHover(constellation.name);
  }, [constellation.name, onHover]);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    onHover(null);
  }, [onHover]);

  return (
    <group onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <Line
        points={constellation.points}
        color={hovered ? "yellow" : "white"}
        lineWidth={2}
      />
      <Text
        position={constellation.points[0]}
        fontSize={0.5}
        color={hovered ? "yellow" : "white"}
        anchorX="center"
        anchorY="bottom"
        renderOrder={1}
        depthTest={false}
      >
        {constellation.name}
      </Text>
    </group>
  );
};

const Exoplanet3D = ({ selectedPlanet, userConstellations = [] }) => {
  const [hoveredConstellation, setHoveredConstellation] = useState(null);
  const radius = !isNaN(parseFloat(selectedPlanet.radius)) ? parseFloat(selectedPlanet.radius) / 20 : 0.2;

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <color attach="background" args={["#000000"]} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={20} />
        <ambientLight intensity={0.5} />
        <Sphere args={[radius, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial attach="material" color="blue" />
        </Sphere>
        <Text position={[0, -radius - 0.3, 0]} fontSize={0.2} color="white" anchorX="center">
          {selectedPlanet.name}
        </Text>
        {constellationsData.constellations.map((constellation, index) => (
          <ConstellationGroup
            key={index}
            constellation={constellation}
            onHover={setHoveredConstellation}
          />
        ))}
        {userConstellations.map((constellation, index) => (
          <UserConstellation 
            key={`user-${index}`} 
            constellation={constellation} 
            onHover={setHoveredConstellation}
          />
        ))}
        <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade />
      </Canvas>
      {hoveredConstellation && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '18px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {hoveredConstellation}
        </div>
      )}
    </div>
  );
};

export default Exoplanet3D;