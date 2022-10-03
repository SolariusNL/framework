import {
  ActionIcon,
  Badge,
  Button,
  Modal,
  NumberInput,
  Table,
  Text,
} from "@mantine/core";
import { GameFund } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { Game } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
import ModernEmptyState from "../ModernEmptyState";
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

        <Button onClick={handleFund}>Donate</Button>
      </Modal>

      <ViewGameTab value="funds" title="Funds">
        <Text mb={16}>
          Help support the developer of this game by donating to them, and they
          will be able to continue to maintain and develop this game to be the
          best it can be.
        </Text>
        {game.funds.length > 0 ? (
          <Table striped mb={10}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Goal</th>
                <th>Amount Raised</th>
                <th>Started</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {game.funds.map((fund, i) => (
                <tr key={i}>
                  <td>
                    <Badge
                      variant="dot"
                      color={fund.current >= fund.target ? "blue" : "green"}
                    >
                      {fund.current >= fund.target ? "Complete" : "Active"}
                    </Badge>
                  </td>
                  <td>{fund.name}</td>
                  <td>{fund.target}</td>
                  <td>{fund.current}</td>
                  <td>{new Date(fund.createdAt).toLocaleDateString()}</td>
                  <td>
                    {mobile ? (
                      <ActionIcon
                        onClick={() => {
                          setToFund(fund);
                          setFundOpen(true);
                        }}
                        color="blue"
                      >
                        <HiCurrencyDollar />
                      </ActionIcon>
                    ) : (
                      <Button
                        size="xs"
                        leftIcon={<HiCurrencyDollar />}
                        onClick={() => {
                          setToFund(fund);
                          setFundOpen(true);
                        }}
                      >
                        Donate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <ModernEmptyState
            title="No funds"
            body="The developer hasn't set up any funds yet."
          />
        )}
      </ViewGameTab>
    </>
  );
};

export default FundsTab;
