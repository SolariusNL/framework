import {
  Anchor,
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
  Textarea,
} from "@mantine/core";
import Link from "next/link";
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

const category = {
  "Racist, sexist or otherwise offensive content": "racist",
  "Spam or misleading content": "spam",
  "Inappropriate avatar or profile picture": "avatar",
  "Inappropriate username": "username",
  "Inappropriate profile description": "description",
  "One of this users games violates the rules": "game",
  Other: "other",
} as const;

const ReportUser = ({ user, opened, setOpened }: ReportUserProps) => {
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
        <Link passHref href="/tos" target="_blank">
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
      />

      <Textarea
        label="Description"
        description="Describe the report."
        mb={24}
      />
      <Checkbox
        label="I confirm that I am not alleging that the user is guilty of any wrongdoing."
        mb={12}
      />
      <Button disabled>Report {user.username}</Button>
    </Modal>
  );
};

export default ReportUser;
