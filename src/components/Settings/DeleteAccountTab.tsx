import {
  Button,
  List,
  Modal,
  PasswordInput,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiCheck,
  HiInformationCircle,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { User } from "../../util/prisma-types";
import ShadedCard from "../ShadedCard";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface DeleteAccountTabProps {
  user: User;
}

const DeleteAccountTab = ({ user }: DeleteAccountTabProps) => {
  const [opened, setOpened] = useState(false);
  const { colors } = useMantineTheme();
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <>
      <SettingsTab tabValue="deleteaccount" tabTitle="Delete Account">
        <SideBySide
          title="Delete your account"
          description="This will delete your account and all of your data. This action cannot be undone."
          icon={<HiTrash />}
          right={
            <Button
              fullWidth
              leftIcon={<HiTrash />}
              color="red"
              onClick={() => setOpened(true)}
              disabled={user.role === "ADMIN"}
            >
              Delete Account
            </Button>
          }
          actions={
            <div className="gap-2 flex flex-col">
              <div className="flex items-start gap-2">
                <HiInformationCircle
                  color={colors.gray[5]}
                  className="flex-0.3"
                />
                <Text color="dimmed" size="sm" className="flex-1">
                  This is <span className="font-bold">permanent</span> and
                  cannot be undone. All data associated with your account will
                  be deleted forever, including your games, plugins, Ticket
                  balances, and more.
                </Text>
              </div>
              <div className="flex items-start gap-2">
                <HiInformationCircle
                  color={colors.gray[5]}
                  className="flex-0.3"
                />
                <Text color="dimmed" size="sm" className="flex-1">
                  This feature is experimental and may not work as expected,
                  contact us directly if account deletion fails.
                </Text>
              </div>
            </div>
          }
          noUpperBorder
          shaded
        />
      </SettingsTab>

      <Modal
        title="Account deletion"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <Text mb={8}>
          Are you sure you want to delete your account? This action cannot be
          undone. Here is a non-exhaustive list of things that will be
          permanently erased:
        </Text>
        <ShadedCard mb={16}>
          <List
            icon={
              <ThemeIcon color="red" radius="xl" size={24} variant="light">
                <HiXCircle />
              </ThemeIcon>
            }
            spacing="sm"
          >
            <List.Item>
              Your account information & files (avatars, cover images, etc.)
            </List.Item>
            <List.Item>
              Your games (all versions will be erased from our servers, only
              local copies will remain)
            </List.Item>
            <List.Item>Your plugins</List.Item>
            <List.Item>
              Your Ticket balance (and existing withdrawals)
            </List.Item>
          </List>
        </ShadedCard>
        <PasswordInput
          label="Confirm password"
          description="Confirm your identity to proceed"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        <Button
          fullWidth
          color="red"
          mt={32}
          leftIcon={<HiTrash />}
          onClick={async () => {
            await fetch("/api/users/@me/delete", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: String(getCookie(".frameworksession")),
              },
              body: JSON.stringify({
                password,
              }),
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.success) {
                  showNotification({
                    title: "Account deleted",
                    message:
                      "Your account has been deleted. Thanks for being a member of Framework. We wish you the best of luck in your future endeavors.",
                    icon: <HiCheck />,
                  });
                } else {
                  showNotification({
                    title: "Error",
                    message: res.error || "An unknown error occurred.",
                    color: "red",
                    icon: <HiXCircle />,
                  });
                }
              })
              .finally(() => {
                setOpened(false);
                setPassword("");
              });
          }}
        >
          Delete Account
        </Button>
      </Modal>
    </>
  );
};

export default DeleteAccountTab;
