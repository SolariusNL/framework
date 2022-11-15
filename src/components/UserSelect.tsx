import { Avatar, Badge, Group, Select, SelectProps, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { forwardRef, useState } from "react";
import { exclude } from "../util/exclude";
import { NonUser } from "../util/prisma-types";

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
        <Avatar src={avatarUri} />

        <div>
          <Group spacing={8}>
            <Text size="sm">{username}</Text>
            <Group spacing={4}>
              {banned && <Badge color="red">Banned</Badge>}
              {role === "ADMIN" && <Badge>Staff</Badge>}
            </Group>
          </Group>
          <Text size="xs" color="dimmed">
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
      data={
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
          : []
      }
      onChange={(user: NonUser) => {
        onUserSelect(user);
      }}
      {...exclude(props, ["data"])}
    />
  );
};

export default UserSelect;
