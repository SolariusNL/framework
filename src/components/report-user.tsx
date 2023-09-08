import { getCookie } from "@/util/cookies";
import { NonUser } from "@/util/prisma-types";
import {
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import { HiCheckCircle, HiOutlineUpload } from "react-icons/hi";
import InlineError from "./inline-error";

interface ReportUserProps {
  user: NonUser;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  game?: number;
}

export type ReportCategory =
  | "Racist, sexist or otherwise offensive content"
  | "Hacking or cheating in game"
  | "Spam or misleading content"
  | "Inappropriate avatar or profile picture"
  | "Inappropriate username"
  | "Inappropriate profile description"
  | "One of this users games violates the rules"
  | "Other";

export const category = {
  "Racist, sexist or otherwise offensive content": "racist",
  "Hacking or cheating in game": "hacking",
  "Spam or misleading content": "spam",
  "Inappropriate avatar or profile picture": "avatar",
  "Inappropriate username": "username",
  "Inappropriate profile description": "description",
  "One of this users games violates the rules": "game",
  Other: "other",
} as const;

const ReportUser = ({ user, opened, setOpened, game }: ReportUserProps) => {
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
        ...(game && { game }),
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
      className={useMantineColorScheme().colorScheme}
    >
      <Text size="sm" color="dimmed" className="mb-6">
        Please review and fill out the report abuse form below. We will review
        your report and take action as soon as possible. Thank you for helping
        keep Framework safe!
      </Text>

      <Select
        label="Category"
        description="Choose a category you think suits this report."
        data={Object.keys(category)}
        mb={12}
        value={reason}
        onChange={(v) => setReason(v as ReportCategory)}
        required
      />

      <Textarea
        label="Description"
        description="Describe the report."
        mb={24}
        required
        placeholder="This user was being rude and was using offensive language."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Checkbox
        label="I agree that this report is being made in good faith and is not a false accusation of wrongdoing."
        checked={checked}
        onChange={() => setChecked(!checked)}
      />

      {error && (
        <InlineError className="my-6" title="Couldn't report" variant="error">
          {error}
        </InlineError>
      )}
      {success && (
        <InlineError className="my-6" title="Report sent" variant="success">
          Thank you for reporting this user.
        </InlineError>
      )}

      <div className="flex justify-end mt-6 gap-2">
        <Button
          disabled={!checked || description.length < 10 || success}
          loading={loading}
          onClick={handleReport}
          variant="light"
          radius="xl"
          leftIcon={<HiOutlineUpload />}
        >
          Report {user.username}
        </Button>
      </div>
    </Modal>
  );
};

export default ReportUser;
