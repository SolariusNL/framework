import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { ProfileLink } from "@prisma/client";
import { useRef, useState } from "react";
import {
  HiClock,
  HiDocumentText,
  HiGlobe,
  HiInformationCircle,
  HiLink,
  HiOfficeBuilding,
  HiPencil,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiSparkles,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import getTimezones from "../../data/timezones";
import { getCookie } from "../../util/cookies";
import getMediaUrl from "../../util/getMedia";
import { User } from "../../util/prisma-types";
import Copy from "../Copy";
import CountrySelect from "../CountryPicker";
import Descriptive from "../Descriptive";
import ImageUploader from "../ImageUploader";
import Links from "../Profile/Links";
import Stateful from "../Stateful";
import Grouped from "./Grouped";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface AccountTabProps {
  user: User;
}

export const updateAccount = async (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  updated: any,
  setSuccess: (success: boolean) => void
) => {
  setLoading(true);
  setError(null);

  await fetch("/api/users/@me/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: String(getCookie(".frameworksession")),
    },
    body: JSON.stringify(updated),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        return setSuccess(true);
      }

      setError(res.error);
    })
    .catch((err) => {
      setError(err.message);
      return null;
    })
    .finally(() => setLoading(false));
};

const AccountTab = ({ user }: AccountTabProps) => {
  const [updated, setUpdated] = useState<any>({});
  const update = (field: string, value: any) => {
    setUpdated({ ...updated, [field]: value });
    setUnsavedChanges(true);
  };
  const [success, setSuccess] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [uploadedAvatarData, setUploadedAvatarData] = useState<string | null>();
  const [profileLinks, setProfileLinks] = useState<ProfileLink[]>(
    user.profileLinks
  );

  return (
    <>
      <SettingsTab
        tabValue="account"
        tabTitle="Profile"
        saveButtonLabel="Save"
        unsaved={unsavedChanges}
        saveButtonAction={async (setLoading, setError) => {
          updateAccount(setLoading, setError, updated, setSuccess);

          if (uploadedAvatarData) {
            const formData = new FormData();
            const file = new File(
              [
                Buffer.from(
                  uploadedAvatarData.replace(/^data:image\/\w+;base64,/, ""),
                  "base64"
                ),
              ],
              "avatar.jpeg",
              {
                type: "image/jpeg",
              }
            );

            formData.append("avatar", file);

            fetch("/api/media/upload/avatar", {
              method: "POST",
              headers: {
                authorization: String(getCookie(".frameworksession")),
              },
              body: formData,
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.success) {
                  setSuccess(true);
                  setUnsavedChanges(false);
                }

                setError(res.error);
              })
              .catch((err) => {
                setError(err.message);
                return null;
              })
              .finally(() => setLoading(false));
          }

          await fetch("/api/users/@me/update/links", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: String(getCookie(".frameworksession")),
            },
            body: JSON.stringify(
              profileLinks.filter((link) => link.name && link.url)
            ),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.success) {
                setSuccess(true);
              } else {
                setError(res.error);
              }
            })
            .catch((err) => {
              setError(err.message);
              return null;
            })
            .finally(() => setLoading(false));

          setUnsavedChanges(false);
        }}
        success={success}
        setSuccess={setSuccess}
      >
        <Stack mb={32}>
          <div
            style={{
              marginBottom: 8,
            }}
          >
            <Group position="apart">
              <Group>
                <Avatar
                  src={
                    uploadedAvatarData
                      ? uploadedAvatarData
                      : getMediaUrl(user.avatarUri) ||
                        `https://avatars.dicebear.com/api/identicon/${user.id}.png`
                  }
                  alt={user.username}
                  radius={99}
                  size={"xl"}
                />
                <Stack spacing={3}>
                  <div className="flex items-center">
                    <Text weight={500}>{user.username}</Text>
                    <div className="flex gap-1 ml-2">
                      {user.role === "ADMIN" && (
                        <Tooltip label="Staff">
                          <div>
                            <HiShieldCheck />
                          </div>
                        </Tooltip>
                      )}
                      {user.premium && (
                        <Tooltip label="Premium">
                          <div>
                            <HiSparkles />
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <Group spacing={3}>
                    <Copy value={user.id} />
                    <Text color="dimmed">
                      ID: <strong>{user.id}</strong>
                    </Text>
                    <Tooltip label="This ID is used to uniquely identify you on the platform. You cannot change it.">
                      <ThemeIcon variant="light" size="sm" ml={6}>
                        <HiQuestionMarkCircle size={12} />
                      </ThemeIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Group>
              <Group>
                <ImageUploader
                  crop={true}
                  imgRef={imgRef as React.MutableRefObject<HTMLImageElement>}
                  onFinished={(data) => {
                    setUploadedAvatarData(data);
                    setUnsavedChanges(true);
                  }}
                  ratio={1}
                />
                {uploadedAvatarData && (
                  <Button
                    leftIcon={<HiTrash />}
                    onClick={() => {
                      setUploadedAvatarData(null);
                      setUnsavedChanges(true);
                    }}
                    color="red"
                  >
                    Remove avatar
                  </Button>
                )}
              </Group>
            </Group>
          </div>
          <Stack spacing={12}>
            <Grouped title="Identity" dark>
              <div>
                <SideBySide
                  title="Username"
                  description="Your username represents you on the platform."
                  actions={
                    <>
                      <Alert icon={<HiInformationCircle size={14} />}>
                        You will be charged 500 tickets to change your username.
                      </Alert>
                      {new Date(user.lastUsernameChange as Date).getTime() +
                        604800000 >
                        Date.now() && (
                        <Alert icon={<HiInformationCircle size={14} />} mt={12}>
                          You can only change your username once every 7 days.
                        </Alert>
                      )}
                    </>
                  }
                  icon={<HiUser />}
                  right={
                    <TextInput
                      label="Username"
                      description="Your username represents you on Framework."
                      defaultValue={user.username}
                      onChange={(e) => {
                        update("username", e.target.value);
                      }}
                      icon={<HiUser />}
                      error={
                        updated.username &&
                        !updated.username.match(/^[a-zA-Z0-9_]{3,24}$/)
                          ? "Your username must be between 3 and 24 characters and can only contain letters, numbers, and underscores."
                          : undefined
                      }
                      disabled={
                        new Date(user.lastUsernameChange as Date).getTime() +
                          604800000 >
                          Date.now() || user.tickets < 500
                      }
                    />
                  }
                  noUpperBorder
                  shaded
                />
              </div>
              <div>
                <SideBySide
                  title="Aliases"
                  description="Your aliases are non-unique."
                  icon={<HiUser />}
                  right={
                    <TextInput
                      label="Alias"
                      placeholder="Create an alias"
                      description="Your alias is a non-unique username."
                      defaultValue={user.alias || ""}
                      onChange={(e) => {
                        update("alias", e.target.value);
                      }}
                      icon={<HiDocumentText />}
                      error={
                        updated.alias &&
                        !updated.alias.match(/^[a-zA-Z0-9_]{3,24}$/)
                          ? "Your alias must be between 3 and 24 characters and can only contain letters, numbers, and underscores."
                          : undefined
                      }
                    />
                  }
                  noUpperBorder
                  shaded
                />
              </div>
              <div>
                <SideBySide
                  title="Bio"
                  description="Tell people about yourself, your interests, and what you do."
                  icon={<HiInformationCircle />}
                  right={
                    <Textarea
                      label="Bio"
                      description="Tell other users about yourself."
                      defaultValue={user.bio}
                      onChange={(e) => {
                        update("bio", e.target.value);
                      }}
                    />
                  }
                  noUpperBorder
                  shaded
                />
              </div>
            </Grouped>
            <Grouped title="Location & Status" dark>
              <div>
                <SideBySide
                  title="Country"
                  description="Represent your nationality on Framework. This will not be used for any purpose other than for social purposes."
                  icon={<HiGlobe />}
                  right={
                    <Descriptive
                      title="Country"
                      description="Represent your country on Framework!"
                    >
                      <CountrySelect
                        defaultValue={user.country}
                        onChange={(code: string) => {
                          update("country", code);
                        }}
                      />
                    </Descriptive>
                  }
                  noUpperBorder
                  shaded
                />
              </div>
              <div>
                <SideBySide
                  title="Busy"
                  description="Let people know if you are busy, like on vacation or working on something else."
                  icon={<HiOfficeBuilding />}
                  right={
                    <Descriptive
                      title="Busy"
                      description="Let other users know you're busy."
                    >
                      <Checkbox
                        label="Enable busy status"
                        defaultChecked={user.busy}
                        onChange={(e) => {
                          update("busy", e.currentTarget.checked);
                        }}
                      />
                    </Descriptive>
                  }
                  noUpperBorder
                  shaded
                />
              </div>
              <div>
                <SideBySide
                  title="Timezone"
                  description="Share your time zone so others know when it's a good time to reach out to you."
                  icon={<HiClock />}
                  right={
                    <Select
                      label="Timezone"
                      description="Select your timezone."
                      defaultValue={user.timeZone}
                      onChange={(e) => {
                        update("timeZone", String(e));
                      }}
                      data={getTimezones().map((t) => ({
                        label: t.value,
                        value: t.value,
                      }))}
                      searchable
                    />
                  }
                  noUpperBorder
                  shaded
                />
              </div>
            </Grouped>
            <Grouped title="Contact" dark>
              <div>
                <SideBySide
                  title="Profile Links"
                  description="Add up to 3 links to your social media profiles, websites, or anything else you want to share."
                  icon={<HiLink />}
                  right={
                    <ReactNoSSR>
                      <Links user={user} />
                    </ReactNoSSR>
                  }
                  actions={
                    <Stateful>
                      {(open, setOpen) => (
                        <>
                          <Button
                            onClick={() => {
                              setOpen(true);
                            }}
                            leftIcon={<HiPencil />}
                            fullWidth
                          >
                            Edit links
                          </Button>
                          <Modal
                            title="Edit links"
                            opened={open}
                            onClose={() => setOpen(false)}
                          >
                            <Stack spacing={12}>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                  className="flex flex-row items-start gap-4"
                                  key={i}
                                >
                                  <TextInput
                                    label={`Name ${i + 1}`}
                                    description="The name of the link."
                                    placeholder="YouTube"
                                    defaultValue={
                                      profileLinks[i]
                                        ? profileLinks[i].name
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const links = [...profileLinks];
                                      links[i] = {
                                        name: e.target.value,
                                        url: links[i] ? links[i].url : "",
                                      } as ProfileLink;
                                      setProfileLinks(links);
                                    }}
                                    icon={<HiLink />}
                                    error={
                                      profileLinks[i] &&
                                      profileLinks[i].name !== "" &&
                                      !profileLinks[i].name.match(
                                        /^[a-zA-Z0-9_ ]{3,24}$/
                                      )
                                        ? "Your link name must be between 3 and 24 characters and can only contain letters, numbers, and underscores."
                                        : undefined
                                    }
                                    className="w-1/2"
                                  />
                                  <TextInput
                                    label={`Link ${i + 1}`}
                                    description="The link to the service."
                                    placeholder="https://example.com"
                                    defaultValue={
                                      profileLinks[i] ? profileLinks[i].url : ""
                                    }
                                    onChange={(e) => {
                                      const links = [...profileLinks];
                                      links[i] = {
                                        name: links[i] ? links[i].name : "",
                                        url: e.target.value,
                                      } as ProfileLink;
                                      setProfileLinks(links);
                                    }}
                                    icon={<HiLink />}
                                    error={
                                      profileLinks[i] &&
                                      profileLinks[i].url !== "" &&
                                      !profileLinks[i].url.match(
                                        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
                                      )
                                        ? "Your link must be a valid URL."
                                        : undefined
                                    }
                                    className="w-1/2"
                                  />
                                </div>
                              ))}
                            </Stack>
                          </Modal>
                        </>
                      )}
                    </Stateful>
                  }
                  noUpperBorder
                  shaded
                />
              </div>
            </Grouped>
          </Stack>
        </Stack>
      </SettingsTab>
    </>
  );
};

export default AccountTab;
