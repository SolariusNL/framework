import Developer from "@/layouts/DeveloperLayout";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSidePropsContext } from "next";

interface DeveloperProps {
  user: User;
}
const DeveloperHome: React.FC<DeveloperProps> = ({ user }) => {
  return (
    <Developer
      user={user}
      title="Developer"
      description="Manage your development tools, workflows, API keys, servers and more."
    >
      <></>
    </Developer>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default DeveloperHome;
