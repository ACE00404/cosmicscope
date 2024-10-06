import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import constellationsData from '../data/constellations.json';
import ConstellationDrawer from './ConstellationDrawer';

// Convert RA/DEC to Cartesian coordinates
const raDecToCartesian = (ra, dec, radius = 50) => {
  const phi = (90 - dec) * (Math.PI / 180);
  const theta = ra * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
};

// Component to handle raycasting for hover interaction
const StarGroup = ({ constellation, onClick }) => {
  const { camera, raycaster, mouse } = useThree();

  const handleClick = useCallback((event) => {
    raycaster.setFromCamera(mouse, camera);
    const stars = constellation.stars.map(star => raDecToCartesian(star.ra, star.dec));
    const objects = stars.map((starPos, index) => {
      const object = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: 'white' })
      );
      object.position.set(...starPos);
      return object;
    });

    const intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
      console.log('Star clicked in constellation:', constellation.name);
      onClick(constellation.name);
    }
  }, [constellation, onClick, camera, raycaster, mouse]);

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
    <group onClick={handleClick}>
      {constellation.stars.map((star, starIndex) => {
        const [x, y, z] = raDecToCartesian(star.ra, star.dec);
        return (
          <Sphere key={starIndex} position={[x, y, z]} args={[0.2, 16, 16]}>
            <meshStandardMaterial attach="material" color="white" />
          </Sphere>
        );
      })}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial attach="material" color="yellow" />
      </lineSegments>
    </group>
  );
};

const ExoplanetModel = ({ selectedPlanet }) => {
  const radius = !isNaN(parseFloat(selectedPlanet.radius)) ? parseFloat(selectedPlanet.radius) / 2 : 1;

  return (
    <group position={[0, 0, 0]}>  // Center the exoplanet
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial attach="material" color="blue" />
      </Sphere>
      <Text position={[0, -radius - 1, 0]} fontSize={1} color="white" anchorX="center">
        {selectedPlanet.name}
      </Text>
    </group>
  );
};

const StarrySky = ({ selectedPlanet, userConstellations = [], onSaveConstellation }) => {
  const [selectedConstellation, setSelectedConstellation] = useState(null);
  const [constellations, setConstellations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const controlsRef = useRef();

  useEffect(() => {
    console.log('Constellations data:', constellationsData);
    setConstellations(constellationsData.constellations);
  }, []);

  const handleConstellationClick = useCallback((name) => {
    console.log('Constellation clicked:', name);
    setSelectedConstellation(name);
  }, []);

  const handleSaveConstellation = (newConstellation) => {
    onSaveConstellation(newConstellation);
    setIsDrawing(false);
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  };

  const handleKeyPress = useCallback((event) => {
    if (event.key === 's' || event.key === 'S') {
      const name = prompt('Enter constellation name:');
      if (name) {
        onSaveConstellation({ name, points });
        setPoints([]);
        setIsDrawing(false);
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    }
  }, [points, onSaveConstellation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDrawing;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 70], fov: 75 }}>
        <color attach="background" args={["#000000"]} />
        <OrbitControls ref={controlsRef} enableZoom={true} minDistance={55} maxDistance={85} enabled={!isDrawing} />
        <ambientLight intensity={0.5} />
        
        <group position={[0, 0, 0]}>
          {constellations.map((constellation, index) => (
            <StarGroup
              key={index}
              constellation={constellation}
              onClick={handleConstellationClick}
            />
          ))}

          {userConstellations && userConstellations.map((constellation, index) => (
            <group key={`user-${index}`}>
              <Line
                points={constellation.points}
                color="yellow"
                lineWidth={2}
              />
              <Text
                position={constellation.points[0]}
                fontSize={2}
                color="white"
                anchorX="center"
                anchorY="bottom"
              >
                {constellation.name}
              </Text>
            </group>
          ))}

          <ExoplanetModel selectedPlanet={selectedPlanet} />

          <Stars radius={60} depth={50} count={5000} factor={4} saturation={0} fade />
        </group>

        {isDrawing && <ConstellationDrawer onSave={handleSaveConstellation} />}
      </Canvas>

      {isDrawing && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '10%',
          color: '#f4fbfd',
          backgroundColor: 'rgba(1, 38, 65, 0.8)',
          padding: '15px', 
          borderRadius: '10px',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          maxWidth: '250px',
        }}>
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '10px',
            fontWeight: 'bold',
            color: '#60b3d1',
          }}>
            Constellation Drawing
          </p>
          <ul style={{ 
            listStyleType: 'none', 
            padding: 0, 
            margin: 0, 
            fontSize: '14px',
          }}>
            <li style={{ marginBottom: '5px' }}>• Drag to draw</li>
            <li style={{ marginBottom: '5px' }}>• Release to finish</li>
            <li style={{ marginBottom: '10px' }}>• Press 'S' to save</li>
          </ul>
        </div>
      )}

      <button
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#60b3d1',
          color: '#012641',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={toggleDrawing}
      >
        {isDrawing ? 'Cancel Drawing' : 'Draw Constellation'}
      </button>
    </div>
  );
};

export default StarrySky;