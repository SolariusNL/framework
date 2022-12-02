import { ActionIcon, Anchor, Button, Group, Table, Text } from "@mantine/core";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiExternalLink, HiPencil, HiPlus } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import InventTab from "./InventTab";

interface GamePassesProps {
  user: User;
}

const GamePasses = ({ user }: GamePassesProps) => {
  const [gamepasses, setGamepasses] = useState<
    Array<
      Gamepass & {
        owners: Array<{ id: number }>;
        game: { id: number; name: string };
      }
    >
  >([]);

  useEffect(() => {
    fetch("/api/games/gamepasses/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGamepasses(res);
      });
  }, []);

  return (
    <InventTab tabValue="gamepasses" tabTitle="Game Passes">
      <Table striped mb={32}>
        <thead>
          <tr>
            <th>Game</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Owners</th>
            <th>Revenue</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {gamepasses.map((gamepass) => (
            <tr key={gamepass.id}>
              <td className="font-semibold">{gamepass.game.name}</td>
              <td>
                <Link
                  passHref
                  as={`/game/${gamepass.game.id}`}
                  href="/game/[id]"
                >
                  <Anchor className="items-center flex gap-1">
                    <HiExternalLink />
                    {gamepass.name}
                  </Anchor>
                </Link>
              </td>
              <td>
                <Text lineClamp={2}>{gamepass.description}</Text>
              </td>
              <td>{gamepass.price}</td>
              <td>{gamepass.owners.length}</td>
              <td>{gamepass.price * gamepass.owners.length}</td>
              <td>
                <Link
                  href="/game/[id]/edit"
                  as={`/game/${gamepass.game.id}/edit?view=store`}
                  passHref
                >
                  <ActionIcon component="a">
                    <HiPencil />
                  </ActionIcon>
                </Link>
              </td>
            </tr>
          ))}

          {gamepasses.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center">
                <ModernEmptyState
                  title="No gamepasses"
                  body="You have no gamepasses"
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Group>
        <Link href="/game/create" passHref>
          <Button variant="subtle" leftIcon={<HiPlus />}>
            Create Game
          </Button>
        </Link>
      </Group>
    </InventTab>
  );
};

export default GamePasses;
