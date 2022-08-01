import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface FriendsProps {
  user: User;
}

const Friends: NextPage<FriendsProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="friends">
      <Title mb={24}>Friends</Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Friends;
