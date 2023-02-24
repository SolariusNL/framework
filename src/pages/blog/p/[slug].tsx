import { Avatar } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";
import Background from "../../../components/Background";
import Framework from "../../../components/Framework";
import RenderMarkdown from "../../../components/RenderMarkdown";
import authorizedRoute from "../../../util/auth";
import clsx from "../../../util/clsx";
import prisma from "../../../util/prisma";
import { BlogPost, blogPostSelect, User } from "../../../util/prisma-types";

interface BlogPostProps {
  post: BlogPost;
  user: User;
}

const BlogPost: NextPage<BlogPostProps> = ({ post, user }) => {
  return (
    <Framework user={user} activeTab="none" noContentPadding relative>
      <div className="relative">
        <Background />
        <main className="relative">
          <div className="overflow-hidden">
            <div className="max-w-8xl mx-auto">
              <div className="flex px-4 pt-8 pb-10 lg:px-8">
                <Link href="/blog">
                  <a className="group no-underline flex font-semibold text-sm leading-6 items-center text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                    <HiChevronLeft className="overflow-visible mr-2  text-slate-400 w-auto h-4  group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    Go back
                  </a>
                </Link>
              </div>
            </div>
            <div className="px-4 sm:px-6 md:px-8">
              <div className="max-w-3xl mx-auto">
                <main>
                  <article className="relative pt-10">
                    <h1
                      className={clsx(
                        "text-2xl font-extrabold mt-0 tracking-tight text-slate-900 dark:text-slate-200 md:text-3xl"
                      )}
                    >
                      {post.title}
                    </h1>
                    <div className="text-sm leading-6">
                      <dl>
                        <dt className="sr-only">Date</dt>
                        <dd
                          className={clsx(
                            "absolute top-0 inset-x-0 text-slate-700 dark:text-zinc-400 ml-0"
                          )}
                        >
                          <time
                            dateTime={new Date(post.createdAt).toISOString()}
                          >
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </time>
                        </dd>
                      </dl>
                    </div>
                    <div className="mt-6">
                      <ul
                        className={clsx(
                          "flex flex-wrap text-sm leading-6 -mt-6 -mx-5 pl-0"
                        )}
                      >
                        <li
                          key={post.author.id}
                          className="flex items-center font-medium whitespace-nowrap px-5 mt-6"
                        >
                          <Avatar
                            src={post.author.avatarUri}
                            alt=""
                            className="mr-3 w-9 h-9 rounded-full"
                          />
                          <div className="text-sm leading-4">
                            <div className="text-slate-900 dark:text-slate-200">
                              {post.author.alias ?? post.author.username}
                            </div>
                            <div className="mt-1">
                              <Link
                                href={`/profile/${post.author.username}`}
                                passHref
                              >
                                <a className="text-sky-500 hover:text-sky-600 dark:text-sky-400 no-underline">
                                  @{post.author.username}
                                </a>
                              </Link>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className={clsx("mt-12")}>
                      <RenderMarkdown>{post.content}</RenderMarkdown>
                    </div>
                  </article>
                </main>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, false, false);

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
      user: auth.props?.user ?? null,
      post: JSON.parse(JSON.stringify(post)),
    },
  };
}

export default BlogPost;
