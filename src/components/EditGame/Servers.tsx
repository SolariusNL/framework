import { Button } from "@mantine/core";
import Link from "next/link";
import { HiPlus } from "react-icons/hi";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import ConnectionsWidget from "../Widgets/Connections";
import EditGameTab from "./EditGameTab";

interface ServersProps {
  game: Game;
}

const Servers = ({ game }: ServersProps) => {
  return (
    <EditGameTab value="servers">
      <Link passHref href={`/game/${game.id}/connection/add`}>
        <Button leftIcon={<HiPlus />} mb={16} variant="default">
          Add a new server
        </Button>
      </Link>
      <ConnectionsWidget filterId={game.id} />
    </EditGameTab>
  );
};

export default Servers;
