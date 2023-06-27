import { GetServerSidePropsContext } from "next";
import { FC } from "react";
import ComingSoon from "@/components/ComingSoon";
import Framework from "@/components/Framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";

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
