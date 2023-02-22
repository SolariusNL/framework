import { Badge, Button, Modal, NumberInput, Text, Title } from "@mantine/core";
import { GameFund } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import useMediaQuery from "../../util/media-query";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import ViewGameTab from "./ViewGameTab";

interface FundsTabProps {
  game: Game;
}

const FundsTab = ({ game }: FundsTabProps) => {
  const mobile = useMediaQuery("768");
  const user = useFrameworkUser();

  const [toFund, setToFund] = useState<GameFund | null>(null);
  const [fundOpen, setFundOpen] = useState(false);
  const [selectedFundAmount, setSelectedFundAmount] = useState(0);
  const [fundLoading, setFundLoading] = useState(false);

  const router = useRouter();

  const handleFund = async () => {
    setFundLoading(true);
    await fetch(
      `/api/games/${game.id}/fund/${toFund?.id}/donate/${selectedFundAmount}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          alert(res.error || "An error occurred.");
          return;
        }

        router.reload();
      })
      .catch((err) => {
        alert(err);
      })
      .finally(() => {
        setFundLoading(false);
      });
  };

  return (
    <>
      <Modal
        opened={fundOpen}
        onClose={() => setFundOpen(false)}
        title="Fund Game"
      >
        <Text mb={16}>
          You are about to fund {toFund?.name}. The amount you fund will be
          deducted from your tickets balance.
        </Text>

        <NumberInput
          label="Amount"
          value={selectedFundAmount}
          onChange={(n) => setSelectedFundAmount(Number(n))}
          min={1}
          max={user?.tickets}
          mb={16}
        />

        <Button onClick={handleFund} fullWidth>
          Donate
        </Button>
      </Modal>

      <ViewGameTab value="funds" title="Funds">
        <Text mb={16}>
          Help support the developer of this game by donating to them, and they
          will be able to continue to maintain and develop this game to be the
          best it can be.
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {game.funds.length > 0 ? (
            game.funds.map((fund) => (
              <ShadedCard
                className="text-center content-center"
                key={fund.id}
                withBorder
              >
                <Badge
                  variant="dot"
                  color={fund.current >= fund.target ? "blue" : "green"}
                  mb={8}
                >
                  {fund.current >= fund.target ? "Complete" : "Active"}
                </Badge>
                <Title order={4} mb={16}>
                  {fund.name}
                </Title>
                {[
                  ["Goal", `${fund.target} tickets`],
                  ["Current", `${fund.current} tickets`],
                ].map((item) => (
                  <div className="flex justify-between" key={item[0]}>
                    <Text color="dimmed">{item[0]}</Text>
                    <Text color="dimmed" weight={600}>
                      {item[1]}
                    </Text>
                  </div>
                ))}
                <Button
                  mt={24}
                  fullWidth
                  onClick={() => {
                    setToFund(fund);
                    setFundOpen(true);
                  }}
                  disabled={game.authorId === user?.id}
                  leftIcon={<HiCurrencyDollar />}
                >
                  Donate
                </Button>
              </ShadedCard>
            ))
          ) : (
            <div className="col-span-2">
              <ModernEmptyState
                title="No funds"
                body="The developer hasn't set up any funds yet."
              />
            </div>
          )}
        </div>
      </ViewGameTab>
    </>
  );
};

export default FundsTab;
