import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { Text, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Celebration from "react-confetti";
import { HiCheckCircle } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

interface PurchaseSuccessProps {
  user: User;
}

const PurchaseSuccess: NextPage<PurchaseSuccessProps> = ({ user }) => {
  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Purchase Successful"
      modernSubtitle="You have successfully purchased tickets!"
    >
      <ReactNoSSR>
        <Celebration />
      </ReactNoSSR>
      <div className="flex flex-col items-center justify-center">
        <HiCheckCircle size={64} className="text-teal-500 mb-6" />
        <Title order={4} mb={12}>
          Thank you for your purchase!
        </Title>
        <Text color="dimmed">
          Your order will be processed shortly, and your tickets will be added
          to your balance within 5 minutes.
        </Text>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default PurchaseSuccess;
