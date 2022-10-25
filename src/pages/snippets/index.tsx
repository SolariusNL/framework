import {
  Avatar,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Text,
  Title,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { GetServerSidePropsContext, NextPage } from "next";
import { HiDownload, HiEye } from "react-icons/hi";
import Framework from "../../components/Framework";
import Stateful from "../../components/Stateful";
import UserContext from "../../components/UserContext";
import authorizedRoute from "../../util/authorizedRoute";
import prisma from "../../util/prisma";
import { NonUser, Snippet, snippetSelect, User } from "../../util/prisma-types";

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

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Snippets"
      modernSubtitle="Browse community-built snippets to help you build your next project."
    >
      <Grid columns={3}>
        {snippets.map((snippet) => (
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
                <Grid.Col span={1}>
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
                          src={snippet.user.avatarUri}
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
                </Grid.Col>
              </>
            )}
          </Stateful>
        ))}
      </Grid>
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
    take: 10,
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
