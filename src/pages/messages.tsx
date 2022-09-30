import { Tabs, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { HiMail, HiPaperAirplane } from "react-icons/hi";
import EmptyState from "../components/EmptyState";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface MessagesProps {
  user: User;
}

const Messages: NextPage<MessagesProps> = ({ user }) => {
  return (
    <Framework
      user={user}
      activeTab="messages"
      modernTitle="Messages"
      modernSubtitle="Send and receive messages with your friends"
    >
      <Tabs variant="pills" defaultValue="inbox">
        <Tabs.List>
          <Tabs.Tab icon={<HiMail />} value="inbox">
            Inbox
          </Tabs.Tab>
          <Tabs.Tab icon={<HiPaperAirplane />} value="sent">
            Sent
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inbox" pt="md">
          <Title order={3}>Inbox</Title>

          <ModernEmptyState title="No messages" body="You have no messages." />
        </Tabs.Panel>

        <Tabs.Panel value="sent" pt="md">
          <Title order={3}>Sent</Title>

          <ModernEmptyState title="No messages" body="You have no messages." />
        </Tabs.Panel>
      </Tabs>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Messages;
