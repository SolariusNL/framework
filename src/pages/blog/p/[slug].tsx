import Background from "@/components/background";
import Framework from "@/components/framework";
import Owner from "@/components/owner";
import RenderMarkdown from "@/components/render-markdown";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import prisma from "@/util/prisma";
import { BlogPost, User, blogPostSelect } from "@/util/prisma-types";
import { GetServerSidePropsContext, NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { HiChevronLeft } from "react-icons/hi";

interface BlogPostProps {
  post: BlogPost;
  user: User;
}

const BlogPost: NextPage<BlogPostProps> = ({ post, user }) => {
  return (
    <>
      <NextSeo
        title={post.title}
        description={post.subtitle}
        openGraph={{
          title: post.title,
          description: post.subtitle,
          url: "https://framework.solarius.me/blog/p/" + post.slug,
          images: [
            {
              secureUrl:
                "https://" +
                process.env.NEXT_PUBLIC_HOSTNAME +
                "/opengraph.png",
              url:
                "https://" +
                process.env.NEXT_PUBLIC_HOSTNAME +
                "/opengraph.png",
              alt: "Framework SEO Banner",
              width: 800,
              height: 400,
            },
          ],
        }}
      />
      <Framework user={user} activeTab="none" noContentPadding relative>
        <div className="relative">
          <Background className="-z-10" />
          <main className="relative">
            <div className="overflow-hidden">
              <div className="max-w-8xl mx-auto">
                <div className="flex px-4 pt-8 pb-10 lg:px-8">
                  <Link href="/blog">
                    <a className="group transition-all no-underline flex font-semibold text-sm leading-6 items-center text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                      <HiChevronLeft className="overflow-visible transition-all mr-2 text-slate-400 w-auto h-4 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
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
                              "absolute top-0 inset-x-0 text-dimmed ml-0"
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
                          <Owner user={post.author} className="px-5 mt-6" />
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
    </>
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
