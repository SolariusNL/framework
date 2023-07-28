import ChatMessage from "@/components/chat/chat-message";
import { Section } from "@/components/home/friends";
import ModernEmptyState from "@/components/modern-empty-state";
import SettingsTab from "@/components/settings/settings-tab";
import SideBySide from "@/components/settings/side-by-side";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import useAmoled from "@/stores/useAmoled";
import usePreferences from "@/stores/usePreferences";
import { getIpcRenderer } from "@/util/electron";
import { Preferences } from "@/util/preferences";
import { ChatMessage as IChatMessage, User } from "@/util/prisma-types";
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
import isElectron from "is-electron";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiChat,
  HiCog,
  HiColorSwatch,
  HiDesktopComputer,
  HiMoon,
  HiOutlineBell,
  HiSun,
} from "react-icons/hi";

interface AppearanceTabProps {
  user: User;
}

const AppearanceTab = ({ user }: AppearanceTabProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { colors } = useMantineTheme();
  const { enabled: amoled } = useAmoled();
  const { preferences } = usePreferences();
  const electron = isElectron();
  const [config, setConfig] = useState<any>();
  const [autostart, setAutostart] = useState<boolean | undefined>();

  useEffect(() => {
    if (electron) {
      setConfig(getIpcRenderer().getConfig());
      getIpcRenderer().getAutoStart().then(setAutostart);
    }
  }, []);

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
      {electron && (
        <>
          <Divider mt="xl" mb="xl" />
          <Section
            title="Desktop"
            description="Customize your desktop client."
          />
          <Stack spacing="sm">
            <SideBySide
              title="Start with computer"
              description="Launch Framework when you log in to your computer."
              icon={<HiDesktopComputer />}
              right={
                <Switch
                  label="Launch on startup"
                  disabled={typeof autostart === "undefined"}
                  defaultChecked={autostart ?? false}
                  onChange={async (v) => {
                    if (v) {
                      await getIpcRenderer().enableAutoStart();
                    } else {
                      await getIpcRenderer().disableAutoStart();
                    }

                    setAutostart(Boolean(v));
                  }}
                  classNames={BLACK}
                />
              }
              shaded
              noUpperBorder
            />
            <SideBySide
              title="Development mode"
              description="Enable development mode to use the developer tools. Note that there is no returning from this without a local development environment."
              icon={<HiCog />}
              right={
                <Switch
                  label="Enable development mode"
                  defaultChecked={Boolean(config?.build === "dev")}
                  onChange={() =>
                    getIpcRenderer().set(
                      "build",
                      config?.build === "dev" ? "stable" : "dev"
                    )
                  }
                  classNames={BLACK}
                />
              }
              shaded
              noUpperBorder
            />
          </Stack>
        </>
      )}
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
              classNames={BLACK}
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
              classNames={BLACK}
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
            <div className="flex flex-col gap-2">
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
                    color.charAt(0).toUpperCase() +
                    color.slice(1).toLowerCase(),
                  value: color,
                }))}
                classNames={BLACK}
              />
              <ChatMessage
                message={
                  {
                    content: "This is a preview of your chat bubble color.",
                    authorId: user.id,
                  } as IChatMessage
                }
                noActions
              />
            </div>
          }
          shaded
          noUpperBorder
        />
      </Stack>
      <Divider mt="xl" mb="xl" />
      <Section
        title="Features"
        description="Customize the features you use on Framework."
      />
      <Stack spacing="sm">
        <SideBySide
          title="Notification manager"
          description="Enable the notification manager to see past notifications with filtering and searching capabilities."
          icon={<HiOutlineBell />}
          right={
            <Switch
              label="Enable notification manager"
              checked={Boolean(preferences["@app/notification-manager"])}
              onChange={() =>
                Preferences.setPreferences({
                  "@app/notification-manager":
                    !preferences["@app/notification-manager"],
                })
              }
              classNames={BLACK}
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
