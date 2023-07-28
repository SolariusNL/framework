import SettingsTab from "@/components/settings/settings-tab";
import { getIpcRenderer } from "@/util/electron";
import { User } from "@/util/prisma-types";
import { Badge, Button, Skeleton, Text } from "@mantine/core";
import isElectron from "is-electron";
import { useEffect, useState } from "react";
import { HiDownload, HiExternalLink } from "react-icons/hi";

interface AboutTabProps {
  user: User;
}

const AboutTab = ({ user }: AboutTabProps) => {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doc/version")
      .then((res) => res.text())
      .then((res) => setVersion(res));
  }, []);

  return (
    <SettingsTab tabValue="about" tabTitle="About Framework">
      <Badge size="lg" mb={32}>
        {version ? (
          version
        ) : (
          <Skeleton
            sx={{
              display: "inline-block",
            }}
            width={100}
          />
        )}
      </Badge>

      <Text mb={32}>
        Framework is a free and open source platform of what Roblox should have
        been. It is a place where you can create, share, and socialize with
        others in a safe and friendly environment.
      </Text>

      {isElectron() && (
        <div
          style={{
            display: "flex",
            alignItems: "start",
            gap: 12,
          }}
        >
          <Button
            leftIcon={<HiDownload />}
            onClick={() => {
              const ipcRenderer = getIpcRenderer();
              ipcRenderer.send("check-for-updates");

              [
                "update-available",
                "update-not-available",
                "update-downloaded",
              ].forEach((channel) => {
                ipcRenderer.on(channel, (event: any, args: any) => {
                  console.log(channel, args);
                });
              });
            }}
            mb={32}
            disabled={process.platform === "linux"}
          >
            Check for Updates
          </Button>
          {process.platform === "linux" && (
            <Text color="dimmed" weight={750} size="sm">
              Automatic updates are not supported on Linux. Please update
              Framework using your package manager.
            </Text>
          )}
        </div>
      )}

      <Button.Group>
        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://invent.solarius.me/Soodam.re/framework"
          target="_blank"
          rel="noreferrer"
        >
          Source Code
        </Button>

        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://invent.solarius.me/Soodam.re/framework/-/issues/new?issue[assignee_id]=&issue[milestone_id]="
          target="_blank"
          rel="noreferrer"
        >
          Report a Bug
        </Button>

        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://invent.solarius.me/Soodam.re/framework/-/blob/main/LICENSE"
          target="_blank"
          rel="noreferrer"
        >
          License
        </Button>
      </Button.Group>
    </SettingsTab>
  );
};

export default AboutTab;
