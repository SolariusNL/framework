import {
  Button,
  Checkbox,
  CloseButton,
  Modal,
  MultiSelect,
  NavLink,
  Stack,
  Text,
  TextInput,
  Textarea,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { DeveloperProfile, DeveloperProfileSkill } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { ReactNode, useEffect, useState } from "react";
import {
  HiCheck,
  HiPencil,
  HiPlus,
  HiUserGroup,
  HiXCircle,
} from "react-icons/hi";
import Descriptive from "../../components/Descriptive";
import { Section } from "../../components/Home/FriendsWidget";
import Markdown, { ToolbarItem } from "../../components/Markdown";
import ShadedCard from "../../components/ShadedCard";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import IResponseBase from "../../types/api/IResponseBase";
import authorizedRoute from "../../util/auth";
import fetchJson from "../../util/fetch";
import prisma from "../../util/prisma";
import { NonUser, User, nonCurrentUserSelect } from "../../util/prisma-types";
import { BLACK } from "../teams/t/[slug]/issue/create";

type DeveloperProfileEx = DeveloperProfile & {
  user: NonUser;
  skills: DeveloperProfileSkill[];
  showcaseGames: Array<{
    id: number;
    name: string;
    iconUri: string;
  }>;
};
type DeveloperProfileProps = {
  user: User;
  profile: DeveloperProfileEx;
};
type SidebarItem = {
  title: string;
  description: string;
  icon: ReactNode;
  value: SidebarValue;
};
type EditForm = {
  bioMd: string;
  skills: Array<{
    name: string;
    description: string;
  }>;
  lookingForWork: boolean;
  showcaseGames: Array<number>;
};
enum SidebarValue {
  Browse,
  Edit,
}

const sidebar: SidebarItem[] = [
  {
    title: "Browse",
    description: "Browse developers on Framework",
    icon: <HiUserGroup />,
    value: SidebarValue.Browse,
  },
  {
    title: "Edit",
    description: "Edit your developer profile",
    icon: <HiPencil />,
    value: SidebarValue.Edit,
  },
];

const DeveloperProfile: React.FC<DeveloperProfileProps> = ({
  user,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarValue>(
    profile ? SidebarValue.Browse : SidebarValue.Edit
  );
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [games, setGames] = useState<
    Array<{
      id: number;
      name: string;
      iconUri: string;
    }>
  >();
  const [creatingSkill, setCreatingSkill] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  const form = useForm<EditForm>({
    initialValues: {
      bioMd: profile?.bioMd || "",
      skills:
        profile?.skills.map((skill) => ({
          name: skill.name,
          description: skill.description,
        })) || [],
      lookingForWork: profile?.lookingForWork || false,
      showcaseGames: profile?.showcaseGames.map((game) => game.id) || [],
    },
    validate: {
      bioMd: (value) => {
        if (value.length < 50) {
          return "Your bio must be at least 50 characters long.";
        } else if (value.length > 2000) {
          return "Your bio must be less than 2000 characters long.";
        }
      },
      skills: (value) => {
        if (value.length < 1) {
          return "You must have at least one skill.";
        }
      },
    },
  });

  const setCreatingSkillProperty = (
    property: "name" | "description",
    value: string
  ) => {
    setCreatingSkill({
      ...creatingSkill,
      [property]: String(value),
    });
  };

  const getMyGames = async () => {
    await fetchJson<
      IResponseBase<{
        games: Array<{
          id: number;
          name: string;
          iconUri: string;
        }>;
      }>
    >("/api/users/@me/games", {
      auth: true,
    }).then((response) => {
      if (response.success) {
        setGames(response.data?.games);
      }
    });
  };

  useEffect(() => {
    getMyGames();
  }, []);

  return (
    <Developer
      user={user}
      title="Developer Profile"
      description="Manage your developer profile and find some work."
    >
      <Modal
        opened={addSkillOpen}
        onClose={() => {
          setAddSkillOpen(false);
          setCreatingSkill({
            name: "",
            description: "",
          });
        }}
        title="Add skill"
        className={useMantineColorScheme().colorScheme}
      >
        <Stack spacing="md">
          <TextInput
            label="Skill name"
            required
            description="The name of the skill."
            classNames={BLACK}
            placeholder="e.g. JavaScript"
            value={creatingSkill?.name}
            onChange={(event) =>
              setCreatingSkillProperty("name", event.currentTarget.value)
            }
            maxLength={30}
          />
          <Textarea
            label="Skill description"
            required
            description="A description of the skill, what you can do with it, etc."
            classNames={BLACK}
            placeholder="e.g. I can make websites with JavaScript."
            minRows={2}
            value={creatingSkill?.description}
            onChange={(event) =>
              setCreatingSkillProperty("description", event.currentTarget.value)
            }
            maxLength={120}
          />
          <div className="mt-4 flex justify-end">
            <Button
              leftIcon={<HiPlus />}
              onClick={() => {
                if (!creatingSkill.name || !creatingSkill.description) {
                  return;
                }
                form.setFieldValue("skills", [
                  ...form.values.skills,
                  creatingSkill,
                ]);
                setAddSkillOpen(false);
                setCreatingSkill({
                  name: "",
                  description: "",
                });
              }}
            >
              Add skill
            </Button>
          </div>
        </Stack>
      </Modal>
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {sidebar.map((item) => (
            <NavLink
              className="rounded-md"
              key={item.title}
              label={item.title}
              icon={item.icon}
              active={activeTab === item.value}
              onClick={() => setActiveTab(item.value)}
              description={item.description}
              disabled={!profile}
            />
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {activeTab === SidebarValue.Browse ? (
            <p>Browse</p>
          ) : (
            <>
              <Section
                title="Create your developer profile"
                description="Fill out the form below to create your developer profile."
              />
              <Text size="sm" color="dimmed" mb="lg">
                Your developer profile serves as an effective platform for
                displaying your skills and experience to potential employers
                seeking to hire developers. Additionally, you can leverage it to
                discover job opportunities within the Framework community.
              </Text>
              <form
                onSubmit={form.onSubmit(async (values) => {
                  await fetchJson<IResponseBase>(
                    "/api/developer/@me/profile/update",
                    {
                      auth: true,
                      body: values,
                      method: "POST",
                    }
                  ).then((res) => {
                    if (res.success) {
                      showNotification({
                        title: "Developer profile updated",
                        message:
                          "Your developer profile has been updated successfully.",
                        icon: <HiCheck />,
                      });
                    } else {
                      showNotification({
                        title: "Error",
                        message:
                          "We were unable to update your developer profile.",
                        icon: <HiXCircle />,
                      });
                    }
                  });
                })}
              >
                <Descriptive
                  title="Bio"
                  description="Tell us about yourself."
                  required
                >
                  <Markdown
                    toolbar={[
                      ToolbarItem.Bold,
                      ToolbarItem.Italic,
                      ToolbarItem.BulletList,
                      ToolbarItem.Code,
                      ToolbarItem.CodeBlock,
                      ToolbarItem.H2,
                      ToolbarItem.H3,
                      ToolbarItem.H4,
                      ToolbarItem.OrderedList,
                      ToolbarItem.Table,
                      ToolbarItem.Url,
                      ToolbarItem.Help,
                    ]}
                    placeholder="Tell us about yourself, your skills, and your experience."
                    value={form.values.bioMd}
                    onChange={(value) => form.setFieldValue("bioMd", value)}
                  />
                  <div className="grid md:grid-cols-2 mt-4 gap-4 grid-cols-1">
                    <Descriptive
                      title="Looking for work"
                      description="Are you looking for work?"
                    >
                      <Checkbox
                        label="I am looking for work"
                        classNames={BLACK}
                        {...form.getInputProps("lookingForWork", {
                          type: "checkbox",
                        })}
                      />
                    </Descriptive>
                    <Descriptive
                      title="Showcase games"
                      description="What games have you made and want to show off?"
                    >
                      <MultiSelect
                        value={
                          form.values.showcaseGames.map((game) =>
                            String(game)
                          ) || []
                        }
                        onChange={(value) => {
                          if (value.length > 5) {
                            return;
                          }
                          form.setFieldValue(
                            "showcaseGames",
                            value.map((v) => Number(v))
                          );
                        }}
                        placeholder="Select games to showcase"
                        nothingFound="No games found"
                        classNames={BLACK}
                        searchable
                        clearable
                        data={
                          games?.map((game) => ({
                            value: String(game.id),
                            label: game.name,
                          })) || []
                        }
                        mb="sm"
                      />
                    </Descriptive>
                  </div>
                  <Descriptive
                    title="Skills"
                    description="What skills do you have?"
                    required
                  >
                    <ShadedCard className="flex flex-col gap-1 p-1">
                      <Button
                        variant="subtle"
                        leftIcon={<HiPlus />}
                        onClick={() => setAddSkillOpen(true)}
                        disabled={form.values.skills.length > 5}
                      >
                        Add skill
                      </Button>
                      <div className="grid md:grid-cols-2 gap-2 grid-cols-1">
                        {form.values.skills.map((skill, index) => (
                          <div
                            className="flex justify-between gap-1"
                            key={index}
                          >
                            <div className="flex flex-col gap-1 p-2">
                              <Text size="lg">{skill.name}</Text>
                              <Tooltip label={skill.description}>
                                <Text size="sm" color="dimmed" lineClamp={1}>
                                  {skill.description}
                                </Text>
                              </Tooltip>
                            </div>
                            <CloseButton
                              radius="xl"
                              onClick={() => {
                                const skills = form.values.skills;
                                skills.splice(index, 1);
                                form.setFieldValue("skills", skills);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </ShadedCard>
                  </Descriptive>
                  <div className="grid md:grid-cols-2 mt-4 gap-4 grid-cols-1">
                    <div />
                    <Button type="submit" size="lg" leftIcon={<HiCheck />}>
                      Save
                    </Button>
                  </div>
                </Descriptive>
              </form>
            </>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Developer>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);
  if (auth.redirect) return auth;

  const profile = await prisma.developerProfile.findFirst({
    where: {
      userId: auth.props.user?.id,
    },
    include: {
      user: nonCurrentUserSelect,
      skills: true,
      showcaseGames: {
        select: {
          id: true,
          name: true,
          iconUri: true,
        },
      },
    },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(auth.props.user)),
      profile: JSON.parse(JSON.stringify(profile)),
    },
  };
}

export default DeveloperProfile;
