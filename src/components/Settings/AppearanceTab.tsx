import {
  Card,
  Divider,
  MANTINE_COLORS,
  MantineColor,
  Select,
  Stack,
  Switch,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { HiBell, HiChat, HiColorSwatch, HiMoon, HiSun } from "react-icons/hi";
import useAmoled from "../../stores/useAmoled";
import usePreferences from "../../stores/usePreferences";
import { Preferences } from "../../util/preferences";
import { User } from "../../util/prisma-types";
import { Section } from "../Home/FriendsWidget";
import ModernEmptyState from "../ModernEmptyState";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface AppearanceTabProps {
  user: User;
}

const AppearanceTab = ({ user }: AppearanceTabProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { colors } = useMantineTheme();
  const { enabled: amoled } = useAmoled();
  const { preferences } = usePreferences();

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
      <Section
        title="Chat"
        description="Customize your chatting experience on Framework."
      />
      <Stack spacing="sm">
        <SideBySide
          title="Chat popout"
          description="Enable the chat popout for quick access to your conversations."
          icon={<HiChat />}
          right={
            <Switch
              label="Enable chat popout"
              checked={Boolean(preferences["@chat/enabled"])}
              onChange={() =>
                Preferences.setPreferences({
                  "@chat/enabled": !preferences["@chat/enabled"],
                })
              }
            />
          }
          shaded
          noUpperBorder
        />
        <SideBySide
          title="Chat bell"
          description="Play a sound when you receive a chat message."
          icon={<HiBell />}
          right={
            <Switch
              label="Enable chat bell"
              checked={Boolean(preferences["@chat/bell"])}
              onChange={() =>
                Preferences.setPreferences({
                  "@chat/bell": !preferences["@chat/bell"],
                })
              }
            />
          }
          shaded
          noUpperBorder
        />
        <SideBySide
          title="Chat bubble color"
          description="Customize the color of your chat bubbles in conversations."
          icon={<HiColorSwatch />}
          right={
            <Select
              icon={<HiColorSwatch />}
              value={String(preferences["@chat/my-color"])}
              onChange={(v: MantineColor) =>
                Preferences.setPreferences({
                  "@chat/my-color": v,
                })
              }
              data={MANTINE_COLORS.map((color) => ({
                label:
                  color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
                value: color,
              }))}
            />
          }
          shaded
          noUpperBorder
        />
      </Stack>
    </SettingsTab>
  );
};

export default AppearanceTab;
