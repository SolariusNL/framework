import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Menu,
  Skeleton,
  Stack,
  Text,
  Textarea
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { StatusPosts } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiChat,
  HiClipboardCopy,
  HiDotsVertical,
  HiFlag
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import getMediaUrl from "../../util/getMedia";
import { NonUser } from "../../util/prisma-types";
import { getRelativeTime } from "../../util/relativeTime";
import ModernEmptyState from "../ModernEmptyState";
import ReportUser from "../ReportUser";
import ShadedCard from "../ShadedCard";
import UserContext from "../UserContext";

type StatusPost = StatusPosts & {
  user: NonUser;
};

const FeedWidget: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const user = useFrameworkUser()!;
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([]);
  const [reportOpened, setReportOpened] = useState(false);
  const [reportUser, setReportUser] = useState<NonUser>();
  const form = useForm<{ status: string }>({
    initialValues: {
      status: "",
    },
    validate: {
      status: (value) => {
        if (value.length > 256 || value.length === 0) {
          return "Status posts cannot be longer than 256 characters or empty";
        }
      },
    },
  });

  const handleStatusPost = async (values: { status: string }) => {
    setLoading(true);
    await fetch("/api/users/@me/status", {
      method: "POST",
      body: JSON.stringify({ status: values.status }),
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStatusPosts([res.status as unknown as StatusPost, ...statusPosts]);
          form.reset();
        }
      });
    setLoading(false);
  };

  const getStatusPosts = async () => {
    await fetch("/api/users/@me/statusposts", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStatusPosts(res.statusPosts);
        }
      });
  };

  useEffect(() => {
    getStatusPosts();
  }, []);

  return (
    <>
      <ReportUser
        user={(reportOpened ? reportUser : user) as NonUser}
        opened={reportOpened}
        setOpened={setReportOpened}
      />
      <ShadedCard withBorder>
        <div className="flex flex-grow">
          <Avatar
            size={42}
            src={getMediaUrl(user.avatarUri)}
            mr={12}
            className="rounded-full"
          />
          <div className="flex-grow">
            <form onSubmit={form.onSubmit(handleStatusPost)}>
              <Textarea
                placeholder="What's on your mind?"
                mb={12}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                {...form.getInputProps("status")}
              />
              <Button
                fullWidth
                leftIcon={<HiChat />}
                loading={loading}
                variant="default"
                type="submit"
              >
                Post your status
              </Button>
            </form>
          </div>
        </div>
        <Divider mt={32} mb={32} />
        <ReactNoSSR onSSR={<Skeleton height={430} />}>
          {statusPosts !== undefined && statusPosts.length === 0 ? (
            <ShadedCard>
              <ModernEmptyState
                title="No status posts yet"
                body="Your friends will post here when they have something to say."
              />
            </ShadedCard>
          ) : (
            <>
              <Stack spacing={24}>
                {statusPosts.map((status) => (
                  <div key={status.id} className="flex justify-between">
                    <div className="flex">
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
                        <div>
                          <Text mb={2} size="sm">
                            @{status.user.username}
                          </Text>
                          <Text color="dimmed" size="xs">
                            {getRelativeTime(
                              new Date(status.createdAt as Date)
                            )}
                          </Text>
                        </div>
                        <Text mt={12}>{status.content}</Text>
                      </div>
                    </div>
                    <div>
                      <Menu width={180}>
                        <Menu.Target>
                          <ActionIcon>
                            <HiDotsVertical />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            color="red"
                            icon={<HiFlag />}
                            onClick={() => {
                              setReportUser(status.user);
                              setReportOpened(true);
                            }}
                          >
                            Report
                          </Menu.Item>
                          <Menu.Item
                            icon={<HiClipboardCopy />}
                            onClick={() => {
                              navigator.clipboard.writeText(status.content);
                            }}
                          >
                            Copy content
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </div>
                ))}
              </Stack>
            </>
          )}
        </ReactNoSSR>
      </ShadedCard>
    </>
  );
};

export default FeedWidget;
