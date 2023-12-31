import ViewGameTab from "@/components/view-game/view-game";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import { Game } from "@/util/prisma-types";
import { Badge, Button, Group, Table } from "@mantine/core";
import { useRouter } from "next/router";
import { HiPlus, HiViewList } from "react-icons/hi";

interface ConnectionTabProps {
  game: Game;
}

const ConnectionTab = ({ game }: ConnectionTabProps) => {
  const user = useFrameworkUser();
  const router = useRouter();

  return (
    <ViewGameTab
      value="connection"
      title="Servers"
      description="See information about this game's servers."
    >
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>Port</th>
            <th>Online</th>
          </tr>
        </thead>

        <tbody>
          {game.connection.map((connection, i) => (
            <tr key={i}>
              <td>{connection.ip}</td>
              <td>{connection.port}</td>
              <td>
                {connection.online ? (
                  <Badge variant="dot" color="green">
                    Online
                  </Badge>
                ) : (
                  <Badge variant="dot" color="red">
                    Offline
                  </Badge>
                )}
              </td>
            </tr>
          ))}

          {game.connection.length == 0 && (
            <tr>
              <td colSpan={3}>
                No servers found. The developer must add a server to play this
                game.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {game.author.id === user?.id && (
        <Group mt="md">
          <Button
            variant="subtle"
            size="xs"
            leftIcon={<HiPlus />}
            onClick={() =>
              router.push(
                "/developer/servers?" +
                  new URLSearchParams({ page: "CreateServer" }).toString()
              )
            }
            disabled={game.connection.length > 0}
          >
            Add server
          </Button>

          <Button
            variant="subtle"
            size="xs"
            leftIcon={<HiViewList />}
            onClick={() => router.push("/developer/servers")}
          >
            Manage servers
          </Button>
        </Group>
      )}
    </ViewGameTab>
  );
};

export default ConnectionTab;
