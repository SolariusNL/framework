import { Badge, Button, Text, Title, Tooltip } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import { HiCheckCircle } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import PurchaseConfirmation from "../PurchaseConfirmation";
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

  return (
    <ViewGameTab value="store" title="Store">
      <Title order={4} mb={8}>
        Gamepasses
      </Title>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {game.gamepasses.length === 0 ? (
          <div className="col-span-2">
            <ModernEmptyState
              title="No gamepasses"
              body="This game has no gamepasses."
            />
          </div>
        ) : (
          game.gamepasses.map((gamepass) => (
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
                          }
                        });
                    }}
                    price={gamepass.price}
                  />
                  <ShadedCard className="text-center" withBorder>
                    <Tooltip
                      label={`This gamepass costs ${gamepass.price} tickets.`}
                    >
                      <Badge mb={12} color="green">
                        {gamepass.price}T$
                      </Badge>
                    </Tooltip>
                    <Text weight={700} size="lg" mb={8}>
                      {gamepass.name}
                    </Text>
                    <Text color="dimmed" lineClamp={2} mb={12}>
                      {gamepass.description}
                    </Text>
                    <Button
                      fullWidth
                      variant="gradient"
                      gradient={{ from: "teal", to: "lime", deg: 105 }}
                      onClick={() => setOpened(true)}
                      disabled={
                        user.tickets < gamepass.price ||
                        game.authorId === user.id ||
                        gamepass.owners.some((owner) => owner.id === user.id)
                      }
                    >
                      {gamepass.owners.some((owner) => owner.id === user.id)
                        ? "Already owned"
                        : "Purchase"}
                    </Button>
                  </ShadedCard>
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
