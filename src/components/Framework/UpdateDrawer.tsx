import { Badge, Divider, Drawer, ScrollArea, Text, Title } from "@mantine/core";
import Link from "next/link";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import ShadedButton from "../ShadedButton";

enum BadgeType {
  NEW = "NEW",
  FIX = "FIX",
  EXPERIMENT = "EXPERIMENT",
  CHANGE = "CHANGE",
}

const UpdateDrawer: React.FC = () => {
  const { opened, setOpened } = useUpdateDrawer();
  const newFeatures: Array<{
    title: string;
    description: string;
    badge: BadgeType;
    date: Date;
    href?: string;
  }> = [
    {
      title: "Conversations 2.0",
      description:
        "Introducing Conversations 2.0. Create groups with multiple people in Chat and enjoy improved Chat performance.",
      badge: BadgeType.NEW,
      date: new Date("2023-05-25"),
    },
    {
      title: "Chat released",
      description:
        "Framework Chat, the successor to Messages is now in general availability.",
      badge: BadgeType.NEW,
      href: "/chat",
      date: new Date("2023-05-19"),
    },
    {
      title: "Improved server provisioning",
      description:
        "We've added a new Cosmic server creation tool to simplify the process.",
      badge: BadgeType.NEW,
      href: "/developer/servers?page=CreateServer",
      date: new Date("2023-04-10"),
    },
    {
      title: "OAuth2",
      description:
        "We've release OAuth2 to the public for developers to build applications that integrate with Framework.",
      badge: BadgeType.NEW,
      href: "/developer/oauth2",
      date: new Date("2023-04-08"),
    },
    {
      title: "AMOLED Dark Mode",
      description: "An AMOLED Dark Mode experiment is now available.",
      badge: BadgeType.EXPERIMENT,
      href: "/settings/preview-program",
      date: new Date("2023-03-26"),
    },
    {
      title: "DMCA Form",
      description: "We've released a dedicated DMCA takedown request form.",
      badge: BadgeType.NEW,
      href: "/dmca",
      date: new Date("2023-03-21"),
    },
    {
      title: "Team moderation",
      description:
        "We've added the ability to remove and ban users from your teams.",
      badge: BadgeType.NEW,
      date: new Date("2023-03-21"),
    },
    {
      title: "New Font",
      description:
        "We've switched to a new font, GitLab Sans, to improve readability and accessibility.",
      badge: BadgeType.CHANGE,
      date: new Date("2023-02-23"),
    },
    {
      title: "Teams",
      description:
        "Teams are now available in an experimental state. Teams are our new way of collaboration and organization, comparable to Groups on Roblox.",
      badge: BadgeType.EXPERIMENT,
      date: new Date("2023-02-23"),
    },
    {
      title: "Redesigned Settings",
      description:
        "The settings page has been redesigned to simplify user experience and improve mobile UX.",
      badge: BadgeType.CHANGE,
      date: new Date("2023-02-07"),
    },
    {
      title: "Banned Profiles",
      description:
        "Banned profiles are no longer shown to improve user safety.",
      badge: BadgeType.CHANGE,
      date: new Date("2023-02-07"),
    },
    {
      title: "Email Login",
      description: "You can now login to Framework using your email.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-29"),
    },
    {
      title: "Game Update Logs",
      description:
        "We've added the ability to add update logs to games. These will help you keep your users up to date with your game's development and changes.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-29"),
    },
    {
      title: "Game Following",
      description: "You can now follow games to receive updates on them.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-29"),
    },
    {
      title: "Game Privating",
      description:
        "You can now make your games private. This will hide them from the public, and only you and whitelisted users will be able to access them.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-28"),
    },
    {
      title: "Chat Release Candidate",
      description:
        "The new Chat feature has entered release candidate status, as it replaces the old Messages feature. We thank you for your feedback during it's early stages.",
      badge: BadgeType.NEW,
      href: "/chat",
      date: new Date("2023-01-26"),
    },
    {
      title: "Dashboard Redesign",
      description:
        "We've redesigned the Dashboard to streamline the UX. More features to come!",
      badge: BadgeType.NEW,
      href: "/",
      date: new Date("2023-01-24"),
    },
    {
      title: "Quick Login",
      description:
        "Quick login allows you to quickly access your account using a QR code without needing to enter any credentials.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-21"),
    },
    {
      title: "Referral Program",
      description:
        "We've added a referral program. Access your referral code & enter your friends' referral codes in the Settings page.",
      badge: BadgeType.NEW,
      href: "/settings/referrals",
      date: new Date("2023-01-18"),
    },
    {
      title: "Daily Prize Email Verification Requirement",
      description:
        "You must now verify your email to claim your daily prize. This is to prevent abuse, and to prevent any type of automated claiming.",
      badge: BadgeType.CHANGE,
      date: new Date("2023-01-08"),
    },
    {
      title: "API Key Management",
      description:
        "You can now manage your API keys in the new Developer Dashboard.",
      badge: BadgeType.NEW,
      href: "/developer/servers",
      date: new Date("2023-01-06"),
    },
    {
      title: "New Profile Badges",
      description:
        "We've added badges for having your email verified, and for enabling TOTP 2FA.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-06"),
    },
    {
      title: "Username Changes",
      description:
        "We've fixed a bug that allowed users to change their username to one already in use. This is now fixed.",
      badge: BadgeType.FIX,
      date: new Date("2023-01-06"),
    },
    {
      title: "What's New",
      description:
        "We've added a What's New drawer that will show you new features and bug fixes when invoked from the user menu.",
      badge: BadgeType.NEW,
      date: new Date("2023-01-06"),
    },
    {
      title: "Live Chat",
      description:
        "We've added a live chat experiment to the preview program. It's based on websocket technology, and is currently in alpha. You can find it in Preview Program tab in your settings.",
      badge: BadgeType.EXPERIMENT,
      date: new Date("2022-12-31"),
      href: "/settings/preview-program",
    },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      position="right"
      sx={{
        zIndex: 1000,
      }}
      padding="md"
    >
      <Title order={3}>What&apos;s new in Framework?</Title>
      <Divider mt="lg" mb="lg" />
      <ScrollArea
        style={{
          overflowY: "auto",
          height: "calc(100vh - 180px)",
        }}
        offsetScrollbars
      >
        {newFeatures
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 10)
          .map((feature) => (
            <Link key={feature.title} href={feature.href || {}}>
              <ShadedButton
                key={feature.title}
                className={feature.href ? "cursor-pointer" : "cursor-default"}
              >
                <div>
                  <Text weight={500} className="mb-2">
                    {feature.title}
                  </Text>
                  <Text size="sm" color="dimmed" mb="sm">
                    {feature.description}
                  </Text>
                  <div className="flex items-center justify-between">
                    <Text size="sm" color="dimmed" weight={500}>
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(feature.date)}
                    </Text>
                    <Badge
                      color={
                        feature.badge === BadgeType.NEW
                          ? "blue"
                          : feature.badge === BadgeType.FIX
                          ? "pink"
                          : feature.badge === BadgeType.EXPERIMENT
                          ? "indigo"
                          : feature.badge === BadgeType.CHANGE
                          ? "violet"
                          : "grape"
                      }
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                </div>
              </ShadedButton>
            </Link>
          ))}
      </ScrollArea>
    </Drawer>
  );
};

export default UpdateDrawer;
