import {
  Avatar,
  Badge,
  Divider,
  Indicator,
  Loader,
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
import ShadedButton from "../ShadedButton";
import ShadedCard from "../ShadedCard";

const FriendsWidget: React.FC = () => {
  const [friends, setFriends] = useState<NonUser[]>();
  const [friendsTab, setFriendsTab] = useState(1);
  const [friendsPages, setFriendsPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyFriends(friendsTab).then((friends) => {
      setFriends(friends);
    });
    getFriendsPages().then((pages) => {
      setFriendsPages(pages);
    });
    setLoading(false);
  }, [friendsTab]);

  return (
    <ShadedCard withBorder>
      <div className="flex justify-center mb-4">
        <Badge variant="dot" color="green">
          {friends &&
            friends?.filter(
              (friend) =>
                new Date(friend.lastSeen) >=
                new Date(new Date().getTime() - 5 * 60 * 1000)
            ).length}
          {" online"}
        </Badge>
      </div>
      <div>
        <Stack spacing={12}>
          {friends &&
            !loading &&
            friends.map((friend, i) => (
              <>
                <Link href={`/profile/${friend.username}`} key={friend.id}>
                  <ShadedButton className="cursor-pointer flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Indicator
                        disabled={
                          new Date(friend.lastSeen) <
                          new Date(new Date().getTime() - 5 * 60 * 1000)
                        }
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
                  </ShadedButton>
                </Link>
                {i !== friends.length - 1 && <Divider className="opacity-50" />}
              </>
            ))}
        </Stack>

        {friends && friends.length === 0 && !loading && (
          <div className="col-span-2">
            <ModernEmptyState
              title="No friends yet"
              body="Find some friends to connect with on Framework."
            />
          </div>
        )}
        {loading && (
          <div className="col-span-2 flex justify-center">
            <Loader />
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
