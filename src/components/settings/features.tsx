import { Section } from "@/components/home/friends";
import SettingsTab from "@/components/settings/settings-tab";
import SideBySide from "@/components/settings/side-by-side";
import Rocket from "@/icons/Rocket";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import usePreferences, { PreferencesStore } from "@/stores/usePreferences";
import { Preferences } from "@/util/preferences";
import { User } from "@/util/prisma-types";
import { UserPreferences } from "@/util/types";
import { Anchor, Divider, Stack, Switch } from "@mantine/core";
import { ReactNode, useState } from "react";
import {
  HiChat,
  HiExclamation,
  HiExclamationCircle,
  HiMicrophone,
  HiPhotograph,
  HiShoppingCart,
  HiSparkles,
  HiTable,
} from "react-icons/hi";
import InlineError from "../inline-error";

type FeaturesTabProps = {
  user: User;
};

type Feature = {
  title: string;
  description: string;
  property: UserPreferences;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledRenderer?: ReactNode;
};
type FeatureSwitchProps = Feature & {
  preferences: PreferencesStore["preferences"];
  setPreferences: typeof Preferences.setPreferences;
};

const FeatureSwitch: React.FC<FeatureSwitchProps> = ({
  title,
  description,
  icon,
  property,
  preferences,
  setPreferences,
  disabled,
  disabledRenderer,
}) => (
  <SideBySide
    title={title}
    description={description}
    icon={icon}
    right={
      disabled ? (
        disabledRenderer
      ) : (
        <Switch
          label={`Enable ${title.toLowerCase()}`}
          checked={Boolean(preferences[property])}
          onChange={() =>
            setPreferences({
              [property]: !preferences[property],
            })
          }
          classNames={BLACK}
          disabled={disabled}
        />
      )
    }
    shaded
    noUpperBorder
  />
);

const FeaturesTab = ({ user }: FeaturesTabProps) => {
  const { preferences } = usePreferences();
  const [success, setSuccess] = useState(false);

  const renderFeatures = (features: Feature[]) => (
    <Stack spacing="sm">
      {features.map((feature) => (
        <FeatureSwitch
          key={feature.property}
          {...feature}
          preferences={preferences}
          setPreferences={Preferences.setPreferences}
        />
      ))}
    </Stack>
  );

  const PERSONALIZATION: Feature[] = [
    {
      title: "Personalized games",
      description:
        "Allow us to recommend games based on your activity and interests.",
      property: "@feature/personalised-games",
      icon: <Rocket />,
    },
    {
      title: "Personalized catalog",
      description:
        "Allow us to recommend catalog items to buy based on your previous purchases.",
      property: "@feature/personalised-catalog",
      icon: <HiShoppingCart />,
    },
    {
      title: "Crash reports",
      description:
        "Automatically submit crash and error reports to Solarius for debugging purposes.",
      property: "@feature/crash-reports",
      icon: <HiTable />,
    },
  ];
  const ADVERTISING: Feature[] = [
    {
      title: "User ads",
      description:
        "Allow us to show you user-generated advertisements on the platform. If disabled, you may still see advertisements from us.",
      property: "@feature/user-ads",
      icon: <HiPhotograph />,
    },
    {
      title: "Preroll ads",
      description:
        "Allow us to show you advertisements before you join a game. Available to Premium members only.",
      property: "@feature/preroll-ads",
      disabled: !user.premium,
      disabledRenderer: (
        <InlineError
          variant="pink"
          icon={<HiSparkles />}
          title="Purchase Premium"
        >
          <Anchor href="/premium">Purchase Premium</Anchor> to disable preroll
          advertisements on Framework. Premium helps keep our services free to
          use.
        </InlineError>
      ),
      icon: <HiPhotograph />,
    },
  ];
  const SAFETY: Feature[] = [
    {
      title: "Child safety",
      description:
        "Enable child safety features to prevent your child from seeing inappropriate content.",
      property: "@feature/child-safety",
      icon: <HiExclamation />,
    },
    {
      title: "Safe chat",
      description:
        "Enable safe chat to filter out explicit language from chat messages.",
      property: "@feature/chat-filter",
      icon: <HiChat />,
    },
    {
      title: "Voice chat",
      description:
        "Enable voice chat to communicate with other players in-game through your microphone.",
      property: "@feature/voice-chat",
      icon: <HiMicrophone />,
    },
    {
      title: "Adult games",
      description: "Allow discovery of M-rated games or above on Framework.",
      property: "@feature/adult-games",
      icon: <HiExclamationCircle />,
    },
  ];

  return (
    <>
      <SettingsTab
        tabValue="features"
        tabTitle="Features"
        setSuccess={setSuccess}
        success={success}
      >
        <Section
          title="Personalization"
          description="Personalize what you see on the platform based on your activity."
        />
        {renderFeatures(PERSONALIZATION)}
        <Divider className="my-8" />
        <Section
          title="Advertising"
          description="Control what advertisements you see on the platform."
        />
        {renderFeatures(ADVERTISING)}
        <Divider className="my-8" />
        <Section
          title="Safety"
          description="Control what safety features are enabled on your account."
        />
        {renderFeatures(SAFETY)}
      </SettingsTab>
    </>
  );
};

export default FeaturesTab;
