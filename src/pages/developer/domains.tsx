import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Menu,
  NavLink,
  Skeleton,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Domain, DomainStatus } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSidePropsContext } from "next";
import { ReactNode, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
  HiCheckCircle,
  HiCog,
  HiDocumentText,
  HiDotsVertical,
  HiGlobe,
  HiHashtag,
  HiPlusCircle,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import Copy from "../../components/Copy";
import DataGrid from "../../components/DataGrid";
import Dot from "../../components/Dot";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import IResponseBase from "../../types/api/IResponseBase";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import fetchJson from "../../util/fetch";
import { User } from "../../util/prisma-types";
import { BLACK } from "../teams/t/[slug]/issue/create";

type DomainsProps = {
  user: User;
};
type SidebarItem = {
  title: string;
  description: string;
  icon: ReactNode;
  value: SidebarValue;
};
enum SidebarValue {
  Domains,
  CreateNewDomain,
  DomainDetails,
  ValidateTXTRecord,
}
type Form = {
  domain: string;
};

const sidebar: SidebarItem[] = [
  {
    title: "Domains",
    description: "Manage your domains.",
    icon: <HiGlobe />,
    value: SidebarValue.Domains,
  },
  {
    title: "New domain",
    description: "Add a new domain",
    icon: <HiPlusCircle />,
    value: SidebarValue.CreateNewDomain,
  },
];

const Domains: React.FC<DomainsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<SidebarValue>(
    SidebarValue.Domains
  );
  const [domains, setDomains] = useState<Domain[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [txtError, setTxtError] = useState<string>();
  const [selectedDomain, setSelectedDomain] = useState<Domain>();
  const [loadingOwnership, setLoadingOwnership] = useState<boolean>(false);
  const form = useForm<Form>({
    initialValues: {
      domain: "",
    },
    validate: {
      domain: (value) => {
        if (!value) {
          return "You must provide a domain.";
        }
      },
    },
  });

  const fetchDomains = async () => {
    await fetchJson<
      IResponseBase<{
        domains: Domain[];
      }>
    >("/api/domains/my", {
      auth: true,
    }).then((res) => {
      if (res.success) {
        setDomains(res.data?.domains!);
        setLoading(false);
      }
    });
  };

  const createDomain = async (values: Form) => {
    await fetchJson<
      IResponseBase<{
        record: string;
      }>
    >("/api/domains/create", {
      auth: true,
      body: {
        domain: values.domain,
      },
      method: "POST",
    }).then((res) => {
      if (res.success) {
        fetchDomains().then(() => {
          showNotification({
            title: "Success",
            message: "Your domain has been successfully created.",
            icon: <HiCheckCircle />,
          });

          setActiveTab(SidebarValue.Domains);
          setSelectedDomain(undefined);
          form.reset();
        });
      } else {
        showNotification({
          title: "Error",
          message: `Your domain couldn't be created. Error: ${res.message}`,
          color: "red",
          icon: <HiXCircle />,
        });
      }
    });
  };

  const verifyDomainRecord = async () => {
    if (selectedDomain) {
      setLoadingOwnership(true);
      await fetchJson<IResponseBase>("/api/domains/verify", {
        method: "POST",
        body: {
          domain: selectedDomain.domain,
        },
        auth: true,
      })
        .then((res) => {
          if (res.success) {
            showNotification({
              title: "Success",
              message: "Your domain has been successfully verified.",
              icon: <HiCheckCircle />,
            });
            setSelectedDomain({
              ...selectedDomain,
              status: DomainStatus.GENERATING_CERTIFICATE,
            } as Domain);
          } else {
            setTxtError(res.message || "An unknown error occurred.");
            setTimeout(() => {
              setTxtError(undefined);
            }, 3500);
          }
        })
        .catch((err) => {
          showNotification({
            title: "Error",
            message: "An unknown error occurred: " + err,
            icon: <HiXCircle />,
            color: "red",
          });
        })
        .finally(() => setLoadingOwnership(false));
    }
  };

  const deleteDomain = async (domain: string) => {
    await fetchJson<IResponseBase>("/api/domains/delete", {
      method: "DELETE",
      body: {
        domain: String(domain),
      },
      auth: true,
    }).then((res) => {
      if (res.success) {
        showNotification({
          title: "Success",
          message: "Your domain has been successfully deleted.",
          icon: <HiCheckCircle />,
        });
        fetchDomains();
      } else {
        showNotification({
          title: "Error",
          message: `Your domain couldn't be deleted. Error: ${res.message}`,
          color: "red",
          icon: <HiXCircle />,
        });
      }
    });
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <Developer
      user={user}
      title="Domains"
      description="Manage your verified domains."
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {sidebar.map((s) => (
            <NavLink
              icon={s.icon}
              label={s.title}
              description={s.description}
              active={activeTab === s.value}
              onClick={() => setActiveTab(s.value)}
              key={s.title}
              className="rounded-md"
            />
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {activeTab === SidebarValue.Domains && (
            <AnimatePresence mode="wait" initial={false}>
              {selectedDomain === undefined ? (
                <motion.div
                  key="domain-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {loading ? (
                        Array.from({ length: 4 }).map((_v, i) => (
                          <Skeleton height={80} key={i} />
                        ))
                      ) : domains && domains.length === 0 ? (
                        <ShadedCard className="col-span-full flex items-center justify-center">
                          <ModernEmptyState
                            title="No domains"
                            body="You do not have any domains."
                          />
                        </ShadedCard>
                      ) : (
                        domains?.map((d, i) => (
                          <ShadedButton
                            className="w-full flex flex-col gap-4"
                            key={i}
                            onClick={() => setSelectedDomain(d)}
                          >
                            <div className="flex w-full justify-between items-center">
                              <Badge
                                radius="md"
                                color={
                                  d.status === DomainStatus.UNVERIFIED
                                    ? "red"
                                    : DomainStatus.VERIFIED && "green"
                                }
                                className="cursor-pointer"
                              >
                                {d.status === DomainStatus.UNVERIFIED
                                  ? "Unverified"
                                  : DomainStatus.VERIFIED && "Verified"}
                              </Badge>
                              <div className="text-gray-400">
                                <HiArrowRight />
                              </div>
                            </div>
                            <Text size="lg" className="flex items-center gap-2">
                              {d.domain}
                            </Text>
                            <Text size="sm" color="dimmed">
                              {d.id.split("-").shift()}
                            </Text>
                          </ShadedButton>
                        ))
                      )}
                    </div>
                  </>
                </motion.div>
              ) : (
                <motion.div
                  key="server-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-start gap-5">
                      <div className="flex items-center md:gap-6 gap-2">
                        <ActionIcon
                          onClick={() => {
                            setSelectedDomain(undefined);
                          }}
                          size="xl"
                          className="rounded-full hover:border-zinc-500/50 transition-all"
                          sx={{
                            borderWidth: 1,
                          }}
                        >
                          <HiArrowLeft />
                        </ActionIcon>
                        <HiGlobe size={32} />
                      </div>
                      <div>
                        <Title order={3}>{selectedDomain.domain}</Title>
                        <Text color="dimmed">
                          {selectedDomain.txtRecord.split("-").shift()}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        radius="md"
                        size="lg"
                        color={
                          selectedDomain.status === DomainStatus.UNVERIFIED
                            ? "red"
                            : DomainStatus.VERIFIED && "green"
                        }
                      >
                        {selectedDomain.status === DomainStatus.UNVERIFIED
                          ? "Unverified"
                          : DomainStatus.VERIFIED && "Verified"}
                      </Badge>
                      <Menu width={180}>
                        <Menu.Target>
                          <ActionIcon>
                            <HiDotsVertical />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={() => {
                              setSelectedDomain(undefined);
                            }}
                            icon={<HiArrowLeft />}
                          >
                            Back to domains
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              openConfirmModal({
                                title: "Delete domain",
                                children: (
                                  <Text size="sm" color="dimmed">
                                    Are you sure you want to delete this domain?
                                    This action is irreversible. Verification
                                    status will be lost!
                                  </Text>
                                ),
                                labels: {
                                  confirm: "Delete",
                                  cancel: "Cancel",
                                },
                                confirmProps: {
                                  color: "red",
                                  leftIcon: <HiTrash />,
                                },
                                onConfirm: () => {
                                  setSelectedDomain(undefined);
                                  deleteDomain(selectedDomain.domain);
                                },
                              });
                            }}
                            icon={<HiTrash />}
                            color="red"
                          >
                            Delete domain
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </div>
                  {selectedDomain.status === DomainStatus.UNVERIFIED ? (
                    <>
                      <Text color="dimmed" size="sm" mb="xs">
                        In order to verify your domain ownership, please copy
                        the TXT record below and create a TXT DNS record
                        according to the information provided.
                      </Text>
                      <Text color="dimmed" size="sm" mb="lg">
                        Please note that DNS changes may take up to 24 hours to
                        propagate. Once your DNS record has been updated, click
                        the{" "}
                        <span className="font-semibold">
                          &quot;Verify ownership&quot;
                        </span>{" "}
                        button to complete the verification process.
                      </Text>
                      <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
                        <TextInput
                          icon={<HiCog />}
                          required
                          classNames={BLACK}
                          value="TXT"
                          label="DNS record type"
                          description="Create a TXT record to verify ownership of this domain. No other type is supported."
                          onClick={(
                            e: React.MouseEvent<HTMLDivElement, MouseEvent> &
                              React.FocusEvent<HTMLInputElement>
                          ) => e.target.select()}
                        />
                        <TextInput
                          icon={<HiDocumentText />}
                          classNames={BLACK}
                          required
                          value={selectedDomain.domain}
                          label="Record name"
                          description="The name of the TXT record must be the domain you are verifying."
                          onClick={(
                            e: React.MouseEvent<HTMLDivElement, MouseEvent> &
                              React.FocusEvent<HTMLInputElement>
                          ) => e.target.select()}
                        />
                      </div>
                      <TextInput
                        label="Record value"
                        description="Copy and paste this identifier into the value field of your DNS record."
                        classNames={BLACK}
                        value={`fw-verification=${selectedDomain.txtRecord}`}
                        required
                        mt="sm"
                        onClick={(
                          e: React.MouseEvent<HTMLDivElement, MouseEvent> &
                            React.FocusEvent<HTMLInputElement>
                        ) => e.target.select()}
                      />
                      <div className="mt-5 flex justify-between">
                        <Alert
                          color="red"
                          className={clsx(txtError ? "block" : "hidden")}
                          icon={<HiXCircle />}
                        >
                          {txtError}
                        </Alert>
                        <Button
                          leftIcon={<HiCheck />}
                          onClick={() => verifyDomainRecord()}
                          className="ml-auto"
                          loading={loadingOwnership}
                        >
                          Verify ownership
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <DataGrid
                        items={[
                          {
                            tooltip: "Domain",
                            value: (
                              <Anchor href={`https://${selectedDomain.domain}`}>
                                {selectedDomain.domain}
                              </Anchor>
                            ),
                            icon: <HiGlobe />,
                          },
                          {
                            tooltip: "Status",
                            icon: <HiCheckCircle />,
                            value: (
                              <div className="flex items-center gap-2">
                                <Dot
                                  color="green"
                                  classNames={{
                                    pulsar: "w-2 h-2",
                                    dot: "w-2 h-2",
                                  }}
                                  pulse
                                />
                                <span>Verified</span>
                              </div>
                            ),
                          },
                          {
                            tooltip: "ID",
                            icon: <HiHashtag />,
                            value: (
                              <div className="flex items-center gap-2">
                                <Copy value={selectedDomain.id} />
                                <span>
                                  {selectedDomain.id.split("-").shift()}...
                                </span>
                              </div>
                            ),
                          },
                        ]}
                      />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {activeTab === SidebarValue.CreateNewDomain && (
            <>
              <Section
                title="Create a new domain"
                description="Fill out the fields below to add a new domain to your account."
              />
              <Text size="sm" color="dimmed" mb="lg">
                Note that this may be a long process, and it may take up to 24
                hours for your domain to be verified due to DNS propagation.
              </Text>
              <form onSubmit={form.onSubmit((values) => createDomain(values))}>
                <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
                  <TextInput
                    label="Domain"
                    description="The domain you want to add to your account."
                    placeholder="docs.soodam.rocks"
                    required
                    classNames={BLACK}
                    icon={<HiGlobe />}
                    {...form.getInputProps("domain")}
                  />
                  <div className="flex flex-col gap-4">
                    <Button size="lg" leftIcon={<HiPlusCircle />} type="submit">
                      Create domain
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Developer>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default Domains;
