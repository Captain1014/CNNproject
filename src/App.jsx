import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Experience } from "./components/Experience";
import { Suspense } from "react";
import { UI } from "./components/UI";

function App() {
  return (
    <>
    <Canvas shadows camera={{ position: [0, 0, 8], fov: 30 }}>
      <color attach="background" args={["rgb(15, 14, 14)"]} />
      <fog attach="fog" args={["#171720", 10,30]}/>
     <Suspense>
     <Experience />
     </Suspense>
     
      <EffectComposer>
        <Bloom mipmapBlur intensity={1.2}></Bloom>
      </EffectComposer>
    </Canvas>
    <UI />
    </>
  );
}

export default App;
