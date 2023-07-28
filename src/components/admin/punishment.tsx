import Stateful from "@/components/stateful";
import banPresets from "@/data/banPresets";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import {
  Anchor,
  Avatar,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiCheckCircle, HiShieldCheck } from "react-icons/hi";

interface IPunishmentForm {
  category: "warning" | "ban";
  reason: string;
  expires?: Date;
  madeConfluenceReport?: boolean;
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
  const [presetOpened, setPresetsOpened] = useState(false);

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
      madeConfluenceReport: false,
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
    <>
      <Modal
        title="Choose template"
        opened={presetOpened}
        onClose={() => {
          setPresetsOpened(false);
          setPunishOpened(true);
        }}
      >
        <Stateful>
          {(preset, setPreset) => (
            <>
              <Select
                label="Reason templates"
                description="Select a reason template"
                data={banPresets.map((preset) => ({
                  label: preset,
                  value: preset,
                }))}
                onChange={(value) => {
                  setPreset(value);
                }}
                searchable
              />
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="default"
                  onClick={() => {
                    setPresetsOpened(false);
                    setPunishOpened(true);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (preset) {
                      punishmentForm.setFieldValue("reason", preset);
                      setPresetsOpened(false);
                      setPunishOpened(true);
                    }
                  }}
                >
                  Select
                </Button>
              </div>
            </>
          )}
        </Stateful>
      </Modal>
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

            <div>
              <Textarea
                label="Reason"
                description="Explain the punishment"
                minRows={4}
                mb={4}
                {...punishmentForm.getInputProps("reason")}
              />
              <Anchor
                onClick={() => {
                  setPresetsOpened(true);
                  setPunishOpened(false);
                }}
                size="sm"
              >
                Choose template
              </Anchor>
            </div>

            <Select
              label="Expires"
              description="Select punishment expiration date"
              disabled={punishmentForm.values.category === "warning"}
              data={[
                {
                  label: "1 day",
                  value: new Date(
                    Date.now() + 1 * 24 * 60 * 60 * 1000
                  ).toDateString(),
                },
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
            <Checkbox
              label={
                <>
                  I documented this punishment in Confluence
                  <br />
                  <Tooltip
                    classNames={{
                      tooltip: clsx(
                        "max-w-xs break-words",
                        "whitespace-pre-wrap"
                      ),
                    }}
                    label={
                      <>
                        <span>
                          You must be logged into Confluence to see the example,
                          contact HR if you cannot access it.
                        </span>
                        <br />
                        <br />
                        <span>
                          This example uses accordions to organize dates
                          chronologically, along with
                        </span>
                        <br />
                        <span>
                          images showing violating content and the corresponding
                          guideline in each alt text.
                        </span>
                      </>
                    }
                  >
                    <Anchor
                      href="https://soodamre.atlassian.net/wiki/spaces/~63937321de5cdaba3a6cd1a7/pages/2031617/user+C3O1L1T"
                      target="_blank"
                      rel="noreferrer"
                    >
                      See example
                    </Anchor>
                  </Tooltip>
                </>
              }
              mt="md"
              {...punishmentForm.getInputProps("madeConfluenceReport", {
                type: "checkbox",
              })}
            />
          </Stack>

          <Button fullWidth type="submit" leftIcon={<HiShieldCheck />}>
            Punish
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default Punishment;
