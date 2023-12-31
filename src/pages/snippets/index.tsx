import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import Stateful from "@/components/stateful";
import UserContext from "@/components/user-context";
import authorizedRoute from "@/util/auth";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { NonUser, Snippet, User, snippetSelect } from "@/util/prisma-types";
import {
  Avatar,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { HiDownload, HiEye, HiPlus, HiSearch } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroller";

interface SnippetsProps {
  user: User;
  snippets: Snippet[];
}

const Snippets: NextPage<SnippetsProps> = ({ user, snippets }) => {
  const createFile = (name: string, content: string, author: NonUser) => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `
/**
 * You must reference the author of this snippet in your code,
 * as they are the original creator and maintain the rights to it.
 * 
 * Author: ${user.username}
 * Downloaded from Framework on ${new Date().toLocaleDateString()}
 */\n\n${content}`,
      ],
      { type: "text/plain" }
    );

    element.href = URL.createObjectURL(file);
    element.download = name + ".ts";
    document.body.appendChild(element);
    element.click();
  };

  const [snippetsState, setSnippetsState] = useState(snippets);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const searchSnippets = async (query: string) => {
    setLoading(true);

    await fetch(`/api/snippets/search?q=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (res.snippets.length > 0) {
            setSnippetsState(res.snippets);
          } else {
            setSnippetsState([]);
          }
        } else {
          setSnippetsState(snippets);
        }
      })
      .catch((err) => {
        console.error(err);
        setSnippetsState(snippets);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Snippets"
      modernSubtitle="Browse community-built snippets to help you build your next project."
    >
      <Group mb="xl">
        <Link href={"/invent/snippets"} passHref>
          <Button leftIcon={<HiPlus />}>Create Snippet</Button>
        </Link>
        <Group>
          <TextInput
            icon={<HiSearch />}
            placeholder="Search snippets..."
            onChange={(e) => searchSnippets(e.currentTarget.value)}
          />
          {loading && <Loader size="sm" />}
        </Group>
      </Group>

      <InfiniteScroll
        pageStart={1}
        loadMore={() => {
          fetch(`/api/snippets?page=${page}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                if (res.snippets.length > 0) {
                  setSnippetsState([...snippetsState, ...res.snippets]);
                  setPage(page + 1);
                } else {
                  setCanLoadMore(false);
                }
              }
            })
            .catch((err) => {
              console.error(err);
              setCanLoadMore(false);
            });
        }}
        hasMore={canLoadMore}
        loader={<Loader size="sm" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snippetsState.length === 0 && (
            <div className="col-span-3">
              <ModernEmptyState
                title="No snippets found"
                body="Try searching for something else."
                shaded
              />
            </div>
          )}
          {snippetsState.map((snippet) => (
            <Stateful key={snippet.id}>
              {(viewOpen, setViewOpen) => (
                <>
                  <Modal
                    opened={viewOpen}
                    onClose={() => setViewOpen(false)}
                    title="Viewing snippet"
                    size="lg"
                  >
                    <Prism language="typescript" withLineNumbers>
                      {snippet.code}
                    </Prism>
                  </Modal>
                  <div className="col-span-1">
                    <Card
                      withBorder
                      shadow="md"
                      sx={{
                        height: "auto",
                      }}
                    >
                      <Card.Section mb="lg">
                        <Prism language="typescript" noCopy withLineNumbers>
                          {snippet.code.split("\n").slice(0, 4).join("\n")}
                        </Prism>
                      </Card.Section>

                      <Group mb="lg">
                        <UserContext user={snippet.user}>
                          <Avatar
                            src={getMediaUrl(snippet.user.avatarUri)}
                            radius="xl"
                            size="sm"
                          />
                        </UserContext>
                        <Text weight={500} color="dimmed">
                          {snippet.user.username}
                        </Text>
                      </Group>

                      <Title order={4} mb="sm">
                        {snippet.name}
                      </Title>
                      <Text lineClamp={3} mb="lg">
                        {snippet.description || "No description provided."}
                      </Text>

                      <Button.Group>
                        <Button
                          fullWidth
                          onClick={() => setViewOpen(true)}
                          leftIcon={<HiEye />}
                        >
                          View snippet
                        </Button>
                        <Button
                          fullWidth
                          variant="default"
                          leftIcon={<HiDownload />}
                          onClick={() =>
                            createFile(snippet.name, snippet.code, snippet.user)
                          }
                        >
                          Download
                        </Button>
                      </Button.Group>
                    </Card>
                  </div>
                </>
              )}
            </Stateful>
          ))}
        </div>
      </InfiniteScroll>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const snippets = await prisma.codeSnippet.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
    select: snippetSelect,
  });

  return {
    props: {
      user: auth.props.user,
      snippets: JSON.parse(JSON.stringify(snippets)),
    },
  };
}

export default Snippets;
