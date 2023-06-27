import { GetServerSidePropsContext } from "next";
import Framework from "@/components/Framework";
import TransactionsWidget from "@/components/Widgets/Transactions";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";

interface TransactionProps {
  user: User;
}

const Transactions = ({ user }: TransactionProps) => {
  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Transactions"
      modernSubtitle="View your transaction history"
    >
      <TransactionsWidget user={user} />
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Transactions;
