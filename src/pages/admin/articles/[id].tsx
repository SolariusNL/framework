import {
  Avatar,
  Badge,
  Button,
  Divider,
  Modal,
  MultiSelect,
  Text,
  TextInput,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";
import { AdminPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import Framework from "../../../components/Framework";
import RichText from "../../../components/RichText";
import authorizedRoute from "../../../util/authorizedRoute";
import getMediaUrl from "../../../util/getMedia";
import prisma from "../../../util/prisma";
import { Article, articleSelect, User } from "../../../util/prisma-types";

interface ArticleViewProps {
  user: User;
  article: Article;
}

const ArticleView: NextPage<ArticleViewProps> = ({ user, article }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [tags, setTags] = useState(article.tags);

  const [existingTags, setExistingTags] = useState<string[]>([]);

  const fetchTags = async () => {
    await fetch("/api/admin/articles/tags", {
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then((res) => res.json().then((tags) => setExistingTags(tags)));
  };

  const updateArticle = async () => {
    await fetch("/api/admin/articles/update/" + article.id, {
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
    }).then(() => setEditing(false));
  };

  return (
    <Framework
      user={user}
      modernTitle={article.title}
      modernSubtitle={`This is an article written by ${article.author.username}`}
      activeTab="none"
      returnTo={{
        label: "Go back to articles",
        href: "/admin/articles",
      }}
      {...(user.adminPermissions.includes(AdminPermission.WRITE_ARTICLE) && {
        actions: [["Edit article", () => setEditing(true)]],
      })}
    >
      <Modal
        title="Edit article"
        opened={editing}
        onClose={() => setEditing(false)}
      >
        <TextInput
          label="Title"
          description="The title of the article"
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
            updateArticle();
            setEditing(false);
          }}
          disabled={!title || !content}
        >
          Update
        </Button>
      </Modal>
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </TypographyStylesProvider>
      <Divider mt={32} mb={32} />
      <div className="flex justify-between">
        <div className="flex gap-0.5">
          {article.viewers.map((viewer) => (
            <Tooltip key={viewer.id} label={viewer.username}>
              <Avatar
                size={24}
                src={getMediaUrl(viewer.avatarUri)}
                radius="xl"
                key={viewer.id}
              />
            </Tooltip>
          ))}
        </div>
        <div className="flex gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false, true);
  const { id } = context.query;

  if (auth.redirect) {
    return auth;
  }

  const article = await prisma.adminArticle.findFirst({
    where: {
      id: String(id),
    },
    select: articleSelect,
  });

  if (!article) {
    return {
      redirect: {
        destination: "/admin/articles",
        permanent: false,
      },
    };
  }

  await prisma.adminArticle.update({
    where: {
      id: String(id),
    },
    data: {
      viewers: {
        connect: {
          id: auth.props.user?.id,
        },
      },
    },
  });

  return {
    props: {
      user: auth.props.user,
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

export default ArticleView;
