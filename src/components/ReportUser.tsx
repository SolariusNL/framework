import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
  Textarea,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import React from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { getCookie } from "../util/cookies";
import { NonUser } from "../util/prisma-types";

interface ReportUserProps {
  user: NonUser;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

export type ReportCategory =
  | "Racist, sexist or otherwise offensive content"
  | "Spam or misleading content"
  | "Inappropriate avatar or profile picture"
  | "Inappropriate username"
  | "Inappropriate profile description"
  | "One of this users games violates the rules"
  | "Other";

export const category = {
  "Racist, sexist or otherwise offensive content": "racist",
  "Spam or misleading content": "spam",
  "Inappropriate avatar or profile picture": "avatar",
  "Inappropriate username": "username",
  "Inappropriate profile description": "description",
  "One of this users games violates the rules": "game",
  Other: "other",
} as const;

const ReportUser = ({ user, opened, setOpened }: ReportUserProps) => {
  const [reason, setReason] = React.useState<ReportCategory>("Other");
  const [description, setDescription] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleReport = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    await fetch(`/api/users/${user.id}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        reason,
        description,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setSuccess(true);
          showNotification({
            title: "Report Successful",
            message: `You have reported ${user.username}`,
            icon: <HiCheckCircle />,
          });
          setOpened(false);
          setReason("Other");
          setDescription("");
          setChecked(false);
          setSuccess(false);
          setError("");
        } else {
          setError(res.message || "Something went wrong");
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={`Reporting ${user.username}`}
    >
      <Text mb={6}>
        By reporting this user, you agree that this report was made in
        accordance with the{" "}
        <Link passHref href="/guidelines" target="_blank">
          <Anchor>Community Guidelines</Anchor>
        </Link>{" "}
        and the{" "}
        <Link passHref href="/terms" target="_blank">
          <Anchor>Terms of Service</Anchor>
        </Link>{" "}
        of Framework.
      </Text>
      <Text mb={14}>
        You also agree that this report was made in good faith and you are not
        alleging that the user is guilty of any wrongdoing.
      </Text>

      <Select
        label="Category"
        description="Choose a category you think suits this report."
        data={Object.keys(category)}
        mb={12}
        value={reason}
        onChange={(v) => setReason(v as ReportCategory)}
      />

      <Textarea
        label="Description"
        description="Describe the report."
        mb={24}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Checkbox
        label="I confirm that I am not alleging that the user is guilty of any wrongdoing."
        mb={12}
        checked={checked}
        onChange={() => setChecked(!checked)}
      />

      {error && (
        <Alert
          mb={12}
          title="Couldn't report"
          icon={<HiXCircle size={24} />}
          color="red"
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          mb={12}
          title="Report sent"
          icon={<HiCheckCircle size={24} />}
          color="green"
        >
          Thank you for reporting this user.
        </Alert>
      )}

      <Button
        disabled={
          !checked || reason === "Other" || description.length < 10 || success
        }
        loading={loading}
        onClick={handleReport}
      >
        Report {user.username}
      </Button>
    </Modal>
  );
};

export default ReportUser;
