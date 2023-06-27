import ContextMenu from "@/components/ContextMenu";
import LoadingIndicator from "@/components/LoadingIndicator";
import ModernEmptyState from "@/components/ModernEmptyState";
import ReportUser from "@/components/ReportUser";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import Verified from "@/components/Verified";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import {
  Avatar,
  Divider,
  Indicator,
  Menu,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiClipboard, HiFlag, HiPlus, HiUser } from "react-icons/hi";

export const Section: React.FC<{
  title: string;
  description: string;
  right?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  sm?: boolean;
}> = ({
  title,
  description,
  right,
  titleClassName,
  descriptionClassName,
  sm,
}) => {
  const meta = (
    <>
      <Title order={sm ? 4 : 3} mb={4} className={titleClassName}>
        {title}
      </Title>
      <Text
        size="sm"
        color="dimmed"
        mb={!right ? "md" : 0}
        className={descriptionClassName}
      >
        {description}
      </Text>
    </>
  );
  return (
    <>
      {right ? (
        <div className="flex items-center justify-between mb-4">
          <div>{meta}</div>
          {right}
        </div>
      ) : (
        meta
      )}
    </>
  );
};

export const Friend: React.FC<{
  friend: NonUser;
  children?: React.ReactNode;
  dropdown?: React.ReactNode;
  dropdownWidth?: number;
}> = ({ friend, children, dropdown, dropdownWidth }) => {
  const { user } = useAuthorizedUserStore();
  const { colors } = useMantineTheme();
  const router = useRouter();
  const [reportOpened, setReportOpened] = useState(false);
  const { copy } = useClipboard();

  if (friend.username.startsWith("[Deleted")) {
    return <></>;
  }

  return (
    <>
      <ReportUser
        opened={reportOpened}
        setOpened={setReportOpened}
        user={friend}
      />
      <ContextMenu
        width={dropdownWidth || 160}
        dropdown={
          <>
            <Menu.Item
              onClick={() => router.push(`/profile/${friend.username}`)}
              icon={<HiUser />}
            >
              View profile
            </Menu.Item>
            <Menu.Item
              icon={<HiFlag />}
              color="red"
              onClick={() => setReportOpened(true)}
              disabled={user?.id === friend.id}
            >
              Report
            </Menu.Item>
            <Menu.Divider />
            {dropdown && (
              <>
                {dropdown}
                <Menu.Divider />
              </>
            )}
            <Menu.Item icon={<HiClipboard />} onClick={() => copy(friend.id)}>
              Copy ID
            </Menu.Item>
          </>
        }
      >
        <Link href={`/profile/${friend.username}`} passHref className="w-fit">
          <ShadedButton className="flex flex-col overflow-hidden">
            <div className="flex items-start gap-4 w-fit">
              <Indicator
                disabled={!Fw.Presence.online(friend)}
                color="green"
                inline
              >
                <Avatar
                  size={32}
                  src={getMediaUrl(friend.avatarUri)}
                  radius={999}
                />
              </Indicator>
              <div className="w-fit">
                <div className="flex items-center gap-2 w-fit truncate">
                  <div className="flex items-center gap-1 w-fit">
                    {friend.verified && (
                      <Verified className="w-[18px] h-[18px]" />
                    )}
                    <Text size="lg">{friend.alias || friend.username}</Text>
                  </div>
                  <span className="text-dimmed">{Fw.Elements.bullet()}</span>
                  <Text size="sm" color="dimmed">
                    @{friend.username}
                  </Text>
                </div>
                <Text size="sm" lineClamp={2} color="dimmed">
                  {friend.bio || "This user has not written a bio."}
                </Text>
                {(
                  friend as NonUser & {
                    following: { id: number }[];
                  }
                ).following &&
                  (
                    friend as NonUser & {
                      following: { id: number }[];
                    }
                  ).following.find((f) => f.id === user?.id) && (
                    <div className="flex items-center gap-2 mt-2">
                      <HiPlus color={colors.gray[6]} />
                      <Text size="sm" color="dimmed" weight={500}>
                        Follows you
                      </Text>
                    </div>
                  )}
              </div>
            </div>
            {children && <div className="w-full">{children}</div>}
          </ShadedButton>
        </Link>
      </ContextMenu>
    </>
  );
};

const FriendsWidget: React.FC = () => {
  const [allFriends, setAllFriends] = useState<NonUser[]>();
  const [recommendedFriends, setRecommendedFriends] = useState<NonUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch("/api/dashboard/friends", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setAllFriends(res.allFriends);
        setRecommendedFriends(res.recommendedFriends);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Section
        title="Online friends"
        description="Dive into a game with your friends"
      />
      {loading ? (
        <ShadedCard className="col-span-2 flex items-center justify-center py-8">
          <LoadingIndicator />
        </ShadedCard>
      ) : (
        <>
          {allFriends &&
          allFriends.filter(
            (friend) =>
              friend.lastSeen &&
              new Date(friend.lastSeen) >
                new Date(new Date().getTime() - 5 * 60 * 1000)
          ).length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allFriends
                  .filter(
                    (friend) =>
                      friend.lastSeen &&
                      new Date(friend.lastSeen) >
                        new Date(new Date().getTime() - 5 * 60 * 1000)
                  )
                  .map((friend, i) => (
                    <Friend friend={friend} key={i} />
                  ))}
              </div>
            </>
          ) : (
            <ShadedCard className="w-full flex justify-center">
              <ModernEmptyState
                title="No friends online"
                body="Your friends are not online right now"
              />
            </ShadedCard>
          )}
        </>
      )}
      <Divider mt="xl" mb="xl" />
      <Section
        title="Recommended people"
        description="People you might know based on mutual friends"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <ShadedCard className="col-span-2 flex items-center justify-center py-8">
            <LoadingIndicator />
          </ShadedCard>
        ) : (
          <>
            {recommendedFriends &&
              recommendedFriends.map((friend, i) => (
                <Friend friend={friend} key={i} />
              ))}
            {recommendedFriends && recommendedFriends.length === 0 && (
              <ShadedCard className="col-span-2">
                <ModernEmptyState
                  title="No recommendations"
                  body="We couldn't find any recommendations for you. Another time?"
                />
              </ShadedCard>
            )}
          </>
        )}
      </div>
      <Divider mt="xl" mb="xl" />
      <Section
        title="Your friends"
        description="A list for easy access to your friends"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <ShadedCard className="col-span-2 flex items-center justify-center py-8">
            <LoadingIndicator />
          </ShadedCard>
        ) : (
          <>
            {allFriends &&
              allFriends.map((friend, i) => <Friend friend={friend} key={i} />)}
            {allFriends && allFriends.length === 0 && (
              <ShadedCard className="col-span-2">
                <ModernEmptyState
                  title="No friends"
                  body="You have no friends yet. Add some!"
                />
              </ShadedCard>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default FriendsWidget;
