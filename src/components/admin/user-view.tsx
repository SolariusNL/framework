import NoteTable, { NoteUser } from "@/components/admin/note-table";
import { AdminViewUser } from "@/components/admin/pages/users";
import PunishmentHistory from "@/components/admin/punishment-history";
import UserActions from "@/components/admin/user-actions";
import Copy from "@/components/copy";
import { Section } from "@/components/home/friends";
import LoadingIndicator from "@/components/loading-indicator";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import Stateful from "@/components/stateful";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import { useUserInformationDialog } from "@/contexts/UserInformationDialog";
import employeeRoleMeta from "@/data/employeeRoles";
import IResponseBase from "@/types/api/IResponseBase";
import cast from "@/util/cast";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import getMediaUrl from "@/util/get-media";
import {
  Accordion,
  Anchor,
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
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { AdminPermission } from "@prisma/client";
import { getCookie, setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiCheck, HiCheckCircle } from "react-icons/hi";
import InlineError from "../inline-error";

interface UserViewProps {
  user: AdminViewUser;
  loading: boolean;
}

const UserView = ({ user: u, loading }: UserViewProps) => {
  const randomKey = () => {
    return Math.random().toString(36).substring(7);
  };

  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const currentUser = useFrameworkUser()!;
  const [permissions, setPermissions] = React.useState<AdminPermission[]>([]);
  const [user, setViewingUser] = React.useState<AdminViewUser>(u);
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
    if (user && user.adminPermissions) {
      setPermissions(user.adminPermissions);
    }
  }, [user]);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingIndicator />
        </div>
      ) : (
        user && (
          <>
            {user.protected && (
              <InlineError
                variant="warning"
                title="Protected user"
                className="mb-6"
              >
                This is a protected user and some functionality may be
                restricted to prevent abuse.
              </InlineError>
            )}
            <Group mb={18}>
              <Avatar
                size="xl"
                radius={999}
                src={getMediaUrl(user.avatarUri)}
              />
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
              <Button.Group>
                <Link
                  href={
                    "/admin/punish?" +
                    new URLSearchParams({
                      uid: user.id.toString(),
                    }).toString()
                  }
                  passHref
                >
                  <Button
                    color="red"
                    disabled={
                      !currentUser.adminPermissions.includes(
                        AdminPermission.PUNISH_USERS
                      ) || user.protected
                    }
                  >
                    Punish
                  </Button>
                </Link>
                <Button
                  color="red"
                  onClick={() => {
                    openConfirmModal({
                      title: "Lock user",
                      children: (
                        <Text size="sm" color="dimmed">
                          Locking a user will prevent them from logging in. This
                          is typically used for users who have been compromised,
                          or need to be quarantined for investigation.
                        </Text>
                      ),
                      labels: {
                        confirm: `
                        ${user.locked ? "Unlock" : "Lock"} ${user.username}  
                        `,
                        cancel: "Cancel",
                      },
                      confirmProps: {
                        color: "red",
                      },
                      async onConfirm() {
                        await fetchJson<IResponseBase>(
                          "/api/admin/lock/" + user.id,
                          {
                            auth: true,
                            method: "POST",
                          }
                        ).then(() => {
                          showNotification({
                            title: `${
                              user.locked ? "Unlocked" : "Locked"
                            } user`,
                            message: `Successfully ${
                              user.locked ? "unlocked" : "locked"
                            } ${user.username}.`,
                            icon: <HiCheckCircle />,
                          });
                          setViewingUser({
                            ...user,
                            locked: !user.locked,
                          });
                        });
                      },
                    });
                  }}
                >
                  {user.locked ? "Unlock" : "Lock"}
                </Button>
              </Button.Group>
              <div className="flex items-center gap-2">
                <Stateful>
                  {(opened, setOpened) => (
                    <>
                      <Modal
                        title="Impersonate user"
                        opened={opened}
                        onClose={() => setOpened(false)}
                      >
                        <form
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
                                setCookie(".frameworksession.old", oldSession, {
                                  maxAge: 60 * 60 * 24 * 30,
                                  ...(process.env.NEXT_PUBLIC_COOKIE_DOMAIN &&
                                    process.env.NEXT_PUBLIC_COOKIE_DOMAIN !==
                                      "CHANGE_ME" && {
                                      domain:
                                        process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                                    }),
                                });
                                setCookie(".frameworksession", newSession, {
                                  maxAge: 60 * 60 * 24 * 30,
                                  ...(process.env.NEXT_PUBLIC_COOKIE_DOMAIN &&
                                    process.env.NEXT_PUBLIC_COOKIE_DOMAIN !==
                                      "CHANGE_ME" && {
                                      domain:
                                        process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                                    }),
                                });

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
              </div>
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
                <Tabs.Tab value="security">Security</Tabs.Tab>
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
                            [
                              "Role",
                              <Badge key={randomKey()}>{user.role}</Badge>,
                            ],
                            ["Bio", user.bio],
                            ["Avatar URI", user.avatarUri],
                            ["Created at", user.createdAt],
                            ["Premium", user.premium],
                            ["Banned", user.banned],
                            ["Protected", user.protected],
                            ["Tickets", user.tickets],
                            ["Verified", user.verified],
                            ["Bits", user.bits],
                            ["TOTP Enabled", user.otpEnabled],
                            ["Linked Discord", user.discordAccount?.discordId],
                            [
                              "Games",
                              <div className="flex flex-wrap" key={randomKey()}>
                                {user.games.map((g) => (
                                  <>
                                    <Link
                                      key={randomKey()}
                                      href={`/game/${g.id}`}
                                      passHref
                                    >
                                      <Anchor>{g.name}</Anchor>
                                    </Link>
                                    {user.games.indexOf(g) !==
                                      user.games.length - 1 && (
                                      <Text color="dimmed" mx={6}>
                                        •
                                      </Text>
                                    )}
                                  </>
                                ))}
                              </div>,
                            ],
                            [
                              "Links",
                              user.profileLinks.map((l) => l.url).join(", "),
                            ],
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
                            ["Email Verified", user.emailVerified],
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
                  <Accordion.Item value="ip">
                    <Accordion.Control>Location Information</Accordion.Control>
                    <Accordion.Panel>
                      {user.recentIp ? (
                        <Table striped mb={6}>
                          <tbody>
                            {Object.entries(user.recentIpGeo as object)
                              .map(([key, value]) => {
                                if (typeof value === "boolean") {
                                  return [key, value ? "Yes" : "No"];
                                }
                                return [key, value] as [string, any];
                              })
                              .map(([key, value]) => (
                                <tr key={key}>
                                  <td className="font-semibold whitespace-nowrap">
                                    {key}
                                  </td>
                                  <td>
                                    {
                                      value as
                                        | string
                                        | number
                                        | JSX.Element
                                        | null
                                    }
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      ) : (
                        <ModernEmptyState
                          title="No location information"
                          body="This user does not have any location information available."
                        />
                      )}
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
                              [
                                "Role",
                                employeeRoleMeta.get(user.employee.role),
                              ],
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
                          body="This user is not an employee of Solarius, or has not been registered yet"
                        />
                      )}
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="notes">
                    <Accordion.Control>Notes</Accordion.Control>
                    <Accordion.Panel>
                      <NoteTable user={cast<NoteUser>(user)} />
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

              <Tabs.Panel value="security">
                <Section
                  title="Emails"
                  description="Emails used by this account since its tracking"
                />
                <ShadedCard className="flex flex-col gap-2 items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Tooltip label="Current email address">
                      <div
                        className={clsx("w-3 h-3 rounded-full bg-green-500/50")}
                      />
                    </Tooltip>
                    <Text size="sm" color="dimmed" weight={500}>
                      {user.email}
                    </Text>
                    {user.emailVerified && (
                      <Tooltip label="Verified">
                        <div className="flex items-center justify-center">
                          <HiCheck className="text-green-500/50" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  {user.previousEmails.length > 0 ? (
                    user.previousEmails.map((e) => (
                      <div className="flex items-center gap-2" key={e}>
                        <Tooltip label="Previous email address">
                          <div
                            className={clsx(
                              "w-3 h-3 rounded-full bg-red-500/50"
                            )}
                          />
                        </Tooltip>
                        <Text color="dimmed" size="sm">
                          {e}
                        </Text>
                      </div>
                    ))
                  ) : (
                    <div className="w-full flex justify-center items-center">
                      <ModernEmptyState
                        title="No previous emails"
                        body="This user has never changed their email."
                      />
                    </div>
                  )}
                </ShadedCard>
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
                              new Date(
                                user.banExpires as Date
                              ).toLocaleString(),
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
                            <Card.Section
                              inheritPadding
                              py="xs"
                              mb={16}
                              withBorder
                            >
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
                <PunishmentHistory user={user} scroll scrollH="30rem" />
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
                                [
                                  AdminPermission.WRITE_ARTICLE,
                                  "write articles",
                                ],
                                [AdminPermission.PUNISH_USERS, "punish users"],
                                [AdminPermission.RUN_ACTIONS, "run actions"],
                                [
                                  AdminPermission.EDIT_PERMISSIONS,
                                  "edit permissions",
                                ],
                                [
                                  AdminPermission.WRITE_BLOG_POST,
                                  "write blog posts",
                                ],
                                [
                                  AdminPermission.CHANGE_INSTANCE_SETTINGS,
                                  "change instance settings",
                                ],
                                [
                                  AdminPermission.IMPERSONATE_USERS,
                                  "impersonate users",
                                ],
                                [
                                  AdminPermission.GENERATE_GIFTS,
                                  "generate gift codes",
                                ],
                                [
                                  AdminPermission.EDIT_FAST_FLAGS,
                                  "edit fast flags",
                                ],
                                [
                                  AdminPermission.PROTECT_USERS,
                                  "protect users",
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
                        fetch(
                          `/api/admin/users/${user.id}/permissions/update`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: String(
                                getCookie(".frameworksession")
                              ),
                            },
                            body: JSON.stringify(permissions),
                          }
                        )
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
        )
      )}
    </>
  );
};

export default UserView;
