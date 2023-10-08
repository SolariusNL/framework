import Owner from "@/components/owner";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import logout from "@/util/api/logout";
import cast from "@/util/cast";
import { NonUser } from "@/util/prisma-types";
import { Box, Button, Container, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { FC } from "react";
import { HiCheckCircle } from "react-icons/hi";

const ImpersonationBanner: FC = () => {
  const { user } = useAuthorizedUserStore();
  const router = useRouter();

  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === "dark" ? "black" : "white",
        borderBottom: `1px solid ${
          theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[2]
        }`,
      })}
      py="md"
    >
      <Container className="flex justify-between items-center">
        <Text className="flex items-center gap-3" color="dimmed">
          <span className="hidden md:block">You are impersonating </span>
          <Owner user={cast<NonUser>(user)} />
        </Text>
        <Button
          variant="white"
          radius="xl"
          onClick={async () => {
            const newCookie = getCookie(".frameworksession.old");

            await logout().then(() => {
              setCookie(".frameworksession", newCookie);
              deleteCookie(".frameworksession.old");

              router.push("/admin/users");
              showNotification({
                title: "Impersonation stopped",
                message: "You are no longer impersonating this user.",
                icon: <HiCheckCircle />,
              });
            });
          }}
        >
          Stop impersonating
        </Button>
      </Container>
    </Box>
  );
};

export default ImpersonationBanner;
