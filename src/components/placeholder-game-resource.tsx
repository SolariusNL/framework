import BioMesh from "@/components/mesh/bio";
import CatalogMesh from "@/components/mesh/catalog";
import CreateGameMesh from "@/components/mesh/create-game";
import FollowMesh from "@/components/mesh/follow";
import LikeGameMesh from "@/components/mesh/like-game";
import ReferMesh from "@/components/mesh/refer";
import TealSkyMesh from "@/components/mesh/teal-sky";
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
