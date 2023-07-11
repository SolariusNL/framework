import Descriptive from "@/components/Descriptive";
import DetailCard from "@/components/DetailCard";
import ImageUploader from "@/components/ImageUploader";
import Markdown, { ToolbarItem } from "@/components/Markdown";
import TeamsViewProvider from "@/components/Teams/TeamsView";
import getTimezones from "@/data/timezones";
import { TeamType } from "@/pages/teams";
import authorizedRoute from "@/util/auth";
import getMediaUrl from "@/util/get-media";
import { NonUser, User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import {
  Avatar,
  Button,
  Checkbox,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAccess, TeamStaffPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRef, useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiClock,
  HiGlobe,
  HiMail,
  HiXCircle,
} from "react-icons/hi";

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};
const blackInput = "dark:bg-black dark:text-white";

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
    staff: { username: string; id: number; avatarUri: string }[];
  };
};

type Updatable = {
  description: string;
  location: string;
  timezone: string;
  website: string;
  email: string;
  access: TeamAccess;
  displayFunds: boolean;
};

const TeamViewSettings: React.FC<TeamViewSettingsProps> = ({ user, team }) => {
  const form = useForm<{
    description: string;
    location?: string;
    timezone?: string;
    website?: string;
    email?: string;
    access?: TeamAccess;
    staffPermissions?: TeamStaffPermission[];
    displayFunds?: boolean;
  }>({
    initialValues: {
      description: team.descriptionMarkdown || "",
      location: team.location || "",
      timezone: team.timezone || "",
      website: team.website || "",
      email: team.email || "",
      access: team.access || TeamAccess.OPEN,
      staffPermissions: team.staffPermissions || [],
      displayFunds: team.displayFunds || false,
    },
    validate: {
      description: (value) => {
        if (value.length > 2048 || value.length < 3) {
          return "Description must be between 3 and 2048 characters";
        }
      },
      location: (value: string) => {
        if (value && (value.length > 50 || value.length < 3)) {
          return "Location must be between 3 and 50 characters";
        }
      },
      timezone: (value: string) => {
        if (value && (value.length > 50 || value.length < 3)) {
          return "Timezone must be between 3 and 50 characters";
        }
      },
      website: (value: string) => {
        if (
          value &&
          !value.match(
            /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
          )
        ) {
          return "Website must be a valid URL";
        }
      },
      email: (value: string) => {
        if (
          value &&
          !value.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
        ) {
          return "Email must be a valid email address";
        }
      },
    },
  });
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const iconRef = useRef<HTMLImageElement>(null);

  const updateTeam = async (values: Updatable) => {
    await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries(values).filter(([key, value]) => {
            return value !== team[key as keyof TeamType];
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
            title: "Team updated",
            message: "Your team has been updated.",
            icon: <HiCheckCircle />,
          });
        } else {
          showNotification({
            title: "Failed to update team",
            message:
              "Failed to update team. Please try again. Error: " + res.error ||
              "Unexpected error",
            icon: <HiXCircle />,
          });
        }
      });
  };

  return (
    <TeamsViewProvider user={user} team={team} active="settings-general">
      <form
        onSubmit={form.onSubmit(async (values) =>
          updateTeam(values as Updatable)
        )}
      >
        <DetailCard.Group>
          <DetailCard
            title="Details"
            description="User-facing information about your team, such as its description
                and avatar."
          >
            <Descriptive
              title="Description"
              description="A description of your team."
            >
              <Markdown
                {...form.getInputProps("description")}
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
                disabled={team.ownerId !== user.id}
              />
            </Descriptive>
            <Descriptive title="Photo" description="Your team's photo.">
              <div className="mt-1 flex items-center space-x-5">
                <Avatar
                  src={uploadedUrl ? uploadedUrl : getMediaUrl(team.iconUri)}
                  size={48}
                  ref={iconRef}
                />
                <ImageUploader
                  crop
                  imgRef={iconRef}
                  ratio={1}
                  onFinished={setUploadedUrl}
                  buttonProps={{
                    disabled: team.ownerId !== user.id,
                  }}
                />
              </div>
            </Descriptive>
          </DetailCard>
          <DetailCard
            title="Contact"
            description="Contact information for your team, such as its email address and website."
          >
            <TextInput
              icon={<HiGlobe />}
              label="Website"
              description="A website for your team to share with the world."
              placeholder="https://framework.solarius.me"
              classNames={{
                input: blackInput,
                icon: "dark:text-white",
              }}
              disabled={team.ownerId !== user.id}
              {...form.getInputProps("website")}
            />
            <TextInput
              icon={<HiMail />}
              label="Email"
              description="A way for people to reach your team."
              placeholder="hi@solarius.me"
              classNames={{
                input: blackInput,
                icon: "dark:text-white",
              }}
              disabled={team.ownerId !== user.id}
              {...form.getInputProps("email")}
            />
            <TextInput
              icon={<HiGlobe />}
              label="Based in"
              description="Share where your team is based, to grow your community."
              placeholder="New York, NY"
              classNames={{
                input: blackInput,
                icon: "dark:text-white",
              }}
              disabled={team.ownerId !== user.id}
              {...form.getInputProps("location")}
            />
            <Select
              data={getTimezones().map((t) => ({
                label: t.value,
                value: t.value,
              }))}
              searchable
              label="Timezone"
              placeholder="Select a timezone"
              description="The timezone of your team."
              className="md:w-1/2"
              styles={{
                root: {
                  width: "100% !important",
                },
              }}
              classNames={{
                input: blackInput,
                icon: "dark:text-white",
              }}
              icon={<HiClock />}
              disabled={team.ownerId !== user.id}
              {...form.getInputProps("timezone")}
            />
          </DetailCard>
          <DetailCard
            title="Privacy"
            description="Privacy settings for your team, such as whether your funds are public."
          >
            <div className="flex flex-col gap-2">
              <Checkbox
                label="Public funds"
                classNames={{
                  input: blackInput,
                  icon: "dark:text-white",
                }}
                disabled={team.ownerId !== user.id}
                {...form.getInputProps("displayFunds", {
                  type: "checkbox",
                })}
              />
              <Text size="sm" color="dimmed">
                Whether your team&apos;s funds are publicly visible on the index
                page.
              </Text>
            </div>
          </DetailCard>
        </DetailCard.Group>
        <div className="mt-8 flex justify-end">
          <Button leftIcon={<HiCheck />} type="submit">
            Save
          </Button>
        </div>
      </form>
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
  if (team.ownerId !== auth.props.user?.id) {
    if (!team.staff?.find((s) => s.id === auth.props.user?.id)) {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamViewSettings;
