import { Text, Title } from "@mantine/core";
import { HiArrowsExpand, HiEye, HiShare } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
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
      body: "Data explicitly and willingly uploaded by a user should be under the ultimate control of the user. Users should be able to decide whom to grant direct access to their data and with which permissions and licenses such access should be granted.",
    },
    {
      icon: HiEye,
      title: "Knowledge",
      subtitle: "of how the data is stored",
      body: "When the data is uploaded to a specific service provider, users should be informed about where that specific service provider stores the data, how long, in which jurisdiction the specific service provider operates, and which laws apply.",
    },
    {
      icon: HiArrowsExpand,
      title: "Freedom",
      subtitle: "to choose a platform",
      body: "Users should always be able to extract their data from the service at any time without experiencing any vendor lock-in. Open standards for formats and protocols are necessary to guarantee this.",
    },
  ];

  const mobile = useMediaQuery("768");

  return (
    <SettingsTab tabValue="privacy" tabTitle="Privacy">
      <Title order={4} mb={16}>
        User Data Manifesto 2.0
      </Title>
      <Text mb={16}>
        The following principles are the foundation of the Framework platform
        and its services. They are the guiding principles that we use when
        making decisions regarding the privacy of our users and their data.
      </Text>
      <div
        style={{
          display: mobile ? "block" : "flex",
          gap: 16,
        }}
      >
        {privacyFundamentals.map((fundamental) => (
          <div
            key={fundamental.body}
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
            <Text>{fundamental.body}</Text>
          </div>
        ))}
      </div>
    </SettingsTab>
  );
};

export default PrivacyTab;
