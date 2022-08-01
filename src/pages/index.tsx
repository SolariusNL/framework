import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="home">
      <Title mb={12}>
        Good {new Date().getHours() > 12 ? "afternoon" : "morning"},{" "}
        {user.username}
      </Title>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx);
}

export default Home;
