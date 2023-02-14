import { Alert, Anchor } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import React from "react";
import { HiExclamationCircle } from "react-icons/hi";

interface EmailReminderProps {
  setWarningSeen: (val: boolean | ((prev: boolean) => boolean)) => void;
}

const EmailReminder = ({ setWarningSeen }: EmailReminderProps) => {
  return (
    <Alert
      color="orange"
      title="Verify your email"
      icon={<HiExclamationCircle size={36} />}
      mb={16}
      withCloseButton
      onClose={() => setWarningSeen(true)}
    >
      We recommend verifying your email address to ensure you are able to
      receive important messages.{" "}
      <Link href="/settings/security">
        <Anchor>Go to settings</Anchor>
      </Link>
    </Alert>
  );
};

export default EmailReminder;
