import { Section } from "@/components/Home/FriendsWidget";
import LoadingIndicator from "@/components/LoadingIndicator";
import Markdown, { ToolbarItem } from "@/components/Markdown";
import ModernEmptyState from "@/components/ModernEmptyState";
import sanitizeInappropriateContent from "@/components/ReconsiderationPrompt";
import RenderMarkdown from "@/components/RenderMarkdown";
import ReportUser from "@/components/ReportUser";
import ShadedCard from "@/components/ShadedCard";
import UserContext from "@/components/UserContext";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import { getRelativeTime } from "@/util/relative-time";
import {
  ActionIcon,
  Avatar,
  Button,
  Menu,
  Modal,
  Pagination,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { StatusPosts } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiClipboardCopy,
  HiDotsVertical,
  HiFlag,
  HiPlus,
} from "react-icons/hi";

type StatusPost = StatusPosts & {
  user: NonUser;
};

const FeedWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const user = useFrameworkUser()!;
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([]);
  const [reportOpened, setReportOpened] = useState(false);
  const [reportUser, setReportUser] = useState<NonUser>();
  const [newPost, setNewPost] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const form = useForm<{ status: string }>({
    initialValues: {
      status: "",
    },
    validate: {
      status: (value) => {
        if (value.length > 1024 || value.length === 0) {
          return "Status posts cannot be longer than 1024 characters or empty";
        }
      },
    },
  });
  const { colorScheme } = useMantineColorScheme();

  const handleStatusPost = async (values: { status: string }) => {
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
          setNewPost(false);
        }
      });
  };

  const getStatusPosts = async () => {
    setLoading(true);
    await fetch("/api/users/@me/statusposts/" + page, {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStatusPosts(res.statusPosts);
          setPages(res.pages);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getStatusPosts();
  }, [page]);

  return (
    <>
      <ReportUser
        user={(reportOpened ? reportUser : user) as NonUser}
        opened={reportOpened}
        setOpened={setReportOpened}
      />
      <Modal
        title="New post"
        opened={newPost}
        onClose={() => setNewPost(false)}
        className={colorScheme}
      >
        <form
          onSubmit={form.onSubmit((values) => {
            setNewPost(false);
            sanitizeInappropriateContent(
              values.status,
              () => {
                handleStatusPost(values);
              },
              () => setNewPost(true)
            );
          })}
        >
          <Markdown
            placeholder="Enter your status..."
            toolbar={[
              ToolbarItem.Bold,
              ToolbarItem.H3,
              ToolbarItem.H4,
              ToolbarItem.BulletList,
              ToolbarItem.OrderedList,
              ToolbarItem.Url,
              ToolbarItem.Help,
            ]}
            {...form.getInputProps("status")}
          />
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="default">
              Post
            </Button>
          </div>
        </form>
      </Modal>
      <Section
        title="Feed"
        description="Your friends' status posts."
        right={
          <Button
            variant="default"
            leftIcon={<HiPlus />}
            onClick={() => setNewPost(true)}
          >
            New post
          </Button>
        }
      />
      <div className="flex items-center justify-center text-center mb-4">
        <Pagination
          radius="md"
          withEdges
          total={pages || 1}
          page={page}
          onChange={setPage}
        />
      </div>
      {loading ? (
        <ShadedCard className="flex items-center justify-center py-8">
          <LoadingIndicator />
        </ShadedCard>
      ) : (
        <>
          {statusPosts && statusPosts.length === 0 ? (
            <ShadedCard>
              <ModernEmptyState
                title="No status posts yet"
                body="Your friends will post here when they have something to say."
              />
            </ShadedCard>
          ) : (
            <>
              <Stack spacing={"md"}>
                {statusPosts.map((status) => (
                  <ShadedCard key={status.id}>
                    <div>
                      <div className="flex justify-between">
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
                              <Text color="dimmed" size="xs" mb="md">
                                {getRelativeTime(
                                  new Date(status.createdAt as Date)
                                )}
                              </Text>
                            </div>
                            <RenderMarkdown>{status.content}</RenderMarkdown>
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
                    </div>
                  </ShadedCard>
                ))}
              </Stack>
            </>
          )}
        </>
      )}
    </>
  );
};

export default FeedWidget;
