import {
  Button,
  Modal,
  Switch,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useHotkeys } from "@mantine/hooks";
import { AdminPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiChevronRight, HiMail } from "react-icons/hi";
import Background from "../../components/Background";
import Descriptive from "../../components/Descriptive";
import Framework from "../../components/Framework";
import Markdown, { ToolbarItem } from "../../components/Markdown";
import RenderMarkdown from "../../components/RenderMarkdown";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import { exclude } from "../../util/exclude";
import prisma from "../../util/prisma";
import { BlogPost, User, blogPostSelect } from "../../util/prisma-types";

interface BlogProps {
  user: User;
  posts: BlogPost[];
  featured: BlogPost[];
}

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

const Blog: NextPage<BlogProps> = ({ user, posts, featured }) => {
  const [createBlogPostModal, setCreateBlogPostModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState<string>();
  const [postFeatured, setPostFeatured] = useState(false);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const newsletter = useForm<{ email: string }>({
    initialValues: { email: "" },
    validate: {
      email: (value) => {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return "Invalid email address";
        }
      },
    },
  });
  const { user: userStore, setProperty } = useAuthorizedUserStore();
  const [loading, setLoading] = useState(false);

  useHotkeys([
    [
      "mod+Enter",
      () => {
        if (user.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST)) {
          setCreateBlogPostModal(true);
        }
      },
    ],
  ]);

  const createArticle = async () => {
    await fetch("/api/blog/create", {
      method: "POST",
      headers,
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
        <div className={colorScheme}>
          <TextInput
            label="Title"
            description="Title of the blog post"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            mb={16}
          />
          <Descriptive title="Subtitle" description="Subtitle of the blog post">
            <Markdown
              value={subtitle}
              onChange={setSubtitle}
              className="mb-4"
              toolbar={[ToolbarItem.Bold, ToolbarItem.Url]}
            />
          </Descriptive>
          <Markdown value={content} onChange={setContent} />
          <Switch
            mt={16}
            label="Featured"
            checked={postFeatured}
            onChange={(e) => setPostFeatured(e.currentTarget.checked)}
          />
          <Button mt={16} disabled={!title || !content} onClick={createArticle}>
            Create
          </Button>
        </div>
      </Modal>
      <Framework
        user={user}
        activeTab="none"
        relative
        {...(user &&
          user.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST) && {
            actions: [["Create post", () => setCreateBlogPostModal(true)]],
          })}
        noContentPadding
      >
        <div className="relative">
          <Background className="-z-10" />
          <main className="max-w-[52rem] mx-auto px-4 pb-28 sm:px-6 md:px-8 xl:px-12 lg:max-w-6xl relative">
            <header className="py-16 sm:text-center">
              <h1 className="mb-4 text-3xl sm:text-4xl tracking-tight text-slate-900 font-extrabold dark:text-slate-200">
                Blog
              </h1>
              <Text size="lg" color="dimmed" mb="xl">
                The latest news and updates from the Solarius team.
              </Text>
              <section className="mt-3 max-w-sm sm:mx-auto sm:px-4">
                {userStore?.newsletterSubscribed ? (
                  <p className="text-sm text-slate-700 dark:text-slate-400 flex flex-col gap-1">
                    You are subscribed to the newsletter!{" "}
                    <a
                      className="text-sky-500 highlight-sky-400 hover:text-sky-600 cursor-pointer dark:text-sky-400 no-underline font-semibold"
                      onClick={async () => {
                        setLoading(true);
                        await fetch("/api/blog/newsletter/subscribe", {
                          method: "POST",
                          headers,
                        })
                          .then(() =>
                            setProperty("newsletterSubscribed", false)
                          )
                          .finally(() => setLoading(false));
                      }}
                    >
                      Unsubscribe
                    </a>
                  </p>
                ) : (
                  <form
                    className="flex flex-wrap -mx-2"
                    onSubmit={newsletter.onSubmit(async (v) => {
                      setLoading(true);
                      await fetch("/api/blog/newsletter/subscribe", {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                          email: v.email,
                        }),
                      })
                        .then(() => setProperty("newsletterSubscribed", true))
                        .finally(() => setLoading(false));
                    })}
                  >
                    <div className="px-2 grow flex-auto">
                      <TextInput
                        placeholder="Subscribe via email"
                        icon={<HiMail />}
                        {...newsletter.getInputProps("email")}
                      />
                    </div>
                    <div className="px-2 grow flex">
                      <UnstyledButton
                        type="submit"
                        className="bg-sky-500 flex-auto h-fit shadow text-white text-sm border-y border-transparent py-2 font-semibold px-2 hover:bg-sky-600 dark:hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 dark:focus:ring-offset-slate-900 dark:focus:ring-sky-700 highlight-white/25 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                        style={{ borderRadius: "8px" }}
                        disabled={loading}
                      >
                        Subscribe
                      </UnstyledButton>
                    </div>
                  </form>
                )}
              </section>
            </header>
            <div className="relative sm:pb-12 sm:ml-[calc(2rem+1px)] md:ml-[calc(3.5rem+1px)] lg:ml-[max(calc(14.5rem+1px),calc(100%-48rem))]">
              <div className="hidden absolute top-3 bottom-0 right-full mr-7 md:mr-[3.25rem] w-px bg-slate-200 dark:bg-zinc-800 sm:block" />
              <div className="space-y-16">
                {posts
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((p) => (
                    <article key={p.slug} className="relative group">
                      <div className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl group-hover:bg-slate-50/70 dark:group-hover:bg-zinc-800/30 transition-all" />
                      <svg
                        viewBox="0 0 9 9"
                        className="hidden border border-solid border-1 absolute right-full mr-6 top-2 text-zinc-200 dark:text-zinc-600 md:mr-12 w-[calc(0.5rem+1px)] h-[calc(0.5rem+1px)] overflow-visible sm:block rounded-full"
                      >
                        <circle
                          cx="4.5"
                          cy="4.5"
                          r="4.5"
                          stroke="currentColor"
                          className="fill-white dark:fill-zinc-900"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="relative">
                        <Title
                          order={4}
                          className="pt-8 lg:pt-0 tracking-tight"
                        >
                          {p.title}
                        </Title>
                        <div className="mt-2 mb-4">
                          <RenderMarkdown clamp={2}>
                            {p.subtitle}
                          </RenderMarkdown>
                        </div>
                        <dl className="absolute left-0 top-0 lg:left-auto lg:right-full lg:mr-[calc(6.5rem+1px)] mt-0 ml-0 mb-0">
                          <dt className="sr-only">Date</dt>
                          <dd
                            className={clsx(
                              "whitespace-nowrap text-sm leading-6 text-dimmed ml-0"
                            )}
                          >
                            <time
                              dateTime={new Date(p.createdAt).toISOString()}
                            >
                              {new Date(p.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </time>
                          </dd>
                        </dl>
                      </div>
                      <Link href={`/blog/p/${p.slug}`}>
                        <a className="flex no-underline items-center text-sm text-sky-500 font-medium">
                          <span className="absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl" />
                          <span className="relative">
                            Read more
                            <span className="sr-only">, {p.title}</span>
                          </span>
                          <HiChevronRight className="relative mt-px overflow-visible ml-1 text-sky-300 dark:text-sky-700" />
                        </a>
                      </Link>
                    </article>
                  ))}
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

  const posts = await prisma.blogPost.findMany({
    select: exclude(blogPostSelect, "content"),
  });

  return {
    props: {
      user: auth.props?.user ?? null,
      posts: JSON.parse(JSON.stringify(posts)),
    },
  };
}

export default Blog;
