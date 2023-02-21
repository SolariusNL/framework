import { GetServerSideProps } from "next";
import TeamsProvider from "../../components/Teams/Teams";
import authorizedRoute from "../../util/auth";
import { User } from "../../util/prisma-types";

type TeamsProps = {
  user: User;
};

const Teams: React.FC<TeamsProps> = ({ user }) => {
  return (
    <TeamsProvider
      user={user}
      title="Teams"
      description="Manage your teams, collaborate, and organize your games."
    >
      <p>Test</p>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default Teams;
