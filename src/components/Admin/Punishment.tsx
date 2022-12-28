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
        reportAuthorId: reportAuthor,
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
        </Stack>

        <Button fullWidth type="submit" leftIcon={<HiShieldCheck />}>
          Punish
        </Button>
      </form>
    </Modal>
  );
};

export default Punishment;
