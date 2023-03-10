import {
  Anchor,
  Badge,
  Button,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Framework from "../components/Framework";
import logout from "../util/api/logout";
import authorizedRoute from "../util/auth";
import { User } from "../util/prisma-types";

const PRIMARY_COL_HEIGHT = 300;

const Punished: React.FC<{
  user: User;
}> = ({ user }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

  useEffect(() => {
    if (!user.banned) {
      router.push("/");
    }
  });

  return (
    <Framework user={user} activeTab="none">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-[37.5rem]">
        <Title order={3} mb="md">
          Account suspended
        </Title>
        <Text color="dimmed" size="sm" mb="xs">
          Your account has been suspended from Framework for violating our{" "}
          <Link href="/terms" passHref>
            <Anchor>Terms of Service</Anchor>
          </Link>{" "}
          and / or the{" "}
          <Link href="/guidelines" passHref>
            <Anchor>Community Guidelines</Anchor>
          </Link>
          .
        </Text>
        <Text color="dimmed" size="sm" mb="lg">
          Please review your ticket below. You may reactivate your account on
          the date posted below, unless you have received a permanent
          suspension.
        </Text>
        <Text color="dimmed" size="sm" weight={700} mb="xs">
          Ban notice
        </Text>
        <Text mb="md">{user.banReason}</Text>
        <Text color="dimmed" size="sm" weight={700} mb="xs">
          Ban expires
        </Text>
        <Text mb="xl" className="flex items-center gap-2">
          {new Date(user.banExpires as Date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {new Date(user.banExpires as Date).getFullYear() === 9999 && (
            <Badge radius="md" color="red">
              Permanent Ban
            </Badge>
          )}
        </Text>
        <Button
          fullWidth
          variant="subtle"
          onClick={async () => {
            if (
              new Date(user.banExpires as Date).getTime() <=
              new Date().getTime()
            ) {
              await fetch("/api/users/@me/unlock", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: String(getCookie(".frameworksession")),
                },
              }).then(() => router.reload());
            } else {
              await logout().then(() => router.reload());
            }
          }}
        >
          {new Date(user.banExpires as Date).getTime() <= new Date().getTime()
            ? "Unlock my account"
            : "Logout of your account"}
        </Button>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Punished;
