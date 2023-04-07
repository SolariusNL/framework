import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CloseButton,
  Code,
  Menu,
  Modal,
  MultiSelect,
  MultiSelectValueProps,
  Skeleton,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { openConfirmModal, openModal } from "@mantine/modals";
import { OAuthScope } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import {
  HiCake,
  HiCheck,
  HiDotsVertical,
  HiGlobe,
  HiKey,
  HiPlus,
  HiRefresh,
  HiSearch,
  HiTag,
  HiTrash,
  HiUserGroup,
} from "react-icons/hi";
import ContextMenu from "../../components/ContextMenu";
import Copy from "../../components/Copy";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedCard from "../../components/ShadedCard";
import { ownerDescriptions } from "../../data/scopes";
import Developer from "../../layouts/DeveloperLayout";
import useAmoled from "../../stores/useAmoled";
import { ICreateNewOAuth2ApplicationResponse } from "../../types/api/ICreateNewOAuth2ApplicationResponse";
import {
  IGetMyOAuth2ApplicationsResponse,
  IOAuthApplication,
} from "../../types/api/IGetMyOAuth2ApplicationsResponse";
import IResponseBase from "../../types/api/IResponseBase";
import authorizedRoute from "../../util/auth";
import { AMOLED_COLORS } from "../../util/constants";
import fetchJson from "../../util/fetch";
import { User } from "../../util/prisma-types";

type OAuth2Props = {
  user: User;
};
type OAuth2Form = {
  name: string;
  description: string;
  scopes: OAuthScope[];
  redirectUri: string;
};

const MultiSelectValue = ({
  value,
  label,
  onRemove,
  classNames,
  ...others
}: MultiSelectValueProps & { value: string }) => {
  return (
    <div {...others}>
      <Box
        sx={(theme) => ({
          display: "flex",
          cursor: "default",
          alignItems: "center",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
          border: `1px solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[4]
          }`,
          paddingLeft: theme.spacing.xs,
          borderRadius: theme.radius.sm,
        })}
      >
        <Text className="font-mono text-xs">{value}</Text>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Box>
    </div>
  );
};

