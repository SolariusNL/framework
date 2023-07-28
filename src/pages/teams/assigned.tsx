import TeamsProvider from "@/components/teams/teams";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";

type TeamsAssignedProps = {
  user: User;
};

const TeamsAssigned: React.FC<TeamsAssignedProps> = ({ user }) => {
  return (
    <TeamsProvider
      user={user}
      title="Assigned"
      description="Manage tasks assigned to you."
    >
      <p>Test</p>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default TeamsAssigned;
