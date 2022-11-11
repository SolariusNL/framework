import {
  Button,
  Card,
  Group,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { HiCurrencyDollar } from "react-icons/hi";
import Framework from "../../components/Framework";
import TransactionsWidget from "../../components/Widgets/Transactions";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";

interface TicketsProps {
  user: User;
}

const Tickets: NextPage<TicketsProps> = ({ user }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework
      user={user}
      activeTab="none"
      modernTitle="Tickets"
      modernSubtitle="Manage your tickets, view transactions, and more."
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: mobile ? "100%" : "30%",
          }}
        >
          <Card withBorder shadow="md">
            <Card.Section withBorder inheritPadding py="xs" mb={16}>
              <Text weight={500} size="sm" color="dimmed">
                Your Ticket Balance
              </Text>
            </Card.Section>
            <Link passHref href="/tickets/buy">
              <UnstyledButton
                sx={(theme) => ({
                  borderRadius: theme.radius.md,
                  color:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.black,

                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[8]
                        : theme.colors.gray[0],
                  },
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                })}
                mb={16}
              >
                <Group>
                  <HiCurrencyDollar size={24} />
                  <Title order={2}>{user.tickets}</Title>
                </Group>
              </UnstyledButton>
            </Link>

            <Text size="sm" color="dimmed" mb={16}>
              Tickets are used to purchase digital goods and services from
              developers, purchase cosmetics for your avatar, and more.
            </Text>

            <Link passHref href="/tickets/buy">
              <Button size="sm" variant="default" fullWidth>
                Buy Tickets
              </Button>
            </Link>
          </Card>
        </div>

        <div
          style={{
            width: mobile ? "100%" : "66%",
            marginTop: mobile ? 16 : 0,
          }}
        >
          <Title order={3} mb={16}>
            Transactions
          </Title>

          <TransactionsWidget user={user} />
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Tickets;
