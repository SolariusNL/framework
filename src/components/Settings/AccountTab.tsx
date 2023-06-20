import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { ProfileLink } from "@prisma/client";
import { useRef, useState } from "react";
import {
  HiCamera,
  HiClock,
  HiDocumentText,
  HiGlobe,
  HiInformationCircle,
  HiLink,
  HiOfficeBuilding,
  HiPencil,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import getTimezones from "../../data/timezones";
import { BLACK } from "../../pages/teams/t/[slug]/issue/create";
import { getCookie } from "../../util/cookies";
import getMediaUrl from "../../util/get-media";
import { User } from "../../util/prisma-types";
import CountrySelect from "../CountryPicker";
import Descriptive from "../Descriptive";
import ImageUploader from "../ImageUploader";
import InlineError from "../InlineError";
import Links from "../Profile/Links";
import Stateful from "../Stateful";
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
        <Stack mb={16}>
          <SideBySide
            title="Avatar"
            description="Your avatar is the image that represents you on the site."
            icon={<HiCamera />}
            noUpperBorder
            shaded
            right={
              <div className="flex gap-8 justify-between md:justify-start">
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
                <div className="flex flex-col gap-2">
                  <ImageUploader
                    crop={true}
                    imgRef={imgRef as React.MutableRefObject<HTMLImageElement>}
                    onFinished={(data) => {
                      setUploadedAvatarData(data);
                      setUnsavedChanges(true);
                    }}
                    ratio={1}
                  />
                  <Text size="sm" color="dimmed" mt={4}>
                    The maximum file size allowed is 12mb, only .jpg, .jpeg,
                    .png, and .webp files are allowed.
                  </Text>
                  <Button
                    leftIcon={<HiTrash />}
                    onClick={() => {
                      setUploadedAvatarData(null);
                      setUnsavedChanges(true);
                    }}
                    color="red"
                    mt="sm"
                    disabled={!uploadedAvatarData}
                  >
                    Remove avatar
                  </Button>
                </div>
              </div>
            }
          />
          <SideBySide
            title="Username"
            description="Your username represents you on the platform."
            icon={<HiUser />}
            right={
              <>
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
                  classNames={BLACK}
                  mb="md"
                />
                <InlineError variant="info" title="Notice">
                  You will be charged 500 tickets to change your username.
                </InlineError>
                {new Date(user.lastUsernameChange as Date).getTime() +
                  604800000 >
                  Date.now() && (
                  <Alert icon={<HiInformationCircle size={14} />} mt={12}>
                    You can only change your username once every 7 days.
                  </Alert>
                )}
              </>
            }
            noUpperBorder
            shaded
          />
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
                  updated.alias && !updated.alias.match(/^[a-zA-Z0-9_]{3,24}$/)
                    ? "Your alias must be between 3 and 24 characters and can only contain letters, numbers, and underscores."
                    : undefined
                }
                classNames={BLACK}
              />
            }
            noUpperBorder
            shaded
          />
          <SideBySide
            title="Bio"
            description="Tell people about yourself, your interests, and what you do."
            icon={<HiInformationCircle />}
            right={
              <>
                <Textarea
                  label="Bio"
                  description="Tell other users about yourself."
                  defaultValue={user.bio}
                  onChange={(e) => {
                    update("bio", e.target.value);
                  }}
                  minRows={3}
                  mb="sm"
                  classNames={BLACK}
                />
                <Text size="sm" color="dimmed">
                  Describe yourself, your interests, and what you do in less
                  than 200 characters.
                </Text>
              </>
            }
            noUpperBorder
            shaded
          />
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
                  classNames={BLACK}
                />
              </Descriptive>
            }
            noUpperBorder
            shaded
          />
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
                classNames={BLACK}
              />
            }
            noUpperBorder
            shaded
          />
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
            noUpperBorder
            shaded
          />
        </Stack>
      </SettingsTab>
    </>
  );
};

export default AccountTab;
