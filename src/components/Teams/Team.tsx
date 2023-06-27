import Copy from "@/components/Copy";
import ShadedButton from "@/components/ShadedButton";
import UserContext from "@/components/UserContext";
import { TeamType } from "@/pages/teams";
import getMediaUrl from "@/util/get-media";
import { Avatar, Text, Tooltip, useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { HiMap, HiUsers, HiViewGrid } from "react-icons/hi";

type TeamProps = {
  team: TeamType;
} & React.ComponentPropsWithoutRef<"div">;

const Team: React.FC<TeamProps> = (props) => {
  const theme = useMantineTheme();
  const { team: t } = props;

  return (
    <Link href={`/teams/t/${t.slug}`} passHref>
      <ShadedButton>
        <div className="w-full">
          <div className="flex gap-5 w-full items-start">
            <Avatar src={getMediaUrl(t.iconUri)} size={82} />
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <Text size="xl" weight={500}>
                  {t.name}
                </Text>
                <div className="flex items-center">
                  <Copy value={t.id} dontPropagate />
                  <Text size="sm" color="dimmed">
                    Copy ID
                  </Text>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="mt-2 flex items-center gap-2">
                  <UserContext user={t.owner}>
                    <Avatar
                      size={24}
                      src={getMediaUrl(t.owner.avatarUri)}
                      className="rounded-full"
                    />
                  </UserContext>
                  <Text size="sm" color="dimmed">
                    @{t.owner.username}
                  </Text>
                </div>
              </div>
              <Text lineClamp={2}>
                {t.description.replace(/<[^>]*>?/gm, "")}
              </Text>
            </div>
          </div>
          <div className="flex justify-around gap-2 mt-4">
            {[
              {
                tooltip: "Member count",
                value: t._count.members + 1 || 0,
                icon: HiUsers,
              },
              {
                tooltip: "Located",
                value: t.location || "Unprovided",
                icon: HiMap,
              },
              {
                tooltip: "Game count",
                value: t._count.games,
                icon: HiViewGrid,
              },
            ].map(({ tooltip, value, icon: Icon }) => (
              <Tooltip label={tooltip} key={tooltip}>
                <div className="flex items-center gap-2">
                  <Icon color={theme.colors.gray[5]} />
                  <Text size="sm" color="dimmed" weight={500}>
                    {value}
                  </Text>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </ShadedButton>
    </Link>
  );
};

export default Team;
