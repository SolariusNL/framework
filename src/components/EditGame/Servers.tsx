import { Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Game } from "../../util/prisma-types";
import EditGameTab from "./EditGameTab";

interface ServersProps {
  game: Game;
}

const Servers = ({ game }: ServersProps) => {
  const router = useRouter();

  useEffect(() => {
    router.push(
      "/developer/servers?" +
        new URLSearchParams({
          q: `id:${game.id}`,
        }).toString()
    );
  }, []);

  return (
    <EditGameTab value="servers">
      <div className="col-span-2 flex items-center justify-center py-8">
        <Loader />
      </div>
    </EditGameTab>
  );
};

export default Servers;
