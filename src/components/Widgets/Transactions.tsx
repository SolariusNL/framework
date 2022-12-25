import { Badge, Pagination, Stack, Text } from "@mantine/core";
import { Transaction } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiArrowRight, HiShoppingCart } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import ShadedCard from "../ShadedCard";

interface TransactionWidgetProps {
  user: User;
  onTransactionsLoaded?: (transactions: Transaction[]) => void;
}

const TransactionsWidget = ({
  user,
  onTransactionsLoaded,
}: TransactionWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [page, setPage] = useState(1);

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
        setLoading(false);
        if (onTransactionsLoaded) onTransactionsLoaded(res);
      });
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <>
      <Stack mb={16}>
        {transactions !== null &&
          transactions.slice((page - 1) * 8, page * 8).map((t) => (
            <ShadedCard
              key={t.id}
              className="flex items-center justify-between"
            >
              <div className="flex flex-col md:flex-row">
                <Badge
                  sx={{
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  color="green"
                >
                  <HiShoppingCart size={20} />
                </Badge>
                <div className="flex flex-col md:ml-4 mt-4 md:mt-0">
                  <div className="flex flex-row gap-2 items-center">
                    <HiArrowRight color="#868E96" />
                    <Text size="lg" weight={600}>
                      {t.to}
                    </Text>
                  </div>
                  <Text size="sm" color="dimmed">
                    {t.description}
                  </Text>
                </div>
              </div>
              <div className="text-right">
                <Text size="lg" weight={600} color="#FF6B6B">
                  -T${t.tickets}
                </Text>
                <Text color="dimmed">
                  {new Date(t.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </div>
            </ShadedCard>
          ))}
      </Stack>
      <Pagination
        total={Math.ceil((transactions?.length ?? 0) / 8)}
        page={page}
        onChange={setPage}
        radius="xl"
      />
    </>
  );
};

export default TransactionsWidget;
