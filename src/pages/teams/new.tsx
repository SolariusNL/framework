import {
  Button,
  Image,
  Select,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import { HiCheckCircle, HiPlusCircle, HiXCircle } from "react-icons/hi";
import Descriptive from "../../components/Descriptive";
import ImageUploader from "../../components/ImageUploader";
import Markdown, { ToolbarItem } from "../../components/Markdown";
import TeamsProvider from "../../components/Teams/Teams";
import getTimezones from "../../data/timezones";
import authorizedRoute from "../../util/auth";
import { User } from "../../util/prisma-types";

type NewTeamProps = {
  user: User;
};

const NewTeam: React.FC<NewTeamProps> = ({ user }) => {
  const theme = useMantineTheme();
  const router = useRouter();
  const form = useForm<{
    name: string;
    description: string;
    location?: string;
    timezone?: string;
    website?: string;
    email?: string;
  }>({
    initialValues: {
      name: "",
      description: "",
      location: "",
      timezone: "",
      website: "",
      email: "",
    },
    validate: {
      name: (value) => {
        if (value.length > 50 || value.length < 3) {
          return "Name must be between 3 and 50 characters";
        }
      },
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
  const [uploadedUrl, setUploadedUrl] = React.useState<string | null>(null);
  const iconRef = React.useRef<HTMLImageElement>(null);

  return (
    <TeamsProvider
      user={user}
      title="New Team"
      description="Create a new team to collaborate with others, establish direct communication with your community, and organize your games."
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        <div className="flex flex-col w-full md:w-1/3">
          <div className="w-full flex flex-col items-center gap-8">
            {uploadedUrl ? (
              <Image
                src={uploadedUrl || ""}
                height={128}
                width={128}
                ref={iconRef}
                className="rounded-lg"
                radius="md"
              />
            ) : (
              <div
                className="w-32 h-32 rounded-lg"
                style={{
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[9]
                      : theme.colors.gray[1],
                }}
              />
            )}
            <ImageUploader
              onFinished={(imgStr) => setUploadedUrl(imgStr)}
              crop
              ratio={1}
              imgRef={iconRef}
            />
          </div>
        </div>
        <div className="flex flex-col w-full md:w-2/3">
          <form
            onSubmit={form.onSubmit(async (values) => {
              await fetch("/api/teams/new", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: String(getCookie(".frameworksession")),
                },
                body: JSON.stringify(
                  Object.fromEntries(
                    Object.entries(values).filter(([_, v]) => v)
                  )
                ),
              })
                .then((res) => res.json())
                .then(async (res) => {
                  if (res.success) {
                    const formData = new FormData();
                    if (uploadedUrl) {
                      const file = new File(
                        [
                          Buffer.from(
                            uploadedUrl?.replace(
                              /^data:image\/\w+;base64,/,
                              ""
                            )!,
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

                    router.push(`/teams/t/${res.team.slug}`);
                    showNotification({
                      title: "Team created",
                      message: "Your team has been created successfully.",
                      icon: <HiCheckCircle />,
                    });
                  } else {
                    showNotification({
                      title: "Error",
                      message: res.message || "An unknown error occurred.",
                      icon: <HiXCircle />,
                    });
                  }
                });
            })}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                <TextInput
                  label="Name"
                  placeholder="Team name"
                  description="The name of your team."
                  required
                  className="w-full md:w-1/2"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  label="Location"
                  placeholder="Team location"
                  description="This can be a city, state, or country."
                  className="w-full md:w-1/2"
                  {...form.getInputProps("location")}
                />
              </div>
              <Descriptive
                title="Description"
                description="The description of your team. What do you do? What are your goals?"
                required
              >
                <div className="mt-4">
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
                    {...form.getInputProps("description")}
                  />
                </div>
              </Descriptive>
              <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                <Select
                  data={getTimezones().map((t) => ({
                    label: t.value,
                    value: t.value,
                  }))}
                  searchable
                  label="Timezone"
                  placeholder="Select a timezone"
                  description="The timezone of your team."
                  className="w-full md:w-1/2"
                  {...form.getInputProps("timezone")}
                />
                <TextInput
                  label="Website"
                  placeholder="Team website"
                  description="The website of your team."
                  className="w-full md:w-1/2"
                  {...form.getInputProps("website")}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                <TextInput
                  label="Email"
                  placeholder="Team email"
                  description="The email of your team."
                  type="email"
                  className="w-full md:w-1/2"
                  {...form.getInputProps("email")}
                />
                <Button
                  size="lg"
                  leftIcon={<HiPlusCircle />}
                  type="submit"
                  className="w-full md:w-1/2"
                >
                  Create Team
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default NewTeam;
