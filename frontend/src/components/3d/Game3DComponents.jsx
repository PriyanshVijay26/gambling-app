import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { Float, OrbitControls, Environment, useGLTF, Sparkles, Box } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Professional 3D Case Component (like Harvester.GG)
const ProfessionalCase = ({ 
  position = [0, 0, 0],
  caseType = 'legendary',
  isOpening = false,
  onOpenComplete = () => {},
  glowIntensity = 1.0
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [openProgress, setOpenProgress] = useState(0);
  
  // Case configurations similar to Harvester.GG
  const caseConfigs = {
    common: {
      color: '#8B7355',
      emissive: '#3D2914',
      glow: '#8B7355',
      metalness: 0.3,
      roughness: 0.7
    },
    rare: {
      color: '#4A90E2',
      emissive: '#1E3A8A',
      glow: '#60A5FA',
      metalness: 0.6,
      roughness: 0.3
    },
    epic: {
      color: '#8B5CF6',
      emissive: '#5B21B6',
      glow: '#A78BFA',
      metalness: 0.8,
      roughness: 0.2
    },
    legendary: {
      color: '#F59E0B',
      emissive: '#D97706',
      glow: '#FCD34D',
      metalness: 0.9,
      roughness: 0.1
    },
    mythical: {
      color: '#EF4444',
      emissive: '#DC2626',
      glow: '#F87171',
      metalness: 1.0,
      roughness: 0.05
    }
  };
  
  const config = caseConfigs[caseType] || caseConfigs.common;
  
  // Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotation animation
      meshRef.current.rotation.y += delta * 0.5;
      
      // Hover effect
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Opening animation
      if (isOpening && openProgress < 1) {
        setOpenProgress(prev => {
          const newProgress = Math.min(prev + delta * 2, 1);
          if (newProgress >= 1) {
            onOpenComplete();
          }
          return newProgress;
        });
      }
    }
  });
  
  return (
    <group position={position}>
      {/* Main Case Body */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={glowIntensity * (hovered ? 1.5 : 1)}
          metalness={config.metalness}
          roughness={config.roughness}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Glow Effect */}
      <mesh position={[0, 0, 0]} scale={2.2}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial
          color={config.glow}
          transparent
          opacity={0.1 * glowIntensity}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Sparkles Effect */}
      <Sparkles
        count={50}
        scale={3}
        size={2}
        speed={0.5}
        opacity={0.8}
        color={config.glow}
      />
      
      {/* Opening Effect */}
      {isOpening && (
        <>
          <mesh position={[0, openProgress * 2, 0]}>
            <boxGeometry args={[2, 0.2, 2]} />
            <meshStandardMaterial
              color={config.color}
              emissive={config.emissive}
              emissiveIntensity={2}
            />
          </mesh>
          
          {/* Light beam effect */}
          <pointLight
            position={[0, 0, 0]}
            intensity={openProgress * 10}
            color={config.glow}
            distance={20}
          />
        </>
      )}
    </group>
  );
};

// Case Gallery Component (like the grid view)
const CaseGallery = ({ cases = [], onCaseSelect = () => {} }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6">
      {cases.map((caseItem, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -10, transition: { duration: 0.2 } }}
          className="relative group cursor-pointer"
          onClick={() => onCaseSelect(caseItem)}
        >
          {/* 3D Case Display */}
          <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-all duration-300">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Environment preset="warehouse" />
              
              <ProfessionalCase
                caseType={caseItem.rarity}
                glowIntensity={1.2}
              />
              
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate
                autoRotateSpeed={2}
              />
            </Canvas>
          </div>
          
          {/* Case Info */}
          <div className="mt-4 text-center">
            <h3 className="text-white font-bold text-lg mb-1">{caseItem.name}</h3>
            
            {/* Rarity Bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full ${
                  caseItem.rarity === 'common' ? 'bg-gray-500' :
                  caseItem.rarity === 'rare' ? 'bg-blue-500' :
                  caseItem.rarity === 'epic' ? 'bg-purple-500' :
                  caseItem.rarity === 'legendary' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
              />
            </div>
            
            {/* Price */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              <span className="text-white font-bold">{caseItem.price}</span>
            </div>
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </motion.div>
      ))}
    </div>
  );
};

