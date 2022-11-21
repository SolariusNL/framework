import { useFrameworkUser } from "../../contexts/FrameworkUser";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Indicator,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiChat,
  HiClipboardList,
  HiCog,
  HiGift,
  HiShieldCheck,
  HiSparkles,
  HiUserGroup,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import ShadedCard from "../ShadedCard";
import { NonUser } from "../../util/prisma-types";
import getMediaUrl from "../../util/getMedia";
import ModernEmptyState from "../ModernEmptyState";

const FriendsWidget: React.FC = () => {
  const user = useFrameworkUser()!;
  const [friends, setFriends] = useState<NonUser[]>(
    user.followers.filter((follower) =>
      user.following.some((following) => following.id === follower.id)
    )
  );
  const [onlineFriends, setOnlineFriends] = useState(
    friends.filter(
      (friend) =>
        new Date(friend.lastSeen) >=
        new Date(new Date().getTime() - 5 * 60 * 1000)
    )
  );
  const [friendsTab, setFriendsTab] = useState(1);

  return (
    <ShadedCard withBorder>
      <div className="flex justify-center mb-4">
        <Badge variant="dot" color="green">
          {onlineFriends.length} online
        </Badge>
      </div>
      <div>
        <Stack spacing={12}>
          {friends
            .slice(
              (friendsTab - 1) * 4,
              friendsTab * 4 > friends.length ? friends.length : friendsTab * 4
            )
            .map((friend, i) => (
              <>
                <Link href={`/profile/${friend.username}`} key={friend.id}>
                  <div className="cursor-pointer flex justify-between">
                    <div className="flex items-center gap-2">
                      <Indicator
                        disabled={!onlineFriends.includes(friend)}
                        color="green"
                        inline
                      >
                        <Avatar
                          size={32}
                          className="rounded-full"
                          src={getMediaUrl(friend.avatarUri)}
                        />
                      </Indicator>
                      <div className="flex items-center gap-1">
                        <Text weight={600}>{friend.username}</Text>
                        {friend.role === "ADMIN" && <HiShieldCheck />}
                        {friend.premium && <HiSparkles />}
                      </div>
                      {friend.alias && (
                        <Text size="sm" color="gray" weight={500}>
                          ({friend.alias})
                        </Text>
                      )}
                    </div>
                    <HiArrowRight />
                  </div>
                </Link>
                {i !== friends.length - 1 && <Divider className="opacity-50" />}
              </>
            ))}
        </Stack>

        {friends.length === 0 && (
          <div className="col-span-2">
            <ModernEmptyState
              title="No friends yet"
              body="Find some friends to connect with on Framework."
            />
          </div>
        )}
      </div>
      <div className="w-full justify-center flex mt-4">
        <Pagination
          total={Math.ceil(friends.length / 4)}
          onChange={setFriendsTab}
          radius="lg"
        />
      </div>
    </ShadedCard>
  );
};

export default FriendsWidget;
