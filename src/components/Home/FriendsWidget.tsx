import { Avatar, Divider, Indicator, Text, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import getMediaUrl from "../../util/getMedia";
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
            <div className="flex items-center gap-1">
              <Text size="lg">{friend.username}</Text>
              {friend.alias && (
                <Text size="sm" color="dimmed">
                  ({friend.alias})
                </Text>
              )}
            </div>
            <Text size="sm" lineClamp={2} color="dimmed">
              {friend.bio}
            </Text>
          </div>
        </div>
      </ShadedButton>
    </Link>
  );
};

const FriendsWidget: React.FC = () => {
  const [allFriends, setAllFriends] = useState<NonUser[]>();

  useEffect(() => {
    fetch("/api/dashboard/friends", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setAllFriends(res);
      });
  }, []);

  return (
    <>
      <Section
        title="Your friends"
        description="A list for easy access to your friends"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      <Divider mt="xl" mb="xl" />
      <Section
        title="Online friends"
        description="Dive into a game with your friends"
      />
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
  );
};

export default FriendsWidget;
