import {
  Avatar,
  Divider,
  Indicator,
  Loader,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import getMediaUrl from "../../util/get-media";
import { NonUser } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import ShadedButton from "../ShadedButton";
import ShadedCard from "../ShadedCard";

export const Section: React.FC<{
  title: string;
  description: string;
  right?: React.ReactNode;
}> = ({ title, description, right }) => {
  const meta = (
    <>
      <Title order={3} mb={4}>
        {title}
      </Title>
      <Text size="sm" color="dimmed" mb={!right ? "md" : 0}>
        {description}
      </Text>
    </>
  );
  return (
    <>
      {right ? (
        <div className="flex items-center justify-between mb-6">
          <div>{meta}</div>
          {right}
        </div>
      ) : (
        meta
      )}
    </>
  );
};

const Friend: React.FC<{ friend: NonUser }> = ({ friend }) => {
  const { user } = useAuthorizedUserStore();
  const { colors } = useMantineTheme();

  return (
    <Link href={`/profile/${friend.username}`} passHref>
      <ShadedButton className="w-full">
        <div className="flex items-start gap-4">
          <Indicator
            disabled={
              !friend.lastSeen ||
              new Date(friend.lastSeen) <
                new Date(new Date().getTime() - 5 * 60 * 1000)
            }
            color="green"
            inline
          >
            <Avatar
              size={32}
              src={getMediaUrl(friend.avatarUri)}
              radius={999}
            />
          </Indicator>
          <div>
            <div className="flex items-center gap-2">
              <Text size="lg">{friend.username}</Text>
              {friend.alias && (
                <Text size="sm" color="dimmed">
                  {friend.alias}
                </Text>
              )}
            </div>
            <Text size="sm" lineClamp={2} color="dimmed">
              {friend.bio}
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
      </ShadedButton>
    </Link>
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
          <Loader />
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
            <Loader />
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
            <Loader />
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
