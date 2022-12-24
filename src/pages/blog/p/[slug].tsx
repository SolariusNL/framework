import { Avatar, Divider, Text, TypographyStylesProvider } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { HiClock, HiPencil, HiStar, HiUsers } from "react-icons/hi";
import Framework from "../../../components/Framework";
import authorizedRoute from "../../../util/authorizedRoute";
import getMediaUrl from "../../../util/getMedia";
import prisma from "../../../util/prisma";
import { BlogPost, blogPostSelect, User } from "../../../util/prisma-types";

interface BlogPostProps {
  post: BlogPost;
  user: User;
}

const BlogPost: NextPage<BlogPostProps> = ({ post, user }) => {
  return (
    <Framework
      user={user}
      modernTitle={post.title}
      modernSubtitle={post.subtitle}
      activeTab="none"
      returnTo={{
        label: "Return to blog",
        href: "/blog",
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-2 gap-y-8">
        {[
          {
            icon: HiClock,
            label: "Created",
            value: <Text>{new Date(post.createdAt).toLocaleDateString()}</Text>,
          },
          {
            icon: HiUsers,
            label: "Views",
            value: <Text>{post.views}</Text>,
          },
          {
            icon: HiPencil,
            label: "Author",
            value: (
              <div className="flex items-center gap-2">
                <Avatar
                  src={getMediaUrl(post.author.avatarUri)}
                  size={24}
                  radius="xl"
                />
                <Text inline size="sm">
                  {post.author.username}
                </Text>
              </div>
            ),
          },
          {
            icon: HiStar,
            label: "Featured",
            value: <Text>{post.featured ? "Yes" : "No"}</Text>,
          },
        ].map((stat, i) => (
          <div key={i} className="text-center w-full">
            <stat.icon size={24} />
            <div className="flex items-center gap-2 text-center justify-center mt-1">
              <Text inline color="dimmed" weight={500}>
                {stat.label}
              </Text>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
      <Divider mt={32} mb={32} />
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </TypographyStylesProvider>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const post = await prisma.blogPost.findUnique({
    where: {
      slug: String(context.params?.slug),
    },
    select: blogPostSelect,
  });

  if (!post) return { redirect: { destination: "/blog", permanent: false } };

  await prisma.blogPost.update({
    where: {
      // @ts-ignore
      id: String(post.id),
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return {
    props: {
      user: auth.props.user,
      post: JSON.parse(JSON.stringify(post)),
    },
  };
}

export default BlogPost;
