import Descriptive from "@/components/descriptive";
import RichText from "@/components/rich-text";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import getMediaUrl from "@/util/get-media";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import { getRelativeTime } from "@/util/relative-time";
import {
  Avatar,
  Button,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { AdminPermission, Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";

export const postSelect: Prisma.PortalBoardPostSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  author: nonCurrentUserSelect,
  _count: {
    select: {
      upvotes: true,
      downvotes: true,
    },
  },
};

const postType = Prisma.validator<Prisma.PortalBoardPostArgs>()({
  select: {
    id: true,
    title: true,
    content: true,
    createdAt: true,
    author: nonCurrentUserSelect,
    _count: {
      select: {
        upvotes: true,
        downvotes: true,
      },
    },
  },
});

export type Post = Prisma.PortalBoardPostGetPayload<typeof postType>;

const Board: React.FC = () => {
  const { user } = useAuthorizedUserStore();
  const createForm = useForm<{
    title: string;
    content: string;
  }>({
    initialValues: {
      title: "",
      content: "",
    },
    validate: {
      title: (value) => {
        if (!value) {
          return "Title is required";
        }
      },
      content: (value) => {
        if (!value) {
          return "Content is required";
        }
      },
    },
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch("/api/employee/board", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    setPosts(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <Modal
        title="Write board post"
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={createForm.onSubmit((values) => {
            fetch("/api/employee/board/post", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: String(getCookie(".frameworksession")),
              },
              body: JSON.stringify(values),
            }).finally(() => {
              showNotification({
                title: "Post created",
                message: "Your post has been created successfully",
                icon: <HiCheckCircle />,
              });
              setCreateOpen(false);
              fetchPosts();
            });
          })}
        >
          <Stack spacing="md">
            <TextInput
              label="Title"
              description="Title of the post"
              {...createForm.getInputProps("title")}
            />
            <Descriptive title="Content" description="Content of the post">
              <RichText
                controls={[
                  ["bold", "italic", "underline"],
                  ["orderedList", "unorderedList"],
                  ["link"],
                ]}
                {...createForm.getInputProps("content")}
              />
            </Descriptive>
          </Stack>
          <Button type="submit" mt="xl">
            Create
          </Button>
        </form>
      </Modal>
      {user?.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST) && (
        <Button variant="subtle" mb="lg" onClick={() => setCreateOpen(true)}>
          Write announcement
        </Button>
      )}
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton height={300} key={i} mb="lg" />
        ))
      ) : (
        <Stack spacing="lg">
          {posts &&
            posts.map((post) => (
              <Paper
                key={post.id}
                shadow="xs"
                p="md"
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[9]
                      : theme.white,
                })}
              >
                <div className="flex justify-between items-start gap-8 mb-6">
                  <div>
                    <Title order={4} mb="sm">
                      {post.title}
                    </Title>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(post.author.avatarUri)}
                        size={24}
                        radius={999}
                      />
                      <Text size="sm">{post.author.username}</Text>
                    </div>
                  </div>
                </div>

                <TypographyStylesProvider>
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </TypographyStylesProvider>

                <div className="flex justify-between items-center">
                  <Text size="sm" color="dimmed">
                    {getRelativeTime(new Date(post.createdAt))}
                  </Text>
                </div>
              </Paper>
            ))}
        </Stack>
      )}
    </>
  );
};

export default Board;
