import {
  Avatar,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { HiPlay, HiShieldCheck, HiSparkles } from "react-icons/hi";
import AdminBadge from "../../components/Badges/Admin";
import AlphaBadge from "../../components/Badges/Alpha";
import PremiumBadge from "../../components/Badges/Premium";
import Framework from "../../components/Framework";
import ThumbnailCarousel from "../../components/ImageCarousel";
import PlaceholderGameResource from "../../components/PlaceholderGameResource";
import authorizedRoute from "../../util/authorizedRoute";
import { exclude } from "../../util/exclude";
import prisma from "../../util/prisma";
import {
  nonCurrentUserSelect,
  User,
  userSelect,
} from "../../util/prisma-types";
import { sendFriendRequest } from "../../util/universe/friends";
import useMediaQuery from "../../util/useMediaQuery";

interface ProfileProps {
  user: User;
  viewing: User;
}

const Profile: NextPage<ProfileProps> = ({ user, viewing }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework user={user} activeTab="none">
      <Group position="apart">
        <Group spacing={36}>
          <Avatar
            src={
              viewing.avatarUri ||
              `https://avatars.dicebear.com/api/identicon/${viewing.id}.png`
            }
            alt={viewing.username}
            radius={999}
            size={80}
          />

          <Stack spacing={6}>
            <Group spacing={6}>
              <Text weight={500} size="xl" sx={{ lineHeight: 1 }} mr={4}>
                {viewing.username}
              </Text>

              {viewing.premium && <HiSparkles />}

              {viewing.role == "ADMIN" && <HiShieldCheck />}
            </Group>

            <Text size="sm" color="dimmed">
              @{viewing.username}
            </Text>
          </Stack>
        </Group>

        {!(viewing.id == user.id) && (
          <Group sx={{ justifyContent: "flex-end" }}>
            <Button variant="outline" color="red">
              Report
            </Button>
            <Button variant="outline">Message</Button>
            <Button variant="outline">Send friend request</Button>
          </Group>
        )}
      </Group>

      <Divider mt={25} mb={25} />

      <Group position="center" spacing={26} mb={26}>
        <Stack align="center" spacing={4}>
          <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
            0
          </Text>
          <Text size="sm" color="dimmed">
            Following
          </Text>
        </Stack>

        <Stack align="center" spacing={4}>
          <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
            0
          </Text>
          <Text size="sm" color="dimmed">
            Followers
          </Text>
        </Stack>

        <Stack align="center" spacing={4}>
          <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
            {viewing.friends.length + viewing.friendsRelation.length}
          </Text>
          <Text size="sm" color="dimmed">
            Friends
          </Text>
        </Stack>
      </Group>

      <Grid columns={24}>
        <Grid.Col span={mobile ? 24 : 14}>
          <Text weight={550} mb={10} color="dimmed">
            About {viewing.username}
          </Text>

          <Text>
            This is a placeholder for the about section. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit. Donec euismod, nisi eu
            consectetur consectetur, nisl nisl consectetur nisl, euismod nisi
            nisl euismod nisl. Donec euismod, nisi eu consectetur consectetur,
            nisl nisl consectetur nisl, euismod nisi nisl euismod nisl. Donec
            euismod, nisi eu consectetur consectetur, nisl nisl consectetur
            nisl, euismod nisi nisl euismod nisl.
          </Text>

          <Divider mt={16} mb={16} />

          <Text weight={550} mb={10} color="dimmed">
            Badges
          </Text>

          <Grid>
            {[
              <AlphaBadge user={user} key="alpha" />,
              viewing.premium && <PremiumBadge user={user} key="premium" />,
              viewing.role == "ADMIN" && <AdminBadge user={user} key="admin" />,
            ].map((b) => (
              <Grid.Col
                span={mobile ? 12 : 6}
                key={Math.floor(Math.random() * 100)}
              >
                {b}
              </Grid.Col>
            ))}
          </Grid>
        </Grid.Col>

        <Grid.Col span={mobile ? 24 : 10}>
          <ThumbnailCarousel
            p={8}
            slides={viewing.games.map((g, i) => (
              <Paper withBorder p={12} radius="md" key={i}>
                <Container p={0} mb={16}>
                  {g.gallery.length > 0 && (
                    <ThumbnailCarousel
                      slides={g.gallery.map((gal, j) => (
                        <Image height={180} src={gal} key={j} alt={g.name} />
                      ))}
                    />
                  )}

                  {g.gallery.length == 0 && (
                    <PlaceholderGameResource height={180} radius={6} />
                  )}
                </Container>

                <Title order={3}>{g.name}</Title>
                <Text size="sm" color="dimmed" mb={16}>
                  @{g.author.username}
                </Text>

                <Progress
                  sections={[
                    {
                      value:
                        (g.likedBy.length / g.likedBy.length +
                          g.dislikedBy.length) *
                        100,
                      color: "green",
                    },
                    {
                      value:
                        (g.likedBy.length / g.likedBy.length +
                          g.dislikedBy.length) *
                        100,
                      color: "red",
                    },
                  ]}
                  mb="md"
                />

                <Button fullWidth color="green" leftIcon={<HiPlay />}>
                  Play
                </Button>
              </Paper>
            ))}
          />
        </Grid.Col>
      </Grid>

      <Divider mt={25} mb={25} />

      <Paper
        withBorder
        shadow="md"
        p={16}
        radius="md"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        mb={32}
      >
        <Group spacing={mobile ? 24 : 32}>
          <Stack align="center" spacing={4}>
            <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
              {new Date(viewing.createdAt).toLocaleDateString()}
            </Text>
            <Text size="sm" color="dimmed">
              Member since
            </Text>
          </Stack>

          <Stack align="center" spacing={4}>
            <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
              0
            </Text>
            <Text size="sm" color="dimmed">
              Place visits
            </Text>
          </Stack>

          <Stack align="center" spacing={4}>
            <Text weight={500} size="lg" sx={{ lineHeight: 1 }}>
              0
            </Text>
            <Text size="sm" color="dimmed">
              Hours played
            </Text>
          </Stack>
        </Group>
      </Paper>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);
  if (auth.redirect) {
    return auth;
  }

  const { username } = ctx.query;
  const viewing = await prisma.user.findFirst({
    where: {
      username: username as string,
    },
    select: userSelect,
  });

  if (!viewing) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify(auth.props?.user)),
      viewing: JSON.parse(
        JSON.stringify(exclude(viewing, "email", "inviteCode", "tickets"))
      ),
    },
  };
}

export default Profile;
