import {
  Avatar,
  Group,
  Modal,
  NavLink,
  Select,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { DatePicker, RangeCalendar } from "@mantine/dates";
import { Transaction } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiCalendar,
  HiChartBar,
  HiCurrencyDollar,
  HiFilter,
  HiTicket,
  HiViewList,
} from "react-icons/hi";
import FilterIndicator from "../../components/FilterIndicator";
import Framework from "../../components/Framework";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import TransactionsWidget from "../../components/Widgets/Transactions";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import authorizedRoute from "../../util/auth";
import getMediaUrl from "../../util/get-media";
import { formatNumberWithCommas } from "../../util/num";
import { User } from "../../util/prisma-types";

type TicketsProps = {
  user: User;
};
export type TransactionWithUser = Transaction & {
  to?: User;
  toString?: string;
};
type DateSort =
  | "last-month"
  | "last-week"
  | "last-day"
  | "last-year"
  | "custom"
  | "all-time";
type FilterType = "all" | "inbound" | "outbound";

const tabs = [
  {
    label: "Dashboard",
    description: "An overview of your Tickets",
    icon: <HiTicket />,
  },
  {
    label: "Transactions",
    description: "View your transaction history",
    icon: <HiViewList />,
  },
  {
    label: "Analytics",
    description: "View analytics based on your transactions",
    icon: <HiChartBar />,
  },
];

