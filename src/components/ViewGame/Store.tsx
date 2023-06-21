import { Image, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiOutlineTicket,
  HiTicket,
} from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import getMediaUrl from "../../util/get-media";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import PurchaseConfirmation from "../PurchaseConfirmation";
import ShadedButton from "../ShadedButton";
import ShadedCard from "../ShadedCard";
import Stateful from "../Stateful";
import ViewGameTab from "./ViewGameTab";

interface StoreProps {
  game: Game & {
    gamepasses: Array<Gamepass & { owners: Array<{ id: number }> }>;
  };
}

const Store: React.FC<StoreProps> = ({ game }) => {
  const user = useFrameworkUser()!;
  const [gamepasses, setGamepasses] = useState(game.gamepasses);

  return (
    <ViewGameTab value="store" title="Store">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gamepasses.length === 0 ? (
          <div className="col-span-2">
            <ModernEmptyState
              title="No gamepasses"
              body="This game has no gamepasses."
            />
          </div>
        ) : (
          gamepasses.map((gamepass) => (
            <Stateful key={gamepass.id}>
              {(opened, setOpened) => (
                <>
                  <PurchaseConfirmation
                    opened={opened}
                    setOpened={setOpened}
                    productTitle={gamepass.name}
                    productDescription={gamepass.description}
                    onPurchaseComplete={async () => {
                      await fetch(
                        `/api/games/${game.id}/gamepass/${gamepass.id}/purchase`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: String(
                              getCookie(".frameworksession")
                            ),
                          },
                        }
                      )
                        .then((res) => res.json())
                        .then((res) => {
                          if (res.success) {
                            setOpened(false);
                            showNotification({
                              title: "Purchase successful",
                              message: `You have successfully purchased ${gamepass.name} for ${gamepass.price}T$.`,
                              icon: <HiCheckCircle />,
                            });
                            setGamepasses(
                              gamepasses.map((gp) => {
                                if (gp.id === gamepass.id) {
                                  return {
                                    ...gp,
                                    owners: [...gp.owners, { id: user.id }],
                                  };
                                }
                                return gp;
                              })
                            );
                          }
                        });
                    }}
                    price={gamepass.price}
                  />
                  <ShadedButton
                    className="w-full flex flex-col hover:bg-black/10"
                    onClick={() => {
                      openConfirmModal({
                        title: gamepass.name,
                        children: (
                          <>
                            <Text mb={4}>Description</Text>
                            <Text size="sm" color="dimmed" mb="md">
                              {gamepass.description}
                            </Text>
                            <Text mb={4}>Price</Text>
                            <Text
                              size="sm"
                              color="dimmed"
                              className="flex items-center gap-2"
                              mb="md"
                            >
                              <HiTicket />
                              {gamepass.price}T$
                            </Text>
                          </>
                        ),
                        labels: {
                          confirm: gamepass.owners.some(
                            (owner) => owner.id === user.id
                          )
                            ? "Already owned"
                            : "Purchase",
                          cancel: "Nevermind",
                        },
                        confirmProps: {
                          leftIcon: <HiTicket />,
                          disabled:
                            gamepass.owners.some(
                              (owner) => owner.id === user.id
                            ) || user.tickets < gamepass.price,
                        },
                        onConfirm: () => {
                          setOpened(true);
                        },
                      });
                    }}
                  >
                    <div className="flex gap-4">
                      {gamepass.iconUri ? (
                        <Image
                          className="rounded-md"
                          src={getMediaUrl(gamepass.iconUri)}
                          width={64}
                          height={64}
                          alt={gamepass.name}
                          radius="md"
                        />
                      ) : (
                        <ShadedCard
                          sx={(theme) => ({
                            width: 64,
                            height: 64,
                            backgroundColor:
                              theme.colorScheme === "dark"
                                ? theme.colors.dark[8]
                                : theme.colors.gray[2],
                          })}
                          className="flex items-center justify-center"
                        >
                          <HiOutlineTicket className="text-dimmed" />
                        </ShadedCard>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Text size="lg">{gamepass.name}</Text>
                          {gamepass.owners.some(
                            (owner) => owner.id === user.id
                          ) && <HiCheck className="text-green-500" />}
                        </div>
                        <Text
                          size="sm"
                          className="flex items-center gap-2 text-green-700"
                        >
                          <HiTicket />
                          {gamepass.price}T$
                        </Text>
                      </div>
                    </div>
                  </ShadedButton>
                </>
              )}
            </Stateful>
          ))
        )}
      </div>
    </ViewGameTab>
  );
};

export default Store;
