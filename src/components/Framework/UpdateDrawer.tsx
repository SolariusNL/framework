import {
  Badge,
  Divider,
  Drawer, Text,
  Title
} from "@mantine/core";
import Link from "next/link";
import useUpdateDrawer from "../../stores/useUpdateDrawer";
import ShadedButton from "../ShadedButton";

enum BadgeType {
  NEW = "NEW",
  FIX = "FIX",
  EXPERIMENT = "EXPERIMENT",
}

const UpdateDrawer: React.FC = () => {
  const { opened, setOpened } = useUpdateDrawer();
  const newFeatures: Array<{
    title: string;
    description: string;
    badge: BadgeType;
    href?: string;
  }> = [
    {
      title: "API Key Management",
      description:
        "You can now manage your API keys in the new Developer Dashboard.",
      badge: BadgeType.NEW,
      href: "/developer",
    },
    {
      title: "New Profile Badges",
      description:
        "We've added badges for having your email verified, and for enabling TOTP 2FA.",
      badge: BadgeType.NEW,
    },
    {
      title: "Username Changes",
      description:
        "We've fixed a bug that allowed users to change their username to one already in use. This is now fixed.",
      badge: BadgeType.FIX,
    },
    {
      title: "What's New",
      description:
        "We've added a What's New drawer that will show you new features and bug fixes when invoked from the user menu.",
      badge: BadgeType.NEW,
    },
    {
      title: "Live Chat",
      description:
        "We've added a live chat experiment to the preview program. It's based on websocket technology, and is currently in alpha. You can find it in Preview Program tab in your settings.",
      badge: BadgeType.EXPERIMENT,
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
        {newFeatures.map((feature) => (
          <Link key={feature.title} href={feature.href || {}}>
            <ShadedButton
              key={feature.title}
              className={feature.href ? "cursor-pointer" : "cursor-default"}
            >
              <div>
                <div className="flex items-center justify-between w-full mb-2">
                  <Text weight={500}>{feature.title}</Text>
                  <Badge
                    color={
                      feature.badge === BadgeType.NEW
                        ? "blue"
                        : feature.badge === BadgeType.FIX
                        ? "pink"
                        : "grape"
                    }
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <Text size="sm" color="dimmed">
                  {feature.description}
                </Text>
              </div>
            </ShadedButton>
          </Link>
        ))}
      </div>
    </Drawer>
  );
};

export default UpdateDrawer;
