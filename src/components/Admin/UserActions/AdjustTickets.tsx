import { Button, Modal, NumberInput, Stack, Text } from "@mantine/core";
import React from "react";
import { HiTicket } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import LabelledRadio from "../../LabelledRadio";
import Stateful from "../../Stateful";
import Action from "./Action";

interface AdjustTicketsProps {
  user: User;
}

const AdjustTickets: React.FC<AdjustTicketsProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  const [tickets, setTickets] = React.useState(0);
  const [type, setType] = React.useState<"set" | "increment" | "decrement">(
    "increment"
  );

  return (
    <Stateful>
      {(open, setOpen) => (
        <>
          <Action
            title="Adjust tickets"
            description="Adjust user's ticket balance"
            onClick={() => setOpen(true)}
            icon={HiTicket}
          />
          <Modal
            title="Adjust user's ticket balance"
            onClose={() => setOpen(false)}
            opened={open}
          >
            <Text color="dimmed" size="sm" mb="lg">
              This users current balance is {user.tickets}.
            </Text>
            <Stack spacing={4} mb="lg">
              {[
                {
                  label: "Increment",
                  description: "Add to current balance",
                  value: "increment",
                },
                {
                  label: "Decrement",
                  description: "Subtract from current balance",
                  value: "decrement",
                },
                {
                  label: "Set",
                  description: "Override current balance",
                  value: "set",
                },
              ].map((option) => (
                <LabelledRadio
                  key={option.value}
                  value={option.value}
                  checked={type === option.value}
                  onChange={() =>
                    setType(option.value as "increment" | "decrement" | "set")
                  }
                  label={option.label}
                  description={option.description}
                  required
                />
              ))}
            </Stack>
            <NumberInput
              label="Amount"
              description="The amount to adjust the balance by"
              value={tickets}
              onChange={(value) => setTickets(Number(value))}
              required
              mb="lg"
            />
            <Button
              mt={16}
              onClick={async () => {
                performAdminAction(
                  AdminAction.ADJUST_TICKETS,
                  {
                    amount: tickets,
                    type,
                  },
                  user.id
                );
                setOpen(false);
              }}
            >
              Adjust Balance
            </Button>
          </Modal>
        </>
      )}
    </Stateful>
  );
};

AdjustTickets.title = "Adjust tickets";
AdjustTickets.description = "Adjust user's ticket balance (override)";
AdjustTickets.condition = (user) => true;

export default AdjustTickets;
