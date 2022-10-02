import {
  ActionIcon,
  Badge,
  Button,
  Modal,
  NumberInput,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { GameFund } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import { HiPlus, HiStop } from "react-icons/hi";
import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import EditGameTab from "./EditGameTab";

interface FundingProps {
  game: Game;
}

const Funding = ({ game }: FundingProps) => {
  const [createFundOpen, setCreateFundOpen] = React.useState(false);

  const [enteredName, setEnteredName] = React.useState("");
  const [enteredGoal, setEnteredGoal] = React.useState(0);

  const [loading, setLoading] = React.useState(false);

  const [funds, setFunds] = React.useState(game.funds);

  const createFund = async () => {
    setLoading(true);
    await fetch(`/api/games/${game.id}/fund/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        name: enteredName,
        goal: enteredGoal,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(res.error || "An error occurred.");
          return;
        }

        setCreateFundOpen(false);
        setEnteredName("");
        setEnteredGoal(0);
        setFunds(
          funds.concat({
            id: res.fund.id,
            name: res.fund.name,
            target: res.fund.target,
            current: res.fund.current,
          } as any)
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Modal
        title="Create New Fund"
        opened={createFundOpen}
        onClose={() => setCreateFundOpen(false)}
      >
        <Text mb={16}>
          Need to raise some money to help fund development of your game? You
          can use Game Funds to crowdsource donations from your community.
        </Text>

        <TextInput
          label="Fund name"
          description="What is this fund for?"
          mb={6}
          value={enteredName}
          onChange={(e) => setEnteredName(e.currentTarget.value)}
          placeholder="Enter a name for this fund"
        />
        <NumberInput
          label="Goal"
          description="How much do you want to raise?"
          mb={16}
          value={enteredGoal}
          onChange={(num) => setEnteredGoal(Number(num))}
          min={50}
          max={1000000}
        />

        <Button onClick={createFund} loading={loading}>
          Create Fund
        </Button>
      </Modal>
      <EditGameTab value="funding">
        <Button
          leftIcon={<HiPlus />}
          mb={16}
          variant="default"
          onClick={() => setCreateFundOpen(true)}
        >
          Create a new fund
        </Button>

        <Table striped>
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>Goal</th>
              <th>Current Raised</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {funds.length > 0 ? (
              funds.map((fund) => (
                <tr key={fund.id}>
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
                  <td>
                    <ActionIcon color="red">
                      <HiStop />
                    </ActionIcon>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <ModernEmptyState
                    title="No funds found"
                    body="Create a new fund to get started"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </EditGameTab>
    </>
  );
};

export default Funding;
