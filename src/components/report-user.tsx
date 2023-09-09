import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { NonUser } from "@/util/prisma-types";
import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  Select,
  Text,
  TextInput,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import React from "react";
import { HiCheckCircle, HiOutlineUpload, HiXCircle } from "react-icons/hi";
import Descriptive from "./descriptive";
import InlineError from "./inline-error";

type ReportUserProps = {
  user: NonUser;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  game?: number;
};
type ReportForm = {
  reason: ReportCategory;
  description: string;
  links: string[];
  terms: boolean;
};

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
  const [loading, setLoading] = React.useState(false);

  const form = useForm<ReportForm>({
    initialValues: {
      reason: "Other",
      description: "",
      links: [],
      terms: false,
    },
    validate: {
      description: (value) => {
        if (!value) return "Description cannot be empty";
        if (value.length > 256 || value.length < 3)
          return "Description must exceeed 3 characters and may not surpass 256 characters.";
      },
    },
  });

  const handleReport = async (values: ReportForm) => {
    setLoading(true);

    await fetchJson<IResponseBase>(`/api/abuse/${user.id}/new`, {
      method: "POST",
      body: values,
      auth: true,
    })
      .then((res) => {
        if (res.success) {
          showNotification({
            title: "Report Successful",
            message: `You have reported ${user.username}`,
            icon: <HiCheckCircle />,
          });
          setOpened(false);
          form.reset();
        } else {
          showNotification({
            title: "Error",
            message: res.message,
            icon: <HiXCircle />,
            color: "red",
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={`Report ${user.username} for abuse`}
      className={useMantineColorScheme().colorScheme}
    >
      <Text size="sm" color="dimmed" className="mb-6">
        Please review and fill out the report abuse form below. We will review
        your report and take action as soon as possible. Thank you for helping
        keep Framework safe!
      </Text>

      <form onSubmit={form.onSubmit(handleReport)}>
        <Select
          label="Category"
          description="Choose a category you think suits this report."
          data={Object.keys(category)}
          className="mb-2"
          required
          {...form.getInputProps("reason")}
        />
        <Textarea
          label="Description"
          description="Describe the report."
          required
          placeholder="This user was being rude and was using offensive language."
          {...form.getInputProps("description")}
        />
        <div className="mt-3 mb-6">
          <Descriptive
            title="URLs"
            description="Insert URLs pointing to abusive content"
            required
          >
            {form.values.links.length > 0 ? (
              form.values.links.map((_l, index) => (
                <div className="flex gap-2 items-center" key={index}>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => form.removeListItem("links", index)}
                  >
                    <HiXCircle />
                  </ActionIcon>
                  <TextInput
                    placeholder="Enter a URL to violating content"
                    className="flex-1"
                    {...form.getInputProps(`links.${index}` as const)}
                  />
                </div>
              ))
            ) : (
              <InlineError variant="info" title="No URLs">
                To facilitate the moderation process, we suggest that you
                include URLs of content that violates the rules.
              </InlineError>
            )}
            <div className="mt-1 flex justify-end gap-2">
              <Button
                radius="xl"
                variant="light"
                disabled={form.values.links.length === 5}
                onClick={() => {
                  form.insertListItem("links", window.location.href);
                }}
              >
                Paste current URL
              </Button>
              <Button
                radius="xl"
                variant="light"
                onClick={() => form.insertListItem("links", "")}
                disabled={form.values.links.length === 5}
              >
                Add
              </Button>
            </div>
          </Descriptive>
        </div>
        <Checkbox
          label="I confirm that this report is submitted in an honest manner and is not a false allegation of misconduct."
          size="sm"
          {...form.getInputProps("terms", {
            type: "checkbox",
          })}
        />
        <div className="flex justify-end mt-6 gap-2">
          <Button
            radius="xl"
            variant="light"
            color="gray"
            onClick={() => setOpened(false)}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            variant="light"
            radius="xl"
            leftIcon={<HiOutlineUpload />}
            type="submit"
          >
            Report {user.username}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportUser;
