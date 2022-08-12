import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Suspense } from "react";
import {
  BufferGeometry,
  Color,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { User } from "../util/prisma-types";

interface AvatarProps {
  user: User;
}

interface Object3DWithGeometry extends Object3D {
  geometry: BufferGeometry;
}

const Avatar = ({ user }: AvatarProps) => {
  const getBaseUri = (additional: string) => {
    return `${
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://framework.soodam.rocks/"
    }${additional}`;
  };

  const head = useLoader(OBJLoader, getBaseUri("/obj/Head.obj"));
  const leftArm = useLoader(OBJLoader, getBaseUri("/obj/LeftArm.obj"));
  const leftLeg = useLoader(OBJLoader, getBaseUri("/obj/LeftLeg.obj"));
  const rightArm = useLoader(OBJLoader, getBaseUri("/obj/RightArm.obj"));
  const rightLeg = useLoader(OBJLoader, getBaseUri("/obj/RightLeg.obj"));
  const torso = useLoader(OBJLoader, getBaseUri("/obj/Torso.obj"));

  return (
    <div>
      <Canvas
        style={{
          height: "45vh",
          borderRadius: "10px",
        }}
        camera={{
          position: [16, 24, -43],
          fov: 32,
        }}
      >
        <Suspense fallback={null}>
          <pointLight position={[-13, -45, -1.8]} intensity={0.1} />
          <primitive
            object={
              new Mesh(
                (head.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.headColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <primitive
            object={
              new Mesh(
                (leftArm.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.leftArmColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <primitive
            object={
              new Mesh(
                (leftLeg.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.leftLegColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <primitive
            object={
              new Mesh(
                (rightArm.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.rightArmColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <primitive
            object={
              new Mesh(
                (rightLeg.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.rightLegColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <primitive
            object={
              new Mesh(
                (torso.children[0] as Object3DWithGeometry)
                  .geometry as BufferGeometry,
                new MeshStandardMaterial({
                  color: new Color(user!.avatar!.torsoColor),
                })
              )
            }
            position={[0, -2.4, 0]}
            scale={[2, 2, 2]}
          />
          <OrbitControls />
          <Environment preset="studio" background />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Avatar;
