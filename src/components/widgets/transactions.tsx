import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import { TransactionWithUser } from "@/pages/tickets";
import getMediaUrl from "@/util/get-media";
import { User } from "@/util/prisma-types";
import { Avatar, Badge, Pagination, Stack, Text } from "@mantine/core";
import { TransactionType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiArrowRight, HiShoppingCart, HiTicket } from "react-icons/hi";

interface TransactionWidgetProps {
  user: User;
  onTransactionsLoaded?: (transactions: TransactionWithUser[]) => void;
}

const TransactionsWidget = ({
  user,
  onTransactionsLoaded,
}: TransactionWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<
    TransactionWithUser[] | null
  >(null);
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
      <div className="w-full flex items-center justify-center">
        <Pagination
          total={Math.ceil((transactions?.length || 16) / 8)}
          page={page}
          onChange={setPage}
          radius="md"
          mb="md"
        />
      </div>
      <Stack>
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
                  {t.type === TransactionType.OUTBOUND ? (
                    <HiShoppingCart
                      size={20}
                      className="flex items-center justify-center"
                    />
                  ) : (
                    <HiTicket
                      size={20}
                      className="flex items-center justify-center"
                    />
                  )}
                </Badge>
                <div className="flex flex-col md:ml-4 mt-4 md:mt-0">
                  <div className="flex flex-row gap-2 items-center">
                    <HiArrowRight color="#868E96" />
                    {t.to ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          size={24}
                          radius={999}
                          src={getMediaUrl(t.to.avatarUri)}
                        />
                        <Text size="lg">{t.to.username}</Text>
                      </div>
                    ) : (
                      <Text size="lg" weight={600}>
                        {t.toString}
                      </Text>
                    )}
                  </div>
                  <Text size="sm" color="dimmed">
                    {t.description}
                  </Text>
                </div>
              </div>
              <div className="text-right">
                {t.type === TransactionType.OUTBOUND ? (
                  <Text size="lg" weight={600} color="#FF6B6B">
                    -{t.tickets}T$
                  </Text>
                ) : (
                  <Text size="lg" weight={600} color="#3FC380">
                    +{t.tickets}T$
                  </Text>
                )}
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
        {transactions !== null && transactions.length === 0 && (
          <ShadedCard>
            <ModernEmptyState
              title="No transactions"
              body="Nothing to see here yet."
            />
          </ShadedCard>
        )}
      </Stack>
    </>
  );
};

export default TransactionsWidget;
