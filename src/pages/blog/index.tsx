import {
  Avatar,
  Button,
  Card,
  Modal,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { AdminPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Framework from "../../components/Framework";
import RichText from "../../components/RichText";
import authorizedRoute from "../../util/authorizedRoute";
import getMediaUrl from "../../util/getMedia";
import prisma from "../../util/prisma";
import { BlogPost, blogPostSelect, User } from "../../util/prisma-types";

interface BlogProps {
  user: User;
  posts: BlogPost[];
  featured: BlogPost[];
}

const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <Card
      withBorder
      p={16}
      shadow="sm"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      })}
    >
      <Link href={`/blog/p/${post.slug}`} passHref>
        <Text weight={500} component="a">
          {post.title}
        </Text>
      </Link>
      <Text color="dimmed" size="sm" mb={16} mt={6}>
        {post.subtitle}
      </Text>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar
            size={24}
            radius="xl"
            src={getMediaUrl(post.author.avatarUri)}
          />
          <Text size="sm" inline>
            {post.author.username}
          </Text>
        </div>
        <Text size="sm" inline color="dimmed">
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
      </div>
    </Card>
  );
};

const Blog: NextPage<BlogProps> = ({ user, posts, featured }) => {
  const [createBlogPostModal, setCreateBlogPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [postFeatured, setPostFeatured] = useState(false);
  const router = useRouter();

  const createArticle = async () => {
    await fetch("/api/blog/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        title,
        content,
        featured: postFeatured,
        subtitle,
      }),
    }).then((res) => res.json());

    setCreateBlogPostModal(false);
    setTitle("");
    setSubtitle("");
    setContent("");
    setPostFeatured(false);

    router.reload();
  };

  return (
    <>
      <Modal
        title="Create new blog post"
        opened={createBlogPostModal}
        onClose={() => setCreateBlogPostModal(false)}
      >
        <TextInput
          label="Title"
          description="Title of the blog post"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <Textarea
          label="Subtitle"
          description="Subtitle of the blog post"
          value={subtitle}
          onChange={(e) => setSubtitle(e.currentTarget.value)}
          mt={16}
        />
        <RichText mt={16} value={content} onChange={setContent} />
        <Switch
          mt={16}
          label="Featured"
          checked={postFeatured}
          onChange={(e) => setPostFeatured(e.currentTarget.checked)}
        />
        <Button mt={16} disabled={!title || !content} onClick={createArticle}>
          Create
        </Button>
      </Modal>
      <Framework
        user={user}
        modernTitle="Blog"
        modernSubtitle="Read our latest news and updates"
        activeTab="none"
        {...(user &&
          user.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST) && {
            actions: [["Create post", () => setCreateBlogPostModal(true)]],
          })}
      >
        <Title order={3} mb={12}>
          Featured posts
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {featured.map((post) => (
            <BlogPostCard post={post} key={post.id} />
          ))}
        </div>

        <Title order={3} mb={12}>
          All posts
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <BlogPostCard post={post} key={post.id} />
          ))}
        </div>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, false, false);

  const posts = await prisma.blogPost.findMany({
    where: {
      featured: false,
    },
    select: blogPostSelect,
  });
  const featured = await prisma.blogPost.findMany({
    where: {
      featured: true,
    },
    select: blogPostSelect,
  });

  return {
    props: {
      user: auth.props?.user ?? null,
      posts: JSON.parse(JSON.stringify(posts)),
      featured: JSON.parse(JSON.stringify(featured)),
    },
  };
}

export default Blog;
