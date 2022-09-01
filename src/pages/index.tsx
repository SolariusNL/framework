import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user }) => {
  const [timeMessage, setTimeMessage] = useState("");

  useEffect(() => {
    setTimeMessage(
      new Date().getHours() < 12
        ? "Good morning"
        : new Date().getHours() < 18
        ? "Good afternoon"
        : new Date().getHours() < 22
        ? "Good evening"
        : "Good night"
    );
  }, []);

  return (
    <Framework user={user} activeTab="home">
      <Title mb={12}>
        {timeMessage}, {user.username}!
      </Title>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);
  if (auth.redirect) {
    return {
      redirect: {
        destination: "/landing",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
    },
  };
}

export default Home;
