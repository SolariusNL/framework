import { Alert, Divider, Stack, Text, Title } from "@mantine/core";
import { PrivacyPreferences } from "@prisma/client";
import { useState } from "react";
import { HiArrowsExpand, HiCheckCircle, HiEye, HiShare } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import SwitchCard from "../SwitchCard";
import { updateAccount } from "./AccountTab";
import SettingsTab from "./SettingsTab";

interface PrivacyTabProps {
  user: User;
}

const PrivacyTab = ({ user }: PrivacyTabProps) => {
  const privacyFundamentals = [
    {
      icon: HiShare,
      title: "Control",
      subtitle: "over user data access",
    },
    {
      icon: HiEye,
      title: "Knowledge",
      subtitle: "of how the data is stored",
    },
    {
      icon: HiArrowsExpand,
      title: "Freedom",
      subtitle: "to choose a platform",
    },
  ];
  const privacyDescriptions: {
    [category: string]: {
      [P in keyof typeof PrivacyPreferences]?: {
        title: string;
        description: string;
        label: string;
      };
    };
  } = {
    ANALYTICS: {
      RECORD_SEARCH: {
        title: "Search history",
        description:
          "We'll use your search history to improve search results on Framework",
        label: "Allow usage of search history",
      },
      USAGE_ANALYTICS: {
        title: "Usage analytics",
        description:
          "We'll use your usage data to improve Framework and find what users like",
        label: "Allow usage of usage data",
      },
      RECEIVE_NEWSLETTER: {
        title: "Newsletter",
        description: "We'll send you a newsletter with updates on Framework",
        label: "Allow newsletter",
      },
    },
  };
  const categoryDescriptions = {
    ANALYTICS: "Framework will use the following data to improve the platform",
  };
  const [updated, setUpdated] = useState<PrivacyPreferences[]>(
    user.privacyPreferences
  );
  const [success, setSuccess] = useState(false);

  return (
    <SettingsTab
      tabValue="privacy"
      tabTitle="Privacy"
      saveButtonAction={(setLoading, setError) => {
        updateAccount(
          setLoading,
          setError,
          {
            privacyPreferences: updated,
          },
          setSuccess
        );
      }}
      saveButtonLabel="Save"
    >
      <Text mb={32}>
        The following principles are the foundation of the Framework platform
        and its services. They are the guiding principles that we use when
        making decisions regarding the privacy of our users and their data.
      </Text>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-6">
        {privacyFundamentals.map((fundamental) => (
          <div
            key={fundamental.title}
            style={{
              textAlign: "center",
            }}
          >
            <fundamental.icon size={40} />
            <Title order={5} mt={10} mb={8}>
              {fundamental.title}
            </Title>
            <Text mb={16} size="sm" color="dimmed">
              {fundamental.subtitle}
            </Text>
          </div>
        ))}
      </div>
      <Stack mb={16}>
        {Object.keys(privacyDescriptions).map((category) => {
          return (
            <SwitchCard
              dark
              title={category.charAt(0) + category.slice(1).toLowerCase()}
              description={
                categoryDescriptions[
                  category as keyof typeof categoryDescriptions
                ]
              }
              key={category}
              data={Object.keys(privacyDescriptions[category]).map((key) => {
                const p = privacyDescriptions[category][
                  key as keyof typeof PrivacyPreferences
                ] as { title: string; description: string; label: string };
                return {
                  title: p.title,
                  description: p.description,
                  checked:
                    user.privacyPreferences.find(
                      (n) => n == (key as keyof typeof PrivacyPreferences)
                    ) != null,
                  pointer: key,
                };
              })}
              onChange={(checked, pointer) => {
                const pointerAsKey = pointer as keyof typeof PrivacyPreferences;

                if (checked) {
                  setUpdated([...updated, PrivacyPreferences[pointerAsKey]]);
                } else {
                  setUpdated(
                    updated.filter((n) => n != PrivacyPreferences[pointerAsKey])
                  );
                }
              }}
            />
          );
        })}
      </Stack>

      {success && (
        <Alert title="Success" icon={<HiCheckCircle />} color="green">
          Saved preferences successfully.
        </Alert>
      )}
    </SettingsTab>
  );
};

export default PrivacyTab;
