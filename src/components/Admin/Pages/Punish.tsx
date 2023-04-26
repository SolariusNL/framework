import {
  Anchor,
  Button,
  Divider,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import React, { FC } from "react";
import { HiArrowLeft, HiCheck, HiCheckCircle, HiXCircle } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import { BLACK } from "../../../pages/teams/t/[slug]/issue/create";
import IResponseBase from "../../../types/api/IResponseBase";
import fetchJson from "../../../util/fetch";
import { Section } from "../../Home/FriendsWidget";
import LabelledCheckbox from "../../LabelledCheckbox";
import LoadingIndicator from "../../LoadingIndicator";
import ShadedCard from "../../ShadedCard";
import Stateful from "../../Stateful";
import PunishmentHistory from "../PunishmentHistory";
import { AdminViewUser } from "./Users";

type PunishmentForm = {
  type: "warning" | "ban" | "hwid";
  userFacingReason: string;
  internalNote: string;
  expires?: Date;
  escalate?: boolean;
  scrubUsername?: boolean;
};

const AUTOFILL_FIELDS = [
  {
    label: "Spamming",
    description: "The user is spamming irrelevant messages on the platform.",
    arguments: [],
    fill: "Spamming is not allowed on the platform. Do not continue to spam.",
  },
  {
    label: "Personal information",
    description:
      "The user is sharing personal information about themselves or others.",
    arguments: [],
    fill: "Sharing personal information is strictly forbidden on Framework. You must respect the privacy of others.",
  },
  {
    label: "Bad image",
    description: "The user is sharing an image that violates our guidelines.",
    arguments: [
      {
        label: "Image description",
        id: "image-description",
        description: "A description of the image.",
      },
    ],
    fill: "The image you shared {image-description} violates our guidelines. Please do not share this image again.",
  },
  {
    label: "Bad link",
    description:
      "The user is sharing a link that violates our guidelines. (e.g. a link to a phishing website)",
    arguments: [
      {
        label: "Link description",
        id: "link-description",
        description: "A description of the link.",
      },
      {
        label: "Infraction",
        id: "infraction",
        description: "The infraction the link constitutes.",
      },
    ],
    fill: "The link you shared {link-description} violates our guidelines: {infraction}. Please do not share this link again.",
  },
  {
    label: "Bad username",
    description: "The user's username violates our guidelines.",
    arguments: [
      {
        label: "Username",
        id: "username",
        description: "The user's username that violated our guidelines.",
      },
    ],
    fill: "Your username {username} violates our guidelines. Do not change your username to something similar.",
  },
  {
    label: "Cheating",
    description: "The user is cheating in a game.",
    arguments: [],
    fill: "Exploiting or misusing Soodam.re software is not permitted and will be dealt with to the fullest extent.",
  },
  {
    label: "Discriminatory language",
    description: "The user is using discriminatory language, such as slurs.",
    arguments: [],
    fill: "Discriminatory language is not permitted on Framework. Do not use discriminatory language, please respect others.",
  },
  {
    label: "Harassment",
    description: "The user is harassing another user.",
    arguments: [],
    fill: "Harassment is forbidden on Framework. Do not harass other users, please respect others.",
  },
];

type PunishProps = {
  reporterId?: number;
  userId?: number;
  back?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  onComplete?: () => void;
};

const Punish: React.FC<PunishProps> = ({
  reporterId: rpid,
  userId,
  onComplete,
  back = {
    label: "Back to users",
    href: "/admin/users",
  },
}) => {
  const [autofillOpen, setAutofillOpen] = React.useState(false);
  const [af, _setAf] = React.useState(AUTOFILL_FIELDS[0]);
  const [loading, setLoading] = React.useState(false);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [user, setUser] = React.useState<AdminViewUser>();
  const [reporterId, setReporterId] = React.useState<number>(
    rpid ?? (undefined as unknown as number)
  );
  const colorScheme = useMantineColorScheme();

  const form = useForm<PunishmentForm>({
    initialValues: {
      type: "warning",
      userFacingReason: "",
      internalNote: "",
    },
    validate: {
      userFacingReason: (value) => {
        if (value.length < 3) {
          return "Reason must be at least 3 characters long.";
        }
        if (value.length > 256) {
          return "Reason must be less than 200 characters long.";
        }
      },
      internalNote: (value) => {
        if (value.length < 3) {
          return "Internal note must be at least 3 characters long.";
        }
      },
    },
  });

  const fetchUser = async (uid: number) => {
    await fetchJson<IResponseBase<{ user: AdminViewUser }>>(
      `/api/admin/user/${uid.toString()}`,
      {
        auth: true,
      }
    )
      .then((res) => {
        if (res.success) {
          setUser(res.data?.user);
        }
      })
      .finally(() => setLoadingUser(false));
  };

  const BackButton: FC = () => (
    <Anchor
      className="flex items-center gap-2"
      {...(back.onClick && {
        onClick: () => {
          if (back.onClick) back.onClick();
        },
      })}
    >
      <span className="flex items-center">
        <HiArrowLeft />
      </span>
      {back.label}
    </Anchor>
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const uid = urlParams.get("uid");
      const reporter = urlParams.get("rid");

      if (uid) {
        fetchUser(Number(uid));
      } else {
        fetchUser(userId!);
      }
      if (reporter) {
        setReporterId(Number(reporter));
      }
    }
  }, []);

  return (
    <>
      <Modal
        title="Autofill"
        opened={autofillOpen}
        onClose={() => setAutofillOpen(false)}
        className={colorScheme.colorScheme}
      >
        <Text size="sm" color="dimmed" mb="md">
          Please provide the arguments for this autofill entry.
        </Text>
        <Stateful
          initialState={{
            args: af.arguments.map((arg) => ({
              id: arg.id,
              value: "",
            })),
          }}
        >
          {(state, setState) => (
            <>
              <Stack spacing={"sm"}>
                {af.arguments.map((arg, index) => (
                  <TextInput
                    label={arg.label}
                    description={arg.description}
                    placeholder="Fill in..."
                    key={index}
                    onChange={(e) => {
                      const args = state.args;
                      args[index].value = e.target.value;
                      setState({ args });
                    }}
                    classNames={BLACK}
                  />
                ))}
              </Stack>
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="default"
                  onClick={() => setAutofillOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  leftIcon={<HiCheck />}
                  onClick={() => {
                    const args = state.args;
                    const fill = af.fill;
                    console.log(args, fill);
                    args.forEach((arg: { id: string; value: string }) => {
                      fill.replace(`{${arg.id}}`, arg.value);
                    });
                    form.setFieldValue("userFacingReason", fill);
                    setAutofillOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </Stateful>
      </Modal>
      {back.href ? (
        <ReactNoSSR>
          <Link href={back.href || "/admin/users"} passHref>
            <Anchor className="flex items-center gap-2">
              <span className="flex items-center">
                <HiArrowLeft />
              </span>
              {back.label}
            </Anchor>
          </Link>
        </ReactNoSSR>
      ) : (
        <BackButton />
      )}
      {loadingUser ? (
        <div className="flex justify-center items-center h-64">
          <LoadingIndicator />
        </div>
      ) : (
        user && (
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1">
              <Text color="dimmed" mb={6}>
                Punishment
              </Text>
              <Title order={2} mb={24}>
                {user.username}
              </Title>
              <Text size="sm" color="dimmed" mb="md">
                Please select a punishment to apply to this user:
              </Text>
              <ul className="list-disc">
                <li className="text-green-500/50">
                  <Text size="sm" color="dimmed">
                    Warning: This will give the user a dismissible warning that
                    will remain in their punishment history.
                  </Text>
                </li>
                <li className="text-yellow-500/50">
                  <Text size="sm" color="dimmed">
                    Temporary ban: This will ban the user for a set amount of
                    time, after which they can reactivate their account.
                  </Text>
                </li>
                <li className="text-orange-500/50">
                  <Text size="sm" color="dimmed">
                    Permanent ban: This will ban the user permanently, and they
                    will not be able to reactivate their account unless an admin
                    manually lifts the ban.
                  </Text>
                </li>
                <li className="text-red-500/50">
                  <Text size="sm" color="dimmed">
                    HWID ban: This will permanently ban the user from Framework
                    by their HWID, which is a unique identifier for their
                    computer. This is the most severe punishment and should only
                    be used in extreme cases.
                  </Text>
                </li>
              </ul>
              <Text size="sm" color="dimmed" mb="md" mt="lg">
                Remember to thoroughly fill out the internal note and reason for
                punishment fields. Mis-documentation can lead to confusion and
                mistakes. Also, remember to check the user&apos;s punishment
                history before applying a punishment.
              </Text>
              <Divider my="lg" />
              <PunishmentHistory user={user} scroll scrollH="30rem" />
            </div>
            <Divider my="xl" className="md:hidden" />
            <div className="flex-1">
              <ShadedCard>
                <form
                  onSubmit={form.onSubmit(async (values) => {
                    if (values.type !== "warning" && !values.expires) {
                      form.setFieldError(
                        "userFacingReason",
                        "Please provide an expiration date for this punishment."
                      );
                      form.setFieldError(
                        "internalNote",
                        "Please provide an expiration date for this punishment."
                      );
                    } else {
                      setLoading(true);
                      await fetchJson<IResponseBase>(
                        `/api/admin/users/${user?.id}/punish/${
                          values.type === "warning" ? "warning" : "ban"
                        }`,
                        {
                          auth: true,
                          method: "POST",
                          body: {
                            ...values,
                            ...(reporterId &&
                              user?.id !== reporterId && {
                                reportAuthorId: reporterId,
                              }),
                            reason: values.userFacingReason,
                          },
                        }
                      )
                        .then((res) => {
                          if (res.success) {
                            form.reset();
                            showNotification({
                              title: "Justice served",
                              message: `Successfully punished ${user.username}. Thank you for keeping Framework safe.`,
                              icon: <HiCheckCircle />,
                            });
                            if (onComplete) return onComplete();
                          } else {
                            showNotification({
                              title: "Something went wrong",
                              message: `We were unable to punish ${user.username}. Please try again later.`,
                              icon: <HiXCircle />,
                              color: "red",
                            });
                          }
                        })
                        .finally(() => setLoading(false));
                    }
                  })}
                >
                  <Section
                    title="Punishment type"
                    description="Please select the type of punishment you would like to apply to this user."
                    sm
                  />
                  <Stack spacing="xs" mb="xl">
                    {[
                      {
                        label: "Warning",
                        pointer: "warning",
                        value: form.values.type === "warning",
                        description:
                          "This will give the user a dismissible warning that will remain in their punishment history.",
                      },
                      {
                        label: "Ban / suspension",
                        pointer: "ban",
                        value: form.values.type === "ban",
                        description:
                          "This will ban the user for a set amount of time, after which they can reactivate their account.",
                      },
                      {
                        label: "HWID ban",
                        pointer: "hwid",
                        value: form.values.type === "hwid",
                        disabled: true,
                        description:
                          "This will permanently ban the user from Framework by their HWID, which is a unique identifier for their computer. This is the most severe punishment and should only be used in extreme cases.",
                      },
                    ].map((item, index) => (
                      <LabelledCheckbox
                        key={index}
                        label={item.label}
                        value={String(item.value)}
                        description={item.description}
                        disabled={item.disabled}
                        classNames={BLACK}
                        radius="xl"
                        onChange={() => {
                          form.setFieldValue(
                            "type",
                            item.pointer as PunishmentForm["type"]
                          );
                        }}
                        checked={item.value}
                      />
                    ))}
                  </Stack>
                  <Section
                    title="Reason for punishment"
                    description="Please provide a reason for this punishment. This will be shown to the user."
                    sm
                  />
                  {/* <Descriptive
                  title="Autofill"
                  description="Autofill a reason for this punishment to save time."
                >
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                    {AUTOFILL_FIELDS.map((af, index) => (
                      <Chip
                        radius="md"
                        key={index}
                        classNames={{
                          label: clsx(
                            BLACK.input,
                            "dark:hover:bg-zinc-900/5 w-full text-center"
                          ),
                        }}
                        checked={false}
                        onClick={() => {
                          if (af.arguments.length > 0) {
                            setAutofillOpen(true);
                            setAf(af);
                          } else {
                            form.setFieldValue(
                              "userFacingReason",
                              af.description
                            );
                          }
                        }}
                      >
                        {af.label}
                      </Chip>
                    ))}
                  </div>
                </Descriptive> */}
                  <Textarea
                    mt="md"
                    classNames={BLACK}
                    label="User-facing reason"
                    description="Please provide a reason for this punishment. This will be shown to the user."
                    placeholder="Offensive language is not tolerated on Framework."
                    required
                    {...form.getInputProps("userFacingReason")}
                  />
                  <Textarea
                    mt="md"
                    classNames={BLACK}
                    label="Internal note"
                    description="Please provide an internal note for this punishment. This will not be shown to the user, and is only visible to Framework staff for reference. Include a Confluence link if applicable."
                    placeholder="This user has been warned for offensive language."
                    required
                    mb="xl"
                    {...form.getInputProps("internalNote")}
                  />
                  {form.values.type === "ban" && (
                    <>
                      <Section
                        title="Ban duration"
                        description="Please select the duration of this ban."
                        sm
                      />
                      <Select
                        label="Expires"
                        description="Select the date this ban will expire."
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
                            value: new Date(
                              "9999-12-31T23:59:59.999Z"
                            ).toDateString(),
                          },
                        ]}
                        classNames={BLACK}
                        required
                        mb="xl"
                        placeholder="Select a duration"
                        {...form.getInputProps("expires")}
                      />
                    </>
                  )}
                  <Section
                    title="Additional options"
                    description="Please select any additional options you would like to apply to this punishment."
                    sm
                  />
                  <Stack spacing="xs" mb="xl">
                    <LabelledCheckbox
                      label="Escalate report"
                      description="For reports which contain threats, harassment, child exploitation or other serious violations."
                      classNames={BLACK}
                      {...form.getInputProps("escalate", { type: "checkbox" })}
                    />
                    <LabelledCheckbox
                      label="Scrub username"
                      description="This will set the users username to a randomly generated string making it impossible to find them by username and to remove inappropiate content."
                      classNames={BLACK}
                      {...form.getInputProps("scrubUsername", {
                        type: "checkbox",
                      })}
                    />
                  </Stack>
                  <Button
                    size="lg"
                    type="submit"
                    leftIcon={<HiCheckCircle />}
                    fullWidth
                    loading={loading}
                  >
                    Apply punishment
                  </Button>
                </form>
              </ShadedCard>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default Punish;
