import {
  Badge,
  Button,
  Group,
  Modal,
  MultiSelect,
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
import { Article } from "../../../util/prisma-types";
import RichText from "../../RichText";
import ShadedButton from "../../ShadedButton";
import Stateful from "../../Stateful";

const Articles: React.FC = () => {
  const user = useFrameworkUser()!;
  const [articles, setArticles] = useState<Article[]>();
  const [loading, setLoading] = useState(false);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

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

  const fetchTags = async () => {
    const tags = await fetch("/api/admin/articles/tags", {
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then((res) => res.json());
    setExistingTags(tags);
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
        tags,
      }),
    }).then((res) => res.json());

    setTitle("");
    setContent("");
    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
    fetchTags();
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
                <MultiSelect
                  label="Tags"
                  placeholder="Create tags for this article"
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create tag '${query}'`}
                  data={existingTags || []}
                  mt={16}
                  description="Tags are used for search and filtering"
                  onChange={(value) => {
                    setTags(value);
                    setExistingTags([...existingTags, ...value]);
                  }}
                />
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
              <ShadedButton className="flex flex-col gap-2">
                <div className="flex items-center">
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
                <div className="flex items-center gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
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
