import ContextMenu from "@/components/ContextMenu";
import Copy from "@/components/Copy";
import DataGrid from "@/components/DataGrid";
import IconTooltip from "@/components/IconTooltip";
import ModernEmptyState from "@/components/ModernEmptyState";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import { ownerDescriptions } from "@/data/scopes";
import Developer from "@/layouts/DeveloperLayout";
import ServiceUnavailable from "@/pages/503";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { ICreateNewOAuth2ApplicationResponse } from "@/types/api/ICreateNewOAuth2ApplicationResponse";
import {
  IGetMyOAuth2ApplicationsResponse,
  IOAuthApplication,
} from "@/types/api/IGetMyOAuth2ApplicationsResponse";
import IResponseBase from "@/types/api/IResponseBase";
import abbreviateNumber from "@/util/abbreviate";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Anchor,
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
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { openConfirmModal, openModal } from "@mantine/modals";
import { OAuthScope } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import {
  HiBadgeCheck,
  HiCalendar,
  HiCheck,
  HiGlobe,
  HiKey,
  HiPlus,
  HiRefresh,
  HiSearch,
  HiTag,
  HiTrash,
  HiUserGroup,
} from "react-icons/hi";

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
  const [search, setSearch] = useState<string | undefined>(undefined);
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
        saving data using our <Code>ApplicationDataService</Code> API, free of
        charge*.
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
              form.reset();
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
      <Text size="sm" color="dimmed" mt="md">
        * OAuth2 <Code>ApplicationDataService</Code> API grants 10 MB of storage
        per application. If you need more, please contact us to discuss your
        needs.
      </Text>
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

  const searchFn = (s: IOAuthApplication) => {
    if (search === undefined || !search) return true;
    return s.name?.toLowerCase().includes(search.toLowerCase());
  };

  return Fw.Feature.enabled(Fw.FeatureIdentifier.OAuth2) ? (
    <Developer
      user={user}
      title="OAuth2"
      description="Manage your OAuth2 applications."
    >
      {createAppModal}
      <div className="flex items-center justify-between mb-6 gap-3">
        <TextInput
          icon={<HiSearch />}
          className="w-full"
          placeholder="Search for apps..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          classNames={BLACK}
        />
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
        ) : apps && apps.filter(searchFn).length > 0 ? (
          apps.filter(searchFn).map((app) => (
            <ContextMenu key={app.id} dropdown={infoDropdown(app)} width={190}>
              <ShadedButton
                className="w-full flex flex-col"
                onClick={() => {
                  openModal({
                    title: app.name,
                    children: (
                      <>
                        <Text size="sm" color="dimmed" mb="lg">
                          {app.description}
                        </Text>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {app.scopes?.map((scope, index) => (
                            <Badge variant="outline" key={index}>
                              {scope}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Text size="sm" color="dimmed">
                            URI
                          </Text>
                          <Anchor weight={500} size="sm" href={app.redirectUri}>
                            {app.redirectUri}
                          </Anchor>
                        </div>
                      </>
                    ),
                  });
                }}
              >
                <div className="flex w-full items-center justify-center gap-2 text-center">
                  <Title order={3}>{app.name}</Title>
                  {app.verified && (
                    <IconTooltip
                      icon={<HiBadgeCheck className="text-green-400" />}
                      descriptiveModal
                      descriptiveModalProps={{
                        title: "Verified OAuth2",
                        children: (
                          <Text size="sm" color="dimmed">
                            This OAuth2 application has been verified for
                            legitimacy by Solarius staff.
                          </Text>
                        ),
                      }}
                      label="Verified application"
                    />
                  )}
                </div>
                <div className="w-full flex justify-center">
                  <Text
                    size="sm"
                    lineClamp={2}
                    color="dimmed"
                    align="center"
                    mt="sm"
                    mb="md"
                  >
                    {app.description}
                  </Text>
                </div>
                <DataGrid
                  mdCols={2}
                  smCols={2}
                  defaultCols={2}
                  className="w-full"
                  items={[
                    {
                      tooltip: "Users",
                      value: abbreviateNumber(app._count?.clients!),
                      icon: <HiUserGroup />,
                    },
                    {
                      tooltip: "Created",
                      value: new Date(
                        app.createdAt as Date
                      ).toLocaleDateString(),
                      icon: <HiCalendar />,
                    },
                  ]}
                />
              </ShadedButton>
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
  ) : (
    <ServiceUnavailable />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default OAuth2;
