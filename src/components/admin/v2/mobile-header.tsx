import useAdmin from "@/stores/useAdmin";
import {
  Burger,
  Header,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { FC } from "react";

const MobileNavHeader: FC = () => {
  const { activeTab, sidebarOpened, setSidebarOpened } = useAdmin();
  const theme = useMantineTheme();

  return (
    <Header height={50} p="md">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={sidebarOpened}
            onClick={() => setSidebarOpened(!sidebarOpened)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        <div className="flex items-center gap-4">
          <Text size="lg" weight={500}>
            {activeTab?.title}
          </Text>
          <Text size="sm" color="dimmed" lineClamp={1}>
            {activeTab?.route}
          </Text>
        </div>
      </div>
    </Header>
  );
};

export default MobileNavHeader;
