import {
  CameraControls,
  Center,
  Environment,
  MeshReflectorMaterial,
  OrbitControls,
  RenderTexture,
  Text,
  useFont,
  useGLTF,
} from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { degToRad, lerp } from "three/src/math/MathUtils";
import { News } from "./News";
import { Color, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { currentPageAtom } from "./UI";
import { atom, useAtom } from "jotai";
import { useFrame } from "@react-three/fiber";
import { Html, Float, Sparkles, Stars, Stats } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import wrinkledPaperTexture from "../dailynews.jpeg"; // adjust the path accordingly
import { TextureLoader } from "three";
import * as THREE from "three";


// const bloomColor = new Color("#fff");
// bloomColor.multiplyScalar(1.5);
const bloomColor = new Color("#fff");
bloomColor.multiply(new Color(1.5, 1.5, 1.5));


export const Experience = () => {
  const controls = useRef();
  const meshFitCameraHome = useRef();
  const meshFitCameraStore = useRef();
  const meshFitCameraNews = useRef();
  const newsPage = useRef();
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const textMaterial = useRef();
  const searchRef = useRef();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [apiResult, setApiResult] = useState("Loading");
  const [newsData, setNewsData] = useState([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  const handleSearchSubmit = async () => {
    if (searchKeyword === "") {
      setCurrentPage("store");
    } else {
      setCurrentPage("news");
      var requestOptions = {
        method: "GET",
      };

      var params = {
        api_token: "CdP4RA0FAD0gcDqS1zOYIPAUJK4tE6qfxHbFl0o6",
        categories: 'business,tech,finance,IT,global',
        search: searchKeyword,
        limit: "3",
        language: "en",
        published_after: "2022-11-30",
      };

      var esc = encodeURIComponent;
      var query = Object.keys(params)
        .map(function (k) {
          return esc(k) + "=" + esc(params[k]);
        })
        .join("&");

      fetch("https://api.thenewsapi.com/v1/news/all?" + query, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const parsedResult = JSON.parse(result);

          // Save all news data in state
          setNewsData(parsedResult.data);

          // Display the first news data
          if (parsedResult.data[0] && parsedResult.data[0].description) {
            const sentences = parsedResult.data[0].description.split(".");
            const truncatedDescription = sentences.slice(0, 2).join(".") + ".";
            setApiResult({
              ...parsedResult.data[0],
              description: truncatedDescription,
            });
            console.log(parsedResult);
          } else {
            setApiResult(parsedResult.data[0]);
          }
        })
        .catch((error) => console.log("error", error));
    }
  };

  const notInterested = () => {
    // Check if there is more data to display
    if (currentResultIndex < newsData.length - 1) {
      // Increment the index to display the next data
      setCurrentResultIndex(currentResultIndex + 1);

      // Update the state with the next data
      const nextNews = newsData[currentResultIndex + 1];
      setApiResult({
        ...nextNews,
        description: nextNews.description,
      });
    } else {
      // If there's no more data,
      setCurrentPage("store");
    }
  };

  const interested = () => {
    // Check if there is a valid URL in apiResult
    if (apiResult && apiResult.url) {
      // Open the URL in a new tab
      window.open(apiResult.url, "_blank");
    } else {
      // Handle the case where there is no URL
      console.error("No valid URL found in apiResult");
    }
  };
  

  useFrame((_, delta) => {
    textMaterial.current.opacity = lerp(
      textMaterial.current.opacity,
      currentPage === "home" || currentPage === "intro" ? 1 : 0,
      delta * 2
    );
    if (searchRef.current) {
      searchRef.current.style.opacity = currentPage === "store" ? 0.8 : 0;
    }
    if (newsPage.current) {
      newsPage.current.visible = currentPage === "news" ? true : false;
    }
  });

  const intro = async () => {
    controls.current.dolly(-22);
    controls.current.smoothTime = 1;
    setTimeout(() => {
      setCurrentPage("home");
    }, 1200);
    fitCamera();
  };

  const fitCamera = async () => {
    if (currentPage === "store") {
      controls.current.smoothTime = 0.6;
      controls.current.fitToBox(meshFitCameraStore.current, true);
    } else if (currentPage === "news") {
      controls.current.smoothTime = 1.6;
      controls.current.fitToBox(meshFitCameraNews.current, true);
    } else {
      controls.current.smoothTime = 1.6;
      controls.current.fitToBox(meshFitCameraHome.current, true);
    }
  };
  useEffect(() => {
    intro();
  }, []);

  useEffect(() => {
    fitCamera();
    window.addEventListener("resize", fitCamera);
    return () => window.removeEventListener("resize", fitCamera);
  }, [currentPage]);


  

 
  return (

    <>
      <CameraControls ref={controls} />
      <mesh ref={meshFitCameraHome} position-z={3.5} visible={false}>
        <boxGeometry args={[8, 2, 2]} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>
      <Text
        font={"fonts/Diphylleia-Regular.ttf"}
        position-x={-2.7}
        position-y={-0.5}
        position-z={1.5}
        lineHeight={1}
        rotation-y={degToRad(30)}
      >
        Daily {"\n"} 3 News
        <meshBasicMaterial
          color={bloomColor}
          toneMapped={false}
          ref={textMaterial}
        />
      </Text>

      <group
        rotation-y={degToRad(-25)}
        position-x={1}
        position-z={5}
        position-y={-1}
      >
        <News />
        <mesh
          ref={meshFitCameraStore}
          position-z={0}
          position-x={1.5}
          position-y={1.3}
          rotation-x={degToRad(-50)}
          rotation-y={degToRad(50)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="red"
            transparent
            opacity={0.5}
            visible={false}
          />
        </mesh>
      </group>

      <group position={[3.5, 1, 3]}>
        <Sparkles
          count={50}
          size={3}
          speed={0.02}
          opacity={1}
          scale={10}
          color="#fff3b0"
        />

          <Float speed={3}>
            <Text
              position={[0.5, 0.2, 0]}
              font={"fonts/Diphylleia-Regular.ttf"}
              scale={0.2}
              lineHeight={1}
            >
              Enter a keyword
            </Text>

            <Html>
              <div
               
                ref={searchRef}
                style={{
                  display: "flex",
                  position: "fixed",
                  top: 20,
                  left: 20,
                  zIndex: 10,
                  opacity: 0,
                }}
              >
                {/* Input Text Box */}
                <input
                position={[0, 0.2, 0]}
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  style={{
                    width: "250px",
                    padding: "5px",
                    backgroundColor: "transparent",
                    border: "1px solid white",
                    color: "white",
            
                  }}
                />
                {/* Search Button */}
                <button
                  onClick={handleSearchSubmit}
                  style={{
                    marginLeft: "15px",
                    padding: "5px",
                    color: "white",
                    transition: "background-color 0.3s ease", // Add transition for smooth animation
                    backgroundColor: "transparent", // Set initial background color
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = bloomColor)
                  } // Set hover background color
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  } // Reset background color on hover out
                >
                  Search
                </button>
              </div>
            </Html>
          </Float>
     
      </group>

      <group>
        
        <mesh
          ref={meshFitCameraNews}
          position-z={-4.5}
          position-x={2}
          position-y={1.3}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="red"
            transparent
            opacity={0.5}
            visible={false}
          />
        </mesh>
        <mesh position={[2, 1.2, -11]} 
        ref={newsPage}
        >
          <planeGeometry args={[3.5, 5]} />

          <Text
          font={"/fonts/BillsMafia.ttf"}
        
            maxWidth={20}
            lineHeight={1.2}
            scale={0.15}
            style={{ whiteSpace: "pre-line" }}
            color="#211f1f"
            opacity={0.5}
            position={[0, 0.85,0.6]}
            textAlign="center"
          >
            {apiResult.title
              ? apiResult.title + "\n" + "\n" 
              : "Loading..." + "\n" + "\n" }
          </Text>

          <Text
  font={"/fonts/OldNewspaperTypes.ttf"}
  maxWidth={20}
  lineHeight={1.2}
  scale={0.1}
  style={{ whiteSpace: "pre-line" }}
  color="#211f1f"
  opacity={0.5}
  position={[0, 0.4, 0.9]}
  textAlign="center"
>
{apiResult.keywords
    ?  apiResult.keywords.split(', ').slice(0, 3).join(', ')
    : "No related keyword found" }
</Text>

          <Text
          position={[0.01,-1,0.9]}
          font={"fonts/OldNewspaperTypes.ttf"}
            maxWidth={30}
            lineHeight={2}
            scale={0.1}
            style={{ whiteSpace: "pre-line" }}
            color="#211f1f"
            opacity={0.5}
          >
            {apiResult.description
              ? apiResult.description + "\n"
              : "No description given."}
          </Text>

       
          <Text
           font={"fonts/Newsreader_9pt-Bold.ttf"}
            position-x={-0.5}
            position-y={-1.5}
            maxWidth={15}
            lineHeight={2}
            scale={0.09}
            color="#9b0f0f"
            onClick={notInterested}
          >
            Next
          </Text>
          <Text
            font={"fonts/Newsreader_9pt-Bold.ttf"}
            position-y={-1.5}
            position-x={0.5}
            maxWidth={15}
            lineHeight={2}
            scale={0.09}
            onClick={interested}
            color="#26631d"
          >
            Interested
          </Text>
          
          <meshStandardMaterial
            map={new THREE.TextureLoader().load(wrinkledPaperTexture)}
            roughness={0.8} // Adjust roughness as needed
            metalness={0.2} // Adjust metalness as needed
            side={THREE.DoubleSide} // Make sure the material is visible from both sides
          />
         
        </mesh>
    
      </group>

      <mesh position-y={-1.35} rotation-x={-Math.PI / 2}>
        <Stars
          radius={50}
          depth={100}
          count={1000}
          factor={6}
          saturation={0}
          fade
          speed={0.2}
        />
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[100, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={10}
          roughness={1}
          depthScale={1}
          opacity={0.5}
          transparent
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#333"
          metalness={0.5}
        />
      </mesh>
      <Environment preset="sunset" />
   
      <Stats />
    </>
  );
};

useGLTF.preload("/models/news.glb");
