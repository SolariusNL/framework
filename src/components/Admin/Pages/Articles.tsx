import {
  Avatar,
  Button,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { AdminPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { useFrameworkUser } from "../../../contexts/FrameworkUser";
import getMediaUrl from "../../../util/getMedia";
import { Article } from "../../../util/prisma-types";
import RichText from "../../RichText";
import ShadedButton from "../../ShadedButton";
import Stateful from "../../Stateful";

const Articles: React.FC = () => {
  const user = useFrameworkUser()!;
  const [articles, setArticles] = useState<Article[]>();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchArticles = async () => {
    setLoading(true);
    const articles = await fetch("/api/admin/articles/get", {
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then((res) => res.json());
    setArticles(articles);
    setLoading(false);
  };

  const createArticle = async () => {
    await fetch("/api/admin/articles/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        title,
        content,
      }),
    }).then((res) => res.json());

    setTitle("");
    setContent("");
    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      {user.adminPermissions.includes(AdminPermission.WRITE_ARTICLE) && (
        <Stateful>
          {(opened, setOpened) => (
            <>
              <Button
                mb={32}
                leftIcon={<HiPlusCircle />}
                onClick={() => setOpened(true)}
              >
                Create article
              </Button>

              <Modal
                title="Create new article"
                opened={opened}
                onClose={() => setOpened(false)}
              >
                <TextInput
                  label="Title"
                  description="Title of the article"
                  value={title}
                  onChange={(e) => setTitle(e.currentTarget.value)}
                />

                <RichText mt={16} value={content} onChange={setContent} />

                <Button
                  mt={16}
                  onClick={() => {
                    createArticle();
                    setOpened(false);
                  }}
                  disabled={!title || !content}
                >
                  Create
                </Button>
              </Modal>
            </>
          )}
        </Stateful>
      )}

      {loading && (
        <Stack spacing={8}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={64} />
          ))}
        </Stack>
      )}

      {!loading && articles && (
        <Stack spacing={8}>
          {articles.map((article) => (
            <Link href={`/admin/articles/${article.id}`} key={article.id}>
              <ShadedButton style={{ width: "100%" }}>
                <div className="flex items-center gap-6">
                  <Avatar
                    radius="xl"
                    src={getMediaUrl(article.author.avatarUri)}
                    size={24}
                  />
                  <Stack spacing={3}>
                    <Group>
                      <Text weight={500}>{article.title}</Text>
                      <Text color="dimmed" size="sm">
                        by {article.author.username} -{" "}
                        {new Date(article.createdAt).toLocaleDateString()}
                      </Text>
                    </Group>
                    <Text size="sm" color="dimmed" lineClamp={2}>
                      {article.content
                        .replace(/<[^>]*>?/gm, "")
                        .replace(/(\r\n|\n|\r)/gm, " ")}
                    </Text>
                  </Stack>
                </div>
              </ShadedButton>
            </Link>
          ))}
        </Stack>
      )}
    </>
  );
};

export default Articles;
