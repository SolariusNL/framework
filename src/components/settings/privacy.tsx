import { updateAccount } from "@/components/settings/account";
import SettingsTab from "@/components/settings/settings-tab";
import SwitchCard from "@/components/switch-card";
import { User } from "@/util/prisma-types";
import { Alert, Stack, Text, Title } from "@mantine/core";
import { PrivacyPreferences } from "@prisma/client";
import { useState } from "react";
import {
  HiCheckCircle,
  HiOutlineArrowsExpand,
  HiOutlineEye,
  HiOutlineShare,
} from "react-icons/hi";

interface PrivacyTabProps {
  user: User;
}

const PrivacyTab = ({ user }: PrivacyTabProps) => {
  const privacyFundamentals = [
    {
      icon: HiOutlineShare,
      title: "Control",
      subtitle: "over user data access",
    },
    {
      icon: HiOutlineEye,
      title: "Knowledge",
      subtitle: "of how the data is stored",
    },
    {
      icon: HiOutlineArrowsExpand,
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
    FEATURES: {
      USER_DISCOVERY: {
        title: "User discovery",
        description:
          "Users can find you through mutual friends with user discovery enabled",
        label: "Appear in user discovery",
      },
      CHAT_REQUESTS: {
        title: "Chat requests",
        description:
          "Users can send you chat requests to start a conversation even if you're not friends",
        label: "Allow chat requests",
      },
      HIDE_INVENTORY: {
        title: "Hide inventory",
        description: "Users can't see your inventory if you have this enabled",
        label: "Hide inventory",
      },
    },
  };
  const categoryDescriptions = {
    ANALYTICS: "Framework will use the following data to improve the platform",
    FEATURES: "Framework will use the following data to enable features",
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
