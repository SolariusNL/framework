import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  CopyButton,
  Divider,
  Grid,
  Group,
  Image,
  Indicator,
  Menu,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
  Tooltip
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import ReactCountryFlag from "react-country-flag";
import {
  HiArrowRight,
  HiCheck,
  HiClipboardCopy,
  HiClock,
  HiFlag,
  HiGift,
  HiOutlineShoppingBag,
  HiReceiptTax,
  HiShieldCheck, HiUser,
  HiUsers
} from "react-icons/hi";
import AdminBadge from "../../components/Badges/Admin";
import AlphaBadge from "../../components/Badges/Alpha";
import PremiumBadge from "../../components/Badges/Premium";
import EmptyState from "../../components/EmptyState";
import Framework from "../../components/Framework";
import ThumbnailCarousel from "../../components/ImageCarousel";
import PlaceholderGameResource from "../../components/PlaceholderGameResource";
import ReportUser from "../../components/ReportUser";
import { useUserInformationDialog } from "../../contexts/UserInformationDialog";
import authorizedRoute from "../../util/authorizedRoute";
import { getCookie } from "../../util/cookies";
import { exclude } from "../../util/exclude";
import prisma from "../../util/prisma";
import { nonCurrentUserSelect, User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";

interface ProfileProps {
  user: User;
  viewing: User;
}

const Profile: NextPage<ProfileProps> = ({ user, viewing }) => {
  const mobile = useMediaQuery("768");
  const [reportOpened, setReportOpened] = React.useState(false);
  const router = useRouter();
  const { open, setOpen, setUser, setDefaultTab } = useUserInformationDialog();

  const handleDonate = async (amt: number) => {
    await fetch(`/api/users/${viewing.id}/donate/${amt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() =>
      router
        .replace({
          pathname: `/profile/${viewing.username}`,
          query: {
            status: "success",
          },
        })
        .then(() => router.reload())
    );
  };

  return (
    <>
      <ReportUser
        user={viewing}
        opened={reportOpened}
        setOpened={setReportOpened}
      />
      <Framework user={user} activeTab="none">
        <Center
          sx={{
            width: "100vw / 2",
          }}
        >
          <Stack align="center">
            <Group align="center">
              <Indicator
                color="green"
                size={10}
                position="bottom-end"
                disabled={
                  Date.now() - new Date(viewing.lastSeen).getTime() >
                  5 * 60 * 1000
                }
              >
                <Avatar
                  src={
                    viewing.avatarUri ||
                    `https://avatars.dicebear.com/api/identicon/${viewing.id}.png`
                  }
                  alt={viewing.username}
                  radius={999}
                  size={100}
                />
              </Indicator>
            </Group>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Group>
                {viewing.country && (
                  <ReactCountryFlag
                    style={{ borderRadius: "6px" }}
                    countryCode={viewing.country}
                    svg
                  />
                )}
                <Text weight={500} size="xl" align="center">
                  {viewing.username}
                </Text>
                {viewing.busy && <Badge>Busy</Badge>}
              </Group>

              <Group spacing={4} ml={6}>
                {viewing.premium && <HiGift title="Premium" />}
                {viewing.role == "ADMIN" && (
                  <HiShieldCheck title="Official Framework Staff" />
                )}
              </Group>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Group spacing={3}>
                <Text color="dimmed">
                  User ID: <strong>{viewing.id}</strong>
                </Text>
                <CopyButton value={String(viewing.id)} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip
                      label={copied ? "Copied" : "Copy"}
                      withArrow
                      position="right"
                    >
                      <ActionIcon
                        color={copied ? "teal" : "gray"}
                        onClick={copy}
                      >
                        {copied ? (
                          <HiCheck size={16} />
                        ) : (
                          <HiClipboardCopy size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>

              <Text color="dimmed" pl={8} pr={8}>
                ·
              </Text>

              <Text color="dimmed">@{viewing.username}</Text>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Group spacing={3}>
                <HiClock color="#868e96" style={{ marginRight: 5 }} />
                <Text color="dimmed">{viewing.timeZone}</Text>
              </Group>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Group spacing={3}>
                <HiUsers color="#868e96" style={{ marginRight: 5 }} />
                <Anchor
                  onClick={() => {
                    setUser(viewing);
                    setDefaultTab("followers");
                    setOpen(true);
                  }}
                >
                  {viewing.followers.length} followers
                </Anchor>
                <Text color="dimmed" pl={8} pr={8}>
                  ·
                </Text>
                <Anchor
                  onClick={() => {
                    setUser(viewing);
                    setDefaultTab("following");
                    setOpen(true);
                  }}
                >
                  {viewing.following.length} following
                </Anchor>
              </Group>
            </div>

            {viewing.id != user.id && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Button.Group>
                  <Button
                    leftIcon={<HiUser />}
                    onClick={() => {
                      fetch(`/api/users/${viewing.id}/follow`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: String(getCookie(".frameworksession")),
                        },
                      }).then(() => router.reload());
                    }}
                  >
                    {viewing.followers.some(
                      (follower) => follower.id == user.id
                    )
                      ? "Unfollow"
                      : "Follow"}
                  </Button>
                  <Menu shadow="md" width={240}>
                    <Menu.Target>
                      <Button leftIcon={<HiReceiptTax />}>Donate</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {[100, 200, 500, 1000, 2500, 5000, 10000].map(
                        (amount) => (
                          <Menu.Item
                            key={amount}
                            icon={<HiOutlineShoppingBag />}
                            disabled={amount > user.tickets}
                            onClick={() => handleDonate(amount)}
                          >
                            Donate {amount} tickets
                          </Menu.Item>
                        )
                      )}
                      <Menu.Divider />
                      <Menu.Label>
                        If you did not mean to donate, contact us and we will
                        refund your donation.
                      </Menu.Label>
                    </Menu.Dropdown>
                  </Menu>
                  <Button
                    leftIcon={<HiFlag />}
                    color="red"
                    onClick={() => setReportOpened(true)}
                  >
                    Report
                  </Button>
                </Button.Group>
              </div>
            )}
          </Stack>
        </Center>

        <Divider mt={25} mb={25} />

        <Grid columns={24}>
          <Grid.Col span={mobile ? 24 : 14}>
            <Text weight={550} mb={10} color="dimmed">
              About {viewing.username}
            </Text>

            <Text>{viewing.bio}</Text>

            <Divider mt={16} mb={16} />

            <Text weight={550} mb={10} color="dimmed">
              Badges
            </Text>

            <Grid>
              {[
                <AlphaBadge user={viewing} key="alpha" />,
                viewing.premium && (
                  <PremiumBadge user={viewing} key="premium" />
                ),
                viewing.role == "ADMIN" && (
                  <AdminBadge user={viewing} key="admin" />
                ),
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
            {viewing.games.length == 0 && (
              <EmptyState
                title="No games"
                body={`${viewing.username} has no games.`}
              />
            )}
            <ThumbnailCarousel
              p={8}
              slides={viewing.games.map((g, i) => (
                <Paper
                  withBorder
                  p={12}
                  radius="md"
                  key={i}
                  shadow="md"
                  sx={{
                    marginRight: i != viewing.games.length - 1 ? 8 : 0,
                  }}
                >
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

                  <Button
                    fullWidth
                    leftIcon={<HiArrowRight />}
                    onClick={() => router.push(`/game/${g.id}`)}
                  >
                    View
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
                {viewing.games.map((g) => g.visits).reduce((a, b) => a + b, 0)}
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
    </>
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
    select: {
      games: {
        include: {
          updates: true,
          author: nonCurrentUserSelect,
          likedBy: nonCurrentUserSelect,
          dislikedBy: nonCurrentUserSelect,
        },
      },
      avatar: true,
      avatarUri: true,
      premium: true,
      role: true,
      createdAt: true,
      username: true,
      id: true,
      bio: true,
      busy: true,
      country: true,
      followers: nonCurrentUserSelect,
      following: nonCurrentUserSelect,
      timeZone: true,
      lastSeen: true,
    },
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
