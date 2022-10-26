import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiCheck,
  HiExclamation,
  HiKey,
  HiLockClosed,
  HiMail,
  HiPencil,
  HiXCircle,
} from "react-icons/hi";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface SecurityTabProps {
  user: User;
}

const SecurityTab = ({ user }: SecurityTabProps) => {
  const [passwordModal, setPasswordModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const router = useRouter();

  const sendEmailVerification = async () => {
    await fetch("/api/users/@me/verifyemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => setEmailVerificationSent(true));
  };

  const changePassword = async () => {
    await fetch("/api/users/@me/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        oldPassword: currentPassword,
        newPassword,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push("/login");
        } else {
          alert(res.message || "Something went wrong");
        }
      })
      .catch((err) => {
        alert(err.message || "Something went horribly wrong");
      });
  };

  const changeEmail = async () => {
    await fetch("/api/users/@me/changeemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        newEmail,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.message || "Something went wrong");
        }
      })
      .catch((err) => {
        alert(err.message || "Something went horribly wrong");
      });
  };

  return (
    <>
      <Modal
        title="Change Password"
        opened={passwordModal}
        onClose={() => setPasswordModal(false)}
      >
        <TextInput
          label="Current Password"
          description="Enter your current password that you use to login"
          mb={6}
          type="password"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextInput
          label="New Password"
          description="Enter your new password"
          mb={12}
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Alert
          color="orange"
          title="Warning"
          icon={<HiXCircle size={18} />}
          mb={12}
        >
          You will be logged out after changing your password.
        </Alert>
        <Button onClick={changePassword}>Confirm</Button>
      </Modal>

      <Modal
        title="Change Email"
        opened={emailModal}
        onClose={() => setEmailModal(false)}
      >
        <TextInput
          label="New Email"
          description="We will send you an email to verify your new email address. Your existing email address will no longer be valid."
          mb={12}
          type="email"
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Button onClick={changeEmail}>Confirm</Button>
      </Modal>

      <SettingsTab tabValue="security" tabTitle="Security">
        <Stack>
          <SideBySide
            title="Password"
            description="Your password is used to log in to your account."
            right={
              <PasswordInput
                label="Password"
                description="Your password"
                disabled
                icon={<HiLockClosed />}
                value="********"
              />
            }
            icon={<HiKey />}
            actions={
              <Button
                onClick={() => setPasswordModal(true)}
                leftIcon={<HiKey />}
                fullWidth
              >
                Change password
              </Button>
            }
          />

          <SideBySide
            title="Email"
            description="Your email address is used to log in to your account. You can also use it to reset your password."
            right={
              <div>
                <TextInput
                  disabled
                  label="Email"
                  description="Your email address"
                  value={user.email}
                  icon={<HiLockClosed />}
                />
                {!user.emailVerified && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <HiExclamation />
                    <Text color="dimmed">
                      You have not verified your email address.
                    </Text>
                  </div>
                )}
              </div>
            }
            icon={<HiMail />}
            actions={
              <Group grow>
                <Button
                  leftIcon={<HiCheck />}
                  onClick={sendEmailVerification}
                  disabled={emailVerificationSent || user.emailVerified}
                >
                  {user.emailVerified
                    ? "Verified"
                    : emailVerificationSent
                    ? "Sent!"
                    : "Verify email"}
                </Button>
                <Button
                  leftIcon={<HiPencil />}
                  onClick={() => setEmailModal(true)}
                >
                  Change email
                </Button>
              </Group>
            }
          />
        </Stack>
      </SettingsTab>
    </>
  );
};

export default SecurityTab;
