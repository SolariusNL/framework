import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import IconTooltip from "@/components/icon-tooltip";
import ThumbnailCarousel from "@/components/image-carousel";
import PlaceholderGameResource from "@/components/placeholder-game-resource";
import ProfileBadges from "@/components/profile/badges";
import Donate from "@/components/profile/donate";
import Links from "@/components/profile/links";
import ShadedCard from "@/components/shaded-card";
import Verified from "@/components/verified";
import { useUserInformationDialog } from "@/contexts/UserInformationDialog";
import countries from "@/data/countries";
import getTimezones from "@/data/timezones";
import Premium from "@/icons/Premium";
import Rocket from "@/icons/Rocket";
import Solarius from "@/icons/Solarius";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useChatStore from "@/stores/useChatStore";
import useReportAbuse from "@/stores/useReportAbuse";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import { exclude } from "@/util/exclude";
import fetchJson, { fetchAndSetData } from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { Game, User } from "@/util/prisma-types";
import {
  Anchor,
  Avatar,
  Button,
  Divider,
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
import React from "react";
import ReactCountryFlag from "react-country-flag";
import {
  HiArrowSmLeft,
  HiCake,
  HiChatAlt2,
  HiCheck,
  HiChevronDoubleUp,
  HiClock,
  HiFlag,
  HiLockClosed,
  HiMap,
  HiOutlineClock,
  HiOutlineViewGrid,
  HiSparkles,
  HiUser,
  HiUserGroup,
  HiXCircle,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import { GetUserInventoryAvailabilityResponse } from "../api/users/[[...params]]";

interface ProfileProps {
  user: User;
  profile: User;
  following: boolean;
}

const Profile: NextPage<ProfileProps> = ({
  user: initialUser,
  profile,
  following,
}) => {
  const { setOpened: setReportOpened } = useReportAbuse();
  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const [viewing, setViewing] = React.useState(profile);
  const [viewingTime, setViewingTime] = React.useState<string>();
  const [isFollowing, setIsFollowing] = React.useState(following);
  const [additionalDetails, setAdditionalDetails] = React.useState<
    Array<{
      icon: JSX.Element;
      title: string;
      value: string | number | JSX.Element;
    }>
  >([]);
  const { setOpened } = useChatStore();
  const { user } = useAuthorizedUserStore();

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
      onClick={() => setReportOpened(true, viewing)}
    >
      Report
    </Button>
  );

  const AiButton = (
    <Button
      leftIcon={<HiChatAlt2 />}
      variant="gradient"
      gradient={{
        from: "pink",
        to: "grape",
      }}
      onClick={async () => {
        await fetchJson<IResponseBase>("/api/chat/conversation", {
          method: "POST",
          auth: true,
          body: {
            name: "",
            participants: [viewing.id],
          },
        }).then((res) => {
          setOpened(true);
        });
      }}
    >
      Chat with Framework AI
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

  React.useEffect(() => {
    fetchAndSetData<GetUserInventoryAvailabilityResponse>(
      `/api/users/${viewing.id}/inventory-availability`,
      (data) => {
        if (data?.available) {
          setAdditionalDetails([
            {
              icon: <HiOutlineViewGrid />,
              title: "Inventory",
              value: (
                <Link href={`/inventory/${viewing.username}`} passHref>
                  <Anchor>See inventory</Anchor>
                </Link>
              ),
            },
          ]);
        }
      }
    );
  }, [viewing]);

  return (
    <>
      <NextSeo
        title={String(viewing.username)}
        description={Fw.Strings.limitLength(viewing.bio, 120)}
        openGraph={{
          title: `${String(viewing.username)} on Framework`,
          description: Fw.Strings.limitLength(viewing.bio, 120),
          type: "profile",
          defaultImageHeight: 128,
          defaultImageWidth: 128,
          profile: {
            username: String(viewing.username),
            firstName: viewing.alias || viewing.username,
            lastName: "",
          },
          images: [
            ...(viewing.avatarUri
              ? [
                  {
                    url: getMediaUrl(viewing.avatarUri),
                    alt: `${String(viewing.username)}'s avatar`,
                    width: 64,
                    height: 64,
                  },
                ]
              : [
                  {
                    secureUrl:
                      "https://" +
                      process.env.NEXT_PUBLIC_HOSTNAME +
                      "/opengraph.png",
                    url:
                      "https://" +
                      process.env.NEXT_PUBLIC_HOSTNAME +
                      "/opengraph.png",
                    alt: "Framework SEO Banner",
                    width: 800,
                    height: 400,
                  },
                ]),
          ],
        }}
      />
      <Framework user={initialUser} activeTab="none">
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
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${viewing.id}`
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
                      {viewing.verified && <Verified />}
                      {viewing.role === "ADMIN" && (
                        <IconTooltip
                          label="Solarius Staff"
                          className="flex items-center justify-center"
                          icon={<Solarius width={20} height={20} />}
                          descriptiveModal
                          descriptiveModalProps={{
                            title: "Solarius Staff",
                            children: (
                              <div className="text-center items-center flex flex-col">
                                <Solarius height={64} width={64} />
                                <Title order={3} mt="lg">
                                  Solarius Employee
                                </Title>
                                <Text size="sm" color="dimmed" mt="md">
                                  This user is a Solarius employee and can
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
                            <Premium
                              className="fill-zinc-900 dark:fill-white"
                              width={20}
                              height={20}
                            />
                          }
                          descriptiveModal
                          descriptiveModalProps={{
                            title: "Premium",
                            children: (
                              <div className="text-center items-center flex flex-col">
                                <Premium
                                  className="fill-zinc-900 dark:fill-white"
                                  height={64}
                                  width={64}
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
                  {user && user.id === viewing.id && (
                    <span className="flex items-center text-sm gap-2 text-dimmed mt-4 md:justify-start justify-center">
                      <HiSparkles />
                      <span>It&apos;s you!</span>
                    </span>
                  )}
                  {user && viewing.id !== user.id && (
                    <>
                      <div className="mt-4">
                        <div className="hidden md:flex items-center gap-2">
                          {viewing.ai ? (
                            AiButton
                          ) : (
                            <>
                              <Button.Group>
                                {FollowButton}
                                {DonationButton}
                              </Button.Group>
                              {ReportButton}
                            </>
                          )}
                        </div>
                        <div className="md:hidden block w-full">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 md:justify-start justify-center">
                              {viewing.ai ? (
                                AiButton
                              ) : (
                                <>
                                  {FollowButton}
                                  {DonationButton}
                                  {ReportButton}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6 mb-3">
                <Text size="sm" weight={500} color="dimmed">
                  Biography
                </Text>
                <Divider className="flex-grow" />
              </div>
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
                <DataGrid
                  mdCols={2}
                  smCols={2}
                  defaultCols={2}
                  className="!mt-0"
                  items={[
                    {
                      icon: <HiCake />,
                      tooltip: "Joined",
                      value: new Date(viewing.createdAt).toLocaleDateString(),
                    },
                    {
                      icon: <HiMap />,
                      tooltip: "Country",
                      value: (
                        <>
                          {viewing.country ? (
                            <div className="flex items-center gap-2">
                              <ReactCountryFlag
                                style={{ borderRadius: "6px" }}
                                countryCode={viewing.country}
                                svg
                              />
                              <span>
                                {
                                  countries.find(
                                    (c) => c.code == viewing.country
                                  )?.name
                                }
                              </span>
                            </div>
                          ) : (
                            <span>
                              <Text size="sm" color="dimmed">
                                Unknown
                              </Text>
                            </span>
                          )}
                        </>
                      ),
                    },
                    {
                      icon: <HiClock />,
                      tooltip: "Timezone",
                      value: (
                        <>
                          {viewing.timeZone ? (
                            getTimezones().find(
                              (tz) => tz.value == viewing.timeZone
                            )?.value
                          ) : (
                            <span>
                              <Text size="sm" color="dimmed">
                                Unknown
                              </Text>
                            </span>
                          )}
                        </>
                      ),
                    },
                    {
                      icon: <HiUserGroup />,
                      tooltip: "Visits",
                      value: viewing.games
                        .map((g) => g.visits)
                        .reduce((a, b) => a + b, 0)
                        .toString(),
                    },
                  ]}
                />
              </ShadedCard>
              <ReactNoSSR>
                <div className="flex items-center justify-center mt-6 mb-2">
                  <div
                    className="flex flex-col gap-2"
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
                        value: "100 reputation",
                      },
                      {
                        icon: <HiOutlineClock />,
                        title: "Local time",
                        value: viewingTime,
                      },
                      {
                        icon: <Rocket />,
                        title: "Trading",
                        value: "Unavailable",
                      },
                      ...additionalDetails,
                    ].map((item) => (
                      <div
                        className="grid grid-cols-2 gap-0 items-center"
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
            <div className="flex-auto min-w-0 md:w-3/4 w-full flex flex-col gap-6">
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
                          <PlaceholderGameResource
                            height={200}
                            game={game as Game}
                          />
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
              {viewing.profileLinks.length > 0 && <Links user={viewing} />}
              <ProfileBadges user={viewing} />
            </div>
          </div>
        )}
      </Framework>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, false, false);

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
      badges: true,
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
      verified: true,
      emailVerified: true,
      ai: true,
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

  const following = auth.props?.user
    ? await prisma.user.findFirst({
        where: {
          id: auth.props.user?.id,
          following: {
            some: {
              id: viewing.id,
            },
          },
        },
      })
    : false;

  return {
    props: {
      profile: JSON.parse(
        JSON.stringify(exclude(viewing, "email", "inviteCode", "tickets"))
      ),
      following: !!following,
      ...auth.props,
    },
  };
}

export default Profile;
