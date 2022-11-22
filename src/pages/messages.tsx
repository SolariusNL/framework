import { Tabs, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { HiFolder, HiMail, HiPaperAirplane, HiTrash } from "react-icons/hi";
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
      <Tabs variant="pills" defaultValue="inbox" orientation="vertical">
        <Tabs.List mr={32}>
          <Tabs.Tab icon={<HiMail />} value="inbox">
            Inbox
          </Tabs.Tab>
          <Tabs.Tab icon={<HiPaperAirplane />} value="sent">
            Sent
          </Tabs.Tab>
          <Tabs.Tab icon={<HiFolder />} value="archive">
            Archive
          </Tabs.Tab>
          <Tabs.Tab icon={<HiTrash />} value="trash">
            Trash
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inbox">
          <Title order={3}>Inbox</Title>

          <ModernEmptyState title="No messages" body="You have no messages." />
        </Tabs.Panel>

        <Tabs.Panel value="sent">
          <Title order={3}>Sent</Title>

          <ModernEmptyState title="No messages" body="You have no messages." />
        </Tabs.Panel>

        <Tabs.Panel value="archive">
          <Title order={3}>Archive</Title>

          <ModernEmptyState title="No messages" body="You have no messages." />
        </Tabs.Panel>

        <Tabs.Panel value="trash">
          <Title order={3}>Trash</Title>

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
