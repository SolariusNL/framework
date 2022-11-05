import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useRef, useState } from "react";
import {
  HiClock,
  HiGlobe,
  HiInformationCircle,
  HiOfficeBuilding,
  HiQuestionMarkCircle,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import getTimezones from "../../data/timezones";
import ImageUploader from "../ImageUploader";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import Copy from "../Copy";
import CountrySelect from "../CountryPicker";
import Descriptive from "../Descriptive";
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

  return (
    <>
      <SettingsTab
        tabValue="account"
        tabTitle="Profile"
        saveButtonLabel="Save"
        unsaved={unsavedChanges}
        saveButtonAction={(setLoading, setError) => {
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
                      : user.avatarUri ||
                        `https://avatars.dicebear.com/api/identicon/${user.id}.png`
                  }
                  alt={user.username}
                  radius={99}
                  size={"xl"}
                />
                <Stack spacing={3}>
                  <Text weight={500}>{user.username}</Text>
                  <Group spacing={3}>
                    <Copy value={user.id} />
                    <Text color="dimmed">
                      ID: <strong>{user.id}</strong>
                    </Text>
                    <Tooltip label="This ID is used to uniquely identify you on the platform. You cannot change it.">
                      <ThemeIcon
                        variant="outline"
                        size="sm"
                        color="gray"
                        ml={6}
                      >
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
          <div>
            <SideBySide
              title="Username"
              description="Your username represents you on the platform."
              actions={
                <>
                  <Alert icon={<HiInformationCircle size={14} />}>
                    You will be charged 500 tickets to change your username.
                  </Alert>
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
                />
              }
            />
          </div>
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
            />
          </div>
        </Stack>
      </SettingsTab>
    </>
  );
};

export default AccountTab;