const OAuth2: React.FC<OAuth2Props> = ({ user }) => {
  const [apps, setApps] = useState<IOAuthApplication[]>();
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [createAppModalOpened, setCreateAppModalOpened] =
    useState<boolean>(false);
  const form = useForm<OAuth2Form>({
    initialValues: {
      name: "",
      description: "",
      scopes: [],
      redirectUri: "",
    },
    validate: {
      name: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
      description: (value) => {
        if (!value) {
          return "Description is required";
        }
      },
      scopes: (value) => {
        if (!value) {
          return "Scopes are required";
        }
      },
      redirectUri: (value) => {
        if (!value) {
          return "Redirect URI is required";
        }

        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          return "Redirect URI must be an HTTP/HTTPS URL";
        }
      },
    },
  });
  const { copy } = useClipboard();
  const { enabled: amoled } = useAmoled();

  const fetchApps = async () => {
    setLoadingApps(true);
    await fetchJson<IGetMyOAuth2ApplicationsResponse>("/api/oauth/my/apps", {
      method: "GET",
      responseType: "json",
      auth: true,
    })
      .then((res) => {
        if (res.success) {
          setApps(res.data?.apps);
        }
      })
      .finally(() => setLoadingApps(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const createAppModal = (
    <Modal
      opened={createAppModalOpened}
      onClose={() => setCreateAppModalOpened(false)}
      title="Create application"
    >
      <Text size="sm" color="dimmed" mb="md">
        Create a new OAuth2 application to integrate your application with
        Framework, allowing users to login with their Framework account and even
        saving data using our <Code>ApplicationDataService</Code> API.
      </Text>
      <form
        onSubmit={form.onSubmit(async (values) => {
          await fetchJson<ICreateNewOAuth2ApplicationResponse>(
            "/api/oauth/my/apps/new",
            {
              method: "POST",
              responseType: "json",
              auth: true,
              body: values,
            }
          ).then((res) => {
            if (res.success) {
              setCreateAppModalOpened(false);
              fetchApps();
              openModal({
                title: "Application created",
                children: (
                  <>
                    <Text size="sm" color="dimmed" mb="lg">
                      Your application has been created. You can now use the
                      following information to integrate your application with
                      Framework.
                    </Text>
                    <div className="flex items-center justify-center gap-2">
                      <Copy value={String(res.data?.app.secret)} />
                      <Text size="sm" color="dimmed">
                        Copy secret
                      </Text>
                    </div>
                  </>
                ),
              });
            }
          });
        })}
      >
        <TextInput
          placeholder="Add a name"
          label="Name"
          required
          description="Give a name to your app to help yourself and others identify it."
          icon={<HiTag />}
          mb="sm"
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Description"
          required
          description="Quickly summarize your app."
          mb="sm"
          placeholder="Shortly is a URL shortener that allows you to shorten URLs and share them with the world."
          {...form.getInputProps("description")}
        />
        <MultiSelect
          data={Object.entries(ownerDescriptions).map(
            ([value, description]) => ({ value, label: description })
          )}
          label="Scopes"
          required
          description="Select the scopes that your app will need to function."
          mb="sm"
          valueComponent={MultiSelectValue}
          placeholder="Choose some scopes"
          {...form.getInputProps("scopes")}
        />
        <TextInput
          icon={<HiGlobe />}
          label="Redirect URI"
          required
          description="The URL that users will be redirected to after they authorize your app."
          placeholder="https://shortly.com/oauth/callback"
          mb="lg"
          {...form.getInputProps("redirectUri")}
        />
        <div className="flex justify-end">
          <Button leftIcon={<HiCheck />} type="submit">
            Create application
          </Button>
        </div>
      </form>
    </Modal>
  );

  const infoDropdown = (app: IOAuthApplication) => (
    <>
      <Menu.Item icon={<HiKey />} onClick={() => copy(app.id)}>
        Copy client ID
      </Menu.Item>
      <Menu.Divider />
      <Menu.Label>Danger zone</Menu.Label>
      <Menu.Item
        icon={<HiTrash />}
        onClick={() => {
          openConfirmModal({
            title: "Confirm deletion",
            children: (
              <Text size="sm" color="dimmed">
                Are you sure you want to delete this application? This action
                cannot be undone.
              </Text>
            ),
            labels: { confirm: "Delete", cancel: "Nevermind" },
            async onConfirm() {
              await fetchJson<IResponseBase<{}>>(
                `/api/oauth/my/apps/${app.id}`,
                {
                  method: "DELETE",
                  responseType: "json",
                  auth: true,
                }
              ).then((res) => {
                if (res.success) {
                  fetchApps();
                }
              });
            },
          });
        }}
        color="red"
      >
        Delete application
      </Menu.Item>
      <Menu.Item
        icon={<HiRefresh />}
        onClick={async () => {
          openConfirmModal({
            title: "Confirm regeneration",
            children: (
              <Text size="sm" color="dimmed">
                Are you sure you want to regenerate the secret for this
                application? All applications using this secret will no longer
                function.
              </Text>
            ),
            labels: { confirm: "Regenerate", cancel: "Nevermind" },
            async onConfirm() {
              await fetchJson<
                IResponseBase<{
                  secret: string;
                }>
              >(`/api/oauth/my/apps/${app.id}`, {
                method: "PATCH",
                responseType: "json",
                auth: true,
              }).then((res) => {
                if (res.success) {
                  openModal({
                    title: "Secret regenerated",
                    children: (
                      <>
                        <Text size="sm" color="dimmed" mb="lg">
                          Your application&apos;s secret has been regenerated.
                          You can now use the following information to integrate
                          your application with Framework.
                        </Text>
                        <div className="flex items-center justify-center gap-2">
                          <Copy value={String(res.data?.secret)} />
                          <Text size="sm" color="dimmed">
                            Copy secret
                          </Text>
                        </div>
                      </>
                    ),
                  });

                  fetchApps();
                }
              });
            },
          });
        }}
        color="red"
      >
        Regenerate secret
      </Menu.Item>
    </>
  );

  return (
    <Developer
      user={user}
      title="API Keys"
      description="Manage your API keys and integrate your applications with Framework."
    >
      {createAppModal}
      <div className="flex items-center justify-between mb-6 gap-3">
        <TextInput icon={<HiSearch />} className="w-full" placeholder="Search for apps..." />
        <Button
          leftIcon={<HiPlus />}
          onClick={() => setCreateAppModalOpened(true)}
          className="hidden md:block"
        >
          Create application
        </Button>
        <ActionIcon
          size="lg"
          color="blue"
          variant="filled"
          onClick={() => setCreateAppModalOpened(true)}
          className="md:hidden"
        >
          <HiPlus />
        </ActionIcon>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {loadingApps ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton height="12rem" key={i} />
          ))
        ) : apps && apps.length > 0 ? (
          apps.map((app) => (
            <ContextMenu key={app.id} dropdown={infoDropdown(app)} width={190}>
              <ShadedCard
                sx={(theme) => ({
                  "&:hover": {
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? "#0b0b0c"
                        : theme.colors.gray[1],
                  },
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? amoled
                        ? AMOLED_COLORS.paper
                        : theme.colors.dark[9]
                      : theme.colors.gray[0],
                  overflow: "visible",
                })}
                className="transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Text size="lg">{app.name}</Text>
                    {app.verified && (
                      <Tooltip label="Verified application">
                        <div className="flex items-center">
                          <HiCheck className="text-green-500" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <Menu width={190} withinPortal>
                    <Menu.Target>
                      <ActionIcon size="lg">
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>{infoDropdown(app)}</Menu.Dropdown>
                  </Menu>
                </div>
                <Text size="sm" color="dimmed" mb="md">
                  {app.description}
                </Text>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    {
                      icon: <HiUserGroup />,
                      value: app._count?.clients,
                    },
                    {
                      icon: <HiCake />,
                      value: new Date(
                        app.createdAt as Date
                      ).toLocaleDateString(),
                    },
                  ].map((item, i) => (
                    <div className="flex flex-col items-center gap-2" key={i}>
                      {item.icon}
                      <Text size="sm" color="dimmed" weight={500}>
                        {item.value}
                      </Text>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.scopes!.map((scope) => (
                    <Badge
                      color="gray"
                      key={scope}
                      variant="outline"
                      radius="md"
                      className="font-mono"
                    >
                      {scope}
                    </Badge>
                  ))}
                </div>
              </ShadedCard>
            </ContextMenu>
          ))
        ) : (
          <ShadedCard className="col-span-full">
            <ModernEmptyState
              title="No applications"
              body="You don't have any OAuth2 applications yet."
            />
          </ShadedCard>
        )}
      </div>
    </Developer>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default OAuth2;
