import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import {
  HiBookmark,
  HiChartBar,
  HiDesktopComputer,
  HiKey,
  HiServer,
  HiUsers,
  HiViewGrid,
} from "react-icons/hi";
import Dashboard from "../../components/Admin/Pages/Dashboard";
import Instance from "../../components/Admin/Pages/Instance";
import Invites from "../../components/Admin/Pages/Invites";
import Reports from "../../components/Admin/Pages/Reports";
import Users from "../../components/Admin/Pages/Users";
import Framework from "../../components/Framework";
import TabNav from "../../components/TabNav";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";

const pages: {
  [key: string]: {
    label: string;
    icon: React.ReactNode;
    route: string;
    component: React.ReactNode;
    description: string;
  };
} = {
  dashboard: {
    label: "Dashboard",
    icon: <HiDesktopComputer />,
    route: "/admin",
    component: <Dashboard />,
    description: "Basic information about this instance",
  },
  keys: {
    label: "Keys",
    icon: <HiKey />,
    route: "/admin/keys",
    component: <Invites />,
    description: "Manage invite keys",
  },
  users: {
    label: "Users",
    icon: <HiUsers />,
    route: "/admin/users",
    component: <Users />,
    description: "Manage users, their information & their roles",
  },
  instance: {
    label: "Instance",
    icon: <HiServer />,
    route: "/admin/instance",
    component: <Instance />,
    description: "Manage this Framework instance, update your server, etc.",
  },
  reports: {
    label: "Reports",
    icon: <HiBookmark />,
    route: "/admin/reports",
    component: <Reports />,
    description: "Review reports made by users",
  },
  metrics: {
    label: "Metrics",
    icon: <HiChartBar />,
    route: "/admin/metrics",
    component: <></>,
    description: "View analytics about your instance",
  },
  games: {
    label: "Games",
    icon: <HiViewGrid />,
    route: "/admin/games",
    component: <></>,
    description: "Manage games on your instance",
  },
};

interface AdminPageProps {
  user: User;
  pageStr: string;
}

const AdminPage: NextPage<AdminPageProps> = ({ user, pageStr }) => {
  const page = pages[pages[pageStr] ? pageStr : "dashboard"];
  const router = useRouter();

  return (
    <Framework
      user={user}
      activeTab="none"
      modernTitle={page.label}
      modernSubtitle={page.description}
    >
      <TabNav
        value={pageStr}
        onTabChange={(t) => router.push(String(t))}
        mb={32}
      >
        <TabNav.List>
          {Object.keys(pages).map((p) => (
            <TabNav.Tab key={p} value={p} icon={pages[p].icon}>
              {pages[p].label}
            </TabNav.Tab>
          ))}
        </TabNav.List>
      </TabNav>
      {page.component}
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user = await authorizedRoute(context, true, false, true);
  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "dashboard";

  if (user.redirect) {
    return user;
  }

  if (!pages[pageStr]) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: user.props.user,
      pageStr,
    },
  };
}

export default AdminPage;
