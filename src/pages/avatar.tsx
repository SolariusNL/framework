import ComingSoon from "@/components/coming-soon";
import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSidePropsContext, NextPage } from "next";

interface AvatarProps {
  user: User;
}

const Avatar: NextPage<AvatarProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="avatar">
      <ComingSoon />
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Avatar;
