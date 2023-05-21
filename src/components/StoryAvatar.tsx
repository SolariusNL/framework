import { ActionIcon, Avatar, Text } from "@mantine/core";
import { FC } from "react";
import { HiPlus } from "react-icons/hi";
import useAuthorizedUserStore from "../stores/useAuthorizedUser";
import getMediaUrl from "../util/get-media";
import { NonUser } from "../util/prisma-types";
import Verified from "./Verified";

type StoryAvatar = {
  user: NonUser;
};

const StoryAvatar: FC<StoryAvatar> = ({ user }) => {
  const { user: currentUser } = useAuthorizedUserStore();
  return (
    <li className="flex flex-col items-center space-y-2 w-fit cursor-pointer max-w-[72px]">
      <div className="relative bg-gradient-to-tr from-yellow-400 to-purple-600 p-1 rounded-full">
        <Avatar
          className="w-16 h-16 rounded-full"
          src={getMediaUrl(user.avatarUri)}
          radius={9999}
        />
        {user.id === currentUser?.id && (
          <ActionIcon
            className="absolute bottom-0 rounded-full right-1"
            variant="filled"
            color="grape"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HiPlus />
          </ActionIcon>
        )}
      </div>

      <div className="flex items-center gap-1">
        {user.verified && <Verified className="w-5 h-5" />}
        <Text
          weight={500}
          size="sm"
          className="text-center"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "4rem",
          }}
        >
          {user.username}
        </Text>
      </div>
    </li>
  );
};

export default StoryAvatar;