// Advanced Material Shader for Premium Effects
const PremiumCaseMaterial = ({ config, time, isHovered }) => {
  const materialRef = useRef();
  
  useFrame(() => {
    if (materialRef.current) {
      // Animated emissive intensity
      materialRef.current.emissiveIntensity = 
        config.baseEmissive + Math.sin(time * 3) * 0.3;
    }
  });
  
  return (
    <meshStandardMaterial
      ref={materialRef}
      color={config.color}
      emissive={config.emissive}
      emissiveIntensity={config.baseEmissive}
      metalness={config.metalness}
      roughness={config.roughness}
      envMapIntensity={2}
      transparent
      opacity={isHovered ? 1 : 0.95}
    />
  );
};

// Post-processing Effects (like depth of field, bloom)
const PostProcessingEffects = () => {
  // This would require @react-three/postprocessing
  // For now, we'll simulate with lighting
  return (
    <>
      <fog attach="fog" args={['#1a1a2e', 10, 50]} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffd700" distance={20} />
    </>
  );
};

// Export updated components
export { ProfessionalCase, CaseGallery };

// 3D Coin Component using actual coin images
const Coin3D = ({ position, rotation, scale = 1, imageUrl, spinning = false }) => {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, imageUrl);
  
  // Create coin geometry with image texture
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    return geo;
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    if (spinning && meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 0.5;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      geometry={geometry}
    >
      <meshStandardMaterial 
        map={texture}
        roughness={0.1}
        metalness={0.8}
        emissive="#ffd700"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

// 3D Dice with custom textures
const Dice3D = ({ position, rolling = false, faces }) => {
  const meshRef = useRef();
  const textures = faces.map(face => useLoader(TextureLoader, face));
  
  useFrame((state, delta) => {
    if (rolling && meshRef.current) {
      meshRef.current.rotation.x += delta * 10;
      meshRef.current.rotation.y += delta * 8;
      meshRef.current.rotation.z += delta * 6;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2, 2, 2]} />
      {textures.map((texture, index) => (
        <meshStandardMaterial 
          key={index}
          attach={`material-${index}`}
          map={texture}
          roughness={0.3}
          metalness={0.1}
        />
      ))}
    </mesh>
  );
};

// 3D Card with custom design
const Card3D = ({ position, imageUrl, flipping = false }) => {
  const meshRef = useRef();
  const frontTexture = useLoader(TextureLoader, imageUrl);
  const backTexture = useLoader(TextureLoader, '/images/cards/card-back.png');
  
  useFrame((state, delta) => {
    if (flipping && meshRef.current) {
      meshRef.current.rotation.y += delta * 8;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Front face */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshStandardMaterial map={frontTexture} />
      </mesh>
      {/* Back face */}
      <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 2.4]} />
        <meshStandardMaterial map={backTexture} />
      </mesh>
    </group>
  );
};

// Animated 3D Mines field
const MineField3D = ({ gridSize = 5, onCellClick, revealedCells, mines }) => {
  const groupRef = useRef();
  
  const cells = useMemo(() => {
    const cellArray = [];
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const index = x * gridSize + z;
        cellArray.push({
          position: [x - gridSize/2, 0, z - gridSize/2],
          index,
          revealed: revealedCells.includes(index),
          isMine: mines.includes(index)
        });
      }
    }
    return cellArray;
  }, [gridSize, revealedCells, mines]);

  return (
    <group ref={groupRef}>
      {cells.map((cell) => (
        <MineCell3D
          key={cell.index}
          position={cell.position}
          revealed={cell.revealed}
          isMine={cell.isMine}
          onClick={() => onCellClick(cell.index)}
        />
      ))}
    </group>
  );
};

