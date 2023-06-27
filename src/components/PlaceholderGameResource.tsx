import BioMesh from "@/components/Mesh/BioMesh";
import CatalogMesh from "@/components/Mesh/CatalogMesh";
import CreateGameMesh from "@/components/Mesh/CreateGameMesh";
import FollowMesh from "@/components/Mesh/FollowMesh";
import LikeGameMesh from "@/components/Mesh/LikeGameMesh";
import ReferMesh from "@/components/Mesh/ReferMesh";
import TealSkyMesh from "@/components/Mesh/TealSkyMesh";
import { Game } from "@/util/prisma-types";
import React from "react";

interface PlaceholderGameResourceProps {
  height?: number;
  radius?: number;
  width?: number;
  game?: Game;
  className?: string;
  noBottomRadius?: boolean;
}

const meshes = [
  BioMesh,
  CatalogMesh,
  CreateGameMesh,
  FollowMesh,
  LikeGameMesh,
  ReferMesh,
  TealSkyMesh,
];

const PlaceholderGameResource = ({
  height,
  radius = 8,
  width,
  game,
  noBottomRadius,
  className,
}: PlaceholderGameResourceProps) => {
  const Mesh = React.useMemo(() => {
    const mesh = meshes[game?.id! % meshes.length];
    return mesh || meshes[Math.floor(Math.random() * meshes.length)];
  }, [game]);

  return React.cloneElement(<Mesh />, {
    className,
    style: {
      height: `${height}px`,
      width: `${width}px`,
      ...(radius ? { borderRadius: `${radius}px` } : {}),
      ...(noBottomRadius
        ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
        : {}),
    },
  });
};

export default PlaceholderGameResource;
