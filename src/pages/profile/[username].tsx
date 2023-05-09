import {
  Anchor,
  Avatar,
  Button,
  Image,
  Indicator,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import ReactCountryFlag from "react-country-flag";
import {
  HiArrowSmLeft,
  HiCake,
  HiCheck,
  HiChevronDoubleUp,
  HiClock,
  HiFlag,
  HiLockClosed,
  HiMap,
  HiUser,
  HiUserGroup,
  HiXCircle,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import AdminBadge from "../../components/Badges/Admin";
import AlphaBadge from "../../components/Badges/Alpha";
import EmailBadge from "../../components/Badges/Email";
import PremiumBadge from "../../components/Badges/Premium";
import TOTPBadge from "../../components/Badges/TOTP";
import Framework from "../../components/Framework";
import IconTooltip from "../../components/IconTooltip";
import ThumbnailCarousel from "../../components/ImageCarousel";
import PlaceholderGameResource from "../../components/PlaceholderGameResource";
import Donate from "../../components/Profile/Donate";
import Links from "../../components/Profile/Links";
import ReportUser from "../../components/ReportUser";
import ShadedCard from "../../components/ShadedCard";
import { useUserInformationDialog } from "../../contexts/UserInformationDialog";
import countries from "../../data/countries";
import getTimezones from "../../data/timezones";
import Rocket from "../../icons/Rocket";
import Soodam from "../../icons/Soodam";
import authorizedRoute from "../../util/auth";
import { exclude } from "../../util/exclude";
import getMediaUrl from "../../util/get-media";
import useMediaQuery from "../../util/media-query";
import prisma from "../../util/prisma";
import { User } from "../../util/prisma-types";

interface ProfileProps {
  user: User;
  profile: User;
  following: boolean;
}

const Profile: NextPage<ProfileProps> = ({ user, profile, following }) => {
  const mobile = useMediaQuery("768");
  const [reportOpened, setReportOpened] = React.useState(false);
  const router = useRouter();
  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const [viewing, setViewing] = React.useState(profile);
  const [viewingTime, setViewingTime] = React.useState<string>();
  const [isFollowing, setIsFollowing] = React.useState(following);

  const FollowButton = (
    <Button
      leftIcon={<HiUser />}
      onClick={async () => {
        setIsFollowing(!isFollowing);
        setViewing((viewing) => ({
          ...viewing,
          _count: {
            ...viewing._count,
            followers: viewing._count.followers + (isFollowing ? -1 : 1),
          },
        }));

        showNotification({
          title: "Followed",
          message: `Successfully ${isFollowing ? "unfollowed" : "followed"} ${
            viewing.username
          }.`,
          icon: <HiCheck />,
        });

        await fetch(`/api/users/${viewing.id}/follow`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: String(getCookie(".frameworksession")),
          },
        });
      }}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );

  const DonationButton = (
    <ReactNoSSR>
      <Donate user={viewing} />
    </ReactNoSSR>
  );

  const ReportButton = (
    <Button
      leftIcon={<HiFlag />}
      color="red"
      onClick={() => setReportOpened(true)}
    >
      Report
    </Button>
  );

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
        description={String(viewing.bio.substring(0, 160))}
        openGraph={{
          title: `${String(viewing.username)} on Framework`,
          description: String(viewing.bio.substring(0, 160)),
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
        {viewing.banned ? (
          <div className="flex items-center justify-center flex-col w-full py-8">
            <ShadedCard>
              <div className="flex gap-4 max-w-sm">
                <HiXCircle
                  size={24}
                  className="whitespace-nowrap flex-shrink-0 text-red-400"
                />
                <div>
                  <Text size="lg">
                    <span className="font-semibold">{viewing.username}</span>{" "}
                    has been banned.
                  </Text>
                  <Text size="sm" color="dimmed">
                    Sorry. We cannot show you this user&apos;s profile, as
                    they&apos;ve been banned.
                  </Text>
                </div>
              </div>
            </ShadedCard>
            <Link href="/" passHref>
              <Anchor className="mt-4 flex items-center gap-2">
                <span className="flex items-center">
                  <HiArrowSmLeft />
                </span>
                Go back home
              </Anchor>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-auto w-full">
              <div className="md:flex md:flex-row items-center md:items-start gap-8">
                <div className="md:items-start items-center flex flex-col md:mb-0 mb-8">
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
                        getMediaUrl(viewing.avatarUri) ||
                        `https://avatars.dicebear.com/api/identicon/${viewing.id}.png`
                      }
                      className="cursor-pointer"
                      radius={999}
                      size={100}
                    />
                  </Indicator>
                </div>
                <div className="flex flex-col justify-between h-full">
                  <div className="flex flex-col justify-between">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      {viewing.role === "ADMIN" && (
                        <IconTooltip
                          label="Soodam.re Staff"
                          className="mr-1 flex items-center justify-center"
                          icon={<Soodam />}
                          descriptiveModal
                          descriptiveModalProps={{
                            title: "Soodam.re Staff",
                            children: (
                              <div className="text-center items-center flex flex-col">
                                <Soodam height={64} width={64} />
                                <Title order={3} mt="lg">
                                  Soodam.re Employee
                                </Title>
                                <Text size="sm" color="dimmed" mt="md">
                                  This user is a Soodam.re employee and can
                                  assist you with any issues you may have. If
                                  you have any questions, feel free to contact
                                  them.
                                </Text>
                              </div>
                            ),
                          }}
                        />
                      )}
                      <Title order={2}>
                        {viewing.alias || viewing.username}
                      </Title>
                      {viewing.busy || viewing.premium ? (
                        <div className="hidden md:block">
                          <div className="w-px h-4 mx-1 dark:bg-zinc-700/50 bg-gray-200" />
                        </div>
                      ) : null}

                      {viewing.busy && (
                        <IconTooltip
                          label="Busy"
                          icon={<HiLockClosed />}
                          descriptiveModal
                          descriptiveModalProps={{
                            title: "Busy",
                            children: (
                              <div className="text-center items-center flex flex-col">
                                <HiLockClosed className="w-16 h-16 text-dimmed" />
                                <Title order={3} mt="lg">
                                  Busy
                                </Title>
                                <Text size="sm" color="dimmed" mt="md">
                                  This user is currently busy and may not be
                                  able to respond to your inquiries.
                                </Text>
                              </div>
                            ),
                          }}
                        />
                      )}
                      {viewing.premium && (
                        <IconTooltip
                          label="Premium"
                          icon={
                            <Rocket className="text-pink-500 animate-pulse" />
                          }
                          descriptiveModal
                          descriptiveModalProps={{
                            title: "Premium",
                            children: (
                              <div className="text-center items-center flex flex-col">
                                <Rocket
                                  height={64}
                                  width={64}
                                  className="text-pink-500"
                                />
                                <Title order={3} mt="lg">
                                  Premium
                                </Title>
                                <Text size="sm" color="dimmed" mt="md">
                                  This user is subscribed to Framework Premium
                                  and has access to exclusive features.
                                </Text>
                              </div>
                            ),
                          }}
                        />
                      )}
                    </div>
                    <Text
                      size="sm"
                      color="dimmed"
                      className="md:text-left text-center"
                    >
                      @{viewing.username}
                    </Text>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:justify-start justify-center">
                    <Text
                      color="dimmed"
                      size="sm"
                      onClick={() => {
                        setOpen(true);
                        setUser(viewing);
                        setDefaultTab("followers");
                      }}
                      className="cursor-pointer dark:hover:text-gray-300 transition-colors hover:text-gray-700"
                    >
                      <span className="font-semibold">
                        {viewing._count.followers}
                      </span>{" "}
                      Followers
                    </Text>
                    <Text
                      color="dimmed"
                      size="sm"
                      onClick={() => {
                        setOpen(true);
                        setUser(viewing);
                        setDefaultTab("following");
                      }}
                      className="cursor-pointer dark:hover:text-gray-300 transition-colors hover:text-gray-700"
                    >
                      <span className="font-semibold">
                        {viewing._count.following}
                      </span>{" "}
                      Following
                    </Text>
                  </div>
                  {viewing.id !== user.id && (
                    <>
                      <div className="mt-4">
                        <div className="hidden md:flex items-center gap-2">
                          <Button.Group>
                            {FollowButton}
                            {DonationButton}
                          </Button.Group>
                          {ReportButton}
                        </div>
                        <div className="md:hidden block w-full">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 md:justify-start justify-center">
                              {FollowButton}
                              {DonationButton}
                              {ReportButton}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Text size="sm" weight={500} mb="sm" color="dimmed" mt="xl">
                Biography
              </Text>
              <Text mb="xl">
                {viewing.bio
                  ? viewing.bio.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))
                  : "This user hasn't written a biography yet."}
              </Text>
              <ShadedCard>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2 gap-y-6">
                  {[
                    {
                      icon: <HiCake />,
                      title: "Joined",
                      value: new Date(viewing.createdAt).toLocaleDateString(),
                    },
                    {
                      icon: <HiMap />,
                      title: "Country",
                      value: viewing.country ? (
                        <div className="flex items-center gap-2">
                          <ReactCountryFlag
                            style={{ borderRadius: "6px" }}
                            countryCode={viewing.country}
                            svg
                          />
                          <span>
                            {
                              countries.find((c) => c.code == viewing.country)
                                ?.name
                            }
                          </span>
                        </div>
                      ) : (
                        <span>
                          <Text size="sm" color="dimmed">
                            Unknown
                          </Text>
                        </span>
                      ),
                    },
                    {
                      icon: <HiClock />,
                      title: "Timezone",
                      value: viewing.timeZone ? (
                        getTimezones().find(
                          (tz) => tz.value == viewing.timeZone
                        )?.value
                      ) : (
                        <span>
                          <Text size="sm" color="dimmed">
                            Unknown
                          </Text>
                        </span>
                      ),
                    },
                    {
                      icon: <HiUserGroup />,
                      title: "Visits",
                      value: viewing.games
                        .map((g) => g.visits)
                        .reduce((a, b) => a + b, 0),
                    },
                  ].map((item) => (
                    <div
                      className="flex flex-col gap-2 items-center"
                      key={item.title}
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-gray-400 flex items-center">
                          {item.icon}
                        </div>
                        <Text size="sm" color="dimmed">
                          {item.title}
                        </Text>
                      </div>
                      <Text size="sm" weight={500} align="center">
                        {item.value}
                      </Text>
                    </div>
                  ))}
                </div>
              </ShadedCard>
              <ReactNoSSR>
                <div className="flex items-center justify-center mt-6 mb-2">
                  <div
                    className="flex flex-col gap-3"
                    style={{
                      maxWidth: "24rem",
                    }}
                  >
                    {[
                      {
                        icon: <HiClock />,
                        title: "Last seen",
                        value: new Date(viewing.lastSeen).toLocaleString(),
                      },
                      {
                        icon: <HiChevronDoubleUp />,
                        title: "Reputation",
                        value: 0,
                      },
                      {
                        icon: <Rocket />,
                        title: "Trading availability",
                        value: "Unavailable",
                      },
                    ].map((item) => (
                      <div
                        className="grid grid-cols-2 gap-2 items-center"
                        key={item.title}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-dimmed flex items-center justify-end">
                            {item.icon}
                          </div>
                          <Text size="sm" color="dimmed">
                            {item.title}
                          </Text>
                        </div>
                        <Text size="sm" weight={500}>
                          {item.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </ReactNoSSR>
            </div>
            <div className="flex-auto md:w-3/4 w-full flex flex-col gap-6">
              {viewing.games.length > 0 && (
                <ThumbnailCarousel
                  slides={viewing.games.map((game) => (
                    <Link href={`/game/${game.id}`} key={game.id} passHref>
                      <div className="relative cursor-pointer rounded-md">
                        {game.gallery.length > 0 ? (
                          <Image
                            height={200}
                            src={getMediaUrl(game.gallery[0])}
                            key={game.gallery[0]}
                            alt={game.name}
                            radius="md"
                          />
                        ) : (
                          <PlaceholderGameResource height={200} />
                        )}
                        <div className="absolute bottom-0 left-0 w-full h-full rounded-md bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex flex-col justify-end p-4">
                          <Title order={4} className="text-white">
                            {game.name}
                          </Title>
                          <Text size="sm" className="text-white" lineClamp={1}>
                            {game.description.replace(/(<([^>]+)>)/gi, "")}
                          </Text>
                        </div>
                      </div>
                    </Link>
                  ))}
                />
              )}
              {user.profileLinks && <Links user={viewing} />}
              <div className="grid grid-cols-2 gap-2">
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
                  [
                    <EmailBadge user={viewing} key="email" />,
                    viewing.emailVerified,
                  ],
                  [<TOTPBadge user={viewing} key="totp" />, viewing.otpEnabled],
                ].map(([badge, condition]) => condition && <div>{badge}</div>)}
              </div>
            </div>
          </div>
        )}
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
          likedBy: { select: { id: true } },
          dislikedBy: { select: { id: true } },
        },
        where: {
          private: false,
        },
      },
      avatarUri: true,
      premium: true,
      role: true,
      createdAt: true,
      username: true,
      id: true,
      bio: true,
      busy: true,
      country: true,
      timeZone: true,
      banned: true,
      lastSeen: true,
      alias: true,
      previousUsernames: true,
      profileLinks: true,
      emailVerified: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      otpEnabled: true,
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

  const following = await prisma.user.findFirst({
    where: {
      id: auth.props.user?.id,
      following: {
        some: {
          id: viewing.id,
        },
      },
    },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(auth.props?.user)),
      profile: JSON.parse(
        JSON.stringify(exclude(viewing, "email", "inviteCode", "tickets"))
      ),
      following: !!following,
    },
  };
}

export default Profile;
