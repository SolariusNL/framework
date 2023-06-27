import LabelledCheckbox from "@/components/LabelledCheckbox";
import { updateAccount } from "@/components/Settings/AccountTab";
import SettingsTab from "@/components/Settings/SettingsTab";
import SideBySide from "@/components/Settings/SideBySide";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { getCookie } from "@/util/cookies";
import { User } from "@/util/prisma-types";
import {
  Alert,
  Button,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import Image from "next/image";
import { useRouter } from "next/router";
import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiExclamation,
  HiKey,
  HiLockClosed,
  HiMail,
  HiPencil,
  HiXCircle,
} from "react-icons/hi";

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
  const [updated, setUpdated] = useState<any>({});
  const update = (field: string, value: any) => {
    setUpdated({ ...updated, [field]: value });
    setUnsavedChanges(true);
  };
  const router = useRouter();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [twofaPromptOpen, setTwofaPromptOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [base32, setBase32] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const { setUser } = useAuthorizedUserStore();

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

  const disableTwoFactor = async () => {
    await fetch("/api/auth/@me/twofa/disable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => {
      showNotification({
        title: "Two-factor authentication disabled",
        message: "You can re-enable it at any time.",
        icon: <HiCheckCircle />,
      });
    });
  };

  const verifyTwoFactor = async () => {
    await fetch("/api/auth/@me/twofa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: twoFactorCode,
        uid: user.id,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTwofaPromptOpen(false);
          showNotification({
            title: "Two-factor authentication enabled",
            message:
              "Thanks for adding an extra layer of security! You can disable it at any time.",
            icon: <HiCheckCircle />,
          });
        } else {
          showNotification({
            title: "Invalid code",
            message: "Please try again.",
            icon: <HiExclamation />,
          });
          setInvalid(true);
          setTimeout(() => setInvalid(false), 5000);
        }
      });
  };

  useEffect(() => {
    if (twofaPromptOpen) {
      fetch("/api/auth/@me/twofa/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setOtpauthUrl(res.otpauth_url);
          setBase32(res.base32);
        })
        .catch((err) => {
          showNotification({
            title: "Error",
            message: err.message || "Failed to generate OTP credentials",
            icon: <HiExclamation />,
          });
        });
    }
  }, [twofaPromptOpen]);

  useEffect(() => {
    if (otpauthUrl) {
      toDataURL(otpauthUrl).then((url) => setQrUrl(url));
    }
  }, [otpauthUrl]);

  return (
    <>
      <Modal
        title="Change Password"
        opened={passwordModal}
        onClose={() => setPasswordModal(false)}
        className={useMantineColorScheme().colorScheme}
      >
        <TextInput
          label="Current password"
          description="Enter your current password that you use to login"
          mb={6}
          type="password"
          onChange={(e) => setCurrentPassword(e.target.value)}
          classNames={BLACK}
          placeholder="Enter your current password"
          required
        />
        <TextInput
          label="New password"
          description="Enter your new password"
          mb={12}
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
          classNames={BLACK}
          placeholder="Enter your new password"
          required
        />
        <Alert
          color="orange"
          title="Warning"
          icon={<HiXCircle size={18} />}
          mb={12}
        >
          You will be logged out after changing your password.
        </Alert>
        <div className="flex justify-end">
          <Button onClick={changePassword}>Confirm</Button>
        </div>
      </Modal>

      <Modal
        title="Change Email"
        opened={emailModal}
        onClose={() => setEmailModal(false)}
        className={useMantineColorScheme().colorScheme}
      >
        <TextInput
          label="New email"
          description="We will send you an email to verify your new email address. Your existing email address will no longer be valid."
          mb={12}
          type="email"
          onChange={(e) => setNewEmail(e.target.value)}
          classNames={BLACK}
          required
          placeholder="Enter your new email"
        />
        <Button onClick={changeEmail}>Confirm</Button>
      </Modal>

      <Modal
        title="Enable Two-factor Authentication"
        opened={twofaPromptOpen}
        onClose={() => {
          setTwofaPromptOpen(false);
        }}
      >
        <Text mb={16} color="dimmed" size="sm">
          Install an authenticator app on your phone, such as Google
          Authenticator (iOS) or Authy (iOS, Android). Then, scan the QR code
          below.
        </Text>
        <div className="flex gap-4 mb-6 flex-col md:flex-row">
          <div className="flex-1">
            <Image
              src={qrUrl}
              width={256}
              height={256}
              className="rounded-md"
            />
            <Text size="sm" color="dimmed" mt={8}>
              If you cannot scan the QR code, enter the code below manually.
            </Text>
          </div>
          <div className="flex-1">
            <TextInput
              label="Verification Code"
              description="Enter the code from your authenticator app"
              mb={12}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="000000"
              error={invalid ? "Invalid code" : undefined}
              classNames={BLACK}
            />
            <Button
              fullWidth
              onClick={async () => await verifyTwoFactor()}
              leftIcon={<HiCheck />}
            >
              Verify TOTP
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-1">
          <Text size="sm" color="dimmed">
            Key: <span className="font-mono font-semibold">{base32}</span>
          </Text>
          <Text size="sm" color="dimmed">
            Account:{" "}
            <span className="font-mono font-semibold">
              {user.username}@Framework
            </span>
          </Text>
        </div>
      </Modal>

      <SettingsTab
        tabValue="security"
        tabTitle="Security"
        unsaved={unsavedChanges}
        saveButtonAction={async (setLoading, setError) => {
          updateAccount(setLoading, setError, updated, setSuccess);
        }}
        saveButtonLabel="Save"
        setSuccess={setSuccess}
        success={success}
      >
        <Stack spacing={16}>
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
                classNames={BLACK}
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
            shaded
            noUpperBorder
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
                  classNames={BLACK}
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
                    : "Verify"}
                </Button>
                <Button
                  leftIcon={<HiPencil />}
                  onClick={() => setEmailModal(true)}
                >
                  Change
                </Button>
              </Group>
            }
            shaded
            noUpperBorder
          />
          <SideBySide
            title="Verification Methods"
            description="Choose which verification methods you want enabled for your account."
            icon={<HiKey />}
            shaded
            noUpperBorder
            right={
              <Stack spacing={4}>
                {[
                  {
                    pointer: "emailRequiredLogin",
                    title: "Email",
                    description: "Require a code from your inbox.",
                    disabled: !user.emailVerified,
                  },
                  {
                    pointer: "otpEnabled",
                    title: "TOTP",
                    description: "Require a code from your authenticator app.",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setTwofaPromptOpen(true);
                      } else {
                        disableTwoFactor();
                      }
                    },
                  },
                  {
                    pointer: "quickLoginEnabled",
                    title: "Quick Login",
                    description: "Log in to your account through a QR code.",
                  },
                ].map((method) => (
                  <LabelledCheckbox
                    label={method.title}
                    description={method.description}
                    defaultChecked={
                      user[method.pointer as keyof User] as boolean
                    }
                    onChange={(e) => {
                      if (method.onChange) {
                        method.onChange(e);
                      } else {
                        update(method.pointer, e.target.checked);
                      }
                    }}
                    disabled={method.disabled}
                    key={method.pointer}
                  />
                ))}
              </Stack>
            }
          />
        </Stack>
      </SettingsTab>
    </>
  );
};

export default SecurityTab;
