import { Avatar, Text, TypographyStylesProvider } from "@mantine/core";
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
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col w-full md:w-1/6">
          <div 
          // stack on desktop, row on mobile
            className="flex flex-row md:flex-col justify-between gap-4 mb-6"
          >
            {[
              {
                icon: HiClock,
                label: "Created",
                value: (
                  <Text size="sm">{new Date(post.createdAt).toLocaleDateString()}</Text>
                ),
              },
              {
                icon: HiUsers,
                label: "Views",
                value: <Text size="sm">{post.views}</Text>,
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
                value: <Text size="sm">{post.featured ? "Yes" : "No"}</Text>,
              },
            ].map((stat, i) => (
              <div key={i}>
                <div>
                  <Text color="dimmed" weight={500}>
                    {stat.label}
                  </Text>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full md:w-5/6">
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </TypographyStylesProvider>
        </div>
      </div>
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
