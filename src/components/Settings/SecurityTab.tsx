import { Alert, Button, Grid, Group, Modal, TextInput } from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiCheck, HiKey, HiPencil, HiXCircle } from "react-icons/hi";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
import Descriptive from "../Descriptive";
import { updateAccount } from "./AccountTab";
import SettingsTab from "./SettingsTab";

interface SecurityTabProps {
  user: User;
}

const SecurityTab = ({ user }: SecurityTabProps) => {
  const [success, setSuccess] = useState(false);
  const mobile = useMediaQuery("768");
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
          mb={6}
          type="password"
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextInput
          label="New Password"
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
        <Grid columns={2} gutter="xl">
          <Grid.Col span={mobile ? 2 : 1}>
            <Descriptive title="Password" description="Change your password.">
              <Button
                onClick={() => setPasswordModal(true)}
                leftIcon={<HiKey />}
              >
                Change password
              </Button>
            </Descriptive>
          </Grid.Col>

          <Grid.Col span={mobile ? 2 : 1}>
            <Descriptive
              title="Email"
              description="Verify or change your email."
            >
              <Group>
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
            </Descriptive>
          </Grid.Col>
        </Grid>
      </SettingsTab>
    </>
  );
};

export default SecurityTab;
