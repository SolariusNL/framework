import { GetServerSidePropsContext, NextPage } from "next";
import ComingSoon from "@/components/ComingSoon";
import Framework from "@/components/Framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";

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
