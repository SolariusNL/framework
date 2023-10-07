import Descriptive from "@/components/descriptive";
import Dot from "@/components/dot";
import { Section } from "@/components/home/friends";
import LabelledCheckbox from "@/components/labelled-checkbox";
import LabelledRadio from "@/components/labelled-radio";
import LoadingIndicator from "@/components/loading-indicator";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import SSRLoader from "@/components/ssr-loader";
import { redisRegions } from "@/data/redis";
import Exchange from "@/icons/Exchange";
import Rocket from "@/icons/Rocket";
import Developer from "@/layouts/DeveloperLayout";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import ServiceUnavailable from "@/pages/503";
import {
  CreateRedisDatabaseResponse,
  GetRedisDatabasesResponse,
} from "@/pages/api/redis/[[...params]]";
import useRedis from "@/stores/useRedis";
import authorizedRoute from "@/util/auth";
import fetchJson, { fetchAndSetData } from "@/util/fetch";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import { Button, NavLink, Select, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { RedisDatabase, RedisDatabaseType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSidePropsContext } from "next";
import dynamic from "next/dynamic";
import React, { ReactNode, useEffect, useState } from "react";
import {
  HiArrowRight,
  HiCheckCircle,
  HiOutlineChartBar,
  HiOutlineDatabase,
  HiOutlineGlobe,
  HiOutlineGlobeAlt,
  HiOutlineTag,
  HiXCircle,
} from "react-icons/hi";

const SelectedDatabaseView = dynamic(
  () => import("@/components/developer/redis/selected-view"),
  { ssr: false, loading: () => SSRLoader }
);

type SidebarItem = {
  title: string;
  description: string;
  icon: ReactNode;
  value: SidebarValue;
};
enum SidebarValue {
  Databases,
  Analytics,
  CreateDatabase,
}
type RedisProps = {
  user: User;
};
type NewDatabaseForm = {
  name: string;
  type: RedisDatabaseType | null;
  region: string;
  multiZoneReplication: boolean;
};

const sidebar: SidebarItem[] = [
  {
    title: "Databases",
    description: "Manage your existing Redis databases.",
    icon: <HiOutlineDatabase />,
    value: SidebarValue.Databases,
  },
  {
    title: "Analytics",
    description: "View metrics for your Redis databases.",
    icon: <HiOutlineChartBar />,
    value: SidebarValue.Analytics,
  },
];

export const databaseTags = (database: RedisDatabase) => {
  return (
    <div className="flex md:flex-row flex-col md:gap-3 gap-1">
      {[
        {
          icon: <HiOutlineGlobeAlt />,
          value: redisRegions[database.region],
        },
        {
          icon: <HiOutlineTag />,
          value: Fw.Strings.upper(database.type),
        },
        {
          icon: <Exchange />,
          value: database.multiZoneReplication
            ? "Multi-zone replication"
            : "Single-zone replication",
        },
      ].map((item, i) => (
        <Text
          size="sm"
          color="dimmed"
          className="flex items-center gap-1"
          key={i}
        >
          {item.icon}
          {item.value}
        </Text>
      ))}
    </div>
  );
};

const Redis: React.FC<RedisProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<SidebarValue>(
    SidebarValue.Databases
  );
  const [loading, setLoading] = useState(false);
  const [databases, setDatabases] = useState<RedisDatabase[]>([]);
  const [anim] = useState(false);
  const form = useForm<NewDatabaseForm>({
    initialValues: {
      name: "",
      type: null,
      region: "",
      multiZoneReplication: false,
    },
    validate: {
      name: (value) => {
        if (!value) return "Name cannot be empty";
        if (value.length > 64) return "Message is too long";
        if (!/^[a-z0-9-]+$/.test(value))
          return "Message must be lowercase and contain only letters, numbers, and dashes (kebab-case)";
      },
      type: (value: unknown) => {
        if (!value) return "Type cannot be empty";
        if (!RedisDatabaseType[value as RedisDatabaseType])
          return "Invalid type";
      },
      region: (value) => {
        if (!redisRegions[value]) return "Invalid region";
      },
    },
  });

  const { setRefetch, setSelectedDatabase, opened } = useRedis();

  const fetchRedisDatabases = async () => {
    setLoading(true);
    await Promise.all([
      fetchAndSetData<GetRedisDatabasesResponse>(
        "/api/redis/databases",
        (res) => setDatabases(res?.databases ?? [])
      ),
    ]).finally(() => setLoading(false));
  };
  const createRedisDatabase = async (values: NewDatabaseForm) => {
    await fetchJson<CreateRedisDatabaseResponse>("/api/redis/new", {
      method: "POST",
      auth: true,
      body: values,
    }).then((res) => {
      if (res.success) {
        showNotification({
          title: "Success",
          message: "Your database has been created and is being provisioned.",
          icon: <HiCheckCircle />,
        });
        setActiveTab(SidebarValue.Databases);
        setDatabases((prev) => [...prev, res.data?.database!]);
        form.reset();
      } else {
        showNotification({
          title: "Error",
          message: res.message ?? "An unknown error occurred.",
          icon: <HiXCircle />,
          color: "red",
        });
      }
    });
  };

  useEffect(() => {
    fetchRedisDatabases();
    setRefetch(fetchRedisDatabases);
  }, []);

  return Fw.Feature.enabled(Fw.FeatureIdentifier.Redis) ? (
    <Developer
      user={user}
      title="Redis"
      description="Store data in hosted Redis databases with maximum uptime and reliability."
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
          {activeTab === SidebarValue.Databases && (
            <>
              <AnimatePresence mode="wait" initial={false}>
                {opened ? (
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
                    <SelectedDatabaseView />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      key="server-list"
                      initial={{
                        opacity: 0,
                        x: anim ? 20 : 0,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: anim ? 20 : 0,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    >
                      <Section
                        title="Databases"
                        description="Overview of your Redis databases."
                        right={
                          <Button
                            radius="xl"
                            variant="light"
                            leftIcon={<Rocket />}
                            onClick={() =>
                              setActiveTab(SidebarValue.CreateDatabase)
                            }
                          >
                            New database
                          </Button>
                        }
                      />
                      {loading ? (
                        <ShadedCard className="w-full flex justify-center items-center py-12">
                          <LoadingIndicator />
                        </ShadedCard>
                      ) : (
                        <>
                          {databases.length === 0 ? (
                            <>
                              <ShadedCard>
                                <ModernEmptyState
                                  title="No databases"
                                  body="You don't have any Redis databases yet."
                                />
                              </ShadedCard>
                            </>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {databases.map((database) => (
                                <ShadedButton
                                  className="w-full group"
                                  onClick={() => setSelectedDatabase(database)}
                                  key={database.id}
                                >
                                  <div className="flex justify-between w-full items-center">
                                    <div className="flex flex-col md:gap-0 gap-4">
                                      <div className="flex items-center gap-3">
                                        <Dot pulse />
                                        <Title order={3} className="font-mono">
                                          {database.name}
                                        </Title>
                                      </div>
                                      {databaseTags(database)}
                                    </div>
                                    <HiArrowRight className="text-dimmed text-2xl opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                </ShadedButton>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
          {activeTab === SidebarValue.Analytics && (
            <>
              <Section
                title="Analytics"
                description="View metrics for your Redis databases."
              />
              <ShadedCard>
                <ModernEmptyState
                  title="No analytics"
                  body="You don't have any analytics yet."
                />
              </ShadedCard>
            </>
          )}
          {activeTab === SidebarValue.CreateDatabase && (
            <>
              <Section
                title="Create database"
                description="Fill out the form below to create a new Redis database."
              />
              <form onSubmit={form.onSubmit(createRedisDatabase)}>
                <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
                  <TextInput
                    icon={<HiOutlineTag />}
                    placeholder="Database name"
                    label="Database name"
                    description="Enter a name for your database in kebab-case (lowercase letters, numbers, and dashes)."
                    required
                    {...form.getInputProps("name")}
                  />
                  <Select
                    label="Region"
                    description="The region in which your database will be hosted and replicated."
                    placeholder="Select a region"
                    icon={<HiOutlineGlobe />}
                    data={
                      Object.entries(redisRegions).map(([key, value]) => ({
                        value: key,
                        label: value,
                      })) ?? []
                    }
                    required
                    {...form.getInputProps("region")}
                  />
                  <div className="flex flex-col gap-4">
                    <Descriptive
                      title="Type"
                      description="The database will be deployed depending on this selection."
                      required
                    >
                      <LabelledRadio
                        label="Regional database"
                        description="A regional database is hosted in a single region."
                        value="regional"
                        onChange={(e) => {
                          form.setFieldValue(
                            "type",
                            e.currentTarget.value === "regional"
                              ? RedisDatabaseType.REGIONAL
                              : RedisDatabaseType.GLOBAL
                          );
                        }}
                        checked={
                          form.values.type === RedisDatabaseType.REGIONAL
                        }
                      />
                      <LabelledRadio
                        label="Global database"
                        description="A global database is replicated across multiple zones."
                        value="multi-zone"
                        onChange={(e) => {
                          form.setFieldValue(
                            "type",
                            e.currentTarget.value === "regional"
                              ? RedisDatabaseType.REGIONAL
                              : RedisDatabaseType.GLOBAL
                          );
                        }}
                        checked={form.values.type === RedisDatabaseType.GLOBAL}
                      />
                    </Descriptive>
                  </div>
                  <LabelledCheckbox
                    label="Multi-zone replication"
                    description="Replicate your database across multiple zones for increased availability."
                    {...form.getInputProps("multiZoneReplication", {
                      type: "checkbox",
                    })}
                  />
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <Button
                    variant="light"
                    radius="xl"
                    color="gray"
                    onClick={() => {
                      setActiveTab(SidebarValue.Databases);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="light"
                    radius="xl"
                    type="submit"
                    leftIcon={<Rocket />}
                  >
                    Create database
                  </Button>
                </div>
              </form>
            </>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Developer>
  ) : (
    <ServiceUnavailable />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default Redis;
