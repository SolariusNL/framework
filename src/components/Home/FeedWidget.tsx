import { Section } from "@/components/Home/FriendsWidget";
import LoadingIndicator from "@/components/LoadingIndicator";
import Markdown, { ToolbarItem } from "@/components/Markdown";
import ModernEmptyState from "@/components/ModernEmptyState";
import sanitizeInappropriateContent from "@/components/ReconsiderationPrompt";
import RenderMarkdown from "@/components/RenderMarkdown";
import ReportUser from "@/components/ReportUser";
import ShadedCard from "@/components/ShadedCard";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { NonUser } from "@/util/prisma-types";
import {
  ActionIcon,
  Button,
  Divider,
  Menu,
  Modal,
  Pagination,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { StatusPostComment, StatusPosts } from "@prisma/client";
import { getCookie } from "cookies-next";
import { FC, useEffect, useState } from "react";
import {
  HiClipboardCopy,
  HiDotsVertical,
  HiFlag,
  HiOutlineChat,
  HiOutlineChatAlt2,
  HiOutlineClock,
  HiPaperAirplane,
  HiPlus,
} from "react-icons/hi";
import DataGrid from "../DataGrid";
import Owner from "../Owner";
import Stateful from "../Stateful";

type StatusPost = StatusPosts & {
  user: NonUser;
  comments: StatusPostComment[];
};
type StatusPostWithComment = StatusPostComment & {
  user: NonUser;
};

const Comment: FC<{ comment: StatusPostWithComment }> = ({ comment }) => (
  <div key={comment.id} className="flex flex-col">
    <Owner user={comment.user} />
    <div className="flex-grow mt-4">
      <RenderMarkdown>{comment.content}</RenderMarkdown>
      <Text size="sm" color="dimmed" mt="md">
        {new Date(comment.createdAt).toLocaleString()}
      </Text>
    </div>
  </div>
);

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

  const dateSort = (
    a: Pick<StatusPost, "createdAt">,
    b: Pick<StatusPost, "createdAt">
  ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

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
                      <div className="flex items-center justify-between">
                        <Owner user={status.user} />
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
                      <div className="flex-grow mt-4">
                        <RenderMarkdown>{status.content}</RenderMarkdown>
                        <DataGrid
                          defaultCols={2}
                          mdCols={2}
                          smCols={2}
                          items={[
                            {
                              tooltip: "Created at",
                              icon: <HiOutlineClock />,
                              value: new Date(
                                status.createdAt
                              ).toLocaleString(),
                            },
                            {
                              tooltip: "Comments",
                              icon: <HiOutlineChat />,
                              value: `${
                                status.comments.length
                              } ${Fw.Strings.pluralize(
                                status.comments.length,
                                "comment"
                              )}`,
                            },
                          ]}
                        />
                      </div>
                      <Divider
                        my="md"
                        label="Comments"
                        labelProps={{
                          color: "dimmed",
                          weight: 500,
                        }}
                        labelPosition="center"
                      />
                      <ShadedCard black withBorder>
                        <Stateful initialState={false}>
                          {(reveal, setReveal) => (
                            <>
                              {status.comments.length === 0 ? (
                                <ModernEmptyState
                                  title="No comments"
                                  body="There are no comments on this post yet."
                                />
                              ) : (
                                <>
                                  {reveal ? (
                                    <>
                                      <div className="flex flex-col gap-6">
                                        {status.comments
                                          .sort(dateSort)
                                          .map((c) => (
                                            <Comment
                                              comment={
                                                c as StatusPostWithComment
                                              }
                                              key={c.id}
                                            />
                                          ))}
                                      </div>
                                      <div className="w-full flex justify-center mt-4">
                                        <Button
                                          variant="subtle"
                                          onClick={() => setReveal(false)}
                                        >
                                          Hide comments
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Comment
                                        comment={
                                          status.comments
                                            .sort(dateSort)
                                            .slice(
                                              0,
                                              1
                                            )[0] as StatusPostWithComment
                                        }
                                      />
                                      {status.comments.length > 1 && (
                                        <div className="w-full flex justify-center mt-4">
                                          <Button
                                            variant="subtle"
                                            onClick={() => setReveal(true)}
                                          >
                                            See {status.comments.length - 1}{" "}
                                            more{" "}
                                            {Fw.Strings.pluralize(
                                              status.comments.length - 1,
                                              "comment"
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </Stateful>
                      </ShadedCard>
                      <Stateful>
                        {(comment, setComment) => (
                          <TextInput
                            mt="md"
                            classNames={BLACK}
                            placeholder="Write your thoughts..."
                            max={128}
                            min={1}
                            icon={<HiOutlineChatAlt2 />}
                            rightSection={
                              <ActionIcon
                                variant="filled"
                                color="blue"
                                type="submit"
                                disabled={
                                  !comment ||
                                  comment.length === 0 ||
                                  comment.length > 128
                                }
                                onClick={() => {
                                  sanitizeInappropriateContent(
                                    comment,
                                    async () => {
                                      await fetchJson<
                                        IResponseBase<{
                                          comment: StatusPostWithComment;
                                        }>
                                      >(
                                        `/api/users/@me/status/${status.id}/comment`,
                                        {
                                          auth: true,
                                          method: "POST",
                                          body: {
                                            content: comment,
                                          },
                                        }
                                      ).then((res) => {
                                        if (res.success) {
                                          setComment("");
                                          setStatusPosts(
                                            statusPosts.map((s) => {
                                              if (s.id === status.id) {
                                                return {
                                                  ...s,
                                                  comments: [
                                                    ...s.comments,
                                                    res.data?.comment!,
                                                  ],
                                                };
                                              }
                                              return s;
                                            })
                                          );
                                        }
                                      });
                                    },
                                    () => {}
                                  );
                                }}
                              >
                                <HiPaperAirplane />
                              </ActionIcon>
                            }
                            onChange={(event) => {
                              setComment(event.currentTarget.value);
                            }}
                            value={comment}
                          />
                        )}
                      </Stateful>
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
