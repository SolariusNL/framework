import { Avatar, Badge, Group, Select, SelectProps, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { forwardRef, useMemo, useState } from "react";
import { exclude } from "@/util/exclude";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";

interface UserSelectProps {
  onUserSelect: (user: NonUser) => void;
}

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  avatarUri: string;
  username: string;
  bio: string;
  banned: boolean;
  role: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ avatarUri, username, bio, banned, role, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={getMediaUrl(avatarUri)} radius={999} size={24} />

        <div>
          <Group spacing={8}>
            <Text size="sm">{username}</Text>
            <Group spacing={4}>
              {banned && (
                <Badge color="red" size="sm">
                  Banned
                </Badge>
              )}
              {role === "ADMIN" && <Badge size="sm">Staff</Badge>}
            </Group>
          </Group>
          <Text size="xs" color="dimmed" lineClamp={1}>
            {bio}
          </Text>
        </div>
      </Group>
    </div>
  )
);

const UserSelect: React.FC<UserSelectProps & Omit<SelectProps, "data">> = ({
  onUserSelect,
  ...props
}) => {
  const [userAutoComplete, setUserAutoComplete] = useState<NonUser[]>([]);
  const [value, setValue] = useState<string>();

  return (
    <Select
      searchable
      onSearchChange={(q) => {
        fetch(`/api/users/search?q=${q}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: String(getCookie(".frameworksession")),
          },
        })
          .then((res) => res.json())
          .then((res) => {
            setUserAutoComplete(res);
          });
      }}
      itemComponent={SelectItem}
      filter={(value, item) =>
        item.username.toLowerCase().includes(value.toLowerCase())
      }
      onClick={(e) => e.stopPropagation()}
      data={useMemo(
        () =>
          userAutoComplete.length > 0
            ? userAutoComplete.map((user) => ({
                value: user.id,
                label: user.username,
                avatarUri: user.avatarUri,
                username: user.username,
                bio: user.bio,
                banned: user.banned,
                role: user.role,
              }))
            : [],
        [userAutoComplete]
      )}
      onChange={(id: number) => {
        onUserSelect(
          userAutoComplete.find((user) => user.id === id) as NonUser
        );
        setValue("");
      }}
      value={value}
      {...exclude(props, ["data"])}
    />
  );
};

export default UserSelect;
