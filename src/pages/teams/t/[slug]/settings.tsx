import {
  Button,
  Divider,
  Image,
  Select,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Rating } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiGlobe,
  HiMail,
  HiXCircle,
} from "react-icons/hi";
import { TeamType } from "../..";
import ImageUploader from "../../../../components/ImageUploader";
import Markdown, { ToolbarItem } from "../../../../components/Markdown";
import SideBySide from "../../../../components/Settings/SideBySide";
import TeamsViewProvider from "../../../../components/Teams/TeamsView";
import getTimezones from "../../../../data/timezones";
import authorizedRoute from "../../../../util/auth";
import getMediaUrl from "../../../../util/get-media";
import { NonUser, User } from "../../../../util/prisma-types";
import { getTeam } from "../../../../util/teams";

export type TeamViewSettingsProps = {
  user: User;
  team: TeamType & {
    games: {
      name: string;
      iconUri: string;
      _count: {
        likedBy: number;
        dislikedBy: number;
      };
      visits: number;
      author: NonUser;
      rating: Rating;
    }[];
  };
};

type Updatable = {
  description: string;
  location: string;
  timezone: string;
  website: string;
  email: string;
};

const TeamViewSettings: React.FC<TeamViewSettingsProps> = ({ user, team }) => {
  const [updates, setUpdates] = useState<Updatable>({
    description: team.descriptionMarkdown || "No description",
    location: team.location || "",
    timezone: team.timezone || "",
    website: team.website || "",
    email: team.email || "",
  });
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const theme = useMantineTheme();
  const router = useRouter();

  const updateUpdatable = (key: keyof Updatable, value: string) => {
    setUpdates((prev) => ({ ...prev, [key]: value }));
  };

  const updateTeam = async () => {
    await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries(updates).filter(([key, value]) => {
            return value !== "" && value !== team[key as keyof TeamType];
          })
        )
      ),
    })
      .then(async (res) => res.json())
      .then(async (res) => {
        if (res.success) {
          const formData = new FormData();
          if (uploadedUrl) {
            const file = new File(
              [
                Buffer.from(
                  uploadedUrl?.replace(/^data:image\/\w+;base64,/, "")!,
                  "base64"
                ),
              ],
              "team.jpeg",
              {
                type: "image/jpeg",
              }
            );

            formData.append("team", file);

            await fetch(`/api/media/upload/team/${res.team.id}`, {
              method: "POST",
              headers: {
                authorization: String(getCookie(".frameworksession")),
              },
              body: formData,
            }).catch(() => {
              showNotification({
                title: "Failed to upload icon",
                message: "Failed to upload icon. Please try again.",
                icon: <HiXCircle />,
              });
            });
          }

          showNotification({
            title: "Team created",
            message: "Your team has been created successfully.",
            icon: <HiCheckCircle />,
          });
          router.reload();
        } else {
          showNotification({
            title: "Failed to update team",
            message: "Failed to update team. Please try again.",
            icon: <HiXCircle />,
          });
        }
      });
  };

  return (
    <TeamsViewProvider user={user} team={team} active="settings">
      <div className="flex justify-between items-center mb-4">
        {uploadedUrl ? (
          <Image
            src={uploadedUrl || ""}
            height={128}
            width={128}
            ref={iconRef}
            className="rounded-lg mb-4"
            radius="md"
          />
        ) : team.iconUri ? (
          <Image
            src={getMediaUrl(team.iconUri)}
            height={128}
            width={128}
            ref={iconRef}
            className="rounded-lg mb-4"
            radius="md"
          />
        ) : (
          <div
            className="w-32 h-32 rounded-lg mb-4"
            style={{
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[9]
                  : theme.colors.gray[1],
            }}
          />
        )}
        <div className="flex items-center gap-3">
          <Text size="sm" color="dimmed">
            Max 12MB. JPG, PNG, GIF. Recommended 1:1.
          </Text>
          <ImageUploader
            onFinished={(imgStr) => setUploadedUrl(imgStr)}
            crop
            ratio={1}
            imgRef={iconRef}
          />
        </div>
      </div>
      <Markdown
        toolbar={[
          ToolbarItem.Bold,
          ToolbarItem.Italic,
          ToolbarItem.Code,
          ToolbarItem.Url,
          ToolbarItem.Table,
          ToolbarItem.BulletList,
          ToolbarItem.OrderedList,
          ToolbarItem.H2,
          ToolbarItem.H3,
          ToolbarItem.H4,
          ToolbarItem.Help,
        ]}
        value={updates.description}
        onChange={(value) => updateUpdatable("description", value)}
      />
      <Divider mt={32} mb={32} />
      <SideBySide
        title="Location"
        description="Let people know where you're from."
        noUpperBorder
        right={
          <TextInput
            icon={<HiGlobe />}
            value={updates.location}
            onChange={(e) => updateUpdatable("location", e.currentTarget.value)}
            placeholder="Location"
          />
        }
      />
      <SideBySide
        title="Timezone"
        description="This'll be useful for users to know when you're online."
        right={
          <Select
            data={getTimezones().map((t) => ({
              label: t.value,
              value: t.value,
            }))}
            searchable
            label="Timezone"
            placeholder="Select a timezone"
            description="The timezone of your team."
            value={updates.timezone}
            onChange={(value) => updateUpdatable("timezone", value!)}
          />
        }
      />
      <SideBySide
        title="Website"
        description="Let people know where to find you on the web."
        right={
          <TextInput
            icon={<HiGlobe />}
            value={updates.website}
            onChange={(e) => updateUpdatable("website", e.currentTarget.value)}
            placeholder="Website"
          />
        }
      />
      <SideBySide
        title="Email"
        description="Let people know where to find you on the web."
        right={
          <TextInput
            icon={<HiMail />}
            value={updates.email}
            onChange={(e) => updateUpdatable("email", e.currentTarget.value)}
            placeholder="Email"
          />
        }
      />
      <Divider mt={32} mb={32} />
      <div className="flex justify-end">
        <Button leftIcon={<HiCheck />} onClick={updateTeam}>
          Save changes
        </Button>
      </div>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
  const team = await getTeam(String(slug));

  if (auth.redirect) return auth;

  if (!team) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
  if (team.ownerId !== auth.props.user?.id)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamViewSettings;
