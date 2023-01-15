import { GetServerSidePropsContext } from "next";
import EmployeeDashboardNav, {
  PageName,
} from "../../../components/Admin/EmployeeDashboardNav";
import authorizedRoute from "../../../util/authorizedRoute";
import { User } from "../../../util/prisma-types";

interface EmployeeDashboardProps {
  user: User;
  pageStr: string;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user,
  pageStr,
}) => {
  return <EmployeeDashboardNav activePage={pageStr as PageName} user={user} />;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false, true);
  if (auth.redirect) return auth;

  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "home";

  return {
    props: {
      user: auth.props.user,
      pageStr,
    },
  };
}

export default EmployeeDashboard;
