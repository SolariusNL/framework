import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { AdminPermission } from "@prisma/client";
import { getCookie, setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiCheckCircle } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import { useUserInformationDialog } from "../../contexts/UserInformationDialog";
import employeeRoleMeta from "../../data/employeeRoles";
import getMediaUrl from "../../util/get-media";
import Copy from "../Copy";
import ModernEmptyState from "../ModernEmptyState";
import Stateful from "../Stateful";
import NoteTable, { NoteUser } from "./NoteTable";
import { AdminViewUser } from "./Pages/Users";
import Punishment from "./Punishment";
import UserActions from "./UserActions";

interface UserViewProps {
  user: AdminViewUser;
}

const UserView = ({ user }: UserViewProps) => {
  const randomKey = () => {
    return Math.random().toString(36).substring(7);
  };

  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const [punishOpened, setPunishOpened] = React.useState(false);
  const currentUser = useFrameworkUser()!;
  const [permissions, setPermissions] = React.useState<AdminPermission[]>([]);
  const router = useRouter();
  const impersonationForm = useForm<{
    reason: string;
    confirm: boolean;
  }>({
    initialValues: {
      reason: "",
      confirm: false,
    },
    validate: {
      reason: (value) => {
        if (!value) {
          return "You must provide a reason for impersonating this user.";
        }
      },
      confirm: (value: boolean) => {
        if (!value) {
          return "You must confirm that you understand the consequences of impersonating this user.";
        }
      },
    },
  });

  React.useEffect(() => {
    if (user.adminPermissions) {
      setPermissions(user.adminPermissions);
    }
  }, [user.adminPermissions]);

  return (
    <>
      <Punishment
        user={user}
        punishOpened={punishOpened}
        setPunishOpened={setPunishOpened}
        onCompleted={() => {
          setPunishOpened(false);
        }}
      />
      <Group mb={18}>
        <Avatar size="xl" radius={999} src={getMediaUrl(user.avatarUri)} />
        <Stack spacing={3}>
          <Group>
            <Title order={3}>{user.username}</Title>
            {user.role === "ADMIN" && <Badge>Staff</Badge>}
            {user.banned && <Badge color="red">Banned</Badge>}
          </Group>
          <Text color="dimmed">
            {user.bio.split("\n").map((line, i) => (
              <React.Fragment key={randomKey()}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Text>
        </Stack>
      </Group>

      <Group mb={18}>
        <Button
          color="red"
          onClick={() => {
            setPunishOpened(true);
          }}
          disabled={
            !currentUser.adminPermissions.includes(AdminPermission.PUNISH_USERS)
          }
        >
          Punish
        </Button>
        <Button.Group>
          <Stateful>
            {(opened, setOpened) => (
              <>
                <Modal
                  title="Impersonate user"
                  opened={opened}
                  onClose={() => setOpened(false)}
                >
                  <form
                    onChange={() => {
                      console.log(impersonationForm.values);
                    }}
                    onSubmit={impersonationForm.onSubmit((values) => {
                      const oldSession = getCookie(".frameworksession");

                      fetch("/api/admin/log/impersonate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: String(oldSession),
                        },
                        body: JSON.stringify({
                          userId: user.id,
                          reason: values.reason,
                        }),
                      })
                        .then((res) => res.json())
                        .then((res) => {
                          const newSession = res.token;
                          setCookie(".frameworksession.old", oldSession);
                          setCookie(".frameworksession", newSession);

                          router.push("/");
                          showNotification({
                            title: "Impersonating User",
                            message: `You are now impersonating ${user.username}. Click 'Stop impersonating' at the top right to stop.`,
                            icon: <HiCheckCircle />,
                            color: "green",
                          });
                        });
                    })}
                  >
                    <Select
                      label="Reason"
                      description="Why are you impersonating this user?"
                      data={[
                        {
                          label: "Customer Support",
                          value: "CUSTOMER_SUPPORT",
                        },
                        {
                          label: "Account Recovery",
                          value: "ACCOUNT_RECOVERY",
                        },
                        { label: "Debugging", value: "DEBUGGING" },
                        { label: "Moderation", value: "MODERATION" },
                        { label: "Unspecified", value: "UNSPECIFIED" },
                      ]}
                      mb={16}
                      placeholder="Select a reason"
                      {...impersonationForm.getInputProps("reason")}
                    />
                    <Checkbox
                      {...impersonationForm.getInputProps("confirm")}
                      label="I understand that my actions in this impersonation session
                      will be monitored and recorded, and that I will be held
                      accountable for any actions I take."
                      mb={16}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        onClick={() => setOpened(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Impersonate</Button>
                    </div>
                  </form>
                </Modal>
                <Button
                  onClick={() => {
                    setOpened(true);
                  }}
                  disabled={
                    !currentUser.adminPermissions.includes(
                      AdminPermission.IMPERSONATE_USERS
                    )
                  }
                >
                  Impersonate
                </Button>
              </>
            )}
          </Stateful>
          <Link href={`/profile/${user.username}`}>
            <Button>View Profile</Button>
          </Link>
        </Button.Group>
      </Group>

      <Tabs defaultValue="info" variant="pills">
        <Tabs.List
          mb="md"
          style={{
            flexWrap: "wrap",
          }}
        >
          <Tabs.Tab value="info">Info</Tabs.Tab>
          <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
          <Tabs.Tab value="punishment">Punishment</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
          <Tabs.Tab value="secrets">Secrets</Tabs.Tab>
          <Tabs.Tab value="history">Punishment History</Tabs.Tab>
          <Tabs.Tab value="actions">Actions</Tabs.Tab>
          <Tabs.Tab value="permissions">Permissions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info">
          <Accordion
            defaultValue="general"
            styles={{
              content: {
                padding: 0,
              },
            }}
          >
            <Accordion.Item value="general">
              <Accordion.Control>General Information</Accordion.Control>
              <Accordion.Panel>
                <Table striped mb={6}>
                  <tbody>
                    {[
                      ["Username", user.username],
                      ["Alias", user.alias],
                      [
                        "Previous Usernames",
                        user.previousUsernames.join(", ") || "None",
                      ],
                      ["ID", user.id],
                      ["Email", user.email],
                      ["Role", <Badge key={randomKey()}>{user.role}</Badge>],
                      ["Bio", user.bio],
                      ["Avatar URI", user.avatarUri],
                      ["Created at", user.createdAt],
                      ["Premium", user.premium],
                      ["Banned", user.banned],
                      ["Tickets", user.tickets],
                      ["TOTP Enabled", user.otpEnabled],
                      ["Linked Discord", user.discordAccount?.discordId],
                      ["Games", user.games.map((g) => g.id).join(", ")],
                      ["Links", user.profileLinks.map((l) => l.url).join(", ")],
                      ["Email Reset", user.emailResetRequired],
                      ["Password Reset", user.passwordResetRequired],
                      [
                        "Followers",
                        <div
                          onClick={() => {
                            setOpen(true);
                            setUser(user);
                            setDefaultTab("followers");
                          }}
                          key={randomKey()}
                          className="cursor-pointer text-blue-500 underline"
                        >
                          {user._count.followers}
                        </div>,
                      ],
                      [
                        "Following",
                        <div
                          key={randomKey()}
                          className="cursor-pointer text-blue-500 underline"
                          onClick={() => {
                            setOpen(true);
                            setUser(user);
                            setDefaultTab("following");
                          }}
                        >
                          {user._count.following}
                        </div>,
                      ],
                      ["Country", user.country],
                      ["Last seen", user.lastSeen],
                      ["Busy", user.busy],
                      ["Verified", user.emailVerified],
                      ["2FA", user.emailRequiredLogin],
                    ]
                      .map((i) => {
                        if (typeof i[1] === "boolean") {
                          return [i[0], i[1] ? "Yes" : "No"];
                        }
                        return i;
                      })
                      .map((h) => (
                        <tr key={String(h[0])}>
                          <td className="font-semibold whitespace-nowrap">
                            {String(h[0])}
                          </td>
                          <td>
                            {h[1] as string | number | JSX.Element | null}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="totp">
              <Accordion.Control>TOTP Details</Accordion.Control>
              <Accordion.Panel>
                {user.otpEnabled ? (
                  <Table striped>
                    <tbody>
                      {[
                        ["ASCII Secret", user.otpAscii],
                        ["Base32 Secret", user.otpBase32],
                        ["URI", user.otpAuthUrl],
                        ["Hex Secret", user.otpHex],
                      ].map((h) => (
                        <tr key={String(h[0])}>
                          <td className="font-semibold whitespace-nowrap">
                            {String(h[0])}
                          </td>
                          <td>
                            {h[1] as string | number | JSX.Element | null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <ModernEmptyState
                    title="No TOTP"
                    body="This user does not have TOTP enabled."
                  />
                )}
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="subscription">
              <Accordion.Control>Subscription</Accordion.Control>
              <Accordion.Panel>
                {user.premium && user.premiumSubscription ? (
                  <Table striped>
                    <tbody>
                      {[
                        [
                          "Created",
                          new Date(
                            user.premiumSubscription.createdAt
                          ).toLocaleString(),
                        ],
                        [
                          "Expires",
                          new Date(
                            user.premiumSubscription.expiresAt
                          ).toLocaleString(),
                        ],
                        ["Type", user.premiumSubscription.type],
                        [
                          "Last Prize",
                          new Date(
                            user.premiumSubscription.lastReward
                          ).toLocaleString(),
                        ],
                      ].map((h) => (
                        <tr key={String(h[0])}>
                          <td className="font-semibold whitespace-nowrap">
                            {String(h[0])}
                          </td>
                          <td>
                            {h[1] as string | number | JSX.Element | null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <ModernEmptyState
                    title="No Subscription"
                    body="This user is not subscribed to Framework Premium"
                  />
                )}
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="employee">
              <Accordion.Control>Employee</Accordion.Control>
              <Accordion.Panel>
                {user.employee ? (
                  <Table striped>
                    <tbody>
                      {[
                        ["Role", employeeRoleMeta.get(user.employee.role)],
                        ["Full Name", user.employee.fullName],
                        [
                          "Contract Expires",
                          new Date(
                            user.employee.contractExpiresAt as Date
                          ).toLocaleString(),
                        ],
                        ["File Created", user.employee.createdAt],
                        ["Contact Email", user.employee.contactEmail],
                        [
                          "Probationary",
                          user.employee.probationary ? "Yes" : "No",
                        ],
                      ].map((h) => (
                        <tr key={String(h[0])}>
                          <td className="font-semibold whitespace-nowrap">
                            {String(h[0])}
                          </td>
                          <td>
                            {h[1] as string | number | JSX.Element | null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <ModernEmptyState
                    title="Not an Employee"
                    body="This user is not an employee of Soodam.re, or has not been registered yet"
                  />
                )}
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="notes">
              <Accordion.Control>Notes</Accordion.Control>
              <Accordion.Panel>
                <NoteTable user={user as unknown as NoteUser} />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Tabs.Panel>

        <Tabs.Panel value="sessions">
          <Table striped>
            <thead>
              <tr>
                <th>ID</th>
                <th>OS</th>
                <th>Token</th>
              </tr>
            </thead>
            <tbody>
              {user.sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id.substring(0, 8)}</td>
                  <td>
                    <Badge>{s.os}</Badge>
                  </td>
                  <td className="flex items-center">
                    <Copy value={s.token} />
                    <Text>{s.token.substring(0, 23)}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="punishment">
          {!user.banned && !user.warning ? (
            <ModernEmptyState
              title="No active punishments"
              body="This user has no active punishments."
            />
          ) : (
            <>
              <Stack spacing={8}>
                {[
                  {
                    title: "Ban info",
                    sections: [
                      ["Ban note", user.banReason],
                      [
                        "Expires",
                        new Date(user.banExpires as Date).toLocaleString(),
                      ],
                    ],
                    condition: user.banned,
                  },
                  {
                    title: "Warning info",
                    sections: [["Warning note", user.warning]],
                    condition: user.warning,
                  },
                ]
                  .filter((i) => i.condition)
                  .map((data) => (
                    <Card key={randomKey()} withBorder>
                      <Card.Section inheritPadding py="xs" mb={16} withBorder>
                        <Text color="dimmed" weight={700} size="sm">
                          {data.title}
                        </Text>
                      </Card.Section>

                      {data.sections.map(([title, value]) => (
                        <Text mb={6} key={randomKey()}>
                          {title}:{" "}
                          <span className="font-semibold">{value}</span>
                        </Text>
                      ))}
                    </Card>
                  ))}
              </Stack>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Table striped>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Body</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {user.notifications
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((n) => (
                  <tr key={n.id}>
                    <td>
                      <Badge>{n.type}</Badge>
                    </td>
                    <td>{n.title}</td>
                    <td>{n.message}</td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="secrets">
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {user.secrets.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="flex items-center">
                    <Copy value={s.code} />
                    <Text>{s.code.substring(0, 23)}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="history">
          <Table striped>
            <thead>
              <tr>
                <th>Punished By</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Date issued</th>
              </tr>
            </thead>
            <tbody>
              {user.punishmentHistory
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div className="flex items-center">
                        <Avatar
                          size={24}
                          src={h.punishedBy.avatarUri}
                          radius="xl"
                        />
                        <Text weight={500}>{h.punishedBy.username}</Text>
                      </div>
                    </td>
                    <td>
                      <Badge>{h.type}</Badge>
                    </td>
                    <td>{h.reason}</td>
                    <td>{new Date(h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}

              {user.punishmentHistory.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <ModernEmptyState
                      title="No punishment history"
                      body="This user has never received a punishment!"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="actions">
          <UserActions target={user} />
        </Tabs.Panel>

        <Tabs.Panel value="permissions">
          {user.role === "ADMIN" ? (
            <>
              <Stack spacing={8} mb={16}>
                {Object.values(AdminPermission).map((permission) => (
                  <Checkbox
                    key={permission}
                    checked={permissions.includes(permission)}
                    disabled={
                      !currentUser.adminPermissions.includes(
                        AdminPermission.EDIT_PERMISSIONS
                      ) || user.id === currentUser.id
                    }
                    label={
                      ("Can " +
                        [
                          [AdminPermission.WRITE_ARTICLE, "write articles"],
                          [AdminPermission.PUNISH_USERS, "punish users"],
                          [AdminPermission.RUN_ACTIONS, "run actions"],
                          [
                            AdminPermission.EDIT_PERMISSIONS,
                            "edit permissions",
                          ],
                          [AdminPermission.WRITE_BLOG_POST, "write blog posts"],
                          [
                            AdminPermission.CHANGE_INSTANCE_SETTINGS,
                            "change instance settings",
                          ],
                          [
                            AdminPermission.IMPERSONATE_USERS,
                            "impersonate users",
                          ],
                        ].find((i) => i[0] === permission)![1]) as string
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPermissions([...permissions, permission]);
                      } else {
                        setPermissions(
                          permissions.filter((p) => p !== permission)
                        );
                      }
                    }}
                  />
                ))}
              </Stack>

              <Button
                onClick={() => {
                  fetch(`/api/admin/users/${user.id}/permissions/update`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: String(getCookie(".frameworksession")),
                    },
                    body: JSON.stringify(permissions),
                  })
                    .then((res) => res.json())
                    .then(() => {
                      showNotification({
                        title: "Permissions updated",
                        message:
                          "The permissions for this user have been updated.",
                        icon: <HiCheckCircle />,
                      });
                    });
                }}
                disabled={
                  user.id === currentUser.id ||
                  !currentUser.adminPermissions.includes(
                    AdminPermission.EDIT_PERMISSIONS
                  ) ||
                  permissions === user.adminPermissions
                }
              >
                Save changes
              </Button>
            </>
          ) : (
            <ModernEmptyState
              title="No permissions"
              body="This user has no permissions, since they are not an admin."
            />
          )}
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default UserView;
