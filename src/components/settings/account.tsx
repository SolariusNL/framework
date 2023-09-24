import CountrySelect from "@/components/country-picker";
import Descriptive from "@/components/descriptive";
import ImageUploader from "@/components/image-uploader";
import Links from "@/components/profile/links";
import SettingsTab from "@/components/settings/settings-tab";
import Stateful from "@/components/stateful";
import getTimezones from "@/data/timezones";
import { FormSection } from "@/pages/teams/t/[slug]/issue/create";
import { getCookie } from "@/util/cookies";
import getMediaUrl from "@/util/get-media";
import { User } from "@/util/prisma-types";
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { ProfileLink } from "@prisma/client";
import { useRef, useState } from "react";
import {
  HiLink,
  HiOutlineUser,
  HiOutlineUserCircle,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

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
        <Stack spacing={32}>
          <FormSection
            title="Personal information"
            description="Details such as your avatar, username, and bio."
            noCard
          >
            <Stack spacing="lg">
              <div className="flex gap-8 justify-between">
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
                <div className="flex flex-col gap-2 w-fit items-end">
                  <div>
                    <ImageUploader
                      crop={true}
                      imgRef={
                        imgRef as React.MutableRefObject<HTMLImageElement>
                      }
                      onFinished={(data) => {
                        setUploadedAvatarData(data);
                        setUnsavedChanges(true);
                      }}
                      ratio={1}
                    />
                  </div>
                  <Text size="sm" color="dimmed" mt={4}>
                    JPG, GIF or PNG. 12MB max.
                  </Text>
                  {uploadedAvatarData && (
                    <div>
                      <Button
                        leftIcon={<HiTrash />}
                        onClick={() => {
                          setUploadedAvatarData(null);
                          setUnsavedChanges(true);
                        }}
                        color="red"
                        mt="sm"
                      >
                        Remove avatar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <TextInput
                    label="Username"
                    defaultValue={user.username}
                    onChange={(e) => {
                      update("username", e.target.value);
                    }}
                    icon={<HiOutlineUser />}
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
                  <Text size="sm" color="dimmed">
                    You&apos;ll be charged 500T$ to change your username.
                  </Text>
                </div>
                <div className="flex flex-col gap-1">
                  <TextInput
                    label="Alias"
                    placeholder="Create an alias"
                    defaultValue={user.alias || ""}
                    onChange={(e) => {
                      update("alias", e.target.value);
                    }}
                    icon={<HiOutlineUserCircle />}
                    error={
                      updated.alias &&
                      !updated.alias.match(/^[a-zA-Z0-9_]{3,24}$/)
                        ? "Your alias must be between 3 and 24 characters and can only contain letters, numbers, and underscores."
                        : undefined
                    }
                  />
                  <Text size="sm" color="dimmed">
                    Your alias is a non-unique username.
                  </Text>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Textarea
                  label="Bio"
                  defaultValue={user.bio}
                  onChange={(e) => {
                    update("bio", e.target.value);
                  }}
                  minRows={3}
                />
                <Text size="sm" color="dimmed">
                  Tell other users about yourself.
                </Text>
              </div>
            </Stack>
          </FormSection>
          <Divider />
          <FormSection
            title="Social"
            description="Details such as your country, timezone, and availability status."
            noCard
          >
            <div className="grid grid-cols-2 gap-4">
              <Descriptive title="Country">
                <CountrySelect
                  defaultValue={user.country}
                  onChange={(code: string) => {
                    update("country", code);
                  }}
                />
              </Descriptive>

              <Select
                label="Timezone"
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
            </div>
            <Descriptive title="Busy">
              <Checkbox
                label="I am busy right now"
                defaultChecked={user.busy}
                onChange={(e) => {
                  update("busy", e.currentTarget.checked);
                }}
              />
            </Descriptive>
          </FormSection>
          <Divider />
          <FormSection
            title="Links"
            description="Add links to your profile."
            noCard
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
                                profileLinks[i] ? profileLinks[i].name : ""
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
          >
            <ReactNoSSR>
              <Links user={user} />
            </ReactNoSSR>
          </FormSection>
        </Stack>
      </SettingsTab>
    </>
  );
};

export default AccountTab;
