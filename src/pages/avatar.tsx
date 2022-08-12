import { Grid, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import dynamic from "next/dynamic";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import AvatarViewer from "../components/Avatar";
import useMediaQuery from "../util/useMediaQuery";

interface AvatarProps {
  user: User;
}

const Avatar: NextPage<AvatarProps> = ({ user }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework user={user} activeTab="avatar">
      <Title mb={24}>Avatar</Title>
      <Grid columns={6}>
        <Grid.Col span={mobile ? 6 : 2}>
          <AvatarViewer user={user} />
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Avatar;