const Tickets: NextPage<TicketsProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<
    TransactionWithUser[] | null
  >(null);
  const [dateSort, setDateSort] = useState<DateSort>("last-month");
  const [customDateSort, setCustomDateSort] = useState<
    [Date | null, Date | null]
  >([new Date(Date.now() - 2592000000), new Date()]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState(0);
  const [customDateModalOpened, setCustomDateModalOpened] = useState(false);

  const dateFilter = (t: Transaction) => {
    switch (dateSort) {
      case "last-month":
        return new Date(t.createdAt).getTime() > Date.now() - 2592000000;
      case "last-week":
        return new Date(t.createdAt).getTime() > Date.now() - 604800000;
      case "last-day":
        return new Date(t.createdAt).getTime() > Date.now() - 86400000;
      case "last-year":
        return new Date(t.createdAt).getTime() > Date.now() - 31536000000;
      case "custom":
        if (!customDateSort) return;
        if (!customDateSort[0] || !customDateSort[1]) return;
        return (
          new Date(t.createdAt).getTime() > customDateSort[0].getTime()! &&
          new Date(t.createdAt).getTime() < customDateSort[1].getTime()!
        );
      case "all-time":
        return true;
    }
  };

  const InboundTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions
            ?.filter((t) => t.type === "INBOUND")
            .filter((t) => dateFilter(t))
            .map((t) => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td>{t.tickets}T$</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          {transactions?.filter((t) => t.type === "INBOUND").length === 0 && (
            <tr>
              <td className="col-span-full text-dimmed">No data available</td>
              <td />
              <td />
            </tr>
          )}
          <tr>
            <td className="font-semibold">Total</td>
            <td className="font-semibold">
              {transactions
                ?.filter((t) => t.type === "INBOUND")
                .filter((t) => dateFilter(t))
                .reduce((acc, t) => acc + t.tickets, 0)}
              T$
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const OutboundTable = () => {
    return (
      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>To</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions
            ?.filter((t) => t.type === "OUTBOUND")
            .filter((t) => dateFilter(t))
            .map((t) => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td>
                  {t.to ? (
                    <div className="flex items-center gap-2">
                      <Avatar
                        size={20}
                        src={getMediaUrl(t.to.avatarUri)}
                        radius={999}
                      />
                      <Text size="sm" color="dimmed" weight={500}>
                        {t.to.username}
                      </Text>
                    </div>
                  ) : (
                    <Text size="sm" color="dimmed" weight={500}>
                      {t.toString}
                    </Text>
                  )}
                </td>
                <td>{t.tickets}T$</td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          {transactions?.filter((t) => t.type === "OUTBOUND").length === 0 && (
            <tr>
              <td className="col-span-full text-dimmed">No data available</td>
              <td />
              <td />
              <td />
            </tr>
          )}
          <tr>
            <td className="font-semibold">Total</td>
            <td></td>
            <td className="font-semibold">
              {transactions
                ?.filter((t) => t.type === "OUTBOUND")
                .filter((t) => dateFilter(t))
                .reduce((acc, t) => acc + t.tickets, 0)}
              T$
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const getTransactions = async () => {
    await fetch("/api/users/@me/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTransactions(res);
      });
  };

  const customDateModal = (
    <Modal
      title="Choose custom date"
      opened={customDateModalOpened}
      onClose={() => setCustomDateModalOpened(false)}
    >
      <RangeCalendar
        value={customDateSort as [Date | null, Date | null]}
        onChange={setCustomDateSort}
        size="lg"
      />
    </Modal>
  );

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <Framework
      user={user}
      activeTab="none"
      modernTitle="Tickets"
      modernSubtitle="Manage your tickets, view transactions, and more."
    >
      {customDateModal}
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <Link passHref href="/tickets/buy">
            <ShadedButton className="mb-4">
              <Group>
                <HiCurrencyDollar size={24} />
                <Title order={2}>{formatNumberWithCommas(user.tickets)}</Title>
              </Group>
            </ShadedButton>
          </Link>
          {tabs.map((tab, i) => (
            <NavLink
              key={i}
              className="rounded-md"
              label={tab.label}
              description={tab.description}
              icon={tab.icon}
              active={activeTab === i}
              onClick={() => setActiveTab(i)}
            />
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {activeTab === 0 && (
            <>
              <div className="flex items-center gap-4">
                <Select
                  value={dateSort}
                  onChange={(v: DateSort) => {
                    setDateSort(v as DateSort);
                    if (v === "custom") setCustomDateModalOpened(true);
                  }}
                  icon={<HiCalendar />}
                  label="Date sort"
                  description="Sort transactions by date"
                  data={[
                    { label: "Last month", value: "last-month" },
                    { label: "Last week", value: "last-week" },
                    { label: "Last day", value: "last-day" },
                    { label: "Last year", value: "last-year" },
                    { label: "Custom date", value: "custom" },
                    { label: "All time", value: "all-time" },
                  ]}
                  placeholder="Date sort"
                />
                <Select
                  value={filter}
                  onChange={(v) => {
                    setFilter(v as FilterType);
                  }}
                  icon={<HiFilter />}
                  label="Filter"
                  description="Filter transactions by type"
                  data={[
                    { label: "All", value: "all" },
                    { label: "Inbound", value: "inbound" },
                    { label: "Outbound", value: "outbound" },
                  ]}
                  placeholder="Filter"
                />
              </div>
              {dateSort === "custom" && (
                <>
                  <FilterIndicator
                    className="mt-4"
                    onClick={() => setDateSort("last-month")}
                    text="Sorting by custom date"
                  />
                  <div className="flex items-center gap-4 mt-2">
                    <DatePicker
                      label="From"
                      description="The start of the date range"
                      value={customDateSort[0]}
                      onChange={(v) => {
                        setCustomDateSort([v, customDateSort[1]]);
                      }}
                      placeholder="From"
                      icon={<HiCalendar />}
                      clearable={false}
                    />
                    <DatePicker
                      label="To"
                      description="The end of the date range"
                      value={customDateSort[1]}
                      onChange={(v) => {
                        setCustomDateSort([customDateSort[0], v]);
                      }}
                      placeholder="To"
                      icon={<HiCalendar />}
                      clearable={false}
                    />
                  </div>
                </>
              )}
              <div className="mt-6">
                {filter === "all" && (
                  <div className="flex flex-col">
                    <div className="mb-4">
                      <Section
                        title="Inbound"
                        description="Your inbound expenditures."
                      />
                      <InboundTable />
                    </div>
                    <Section
                      title="Outbound"
                      description="Your outbound expenditures."
                    />
                    <OutboundTable />
                  </div>
                )}
                {filter === "inbound" && <InboundTable />}
                {filter === "outbound" && <OutboundTable />}
              </div>
            </>
          )}
          {activeTab === 1 && (
            <TransactionsWidget
              onTransactionsLoaded={setTransactions}
              user={user}
            />
          )}
          {activeTab === 2 && (
            <div className="flex items-center justify-center">
              <ModernEmptyState
                title="Coming soon"
                body="Ticket analytics are temporarily unavailable while we fix up some bugs."
              />
            </div>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Tickets;
