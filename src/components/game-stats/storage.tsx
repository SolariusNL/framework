import { EditableGame } from "@/layouts/edit-game-layout";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Fw } from "@/util/fw";
import { Center, Group, Paper, RingProgress, Text } from "@mantine/core";
import { FC } from "react";
import { HiOutlineFolderDownload } from "react-icons/hi";

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

  return (
    <Paper withBorder p="xs">
      <Group>
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[
            {
              value: usedStoragePercentage,
              color: "blue",
            },
          ]}
          label={
            <Center>
              <HiOutlineFolderDownload size={24} className="text-dimmed" />
            </Center>
          }
        />

        <div>
          <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
            Used storage capacity
          </Text>
          <Text weight={700} size="xl" mb={4}>
            {usedStorageGB.toFixed(2)} GB ({Math.round(usedStoragePercentage)}%)
          </Text>
          <Text color="dimmed" size="xs">
            Using {formatBytes(Math.round(game.usedStorageBytes))} of{" "}
            {formatBytes(storageCapacity)}
          </Text>
        </div>
      </Group>
    </Paper>
  );
};

export default StorageStat;
