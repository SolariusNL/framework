import OuterUI from "@/layouts/OuterUI";
import logout from "@/util/api/logout";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { Button, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import { FC } from "react";
import { HiExclamation, HiLogout } from "react-icons/hi";

type AccountLockedProps = {
  user: User;
};

const AccountLocked: FC<AccountLockedProps> = () => {
  return (
    <OuterUI description="Your account has been locked by a Solarius staff member.">
      <div className="flex items-center gap-2 justify-center">
        <HiExclamation className="text-red-500 flex-shrink-0 w-6 h-6" />
        <Text color="red" weight={600} size="lg">
          Account locked
        </Text>
      </div>
      <Text size="sm" color="dimmed" mt="sm" align="center">
        Your account has been locked for security purposes. Please contact
        Solarius for additional information regarding the status of your
        account.
      </Text>
      <div className="flex justify-center gap-2 mt-6">
        <Button
          leftIcon={<HiLogout />}
          color="red"
          onClick={async () => {
            await logout();
          }}
          radius="xl"
          variant="light"
        >
          Logout
        </Button>
      </div>
    </OuterUI>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  if (auth.redirect) return auth;

  return {
    props: {
      user: auth.props.user,
    },
  };
};

export default AccountLocked;
