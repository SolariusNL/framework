import { Badge, Button, Skeleton, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";

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

      <Button.Group>
        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://github.com/Tsodinq/framework"
          target="_blank"
          rel="noreferrer"
        >
          Source Code
        </Button>

        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://github.com/Tsodinq/framework/issues"
          target="_blank"
          rel="noreferrer"
        >
          Report a Bug
        </Button>

        <Button
          leftIcon={<HiExternalLink />}
          component="a"
          href="https://github.com/Tsodinq/framework/blob/main/LICENSE"
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
