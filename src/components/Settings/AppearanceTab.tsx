import {
  Card,
  Divider,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { HiMoon, HiSpeakerphone, HiSun } from "react-icons/hi";
import useAmoled from "../../stores/useAmoled";
import useAudio from "../../stores/useAudio";
import useMediaQuery from "../../util/media-query";
import { User } from "../../util/prisma-types";
import { Section } from "../Home/FriendsWidget";
import ModernEmptyState from "../ModernEmptyState";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface AppearanceTabProps {
  user: User;
}

const AppearanceTab = ({ user }: AppearanceTabProps) => {
  const mobile = useMediaQuery("768");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { colors } = useMantineTheme();
  const { enabled: amoled } = useAmoled();
  const { chatNotification, setChatNotification } = useAudio();

  return (
    <SettingsTab tabValue="appearance" tabTitle="Appearance">
      <Section
        title="Appearance"
        description="Change the appearance of Framework."
      />
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
              p="md"
              sx={{
                cursor: "pointer",
                flex: 1,
                backgroundColor:
                  colorScheme == "dark" ? colors.dark[8] : colors.gray[0],
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
      <Divider mt="xl" mb="xl" />
      <Section title="Sound" description="Change sound preferences." />
      <SideBySide
        title="Chat notifications"
        description="Play a sound when you receive a chat message."
        icon={<HiSpeakerphone />}
        right={
          <Switch
            label="Enable chat notifications"
            checked={chatNotification}
            onChange={() => setChatNotification(!chatNotification)}
          />
        }
        shaded
        noUpperBorder
      />
    </SettingsTab>
  );
};

export default AppearanceTab;
