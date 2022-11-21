import {
  Avatar,
  Button,
  Divider,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiChat } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { exclude } from "../../util/exclude";
import getMediaUrl from "../../util/getMedia";
import { NonUser } from "../../util/prisma-types";
import { getRelativeTime } from "../../util/relativeTime";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import UserContext from "../UserContext";

const FeedWidget: React.FC = () => {
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusPage, setStatusPage] = useState(1);
  const user = useFrameworkUser()!;

  const [friends, setFriends] = useState<NonUser[]>(
    user.followers.filter((follower) =>
      user.following.some((following) => following.id === follower.id)
    )
  );
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
    <>
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
            <Stack spacing={16} className="mb-4">
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
                          {getRelativeTime(new Date(status.createdAt as Date))}
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
    </>
  );
};

export default FeedWidget;
