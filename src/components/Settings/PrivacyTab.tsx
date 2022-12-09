import { Alert, Divider, Stack, Switch, Text, Title } from "@mantine/core";
import { PrivacyPreferences } from "@prisma/client";
import { useState } from "react";
import { HiArrowsExpand, HiCheckCircle, HiEye, HiShare } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Descriptive from "../Descriptive";
import { updateAccount } from "./AccountTab";
import Grouped from "./Grouped";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

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
      <Title order={4} mb={16}>
        User Data Manifesto 2.0
      </Title>
      <Text mb={32}>
        The following principles are the foundation of the Framework platform
        and its services. They are the guiding principles that we use when
        making decisions regarding the privacy of our users and their data.
      </Text>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
      <Divider mt={32} mb={32} />
      <Stack mb={32}>
        {Object.keys(privacyDescriptions).map((category) => {
          return (
            <Grouped
              title={category.charAt(0) + category.slice(1).toLowerCase()}
              key={category}
            >
              {Object.keys(privacyDescriptions[category]).map((key) => {
                const p = privacyDescriptions[category][
                  key as keyof typeof PrivacyPreferences
                ] as { title: string; description: string; label: string };

                return (
                  <SideBySide
                    title={p.title}
                    description={p.description}
                    key={key}
                    shaded
                    noUpperBorder
                    right={
                        <Switch
                          defaultChecked={
                            user.privacyPreferences.find(
                              (n) => n == (key as PrivacyPreferences)
                            ) != null
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUpdated([
                                ...updated,
                                key as PrivacyPreferences,
                              ]);
                            } else {
                              setUpdated(
                                updated.filter(
                                  (n) => n != (key as PrivacyPreferences)
                                )
                              );
                            }
                          }}
                          label={p.label}
                        />
                    }
                  />
                );
              })}
            </Grouped>
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
