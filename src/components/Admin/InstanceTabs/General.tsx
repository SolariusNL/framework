import { Anchor, Divider, Skeleton, Tabs, Text, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiEmojiHappy, HiEmojiSad, HiExternalLink } from "react-icons/hi";

const GeneralTab: React.FC = () => {
  const [version, setVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");

  useEffect(() => {
    fetch("/api/admin/instance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setVersion(res.version);
      });

    fetch("https://invent.soodam.rocks/api/v4/projects/4/releases/")
      .then((res) => res.json())
      .then((res: Array<{ tag_name: string }>) => {
        setLatestVersion(res[0].tag_name);
      });
  }, []);

  return (
    <Tabs.Panel value="general">
      <Title mb={24} order={2}>
        Framework
      </Title>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 md:col-span-1">
          <Text color="dimmed" size="sm" mb={8}>
            Installed
          </Text>
          <Anchor
            href={`https://invent.soodam.rocks/Soodam.re/framework/-/releases/${version}`}
            target="_blank"
            className="flex items-center"
          >
            <Title order={2} mr={8}>
              {!version ? <Skeleton height={32} width={74} /> : version}
            </Title>
            <HiExternalLink />
          </Anchor>
        </div>
        <div className="col-span-3 md:col-span-1">
          <Text color="dimmed" size="sm" mb={8}>
            Latest
          </Text>
          <Anchor
            href={`https://invent.soodam.rocks/Soodam.re/framework/-/releases/${version}`}
            target="_blank"
            className="flex items-center"
          >
            <Title order={2} mr={8}>
              {!latestVersion ? (
                <Skeleton height={32} width={74} />
              ) : (
                latestVersion
              )}
            </Title>
            <HiExternalLink />
          </Anchor>
        </div>
        <div className="col-span-3 md:col-span-1">
          {version && latestVersion && version !== latestVersion ? (
            <div className="flex items-center gap-2 flex-wrap">
              <HiEmojiSad size={32} className="text-red-500" />
              <Text color="red">
                You are not running the latest version of Framework. Please
                update to the latest version to ensure you are receiving the
                latest security updates.
              </Text>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <HiEmojiHappy size={32} className="text-green-500" />
              <Text color="green">
                You are running the latest version of Framework.
              </Text>
            </div>
          )}
        </div>
      </div>
      <Divider mt={32} mb={32} />
      <Title mb={24} order={2}>
        Database
      </Title>
    </Tabs.Panel>
  );
};

export default GeneralTab;
