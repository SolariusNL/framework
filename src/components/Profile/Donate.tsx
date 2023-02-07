import { Button, Chip, Modal, NumberInput, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiReceiptTax, HiTicket } from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import { NonUser } from "../../util/prisma-types";

interface DonateProps {
  user: NonUser;
}

const Donate = ({ user }: DonateProps) => {
  const { user: currentUser, setUser } = useAuthorizedUserStore();
  const form = useForm<{
    tickets: number;
  }>({
    initialValues: {
      tickets: 0,
    },
  });
  const [opened, setOpened] = useState(false);

  const handleDonate = async (amt: number) => {
    await fetch(`/api/users/${user.id}/donate/${amt}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => {
      showNotification({
        title: "Donation Successful",
        message: `You have donated ${amt}T$ to ${user.username}`,
        icon: <HiReceiptTax />,
      });
      setUser({
        ...currentUser!,
        tickets: Number(currentUser?.tickets) - amt,
      });
    });
  };

  return (
    <>
      <Modal title="Donate" opened={opened} onClose={() => setOpened(false)}>
        <Text size="sm" color="dimmed" mb="md">
          Please provide an amount of Tickets to send to this user. Donations
          are irreversible.
        </Text>
        <form
          onSubmit={form.onSubmit(async (values) => {
            setOpened(false);
            await handleDonate(values.tickets);
          })}
        >
          <NumberInput
            min={1}
            max={currentUser?.tickets && 1000000}
            mb="md"
            label="Ticket amount"
            required
            description="Please provide a ticket amount"
            {...form.getInputProps("tickets")}
          />
          <div className="flex items-center justify-center gap-2 md:gap-0 mb-6 flex-wrap md:justify-between">
            {[50, 100, 500, 1000, 5000].map((n) => (
              <Chip
                radius="md"
                onClick={() => form.setFieldValue("tickets", n)}
                checked={form.values.tickets === n}
                key={n}
                disabled={currentUser?.tickets! < n}
              >
                {n}
              </Chip>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="default" onClick={() => setOpened(false)}>
              Nevermind
            </Button>
            <Button leftIcon={<HiTicket />} type="submit">
              Confirm
            </Button>
          </div>
        </form>
      </Modal>
      <Button
        leftIcon={<HiReceiptTax />}
        onClick={() => {
          setOpened(true);
        }}
      >
        Donate
      </Button>
    </>
  );
};

export default Donate;
