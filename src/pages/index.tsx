import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Indicator,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiChat, HiUserGroup } from "react-icons/hi";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import UserContext from "../components/UserContext";
import authorizedRoute from "../util/authorizedRoute";
import { exclude } from "../util/exclude";
import getMediaUrl from "../util/getMedia";
import { NonUser, User } from "../util/prisma-types";
import { getRelativeTime } from "../util/relativeTime";
import ReactNoSSR from "react-no-ssr";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user }) => {
  const [timeMessage, setTimeMessage] = useState("");
  const [friends, setFriends] = useState<NonUser[]>(
    user.followers.filter((follower) =>
      user.following.some((following) => following.id === follower.id)
    )
  );
  const [onlineFriends, setOnlineFriends] = useState(
    friends.filter(
      (friend) =>
        new Date(friend.lastSeen) >=
        new Date(new Date().getTime() - 5 * 60 * 1000)
    )
  );
  const [friendsTab, setFriendsTab] = useState(1);
  const [statusPosts, setStatusPosts] = useState(
    user.statusPosts
      .concat(
        friends
          .map((friend) => friend.statusPosts)
          .reduce((acc, val) => acc.concat(val), [])
      )
      .map((post) => ({
        ...post,
        user: exclude(
          user.id === post.userId
            ? user
            : friends.find((f) => f.id === post.userId),
          ["statusPosts"]
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusPage, setStatusPage] = useState(1);

  useEffect(() => {
    setTimeMessage(
      new Date().getHours() < 12
        ? "Good morning"
        : new Date().getHours() < 18
        ? "Good afternoon"
        : new Date().getHours() < 22
        ? "Good evening"
        : "Good night"
    );
  }, []);

  const handleStatusPost = async () => {
    setLoading(true);
    await fetch("/api/users/@me/status", {
      method: "POST",
      body: JSON.stringify({ status: statusMsg }),
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStatusPosts([res.status, ...statusPosts]);
          setStatusMsg("");
        }
      });
    setLoading(false);
    setStatusMsg("");
  };

  return (
    <Framework
      user={user}
      activeTab="home"
      modernTitle={`${timeMessage}, ${user.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <ReactNoSSR onSSR={<Skeleton height={300} />}>
            <ShadedCard withBorder>
              <div className="flex justify-between">
                <div className="flex items-center gap-2 mb-6">
                  <HiUserGroup size={24} />
                  <Title order={3}>Friends</Title>
                </div>
                <div>
                  <Badge variant="dot" color="green">
                    {onlineFriends.length} online
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {friends
                  .slice(
                    (friendsTab - 1) * 4,
                    friendsTab * 4 > friends.length
                      ? friends.length
                      : friendsTab * 4
                  )
                  .map((friend) => (
                    <Link href={`/profile/${friend.username}`} key={friend.id}>
                      <div className="cursor-pointer">
                        <Card
                          shadow="sm"
                          p="md"
                          className="justify-center flex flex-col items-center"
                          withBorder
                        >
                          <Indicator
                            disabled={!onlineFriends.includes(friend)}
                            color="green"
                            inline
                          >
                            <Avatar
                              size={64}
                              className="rounded-full"
                              src={getMediaUrl(friend.avatarUri)}
                              mb={16}
                            />
                          </Indicator>
                          {friend.alias && (
                            <Text
                              weight={700}
                              color="dimmed"
                              lineClamp={1}
                              mb={6}
                            >
                              {friend.alias}
                            </Text>
                          )}
                          <Text weight={500} lineClamp={1} mb={12}>
                            @{friend.username}
                          </Text>
                          <div className="flex justify-around w-full">
                            {[
                              ["Following", friend.following.length],
                              ["Followers", friend.followers.length],
                            ].map(([label, count]) => (
                              <div
                                className="flex flex-col items-center"
                                key={label}
                              >
                                <Text weight={700} color="dimmed">
                                  {count}
                                </Text>
                                <Text size="sm" color="dimmed">
                                  {label}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </Link>
                  ))}

                {friends.length === 0 && (
                  <div className="w-full flex justify-center">
                    <ModernEmptyState
                      title="No friends yet"
                      body="Find some friends to connect with on Framework."
                    />
                  </div>
                )}
              </div>
              <div className="w-full justify-center flex mt-4">
                <Pagination
                  total={Math.ceil(friends.length / 4)}
                  onChange={setFriendsTab}
                  radius="lg"
                />
              </div>
            </ShadedCard>
          </ReactNoSSR>
        </div>
        <div className="flex-1">
          <div className="flex flex-grow">
            <Avatar
              size={42}
              src={getMediaUrl(user.avatarUri)}
              mr={12}
              className="rounded-full"
            />
            <div className="flex-grow">
              <Textarea
                placeholder="What's on your mind?"
                icon={<HiChat />}
                mb={12}
                value={statusMsg}
                onChange={(e) => setStatusMsg(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
              />
              <Button
                fullWidth
                leftIcon={<HiChat />}
                variant="subtle"
                disabled={statusMsg.length === 0 || statusMsg.length > 256}
                onClick={handleStatusPost}
                loading={loading}
              >
                Post your status
              </Button>
            </div>
          </div>
          <Divider mt={32} mb={32} />
          <ReactNoSSR onSSR={<Skeleton height={430} />}>
            {statusPosts.length === 0 ? (
              <ShadedCard>
                <ModernEmptyState
                  title="No status posts yet"
                  body="Your friends will post here when they have something to say."
                />
              </ShadedCard>
            ) : (
              <>
                <div className="w-full flex justify-center mb-4">
                  <Pagination
                    total={Math.ceil(statusPosts.length / 5)}
                    onChange={setStatusPage}
                    radius="lg"
                  />
                </div>
                <Stack spacing={16}>
                  {statusPosts
                    .slice(
                      (statusPage - 1) * 5,
                      statusPage * 5 > statusPosts.length
                        ? statusPosts.length
                        : statusPage * 5
                    )
                    .map((status) => (
                      <div key={status.id} className="flex">
                        <div>
                          <UserContext user={status.user}>
                            <Avatar
                              size={42}
                              src={getMediaUrl(status.user.avatarUri)}
                              mr={12}
                              className="rounded-full"
                            />
                          </UserContext>
                        </div>
                        <div className="flex-grow">
                          <div className="flex gap-2">
                            <Text color="dimmed" size="xs" mb={6} weight={600}>
                              @{status.user.username}
                            </Text>
                            <Text size="xs">{" • "}</Text>
                            <Text color="dimmed" size="xs" mb={6}>
                              {getRelativeTime(
                                new Date(status.createdAt as Date)
                              )}
                            </Text>
                          </div>
                          <Text>{status.content}</Text>
                        </div>
                      </div>
                    ))}
                </Stack>
              </>
            )}
          </ReactNoSSR>
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);

  if (auth.redirect) {
    return {
      redirect: {
        destination: "/landing",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
    },
  };
}

export default Home;
