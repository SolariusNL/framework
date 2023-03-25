import {
  Card,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { HiMoon, HiSun } from "react-icons/hi";
import useAmoled from "../../stores/useAMoled";
import useMediaQuery from "../../util/media-query";
import { User } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import SettingsTab from "./SettingsTab";

interface AppearanceTabProps {
  user: User;
}

const AppearanceTab = ({ user }: AppearanceTabProps) => {
  const mobile = useMediaQuery("768");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { colors } = useMantineTheme();
  const { enabled: amoled } = useAmoled();

  return (
    <SettingsTab tabValue="appearance" tabTitle="Appearance">
      <div className="grid grid-cols-2 gap-8 w-full">
        {amoled ? (
          <div className="col-span-full">
            <ModernEmptyState
              title="AMOLED Mode"
              body="AMOLED mode is enabled, so you can't change the theme. Disable AMOLED mode to change the theme."
            />
          </div>
        ) : (
          ["Dark", "Light"].map((color) => (
            <Card
              shadow="sm"
              p="md"
              sx={{
                cursor: "pointer",
                flex: 1,
                backgroundColor:
                  colorScheme == "dark" ? colors.dark[8] : colors.gray[1],
              }}
              onClick={() => toggleColorScheme()}
              key={color}
            >
              <Card
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    colorScheme == color.toLowerCase()
                      ? `2px solid ${colors.blue[6]}`
                      : "none",
                }}
                mb={16}
                shadow="sm"
                p="md"
              >
                {color == "Dark" ? (
                  <HiMoon
                    size={64}
                    color={colorScheme == "dark" ? "#845EF7" : "#BE4BDB"}
                  />
                ) : (
                  <HiSun
                    size={64}
                    color={colorScheme == "dark" ? "#FFE066" : "#F59F00"}
                  />
                )}
              </Card>

              <Title order={4} align="center" mb={6}>
                {color} Theme
              </Title>
              <Text color="dimmed" size="sm" align="center">
                {color == "Dark"
                  ? "For the night owls."
                  : "For the light of heart."}
              </Text>
            </Card>
          ))
        )}
      </div>
    </SettingsTab>
  );
};

export default AppearanceTab;
