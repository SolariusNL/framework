import { Badge, Divider, Drawer, Text, Title } from "@mantine/core";
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
      href: "/developer",
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
      href: "/settings",
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
      <div
        style={{
          overflowY: "auto",
          height: "calc(100vh - 180px)",
        }}
      >
        {newFeatures
          .sort((a, b) => b.date.getTime() - a.date.getTime())
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
      </div>
    </Drawer>
  );
};

export default UpdateDrawer;
