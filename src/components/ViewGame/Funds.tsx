import {
  Badge,
  Button,
  Modal,
  NumberInput,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { GameFund } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiCheckCircle, HiTicket } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import PurchaseConfirmation from "../PurchaseConfirmation";
import RenderMarkdown from "../RenderMarkdown";
import ShadedCard from "../ShadedCard";
import ViewGameTab from "./ViewGameTab";

interface FundsTabProps {
  game: Game;
}

const FundsTab = ({ game }: FundsTabProps) => {
  const user = useFrameworkUser();
  const [funds, setFunds] = useState(game.funds);
  const [toFund, setToFund] = useState<GameFund | null>(null);
  const [fundOpen, setFundOpen] = useState(false);
  const [selectedFundAmount, setSelectedFundAmount] = useState(1);
  const [fundLoading, setFundLoading] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const [confirmationOpen, setConfirmationOpen] = useState(false);

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

        showNotification({
          title: "Success",
          message: "Your help is appreciated!",
          icon: <HiCheckCircle />,
        });
        setFunds(
          funds.map((fund) => {
            if (fund.id === toFund?.id) {
              return {
                ...fund,
                current: fund.current + selectedFundAmount,
              };
            }
            return fund;
          })
        );
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
      <PurchaseConfirmation
        productTitle={toFund?.name!}
        productDescription={toFund?.description!}
        opened={confirmationOpen}
        setOpened={setConfirmationOpen}
        onPurchaseComplete={async () => {
          await handleFund();
        }}
        price={selectedFundAmount}
        proseDescription
      />
      <Modal
        opened={fundOpen}
        onClose={() => setFundOpen(false)}
        title="Fund Game"
        className={colorScheme}
      >
        <RenderMarkdown proseAddons="prose-sm">
          {toFund?.description!}
        </RenderMarkdown>

        <NumberInput
          label="Amount"
          value={selectedFundAmount}
          onChange={(n) => setSelectedFundAmount(Number(n))}
          min={1}
          required
          description={`You have ${user?.tickets} tickets.`}
          max={user?.tickets}
          mb={16}
          mt="md"
        />

        <div className="flex justify-end">
          <Button
            onClick={() => {
              setConfirmationOpen(true);
              setFundOpen(false);
            }}
            loading={fundLoading}
            leftIcon={<HiTicket />}
          >
            Donate
          </Button>
        </div>
      </Modal>

      <ViewGameTab value="funds" title="Funds">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funds.length > 0 ? (
            funds.map((fund) => (
              <ShadedCard
                className="text-center cursor-pointer content-center dark:hover:bg-zinc-900/20 transition-colors duration-200 hover:bg-zinc-200/20 ease-in-out"
                key={fund.id}
                withBorder
                onClick={() => {
                  setToFund(fund);
                  setFundOpen(true);
                }}
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
                <div className="mt-4 flex justify-around items-center">
                  {[
                    {
                      label: "Raised",
                      value: `${fund.current}T$`,
                    },
                    {
                      label: "Goal",
                      value: `${fund.target}T$`,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center"
                    >
                      <Text color="dimmed" size="sm">
                        {stat.label}
                      </Text>
                      <Text weight={500}>{stat.value}</Text>
                    </div>
                  ))}
                </div>
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
