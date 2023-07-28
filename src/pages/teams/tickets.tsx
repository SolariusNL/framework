import TeamsProvider from "@/components/teams/teams";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";

type TeamsTicketsProps = {
  user: User;
};

const TeamsTickets: React.FC<TeamsTicketsProps> = ({ user }) => {
  return (
    <TeamsProvider
      user={user}
      title="Tickets"
      description="Overview and management of support tickets in your teams."
    >
      <p>Test</p>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default TeamsTickets;
