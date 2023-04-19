import {
  Badge,
  Button,
  NavLink,
  Skeleton,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Domain, DomainStatus } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { ReactNode, useEffect, useState } from "react";
import { HiGlobe, HiPlusCircle, HiXCircle } from "react-icons/hi";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import IResponseBase from "../../types/api/IResponseBase";
import authorizedRoute from "../../util/auth";
import fetchJson from "../../util/fetch";
import { User } from "../../util/prisma-types";
import { BLACK } from "../teams/t/[slug]/issue/create";
import { showNotification } from "@mantine/notifications";

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
  const [selectedDomain, setSelectedDomain] = useState<Domain>();
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_v, i) => (
                    <Skeleton height={80} key={i} />
                  ))
                ) : domains && domains.length ? (
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
                    >
                      <Badge
                        radius="md"
                        color={
                          d.status === DomainStatus.UNVERIFIED
                            ? "red"
                            : DomainStatus.VERIFIED
                            ? "orange"
                            : DomainStatus.GENERATING_CERTIFICATE
                            ? "yellow"
                            : "green"
                        }
                        className="cursor-pointer"
                      >
                        {d.status === DomainStatus.UNVERIFIED
                          ? "Unverified"
                          : DomainStatus.VERIFIED
                          ? "Verified"
                          : DomainStatus.GENERATING_CERTIFICATE
                          ? "Generating Certificate"
                          : DomainStatus.COMPLETE && "Verified"}
                      </Badge>
                      <Text size="lg" className="flex items-center gap-2">
                        {d.domain}
                      </Text>
                    </ShadedButton>
                  ))
                )}
              </div>
            </>
          )}
          {activeTab === SidebarValue.CreateNewDomain && (
            <>
              <Section
                title="Create a new domain"
                description="Fill out the fields below to add a new domain to your account."
              />
              <Text size="sm" color="dimmed" mb="lg">
                You cannot use apex domains as they pose a security risk of
                domain takeover. You must use a subdomain.
              </Text>
              <form onSubmit={form.onSubmit((values) => createDomain(values))}>
                <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
                  <TextInput
                    label="Domain"
                    description="Your domain must include a subdomain."
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
