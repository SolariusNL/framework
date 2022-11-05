import { Pagination, ScrollArea, Skeleton, Table } from "@mantine/core";
import { Transaction } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { User } from "../../util/prisma-types";
import Copy from "../Copy";
import ModernEmptyState from "../ModernEmptyState";

interface TransactionWidgetProps {
  user: User;
}

const TransactionsWidget = ({ user }: TransactionWidgetProps) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [page, setPage] = useState(1);

  const getTransactions = async () => {
    await fetch(`/api/users/@me/transactions/${page}`, {
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
      });
  };

  useEffect(() => {
    getTransactions();
  }, []);

  return (
    <>
      <ScrollArea>
        <Table striped mb={20}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>To</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions !== null &&
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td style={{ display: "flex", alignItems: "center" }}>
                    <Copy value={transaction.id} />
                    {transaction.id.slice(0, 8)}...
                  </td>
                  <td>{transaction.to}</td>
                  <td>{transaction.tickets}</td>
                  <td>{transaction.description}</td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

            {transactions !== null && transactions.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <ModernEmptyState
                    title="No transactions found"
                    body="You have no transactions to display."
                  />
                </td>
              </tr>
            )}

            {loading &&
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td>
                    <Skeleton width={100} height={18} />
                  </td>
                  <td>
                    <Skeleton width={100} height={18} />
                  </td>
                  <td>
                    <Skeleton width={40} height={18} />
                  </td>
                  <td>
                    <Skeleton width={120} height={18} />
                  </td>
                  <td>
                    <Skeleton width={100} height={18} />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </ScrollArea>

      <Pagination
        total={Math.ceil(
          (transactions?.length && transactions.length / 10) || 0
        )}
        page={page}
        onChange={setPage}
      />
    </>
  );
};

export default TransactionsWidget;
