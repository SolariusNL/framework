import {
  Button,
  Group,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { Transaction } from "@prisma/client";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title as ChartTitle,
  Tooltip,
} from "chart.js";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { HiChartBar, HiCurrencyDollar, HiViewList } from "react-icons/hi";
import Framework from "../../components/Framework";
import ShadedCard from "../../components/ShadedCard";
import TabNav from "../../components/TabNav";
import TransactionsWidget from "../../components/Widgets/Transactions";
import authorizedRoute from "../../util/auth";
import useMediaQuery from "../../util/media-query";
import { User } from "../../util/prisma-types";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartTitle,
  Tooltip
);

interface TicketsProps {
  user: User;
}

const Tickets: NextPage<TicketsProps> = ({ user }) => {
  const mobile = useMediaQuery("768");
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

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
          <ShadedCard shadow="md">
            <Link passHref href="/tickets/buy">
              <UnstyledButton
                sx={(theme) => ({
                  borderRadius: theme.radius.md,
                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[7]
                        : theme.colors.gray[3],
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
              <Button size="sm" variant="subtle" fullWidth color="gray">
                Buy Tickets
              </Button>
            </Link>
          </ShadedCard>
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

          <TabNav defaultValue="general">
            <TabNav.List mb={16}>
              <TabNav.Tab value="general" icon={<HiViewList />}>
                General
              </TabNav.Tab>
              <TabNav.Tab value="statistics" icon={<HiChartBar />}>
                Statistics
              </TabNav.Tab>
            </TabNav.List>
            <Tabs.Panel value="general">
              <ShadedCard shadow="sm">
                <TransactionsWidget
                  onTransactionsLoaded={setTransactions}
                  user={user}
                />
              </ShadedCard>
            </Tabs.Panel>
            <Tabs.Panel value="statistics">
              <div>
                <div className="mb-6">
                  <ShadedCard shadow="sm">
                    <Line
                      data={{
                        labels: [
                          ...Array.from({ length: 6 }, (_, i) => {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            return date.toLocaleString("default", {
                              month: "short",
                            });
                          }).reverse(),
                        ],
                        datasets: [
                          {
                            label: "Tickets",
                            data: [
                              ...Array.from({ length: 6 }, (_, i) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() - i);
                                return transactions?.filter(
                                  (transaction) =>
                                    new Date(
                                      transaction.createdAt
                                    ).getMonth() === date.getMonth()
                                ).length;
                              }).reverse(),
                            ],
                            fill: false,
                            backgroundColor: "rgb(255, 99, 132)",
                            borderColor: "rgba(255, 99, 132, 0.2)",
                          },
                        ],
                      }}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Transactions in the last 6 months",
                          },
                          tooltip: {
                            callbacks: {
                              label: (context: any) => {
                                return `Transactions: ${context.parsed.y}`;
                              },
                            },
                            enabled: true,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                      }}
                    />
                  </ShadedCard>
                </div>
                <div>
                  <ShadedCard shadow="sm">
                    <Line
                      data={{
                        labels: [
                          ...Array.from({ length: 6 }, (_, i) => {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            return date.toLocaleString("default", {
                              month: "short",
                            });
                          }).reverse(),
                        ],
                        datasets: [
                          {
                            label: "Tickets",
                            data: [
                              ...Array.from({ length: 6 }, (_, i) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() - i);
                                return transactions
                                  ?.filter(
                                    (transaction) =>
                                      new Date(
                                        transaction.createdAt
                                      ).getMonth() === date.getMonth()
                                  )
                                  .reduce(
                                    (acc, transaction) =>
                                      acc + transaction.tickets,
                                    0
                                  );
                              }).reverse(),
                            ],
                            fill: false,
                            backgroundColor: "rgb(0, 230, 118)",
                            borderColor: "rgba(0, 230, 118, 0.2)",
                          },
                        ],
                      }}
                      options={{
                        plugins: {
                          title: {
                            display: true,
                            text: "Tickets spent in the last 6 months",
                          },
                          tooltip: {
                            callbacks: {
                              label: (context: any) => {
                                return `Tickets spent: ${context.parsed.y}`;
                              },
                            },
                            enabled: true,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                          },
                        },
                      }}
                    />
                  </ShadedCard>
                </div>
              </div>
            </Tabs.Panel>
          </TabNav>
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Tickets;
