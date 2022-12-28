import { ActionIcon, Anchor, ScrollArea, Table, Text } from "@mantine/core";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiExternalLink, HiPencil } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import InventTab from "./InventTab";

interface GamePassesProps {
  user: User;
}

type GamepassWithOwners = Gamepass & {
  owners: Array<{ id: number }>;
};

const GamePasses = ({ user }: GamePassesProps) => {
  const [gamepasses, setGamepasses] = useState<
    Array<{
      id: number;
      name: string;
      gamepasses: GamepassWithOwners[];
    }>
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
    <InventTab
      tabValue="gamepasses"
      tabTitle="Game Passes"
      tabSubtitle="Game passes are a way to sell additional content for your games, for example, access to limited-time items or exclusive features."
    >
      <ScrollArea>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Owners</th>
              <th>Revenue</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {gamepasses.map((g) => (
              <>
                <tr key={g.id}>
                  <td
                    colSpan={6}
                    className="font-bold bg-gray-400 bg-opacity-10"
                  >
                    <Link href={`/game/${g.id}`} passHref>
                      <Anchor className="flex items-center gap-1">
                        <HiExternalLink />{" "}
                        <>
                          {g.name} ({g.gamepasses.length} gamepasses)
                        </>
                      </Anchor>
                    </Link>
                  </td>
                </tr>
                {g.gamepasses.map((gp) => {
                  return (
                    <tr key={gp.id}>
                      <td>{gp?.name}</td>
                      <td>
                        <Text lineClamp={1}>{gp?.description}</Text>
                      </td>
                      <td>T${gp?.price}</td>
                      <td>{gp?.owners.length}</td>
                      <td>T${gp?.owners?.length! * (gp?.price || 0)}</td>
                      <td>
                        <Link href={`/game/${g.id}/edit?view=store`} passHref>
                          <ActionIcon variant="light">
                            <HiPencil />
                          </ActionIcon>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}

            {gamepasses.length === 0 && (
              <tr>
                <td className="text-center" colSpan={6}>
                  <ModernEmptyState
                    title="No gamepasses"
                    body="You have no gamepasses"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </InventTab>
  );
};

export default GamePasses;
