import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import getMediaUrl from "@/util/get-media";
import { NonUser, User } from "@/util/prisma-types";
import {
  getFollowers,
  getFollowersPages,
  getFollowing,
  getFollowingPages,
} from "@/util/universe/friends";
import {
  Avatar,
  Group,
  Modal,
  Pagination,
  SegmentedControl,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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

const UserItem = ({
  user,
  finished,
}: {
  user: NonUser | User | null;
  finished: () => void;
}) => {
  return (
    <Link href="/profile/[username]" as={`/profile/${user?.username}`} passHref>
      <UnstyledButton
        onClick={() => {
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
          width: "100%",
        })}
      >
        <Group>
          <Group>
            <Avatar
              src={getMediaUrl(user!.avatarUri)}
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
    </Link>
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
  const [followers, setFollowers] = useState<NonUser[]>([]);
  const [following, setFollowing] = useState<NonUser[]>([]);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const [followersPages, setFollowersPages] = useState(1);
  const [followingPages, setFollowingPages] = useState(1);

  useEffect(() => {
    if (user) {
      getFollowersPages(user?.id!).then((pages) => {
        setFollowersPages(pages);
      });
      getFollowingPages(user?.id!).then((pages) => {
        setFollowingPages(pages);
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getFollowers(user?.id!).then((followers) => {
        setFollowers(followers);
      });

      getFollowing(user?.id!).then((following) => {
        setFollowing(following);
      });
    }
  }, [user, followersPage, followingPage]);

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
          <ShadedCard>
            {user?._count.following === 0 ? (
              <ModernEmptyState
                title={`${user?.username} is not following anyone`}
                body="They will be listed here once they start following people."
              />
            ) : (
              following &&
              following.map((u) => (
                <UserItem
                  user={u as NonUser}
                  key={u.id}
                  finished={() => setOpen(false)}
                />
              ))
            )}
          </ShadedCard>
        )) ||
          (selectedTab === "followers" && (
            <ShadedCard>
              {user?._count.followers === 0 ? (
                <ModernEmptyState
                  title={`${user?.username} has no followers`}
                  body="They will be listed here once they start getting followers."
                />
              ) : (
                followers &&
                followers.map((u) => (
                  <UserItem
                    user={u as NonUser}
                    key={u.id}
                    finished={() => setOpen(false)}
                  />
                ))
              )}
            </ShadedCard>
          ))}

        <div className="w-full flex justify-center mt-4">
          <Pagination
            total={
              selectedTab === "followers" ? followersPages : followingPages
            }
            page={selectedTab === "followers" ? followersPage : followingPage}
            onChange={(page) =>
              selectedTab === "followers"
                ? setFollowersPage(page)
                : setFollowingPage(page)
            }
            radius="xl"
          />
        </div>
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
