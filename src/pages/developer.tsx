import { GetServerSidePropsContext } from "next";
import { HiHome, HiKey, HiNewspaper, HiUser } from "react-icons/hi";
import DeveloperActivity from "../components/Developer/Activity";
import DeveloperDashboard from "../components/Developer/Dashboard";
import DeveloperKeys from "../components/Developer/Keys";
import DeveloperProfile from "../components/Developer/Profile";
import Framework from "../components/Framework";
import TabNav from "../components/TabNav";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import ReactNoSSR from "react-no-ssr";

interface DeveloperProps {
  user: User;
}

const Developer: React.FC<DeveloperProps> = ({ user }) => {
  return (
    <Framework
      modernTitle="Developer"
      modernSubtitle="Framework empowers developers to integrate their products with our platform."
      activeTab="none"
      user={user}
    >
      <TabNav defaultValue="dashboard">
        <TabNav.List mb="lg" sx={{ flexWrap: "wrap" }}>
          <TabNav.Tab value="dashboard" icon={<HiHome />}>
            Dashboard
          </TabNav.Tab>
          <TabNav.Tab value="keys" icon={<HiKey />}>
            Keys
          </TabNav.Tab>
          <TabNav.Tab value="activity" icon={<HiNewspaper />}>
            Activity
          </TabNav.Tab>
          <TabNav.Tab value="profile" icon={<HiUser />}>
            Profile
          </TabNav.Tab>
        </TabNav.List>
        {[
          DeveloperDashboard,
          DeveloperKeys,
          DeveloperActivity,
          DeveloperProfile,
        ].map((Component, index) => (
          <ReactNoSSR key={index}>
            <Component />
          </ReactNoSSR>
        ))}
      </TabNav>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default Developer;