const MineCell3D = ({ position, revealed, isMine, onClick }) => {
  const meshRef = useRef();
  const diamondTexture = useLoader(TextureLoader, '/images/diamond.png');
  const mineTexture = useLoader(TextureLoader, '/images/mine.png');
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.2}>
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={(e) => e.object.scale.setScalar(1.1)}
        onPointerOut={(e) => e.object.scale.setScalar(1)}
      >
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        {revealed ? (
          <meshStandardMaterial 
            map={isMine ? mineTexture : diamondTexture}
            color={isMine ? "#ff4444" : "#44ff44"}
            emissive={isMine ? "#440000" : "#004400"}
            emissiveIntensity={0.3}
          />
        ) : (
          <meshStandardMaterial 
            color="#666666"
            roughness={0.8}
            metalness={0.2}
          />
        )}
      </mesh>
    </Float>
  );
};

// Main 3D Scene Component
export const Game3DScene = ({ 
  gameType = 'coins', 
  gameData = {},
  onInteraction = () => {} 
}) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas
        camera={{ position: [0, 5, 5], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Game-specific 3D elements */}
        {gameType === 'coins' && (
          <>
            <Coin3D 
              position={[-2, 0, 0]} 
              imageUrl="/images/coins/gold-coin.png"
              spinning={gameData.spinning}
            />
            <Coin3D 
              position={[2, 0, 0]} 
              imageUrl="/images/coins/silver-coin.png"
              spinning={gameData.spinning}
            />
          </>
        )}
        
        {gameType === 'dice' && (
          <Dice3D 
            position={[0, 1, 0]}
            rolling={gameData.rolling}
            faces={[
              '/images/dice/face-1.png',
              '/images/dice/face-2.png',
              '/images/dice/face-3.png',
              '/images/dice/face-4.png',
              '/images/dice/face-5.png',
              '/images/dice/face-6.png'
            ]}
          />
        )}
        
        {gameType === 'cards' && (
          <Card3D 
            position={[0, 0, 0]}
            imageUrl="/images/cards/ace-spades.png"
            flipping={gameData.flipping}
          />
        )}
        
        {gameType === 'mines' && (
          <MineField3D 
            gridSize={5}
            onCellClick={onInteraction}
            revealedCells={gameData.revealed || []}
            mines={gameData.mines || []}
          />
        )}
        
        {/* Controls for development */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

// Particle system with 3D elements
export const Particle3DEffect = ({ type = 'coins', count = 50, active = false }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 20,
        Math.random() * 10,
        (Math.random() - 0.5) * 20
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      velocity: [
        (Math.random() - 0.5) * 0.1,
        -Math.random() * 0.05,
        (Math.random() - 0.5) * 0.1
      ]
    }));
  }, [count]);

  if (!active) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      <Canvas>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {particles.map((particle) => (
          <AnimatedParticle3D
            key={particle.id}
            {...particle}
            type={type}
          />
        ))}
      </Canvas>
    </div>
  );
};

const AnimatedParticle3D = ({ position, rotation, velocity, type }) => {
  const meshRef = useRef();
  const texture = useLoader(TextureLoader, 
    type === 'coins' ? '/images/coins/gold-coin.png' : '/images/diamond.png'
  );
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update position
      meshRef.current.position.x += velocity[0];
      meshRef.current.position.y += velocity[1];
      meshRef.current.position.z += velocity[2];
      
      // Rotation animation
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.y += delta * 4;
      
      // Gravity effect
      velocity[1] -= delta * 0.01;
      
      // Reset if out of bounds
      if (meshRef.current.position.y < -10) {
        meshRef.current.position.y = 10;
        velocity[1] = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={0.2}>
      <cylinderGeometry args={[1, 1, 0.1, 16]} />
      <meshStandardMaterial 
        map={texture}
        metalness={0.8}
        roughness={0.2}
        emissive="#ffd700"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};