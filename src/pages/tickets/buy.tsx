import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";

interface BuyTicketsProps {
  user: User;
}

const BuyTickets: NextPage<BuyTicketsProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="none">
      <Title mb={24}>
        Buy Tickets
      </Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default BuyTickets;