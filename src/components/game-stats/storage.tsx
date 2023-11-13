import { EditableGame } from "@/layouts/edit-game-layout";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Fw } from "@/util/fw";
import { FC } from "react";
import { HiOutlineFolderDownload } from "react-icons/hi";
import GameStatCard from "./stat-card";

type StorageStatProps = {
  game: EditableGame;
};

const formatBytes = (bytes: number): string => {
  const units = ["bytes", "KB", "MB", "GB", "TB"];

  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return bytes.toFixed(2) + " " + units[i];
};

const StorageStat: FC<StorageStatProps> = ({ game }) => {
  const { user } = useAuthorizedUserStore();
  const storageCapacity = user?.premium
    ? 25 * 1024 * 1024 * 1024
    : 5 * 1024 * 1024 * 1024;

  const usedStorageGB = Fw.Conversions.storage.bytesToGigabytes(
    game.usedStorageBytes
  );
  const usedStoragePercentage = (game.usedStorageBytes / storageCapacity) * 100;

  const formattedValue = `${usedStorageGB.toFixed(2)} GB (${Math.round(
    usedStoragePercentage
  )}%)`;
  const tertiaryLabel = `Using ${formatBytes(
    Math.round(game.usedStorageBytes)
  )} of ${formatBytes(storageCapacity)}`;

  return (
    <GameStatCard
      value={usedStoragePercentage}
      formattedValue={formattedValue}
      title="Used storage capacity"
      icon={<HiOutlineFolderDownload size={24} className="text-dimmed" />}
      tertiaryLabel={tertiaryLabel}
    />
  );
};

export default StorageStat;
