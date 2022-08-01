import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface AvatarProps {
  user: User;
}

const Avatar: NextPage<AvatarProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="avatar">
      <Title mb={24}>Avatar</Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Avatar;
