import IconTooltip from "@/components/icon-tooltip";
import ModernEmptyState from "@/components/modern-empty-state";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { NonUser } from "@/util/prisma-types";
import { Anchor, Card, CardProps, Text } from "@mantine/core";
import { Domain, DomainStatus, ProfileLink } from "@prisma/client";
import { useEffect, useState } from "react";
import { HiBadgeCheck } from "react-icons/hi";

interface LinksProps {
  user: NonUser & {
    profileLinks: ProfileLink[];
  };
}

const PROTOCOL_REGEX = /^(?:https?:\/\/)?/i;

const Links = ({
  user,
  ...props
}: LinksProps & Omit<CardProps, "children">) => {
  const [domains, setDomains] = useState<Domain[]>();

  const fetchDomains = async () => {
    await fetchJson<IResponseBase<{ domains: Domain[] }>>(
      "/api/domains/u/" + user.id,
      {
        auth: true,
      }
    ).then((res) => {
      if (res.success) {
        setDomains(res.data?.domains!);
      }
    });
  };

  const removeProtocol = (domain: string): string => {
    let domainWithoutProtocol = domain.replace(PROTOCOL_REGEX, "");
    const pathIndex = domainWithoutProtocol.indexOf("/");
    if (pathIndex !== -1) {
      domainWithoutProtocol = domainWithoutProtocol.slice(0, pathIndex);
    }
    return domainWithoutProtocol.replace(/\/$/, "");
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <div
      className="min-w-0 truncate flex flex-col gap-4 text-ellipsis"
      {...props}
    >
      {user.profileLinks
        .map((link) => ({
          ...link,
          url: link.url.startsWith("http") ? link.url : `https://${link.url}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((link, i) => (
          <Card.Section key={i} className="flex flex-col">
            <div className="flex gap-2 items-center">
              <Text weight={700} size="sm" color="dimmed" mb={4}>
                {link.name}
              </Text>
              {typeof window !== "undefined" &&
                domains &&
                domains
                  .filter((d) =>
                    [
                      DomainStatus.GENERATING_CERTIFICATE,
                      DomainStatus.VERIFIED,
                    ].includes(
                      d.status as "GENERATING_CERTIFICATE" | "VERIFIED"
                    )
                  )
                  .map((d) => d.domain)
                  .includes(removeProtocol(link.url)) && (
                  <IconTooltip
                    icon={<HiBadgeCheck className="text-sky-500 -mt-1" />}
                    label="This user has verified ownership of this domain"
                  />
                )}
            </div>
            <Anchor
              onClick={() => Fw.Links.externalWarning(link.url)}
              target="_blank"
              className="truncate"
            >
              {link.url}
            </Anchor>
          </Card.Section>
        ))}
      {user.profileLinks.length === 0 && (
        <div className="w-full justify-center flex">
          <ModernEmptyState title="No links" body="This user has no links." />
        </div>
      )}
    </div>
  );
};

export default Links;
