// import React, { useRef, useEffect, useState, Suspense } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';

// // Available outfits — add more GLB files here as you create them
// const OUTFITS = {
//   uniform: '/mimi_uniform_model.glb',
//   frock:   '/mimi_frock_model.glb',
// };

// // Animation states your app will use
// // 'idle'          → she's listening/waiting
// // 'greet_02'      → greeting when app opens
// // 'clap'          → positive reaction
// // 'agree'         → nodding/agreeing
// // 'afraid'        → confused/error state
// // 'wave_goodbye_02' → user closes chat
// // 'talking'       → code-driven, no GLB animation needed

// function Model({ outfit, animationState, isTalking, audioLevel }) {
//   const modelRef = useRef();
//   const headRef = useRef();

//   const { scene, nodes, animations } = useGLTF(OUTFITS[outfit] || OUTFITS.uniform);
//   const { actions, names } = useAnimations(animations, modelRef);

//   // Log all bones — paste this output here so we can drive the jaw/head
//   useEffect(() => {
//     console.log('=== ANIMATION NAMES ===', names);
//     console.log('=== ALL BONES ===');
//     scene.traverse((obj) => {
//       if (obj.isBone) console.log('BONE:', obj.name);
//       // Find head bone for talking animation
//       if (obj.name.toLowerCase().includes('head') && obj.isBone) {
//         headRef.current = obj;
//         console.log('HEAD BONE FOUND:', obj.name);
//       }
//     });
//   }, [scene, names]);

//   useEffect(() => {
//   console.log('=== ALL MESHES ===');
//   scene.traverse((obj) => {
//     if (obj.isMesh) {
//       console.log('MESH:', obj.name);
//       // Check for morph targets
//       if (obj.morphTargetDictionary) {
//         console.log('  MORPH TARGETS:', Object.keys(obj.morphTargetDictionary));
//       }
//     }
//   });

  
// }, [scene]);

// useEffect(() => {
//   if (scene) {
//     console.log("--- Scanning Model for Facial Controls ---");
    
//     scene.traverse((child) => {
//       // Check for meshes that have a morphTargetDictionary
//       if (child.isMesh && child.morphTargetDictionary) {
//         console.log(`Found controls on Mesh: "${child.name}"`, child.morphTargetDictionary);
//       }
      
//       // Also apply your clothing texture here to keep things efficient
//       if (child.isMesh) {
//         // child.material.map = texture;
//         child.material.needsUpdate = true;
//       }
//     });
//   }
// }, [scene]);


//   // Play skeletal animation when animationState changes
//   useEffect(() => {
//     if (!actions || names.length === 0) return;

//     // Stop all current animations
//     Object.values(actions).forEach(a => a.fadeOut(0.3));

//     // Don't play a skeletal anim when talking — we drive it with code below
//     if (animationState === 'talking') return;

//     // Try to play the requested animation, fallback to idle
//     const target = actions[animationState] || actions['idle'] || Object.values(actions)[0];
//     if (target) target.reset().fadeIn(0.3).play();
//   }, [animationState, actions, names]);

//   // Procedural animation loop
//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();
//     if (!modelRef.current) return;

//     if (animationState === 'talking' || isTalking) {
//       // --- TALKING: code-driven head movement synced to audio ---
//       // audioLevel should be 0-1 from Web Audio API (0 = silent, 1 = loud)
//       const volume = audioLevel || Math.abs(Math.sin(t * 8)) * 0.5; // fallback sine wave

//       // Head nods on syllables
//       if (headRef.current) {
//         headRef.current.rotation.x = -volume * 0.15; // nod forward when speaking
//         headRef.current.rotation.z = Math.sin(t * 3) * 0.04; // slight tilt
//       }

//       // Body leans slightly forward when talking
//       modelRef.current.rotation.x = volume * 0.03;
//       modelRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;
//       modelRef.current.position.y = -1 + Math.sin(t * 2) * 0.01;

//     } else {
//       // --- IDLE BREATHING: subtle procedural on top of skeletal ---
//       modelRef.current.position.y = -1 + Math.sin(t * 1.2) * 0.02;
//       modelRef.current.rotation.z = Math.sin(t * 0.4) * 0.01;
//     }
//   });

//   return (
//     <primitive
//       ref={modelRef}
//       object={scene}
//       scale={2.2}
//       position={[0, -1, 0]}
//     />
//   );
// }

// export default function MimiCharacter({
//   outfit = 'uniform',        // 'uniform' | 'frock'
//   animationState = 'idle',   // 'idle' | 'talking' | 'greet_02' | 'clap' | 'agree' | 'afraid' | 'wave_goodbye_02'
//   isTalking = false,
//   audioLevel = 0,            // 0-1 float from Web Audio API
// }) {
//   return (
//     <div style={{ width: '100%', height: '500px' }}>
//       <Canvas camera={{ position: [0, 1.2, 3], fov: 40 }}>
//         <ambientLight intensity={1.5} />
//         <pointLight position={[10, 10, 10]} intensity={2} />
//         <pointLight position={[-10, 5, -5]} intensity={1} />
//         <directionalLight position={[0, 5, 5]} intensity={1.5} />
//         <Suspense fallback={null}>
//           <Model
//             outfit={outfit}
//             animationState={animationState}
//             isTalking={isTalking}
//             audioLevel={audioLevel}
//           />
//           <OrbitControls enablePan={false} target={[0, 0.5, 0]} />
//         </Suspense>
//       </Canvas>
//     </div>
//   );
// }