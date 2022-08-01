import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface SettingsProps {
  user: User;
}

const Settings: NextPage<SettingsProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="settings">
      <Title mb={24}>Settings</Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Settings;
