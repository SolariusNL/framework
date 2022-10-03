import { Badge, Button, Table } from "@mantine/core";
import { useRouter } from "next/router";
import { HiPlus } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { Game } from "../../util/prisma-types";
import ViewGameTab from "./ViewGameTab";

interface ConnectionTabProps {
  game: Game;
}

const ConnectionTab = ({ game }: ConnectionTabProps) => {
  const user = useFrameworkUser();
  const router = useRouter();

  return (
    <ViewGameTab value="connection" title="Connection">
      <Table highlightOnHover mb={10}>
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

      {game.author.id == user?.id && (
        <Button
          variant="subtle"
          size="xs"
          leftIcon={<HiPlus />}
          onClick={() => router.push(`/game/${game.id}/connection/add`)}
        >
          Add server
        </Button>
      )}
    </ViewGameTab>
  );
};

export default ConnectionTab;
