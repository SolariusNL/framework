import {
  Avatar,
  Badge,
  Divider,
  Indicator,
  Pagination,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiArrowRight, HiShieldCheck, HiSparkles } from "react-icons/hi";
import getMediaUrl from "../../util/getMedia";
import { NonUser } from "../../util/prisma-types";
import { getFriendsPages, getMyFriends } from "../../util/universe/friends";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";

const FriendsWidget: React.FC = () => {
  const [friends, setFriends] = useState<NonUser[]>();
  const [friendsTab, setFriendsTab] = useState(1);
  const [friendsPages, setFriendsPages] = useState(1);

  useEffect(() => {
    getMyFriends(friendsTab).then((friends) => {
      setFriends(friends);
    });
    getFriendsPages().then((pages) => {
      setFriendsPages(pages);
    });
  }, [friendsTab]);

  return (
    <ShadedCard withBorder>
      <div className="flex justify-center mb-4">
        <Badge variant="dot" color="green">
          {friends && friends?.filter(
            (friend) =>
              new Date(friend.lastSeen) >=
              new Date(new Date().getTime() - 5 * 60 * 1000)
          )} online
        </Badge>
      </div>
      <div>
        <Stack spacing={12}>
          {friends &&
            friends.map((friend, i) => (
              <>
                <Link href={`/profile/${friend.username}`} key={friend.id}>
                  <div className="cursor-pointer flex justify-between">
                    <div className="flex items-center gap-2">
                      <Indicator
                        disabled={!onlineFriends?.includes(friend)}
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

        {friends && friends.length === 0 && (
          <div className="col-span-2">
            <ModernEmptyState
              title="No friends yet"
              body="Find some friends to connect with on Framework."
            />
          </div>
        )}
      </div>
      <div className="w-full justify-center flex mt-4">
        <Pagination total={friendsPages} onChange={setFriendsTab} radius="lg" />
      </div>
    </ShadedCard>
  );
};

export default FriendsWidget;
