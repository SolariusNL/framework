import { Grid, Title } from "@mantine/core";
import isElectron from "is-electron";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import UserCard from "../components/UserCard";
import authorizedRoute from "../util/authorizedRoute";
import prisma from "../util/prisma";
import { nonCurrentUserSelect, NonUser, User } from "../util/prisma-types";

interface HomeProps {
  user: User;
  onlineFriends: NonUser[];
}

const Home: NextPage<HomeProps> = ({ user, onlineFriends }) => {
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
    <Framework
      user={user}
      activeTab="home"
      modernTitle={`${timeMessage}, ${user.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      <Title order={3} mb={6}>
        Online friends
      </Title>
      <Grid>
        {onlineFriends.map((friend) => (
          <Grid.Col xs={3} md={3} sm={2} lg={3} key={user.id}>
            <UserCard user={friend} minimal />
          </Grid.Col>
        ))}

        {onlineFriends.length === 0 && (
          <ModernEmptyState title="No friends online" body="Maybe later?" />
        )}
      </Grid>
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

  const onlineFriends = await prisma.user.findMany({
    where: {
      following: {
        some: {
          id: auth!.props!.user!.id,
        },
      },
      followers: {
        some: {
          id: auth!.props!.user!.id,
        },
      },

      lastSeen: {
        gte: new Date(new Date().getTime() - 5 * 60 * 1000),
      },
    },
    ...nonCurrentUserSelect,
  });

  return {
    props: {
      user: auth.props.user,
      onlineFriends: JSON.parse(JSON.stringify(onlineFriends)),
    },
  };
}

export default Home;
