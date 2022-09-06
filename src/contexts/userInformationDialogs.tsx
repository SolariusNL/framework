import {
  Avatar,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import EmptyState from "../components/EmptyState";
import { NonUser, User } from "../util/prisma-types";

const UserInformationDialogContext =
  createContext<UserInformationDialogContextType>({
    open: false,
    setOpen: () => {},
    user: null,
    setUser: () => {},
    setDefaultTab: () => {},
  });

interface UserInformationDialogContextType {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  user: NonUser | User | null;
  setUser: Dispatch<SetStateAction<NonUser | User | null>>;
  setDefaultTab: Dispatch<SetStateAction<"following" | "followers">>;
}

const UserItem = ({ user, finished }: { user: NonUser | User | null, finished: () => void }) => {
  const router = useRouter();

  return (
    <UnstyledButton
      onClick={() => {
        router.push(`/profile/${user?.username}`);
        finished();
      }}
      sx={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <Group>
          <Avatar
            src={user?.avatarUri}
            size={26}
            radius="xl"
            alt={user?.username}
          />
        </Group>
        <Group>
          <Text weight={490}>{user?.username}</Text>
        </Group>
        <Group>
          <Text color="dimmed" lineClamp={1}>
            {user?.bio}
          </Text>
        </Group>
      </Group>
    </UnstyledButton>
  );
};

const UserInformationWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<NonUser | User | null>(null);

  const [selectedTab, setSelectedTab] = useState<"following" | "followers">(
    "following"
  );

  return (
    <UserInformationDialogContext.Provider
      value={{ open, setOpen, user, setUser, setDefaultTab: setSelectedTab }}
    >
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={user?.username || ""}
      >
        <SegmentedControl
          data={[
            { label: "Followers", value: "followers" },
            { label: "Following", value: "following" },
          ]}
          value={selectedTab}
          fullWidth
          mb={26}
          onChange={(v: "following" | "followers") => setSelectedTab(v)}
        />

        {(selectedTab === "following" && (
          <Paper
            sx={(theme) => ({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.white,
            })}
            withBorder
            shadow="md"
            p={12}
            radius="md"
          >
            {user?.following.length === 0 ? (
              <EmptyState
                title={`${user?.username} is not following anyone`}
                body="They will be listed here once they start following people."
              />
            ) : (
              user?.following.map((u) => (
                <UserItem user={u as NonUser} key={u.id} finished={() => setOpen(false)} />
              ))
            )}
          </Paper>
        )) ||
          (selectedTab === "followers" && (
            <Paper
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.white,
              })}
              withBorder
              shadow="md"
              p={12}
              radius="md"
            >
              {user?.followers.length === 0 ? (
                <EmptyState
                  title={`${user?.username} has no followers`}
                  body="They will be listed here once they start getting followers."
                />
              ) : (
                user?.followers.map((u) => (
                  <UserItem user={u as NonUser} key={u.id} finished={() => setOpen(false)} />
                ))
              )}
            </Paper>
          ))}
      </Modal>
      {children}
    </UserInformationDialogContext.Provider>
  );
};

const useUserInformationDialog = () => {
  const context = useContext(UserInformationDialogContext);
  if (context === undefined) {
    throw new Error(
      "useUserInformationDialog must be used within a UserInformationWrapper"
    );
  }
  return context;
};

export { UserInformationWrapper, useUserInformationDialog };