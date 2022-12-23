import { Loader, Tabs, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { HiFolder, HiMail, HiPaperAirplane } from "react-icons/hi";
import Framework from "../components/Framework";
import Inbox from "../components/Messages/Inbox";
import NewMessage from "../components/Messages/NewMessage";
import ModernEmptyState from "../components/ModernEmptyState";
import TabNav from "../components/TabNav";
import authorizedRoute from "../util/authorizedRoute";
import { Message, User } from "../util/prisma-types";
import ReactNoSSR from "react-no-ssr";

interface MessagesProps {
  user: User;
}

const Messages: NextPage<MessagesProps> = ({ user }) => {
  const [newMessageOpened, setNewMessageOpened] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>();
  const [loading, setLoading] = React.useState(true);

  const getMessages = async () => {
    await fetch("/api/messages/my", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        function newest(a: Message, b: Message) {
          const aA = new Date(a.createdAt);
          const bB = new Date(b.createdAt);
          return bB.getTime() - aA.getTime();
        }
        setMessages(res.sort(newest));
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    getMessages();
  }, []);

  return (
    <>
      <NewMessage opened={newMessageOpened} setOpened={setNewMessageOpened} />
      <Framework
        user={user}
        activeTab="messages"
        modernTitle="Messages"
        modernSubtitle="Send and receive messages with your friends"
        beta
        actions={[["New message", () => setNewMessageOpened(true)]]}
      >
        <TabNav defaultValue="inbox">
          <TabNav.List mb={24}>
            <TabNav.Tab icon={<HiMail />} value="inbox">
              Inbox
            </TabNav.Tab>
            <TabNav.Tab icon={<HiPaperAirplane />} value="sent">
              Sent
            </TabNav.Tab>
          </TabNav.List>

          <ReactNoSSR>
            <Tabs.Panel value="inbox">
              <Title order={3} mb={24}>
                Inbox
              </Title>

              {messages?.filter((m) => m.recipientId === user.id).length! >
              0 ? (
                <Inbox
                  messages={messages?.filter((m) => m.recipientId === user.id)!}
                  setMessages={
                    setMessages as React.Dispatch<
                      React.SetStateAction<Message[]>
                    >
                  }
                />
              ) : loading ? (
                <Loader />
              ) : (
                <ModernEmptyState
                  title="No messages"
                  body="You have no messages."
                />
              )}
            </Tabs.Panel>

            <Tabs.Panel value="sent">
              <Title order={3} mb={24}>
                Sent
              </Title>

              {messages?.filter((m) => m.senderId === user.id).length! > 0 ? (
                <Inbox
                  messages={messages?.filter((m) => m.senderId === user.id)!}
                  setMessages={
                    setMessages as React.Dispatch<
                      React.SetStateAction<Message[]>
                    >
                  }
                />
              ) : loading ? (
                <Loader />
              ) : (
                <ModernEmptyState
                  title="No messages"
                  body="You haven't sent any messages."
                />
              )}
            </Tabs.Panel>
          </ReactNoSSR>
        </TabNav>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Messages;
