import TeamsProvider from "@/components/teams/teams";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";

type TeamsIssuesProps = {
  user: User;
};

const TeamsIssues: React.FC<TeamsIssuesProps> = ({ user }) => {
  return (
    <TeamsProvider
      user={user}
      title="Issues"
      description="Overview of issues in your teams."
    >
      <p>Test</p>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default TeamsIssues;
