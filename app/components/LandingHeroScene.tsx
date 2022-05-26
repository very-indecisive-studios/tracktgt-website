import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D, TextureLoader } from "three";
import { Suspense, useEffect, useMemo, useRef } from "react";

export const atlasImageVertexShader = `
precision mediump float;

varying vec2 vUv;

uniform float atlasXSize;
uniform float atlasYSize;

void main()
{
    float newX = (uv.x/atlasXSize) + instanceColor.r;
    float newY = (uv.y/atlasYSize) + instanceColor.g;

    vec2 newUv = vec2(newX, newY);
    vUv = newUv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`;

export const atlasImageFragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform sampler2D atlasMap;

void main()
{
    gl_FragColor = texture2D(atlasMap, vUv);
}`;


interface MediaPostersProps {
    opp: boolean;
    xOffset: number;
    yOffset: number;
}

function MediaPosters({ opp, xOffset, yOffset }: MediaPostersProps) {
    const atlasXSize = 4.0;
    const atlasYSize = 3.0;
    const count = 10;
    const offset = 5;
    const speed = 0.05;
    const outOfBounds = 6;

    const map = useLoader(TextureLoader, "/atlas.jpg");
    const ref = useRef<InstancedMesh>(null!);
    const object3D = useMemo<Object3D>(() => new Object3D(), []);
    const xPosArray = useMemo<Array<number>>(() => Array.from(Array(count).keys()).map(i => ((i - offset + xOffset) * 1.2)), []);

    useEffect(() => {
        for (let i = 0; i < count; i++) {
            // Using instance color as an offset because 
            // since its already implemented by default yknow...
            const xOffset = Math.floor(Math.random() * atlasXSize) * (1 / atlasXSize);
            const yOffset = Math.floor(Math.random() * atlasYSize) * (1 / atlasYSize);

            ref.current.setColorAt(i, new Color(xOffset, yOffset, 0));

            if (ref.current.instanceColor != null) {
                ref.current.instanceColor.needsUpdate = true;
            }
        }
    }, [])

    useFrame((state, delta, frame) => {
        for (let i = 0; i < count; i++) {
            let xPos = xPosArray[i];

            if (opp) {
                if (xPos < -outOfBounds) {
                    let next = i - 1;
                    if (next < 0) {
                        next = count - 1
                    }
                    xPos = xPosArray[next] + 1.2;

                }
                xPosArray[i] = xPos + (-speed * delta);
            } else {
                if (xPos > outOfBounds) {
                    let next = i + 1;
                    if (next == count) {
                        next = 0
                    }
                    xPos = xPosArray[next] - 1.2;

                }
                xPosArray[i] = xPos + (speed * delta);
            }

            object3D.position.set(xPosArray[i], yOffset, 0);
            object3D.updateMatrix();
            ref.current.setMatrixAt(i, object3D.matrix);

            ref.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={ref} args={[undefined, undefined, count]} scale={[2.4, 3.6, 1]}>
            <planeGeometry/>
            <shaderMaterial
                uniforms={{
                    atlasMap: { value: map },
                    atlasXSize: { value: atlasXSize },
                    atlasYSize: { value: atlasYSize }
                }}
                attach={"material"}
                vertexShader={atlasImageVertexShader}
                fragmentShader={atlasImageFragmentShader}
            />
        </instancedMesh>
    )
}

const LandingHeroScene = () => (
    <Canvas style={{
        height: "100%",
        position: "absolute"
    }} camera={{ position: [4, 0, 4], rotation: [0.25, 0.25, 0.25] }}>
        <Suspense fallback={null}>
            <MediaPosters opp={true} xOffset={0.75} yOffset={1.15}/>
            <MediaPosters opp={false} xOffset={0} yOffset={0}/>
            <MediaPosters opp={true} xOffset={0.75} yOffset={-1.15}/>
        </Suspense>
    </Canvas>
);

export default LandingHeroScene;
