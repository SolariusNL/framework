import {
  Anchor,
  Divider,
  Skeleton,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiEmojiHappy, HiEmojiSad, HiExternalLink } from "react-icons/hi";
import TabNav from "../../TabNav";

export enum PrefCategory {
  Email = "email",
  Integrations = "integrations",
  Flags = "flags",
}

const Instance = () => {
  const [version, setVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [emailPrefs, setEmailPrefs] = useState(new Map<string, string>());
  const [flagPrefs, setFlagPrefs] = useState(new Map<string, string>());

  const fetchPrefs = async (
    category: PrefCategory,
    callback: (prefs: Map<string, string>) => void
  ) => {
    const res = await fetch(`/api/admin/prefs/${category}`, {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    });
    const data = await res.json();
    callback(new Map(Object.entries(data)));
  };

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

    fetch("https://tsodinq.github.io/framework/docs/version.txt")
      .then((res) => res.text())
      .then((res) => {
        setLatestVersion(res.substring(0, res.length - 1));
      });
  }, []);

  useEffect(() => {
    fetchPrefs(PrefCategory.Email, setEmailPrefs);
    fetchPrefs(PrefCategory.Flags, setFlagPrefs);
  }, []);

  return (
    <>
      <TabNav orientation="vertical" defaultValue="general">
        <TabNav.List mr="xl">
          <TabNav.Tab value="general">General</TabNav.Tab>
          <TabNav.Tab value="email">Email</TabNav.Tab>
          <TabNav.Tab value="integrations">Integrations</TabNav.Tab>
          <TabNav.Tab value="flags">Flags</TabNav.Tab>
        </TabNav.List>

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
                href={`https://github.com/Tsodinq/framework/releases/tag/${version}`}
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
                href={`https://github.com/Tsodinq/framework/releases/tag/${version}`}
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
        <Tabs.Panel value="email">
          <Table highlightOnHover>
            <tbody>
              {Array.from(emailPrefs).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value="integrations">
          <></>
        </Tabs.Panel>
        <Tabs.Panel value="flags">
          <Table highlightOnHover>
            <tbody>
              {Array.from(flagPrefs).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>
      </TabNav>
    </>
  );
};

export default Instance;
