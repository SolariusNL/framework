import {
  Avatar,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import getMediaUrl from "../../util/getMedia";
import { NonUser } from "../../util/prisma-types";

interface IPunishmentForm {
  category: "warning" | "ban";
  reason: string;
  expires?: Date;
}

interface PunishmentProps {
  punishOpened: boolean;
  setPunishOpened: (value: boolean) => void;
  user: NonUser;
  onCompleted?: () => void;
  reportAuthor?: number;
}

const Punishment: React.FC<PunishmentProps> = ({
  punishOpened,
  setPunishOpened,
  user = undefined,
  onCompleted = () => {},
  reportAuthor,
}) => {
  const submitPunishment = async (values: IPunishmentForm) => {
    await fetch(`/api/admin/users/${user?.id}/punish/${values.category}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        reason: values.reason,
        ...(reportAuthor &&
          user?.id !== reportAuthor && {
            reportAuthorId: reportAuthor,
          }),
        ...(values.expires && { expires: values.expires }),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (onCompleted) onCompleted();
          showNotification({
            title: "Success",
            message: "Punishment successfully issued.",
            icon: <HiCheckCircle />,
          });
        } else {
          alert("An error occurred while punishing the user.");
        }
      })
      .catch(() => {
        alert("An error occurred while punishing the user.");
      });
  };

  const punishmentForm = useForm<IPunishmentForm>({
    initialValues: {
      category: "warning",
      reason: "",
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    validate: {
      reason: (value) => {
        if (value.length < 3) {
          return "Reason must be at least 3 characters long";
        }
      },
    },
  });

  return (
    <Modal
      title="Punishment"
      opened={punishOpened}
      onClose={() => setPunishOpened(false)}
    >
      <Group mb={24}>
        <Group>
          <Avatar
            size={36}
            src={user && getMediaUrl(user?.avatarUri)}
            radius={99}
          />
          <Stack spacing={3}>
            <Text size="sm" color="dimmed">
              Receiving punishment
            </Text>
            <Text weight={650}>{user?.username}</Text>
          </Stack>
        </Group>
      </Group>

      <form onSubmit={punishmentForm.onSubmit(submitPunishment)}>
        <Stack spacing={8} mb={24}>
          <Select
            label="Category"
            description="Select punishment category"
            data={[
              { label: "Warning", value: "warning" },
              { label: "Ban", value: "ban" },
            ]}
            {...punishmentForm.getInputProps("category")}
          />

          <Textarea
            label="Reason"
            description="Explain the punishment"
            {...punishmentForm.getInputProps("reason")}
          />

          <Select
            label="Expires"
            description="Select punishment expiration date"
            disabled={punishmentForm.values.category === "warning"}
            data={[
              {
                label: "3 days",
                value: new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "7 days",
                value: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "14 days",
                value: new Date(
                  Date.now() + 14 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "30 days",
                value: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "120 days",
                value: new Date(
                  Date.now() + 120 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "365 days",
                value: new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000
                ).toDateString(),
              },
              {
                label: "Permanent",
                value: new Date("9999-12-31T23:59:59.999Z").toDateString(),
              },
            ]}
            {...punishmentForm.getInputProps("expires")}
          />
        </Stack>

        <Button fullWidth type="submit" leftIcon={<HiShieldCheck />}>
          Punish
        </Button>
      </form>
    </Modal>
  );
};

export default Punishment;
