import {
  Avatar,
  Button,
  CloseButton,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import React from "react";
import {
  HiCheckCircle,
  HiLockClosed,
  HiShare,
  HiTicket,
  HiUsers,
} from "react-icons/hi";
import getMediaUrl from "../../util/get-media";
import { Game } from "../../util/prisma-types";
import Copy from "../Copy";
import SideBySide from "../Settings/SideBySide";
import UserSelect from "../UserSelect";
import EditGameTab from "./EditGameTab";

interface AccessProps {
  game: Game & {
    paywallAccess: Array<{
      id: number;
      username: string;
      avatarUri: string;
    }>;
  };
}

const Access = ({ game }: AccessProps) => {
  const [updated, setUpdated] = React.useState({});
  const [gameData, setGameData] = React.useState(game);

  const updateGame = async () => {
    await fetch(`/api/games/${game.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        ...updated,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(
            res.error ||
              "A terrible error has occurred, and we couldn't update your game."
          );
        }

        showNotification({
          title: "Game updated",
          message: "Your game has been updated successfully.",
          icon: <HiCheckCircle />,
        });

        setGameData({ ...gameData, ...updated });
      })
      .catch((err) => {
        alert(err);
      });
  };

  return (
    <EditGameTab value="access">
      <Stack spacing={12} mb="lg">
        <SideBySide
          title="Access"
          description="Control who can access your game."
          icon={<HiLockClosed />}
          shaded
          noUpperBorder
          right={
            <Select
              data={[
                { label: "Everyone", value: "everyone" },
                { label: "Only people I invite", value: "invite" },
                { label: "People who purchase a license", value: "license" },
              ]}
              label="Access type"
              description="Who can access your game?"
              value={
                gameData.private
                  ? "invite"
                  : gameData.paywall
                  ? "license"
                  : "everyone"
              }
              onChange={(value) => {
                setUpdated({
                  ...updated,
                  private: value === "invite",
                  paywall: value === "license",
                });
                setGameData({
                  ...gameData,
                  private: value === "invite",
                  paywall: value === "license",
                });
              }}
            />
          }
        />
        {gameData.private && (
          <>
            <SideBySide
              title="Members"
              description="Manage users who've been whitelisted to access your game."
              icon={<HiUsers />}
              shaded
              right={
                <div className="flex flex-col gap-2">
                  <UserSelect
                    label="Add user"
                    description="Add a user to your game's whitelist."
                    onUserSelect={(user) => {
                      if (gameData.privateAccess.find((u) => u.id === user.id))
                        return;
                      setGameData({
                        ...gameData,
                        privateAccess: [
                          ...gameData.privateAccess,
                          {
                            id: user.id,
                            username: user.username,
                            avatarUri: user.avatarUri,
                          },
                        ],
                      });
                      setUpdated({
                        ...updated,
                        privateAccess: [
                          ...gameData.privateAccess,
                          {
                            id: user.id,
                            username: user.username,
                            avatarUri: user.avatarUri,
                          },
                        ],
                      });
                    }}
                    filter={(_, user) =>
                      !gameData.privateAccess.find((u) => u.id === user.id)
                    }
                  />
                  <Stack spacing={2} mt="sm">
                    {gameData.privateAccess.map((user) => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={getMediaUrl(user.avatarUri)}
                            size={20}
                            radius={999}
                          />
                          <Text size="sm" color="dimmed">
                            {user.username}
                          </Text>
                        </div>
                        <CloseButton
                          size="xs"
                          onClick={() => {
                            setGameData({
                              ...gameData,
                              privateAccess: gameData.privateAccess.filter(
                                (u) => u.id !== user.id
                              ),
                            });
                            setUpdated({
                              ...updated,
                              privateAccess: gameData.privateAccess.filter(
                                (u) => u.id !== user.id
                              ),
                            });
                          }}
                        />
                      </div>
                    ))}
                  </Stack>
                </div>
              }
              noUpperBorder
            />
          </>
        )}
        {gameData.paywall && (
          <SideBySide
            title="License"
            description="Manage your game's license."
            icon={<HiTicket />}
            shaded
            right={
              <NumberInput
                label="Price"
                description="How much should people pay to access your game?"
                value={gameData.paywallPrice}
                onChange={(value) => {
                  setUpdated({ ...updated, paywallPrice: Number(value) });
                  setGameData({ ...gameData, paywallPrice: Number(value) });
                }}
                min={1}
                max={100000}
              />
            }
            noUpperBorder
          />
        )}
        {typeof window !== "undefined" && (
          <SideBySide
            title="Share"
            description="Share your game with others."
            icon={<HiShare />}
            shaded
            right={
              <div className="flex items-center gap-2 w-full">
                <Copy
                  value={`${window.location.protocol}//${window.location.host}/game/${game.id}`}
                />
                <TextInput
                  readOnly
                  value={`${window.location.protocol}//${window.location.host}/game/${game.id}`}
                  className="w-full"
                />
              </div>
            }
            noUpperBorder
          />
        )}
      </Stack>
      <Button onClick={updateGame}>Save changes</Button>
    </EditGameTab>
  );
};

export default Access;
