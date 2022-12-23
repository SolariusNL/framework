import { Button, Modal, NumberInput, Text } from "@mantine/core";
import React from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Stateful from "../../Stateful";

interface AdjustTicketsProps {
  user: User;
}

const AdjustTickets: React.FC<AdjustTicketsProps> = ({ user }) => {
  const [tickets, setTickets] = React.useState(0);
  return (
    <Stateful>
      {(open, setOpen) => (
        <>
          <Button leftIcon={<HiCurrencyDollar />} onClick={() => setOpen(true)}>
            Adjust Ticket Balance
          </Button>
          <Modal
            title="Adjust user's ticket balance"
            onClose={() => setOpen(false)}
            opened={open}
          >
            <Text color="dimmed" size="sm">
              This users current balance is {user.tickets}. This will override
              their current balance. Please, be cautious. This action cannot be
              undone.
            </Text>
            <NumberInput
              mt={16}
              label="New balance"
              description="This will override their current balance."
              value={tickets}
              onChange={(value) => setTickets(Number(value))}
            />
            <Button
              mt={16}
              onClick={async () => {
                performAdminAction(
                  AdminAction.ADJUST_TICKETS,
                  {
                    amount: tickets,
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

export default AdjustTickets;