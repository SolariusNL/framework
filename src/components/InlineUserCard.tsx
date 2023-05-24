import { Avatar, ButtonProps, Text } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { HiArrowRight } from "react-icons/hi";
import getMediaUrl from "../util/get-media";
import { NonUser } from "../util/prisma-types";
import ShadedButton from "./ShadedButton";

type InlineUserCardProps = {
  user: NonUser;
  rightSection?: React.ReactNode;
  link?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const InlineUserCard: FC<InlineUserCardProps> = ({
  user,
  link = true,
  ...props
}) => {
  const Component = (
    <ShadedButton
      className="flex group justify-between items-center p-2"
      {...(props as ButtonProps)}
    >
      <div className="flex items-center gap-2">
        <Avatar src={getMediaUrl(user.avatarUri)} radius="xl" size={24} />
        <Text size="sm" weight={500}>
          {user.alias ? user.alias : user.username}
        </Text>
        <Text size="sm" color="dimmed">
          @{user.username}
        </Text>
      </div>
      <div className="flex items-center gap-2">
        {props.rightSection}
        <HiArrowRight className="text-dimmed group-hover:opacity-100 md:opacity-0 opacity-100 transition-all" />
      </div>
    </ShadedButton>
  );

  return (
    <>
      {link ? (
        <Link href={`/profile/${user.username}`} passHref key={user.id}>
          {Component}
        </Link>
      ) : (
        Component
      )}
    </>
  );
};

export default InlineUserCard;
