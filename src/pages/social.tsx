import ComingSoon from "@/components/coming-soon";
import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { GetServerSidePropsContext } from "next";
import { FC } from "react";

type SocialProps = {
  user: User;
};

const Social: FC<SocialProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="social">
      <ComingSoon />
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Social;
