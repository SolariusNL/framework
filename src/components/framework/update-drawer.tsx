import ShadedButton from "@/components/shaded-button";
import useUpdateDrawer from "@/stores/useUpdateDrawer";
import { Badge, Divider, Drawer, ScrollArea, Text, Title } from "@mantine/core";
import Link from "next/link";

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
      title: "Features",
      description: "You can now customize your experience even further with the new Features settings tab.",
      badge: BadgeType.NEW,
      date: new Date("2023-11-30"),
      href: "/settings/features"
    },
    {
      title: "Redis databases",
      description:
        "You can now create Redis databases directly on Framework for your applications.",
      badge: BadgeType.NEW,
      date: new Date("2023-10-07"),
      href: "/developer/redis",
    },
    {
      title: "0.9.0",
      description:
        "Framework v0.9.0 is now available and brings many new changes.",
      badge: BadgeType.NEW,
      date: new Date("2023-09-19"),
      href: "https://changelog.solarius.me/#framework-v090",
    },
    {
      title: "Economy",
      description:
        "The Framework economy is now available. Powered by our Asset API, you can now purchase & trade goods on Framework.",
      badge: BadgeType.NEW,
      date: new Date("2023-08-28"),
      href: "/catalog",
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
