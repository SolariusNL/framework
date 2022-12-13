import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface MessagesProps {
  user: User;
}

const Messages: NextPage<MessagesProps> = ({ user }) => {
  return (
    <>
      <Framework
        user={user}
        activeTab="messages"
        modernTitle="Messages"
        modernSubtitle="Send and receive messages with your friends"
      >
        <ModernEmptyState
          title="Deprecated"
          body="Messages V1 is deprecated until we finish working on the new rewrite. We apologize for the inconvenience."
        />
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Messages;
