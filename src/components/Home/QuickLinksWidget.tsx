import { Text, ThemeIcon, Title } from "@mantine/core";
import Link from "next/link";
import {
  HiArrowRight,
  HiClipboardList,
  HiCog,
  HiGift,
  HiUserGroup,
} from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import ShadedCard from "../ShadedCard";

const QuickLinksWidget: React.FC = () => {
  const user = useFrameworkUser()!;

  return (
    <ShadedCard withBorder p={8} solid>
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: "Browse games",
            description: "Find games to play on Framework.",
            icon: <HiUserGroup />,
            color: "blue",
            link: "/games",
          },
          {
            title: "View your profile",
            description: "View your profile, edit your settings, and more.",
            icon: <HiClipboardList />,
            color: "teal",
            link: `/profile/${user.username}`,
          },
          {
            title: "Manage settings",
            description:
              "Manage your account settings, privacy, security, and more.",
            icon: <HiCog />,
            color: "grape",
            link: "/settings/account",
          },
          {
            title: "Daily prize",
            description: "Claim your daily prize.",
            icon: <HiGift />,
            color: "pink",
            link: "/prizes",
          },
        ].map(({ title, description, icon, color, link }) => (
          <Link href={link} key={title}>
            <div className="flex flex-col gap-4 cursor-pointer p-2">
              <div className="flex justify-between items-center">
                <ThemeIcon variant="light" color={color} size={38} sx={{
                  border: "1px solid",
                  borderColor: color[9]
                }}>
                  {icon}
                </ThemeIcon>
                <HiArrowRight />
              </div>
              <div>
                <Title order={5} mb={6}>
                  {title}
                </Title>
                <Text color="dimmed">{description}</Text>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ShadedCard>
  );
};

export default QuickLinksWidget;
