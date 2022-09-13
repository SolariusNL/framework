import { Pagination, ScrollArea, Skeleton, Table } from "@mantine/core";
import { Transaction } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";

interface TransactionProps {
  user: User;
}

const Transactions = ({ user }: TransactionProps) => {
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
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Transactions"
      modernSubtitle="View your transaction history"
    >
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
                  <td>{transaction.id}</td>
                  <td>{transaction.to}</td>
                  <td>{transaction.tickets}</td>
                  <td>{transaction.description}</td>
                  <td>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

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
        total={
          // 10 per page
          Math.ceil((transactions?.length && transactions.length / 10) || 0)
        }
        page={page}
        onChange={setPage}
      />
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Transactions;
