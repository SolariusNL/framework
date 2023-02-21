import { GetServerSideProps } from "next";
import TeamsProvider from "../../components/Teams/Teams";
import authorizedRoute from "../../util/auth";
import { User } from "../../util/prisma-types";

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
