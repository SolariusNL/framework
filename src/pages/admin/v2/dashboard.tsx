import AdminLayout, { AdminLayoutPageProps, routes } from "@/layouts/admin-layout";
import { getAdminSSP } from "@/util/admin-route";
import { FC } from "react";

const AdminDashboard: FC<AdminLayoutPageProps> = ({ user }) => {
  return (
    <AdminLayout user={user} activeRoute={routes.home.dashboard}>
      <p>Yes</p>
    </AdminLayout>
  );
};

export const getServerSideProps = getAdminSSP;

export default AdminDashboard;
