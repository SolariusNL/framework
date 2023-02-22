import { GetServerSideProps } from "next";
import TeamsProvider from "../../components/Teams/Teams";
import authorizedRoute from "../../util/auth";
import { User } from "../../util/prisma-types";

type TeamsGamesProps = {
  user: User;
};

const TeamsGames: React.FC<TeamsGamesProps> = ({ user }) => {
  return (
    <TeamsProvider
      user={user}
      title="Games"
      description="Overview of all games managed by teams you're a part of."
    >
      <p>Test</p>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default TeamsGames;
