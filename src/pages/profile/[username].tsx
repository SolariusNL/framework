import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  CopyButton,
  Grid,
  Group,
  Indicator,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import ReactCountryFlag from "react-country-flag";
import {
  HiArrowRight,
  HiCheck,
  HiClipboardCopy,
  HiClock,
  HiDesktopComputer,
  HiFlag,
  HiGift,
  HiGlobe,
  HiOfficeBuilding,
  HiShieldCheck,
  HiUser,
  HiUsers
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import AdminBadge from "../../components/Badges/Admin";
import AlphaBadge from "../../components/Badges/Alpha";
import PremiumBadge from "../../components/Badges/Premium";
import Framework from "../../components/Framework";
import ThumbnailCarousel from "../../components/ImageCarousel";
import ModernEmptyState from "../../components/ModernEmptyState";
import PlaceholderGameResource from "../../components/PlaceholderGameResource";
import Donate from "../../components/Profile/Donate";
import ReportUser from "../../components/ReportUser";
import ShadedCard from "../../components/ShadedCard";
import { useUserInformationDialog } from "../../contexts/UserInformationDialog";
import countries from "../../data/countries";
import getTimezones from "../../data/timezones";
import authorizedRoute from "../../util/authorizedRoute";
import { getCookie } from "../../util/cookies";
import { exclude } from "../../util/exclude";
import prisma from "../../util/prisma";
import { nonCurrentUserSelect, User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";

interface ProfileProps {
  user: User;
  profile: User;
}

const Profile: NextPage<ProfileProps> = ({ user, profile }) => {
  const mobile = useMediaQuery("768");
  const [reportOpened, setReportOpened] = React.useState(false);
  const router = useRouter();
  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const [viewing, setViewing] = React.useState(profile);
  const [viewingTime, setViewingTime] = React.useState<string>();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const utc = getTimezones().find(
        (tz) => tz.value == viewing.timeZone
      )?.utc;

      setViewingTime(
        new Date().toLocaleTimeString([], {
          timeZone: utc?.[0],
        })
      );
    }
  }, [viewing]);

  return (
    <>
      <ReportUser
        user={viewing}
        opened={reportOpened}
        setOpened={setReportOpened}
      />
      <NextSeo
        title={String(viewing.username)}
        description={String(viewing.bio)}
        openGraph={{
          title: `${String(viewing.username)} on Framework`,
          description: String(viewing.bio),
          ...(viewing.avatarUri && {
            images: [
              {
                url: String(viewing.avatarUri),
                alt: `${String(viewing.username)}'s avatar`,
              },
            ],
          }),
        }}
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
                alignItems: "center",
              }}
            >
              {viewing.country && (
                <ReactCountryFlag
                  style={{ borderRadius: "6px", marginRight: 12 }}
                  countryCode={viewing.country}
                  svg
                />
              )}
              <Text weight={500} size="xl" align="center">
                {viewing.username}
              </Text>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "12px",
              }}
            >
              {viewing.busy && <Badge>Busy</Badge>}
              {viewing.premium && <HiGift title="Premium" />}
              {viewing.role == "ADMIN" && (
                <HiShieldCheck title="Official Framework Staff" />
              )}
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
                <Text color="dimmed" weight={500} mr={5}>
                  {viewing.timeZone}
                </Text>
                <Text color="dimmed">{viewingTime || "Fetching..."}</Text>
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
                  <ReactNoSSR>
                    <Donate user={viewing} />
                  </ReactNoSSR>
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

        <Paper
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme == "dark"
                ? theme.colors.dark[9]
                : theme.colors.gray[1],
          })}
          p={16}
          mt={50}
        >
          <Grid columns={24}>
            <Grid.Col span={mobile ? 24 : 14}>
              <Text weight={550} mb={10} color="dimmed">
                About {viewing.username}
              </Text>
              <Text mb={16}>{viewing.bio}</Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ShadedCard withBorder shadow="md" className="h-fit">
                  <Stack spacing={6}>
                    {[
                      [HiClock, viewing.timeZone, "Timezone"],
                      [
                        HiGlobe,
                        countries.find((c) => c.code == viewing.country)?.name,
                        "Country",
                      ],
                      [
                        HiOfficeBuilding,
                        viewing.busy ? "Busy" : "Available" || "Available",
                        "Status",
                      ],
                      [
                        HiDesktopComputer,
                        new Date(viewing.lastSeen).toLocaleString(),
                        "Last seen",
                      ],
                    ]
                      .filter(([, value]) => value)
                      .map(([Icon, value, label]: any) => (
                        <Group spacing={3} key={label}>
                          <Tooltip label={label} key={value}>
                            <ThemeIcon color="transparent">
                              <Icon
                                color="#868e96"
                                style={{ marginRight: 5 }}
                              />
                            </ThemeIcon>
                          </Tooltip>
                          <Text color="dimmed" mr={5}>
                            {String(value)}
                          </Text>
                        </Group>
                      ))}
                  </Stack>
                </ShadedCard>
                <ShadedCard withBorder shadow="md" className="h-fit">
                  <Stack spacing={12}>
                    {[
                      {
                        icon: HiClock,
                        label: "Member since",
                        value: new Date(viewing.createdAt).toLocaleDateString(),
                      },
                      {
                        icon: HiUsers,
                        label: "Place visits",
                        value: viewing.games
                          .map((g) => g.visits)
                          .reduce((a, b) => a + b, 0),
                      },
                      {
                        icon: HiClock,
                        label: "Hours played",
                        value: 0,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <Group key={String(value)} spacing={3}>
                        <Icon color="#868e96" style={{ marginRight: 12 }} />
                        <div className="items-start">
                          <Text color="dimmed" weight={600}>
                            {label}
                          </Text>
                          <Text color="dimmed">{String(value)}</Text>
                        </div>
                      </Group>
                    ))}
                  </Stack>
                </ShadedCard>
              </div>
              <Text weight={550} mb={10} color="dimmed" mt={50}>
                Badges
              </Text>

              <ReactNoSSR>
                <div
                  style={{
                    display: "grid",
                    gridColumnGap: "12px",
                    gridTemplateColumns: `repeat(${mobile ? 1 : 2}, 1fr)`,
                    gridRowGap: "12px",
                  }}
                >
                  {[
                    [<AlphaBadge user={viewing} key="alpha" />, true],
                    [
                      <PremiumBadge user={viewing} key="premium" />,
                      viewing.premium,
                    ],
                    [
                      <AdminBadge user={viewing} key="admin" />,
                      viewing.role == "ADMIN",
                    ],
                  ].map(
                    ([badge, condition]) => condition && <div>{badge}</div>
                  )}
                </div>
              </ReactNoSSR>
            </Grid.Col>

            <Grid.Col span={mobile ? 24 : 10}>
              {viewing.games.length == 0 && (
                <ModernEmptyState
                  title="No games"
                  body={`${viewing.username} has no games.`}
                />
              )}
              <ReactNoSSR>
                <ThumbnailCarousel
                  p={8}
                  slides={viewing.games.map((g, i) => (
                    <Paper
                      withBorder
                      p="md"
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
                              <Image
                                height={180}
                                src={gal}
                                key={j}
                                alt={g.name}
                              />
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
              </ReactNoSSR>
            </Grid.Col>
          </Grid>
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
      profile: JSON.parse(
        JSON.stringify(exclude(viewing, "email", "inviteCode", "tickets"))
      ),
    },
  };
}

export default Profile;
