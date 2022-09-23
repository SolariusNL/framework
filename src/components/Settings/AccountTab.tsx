import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  FileButton,
  Grid,
  Group,
  Modal,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  HiIdentification,
  HiInformationCircle,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import { Crop } from "react-image-crop";
import getTimezones from "../../data/timezones";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
import CountrySelect from "../CountryPicker";
import Descriptive from "../Descriptive";
import SettingsTab from "./SettingsTab";
import ReactNoSSR from "react-no-ssr";

const AvatarCropNoSSR = dynamic(() => import("react-image-crop"), {
  ssr: false,
});

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
  };
  const [uploadedAvatar, setUploadedAvatar] = useState<File | null>(null);
  const [uploadedAvatarData, setUploadedAvatarData] = useState<string | null>(
    null
  );
  const [croppedImage, setCroppedImage] = useState<String | null>(null);
  const [success, setSuccess] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>();
  const [usernameSelected, setUsernameSelected] = useState(false);

  const onCropComplete = (crop: Crop) => {
    makeClientCrop(crop);
  };

  const makeClientCrop = async (crop: Crop) => {
    if (crop.width && crop.height) {
      const croppedImg = await getCroppedImg(
        imgRef.current,
        crop,
        "cropped.jpeg"
      );
      setCroppedImage(String(croppedImg));
    }
  };

  const getCroppedImg = (image: any, crop: Crop, fileName: string) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      try {
        return new Promise((resolve, reject) => {
          resolve(canvas.toDataURL("image/jpeg"));
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const mobile = useMediaQuery("768");

  const getImageFromFile = () => {
    if (!uploadedAvatar) {
      return null;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setUploadedAvatarData(reader.result as string);
      setUploadedAvatar(null);
    };

    reader.readAsDataURL(uploadedAvatar);
  };

  useEffect(() => {
    if (uploadedAvatar) {
      getImageFromFile();
    }
  }),
    [uploadedAvatar];

  return (
    <>
      <Modal
        opened={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        title="Crop Avatar"
      >
        <AvatarCropNoSSR
          crop={crop}
          onChange={(crop) => setCrop(crop)}
          onComplete={onCropComplete}
        >
          <img
            ref={imgRef as any}
            src={String(uploadedAvatarData)}
            alt="avatar"
          />
        </AvatarCropNoSSR>

        <Button
          mt={20}
          fullWidth
          onClick={() => {
            setCropModalOpen(false);
            setUploadedAvatarData(String(croppedImage));
            setCroppedImage(null);
          }}
        >
          Finish
        </Button>
      </Modal>

      <SettingsTab
        tabValue="account"
        tabTitle="Profile"
        saveButtonLabel="Save"
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
                  setUploadedAvatar(null);
                }

                setError(res.error);
              })
              .catch((err) => {
                setError(err.message);
                return null;
              })
              .finally(() => setLoading(false));
          }
        }}
        success={success}
        setSuccess={setSuccess}
      >
        <Grid columns={2} gutter="xl">
          <Grid.Col span={mobile ? 2 : 1}>
            <Descriptive
              title="Avatar"
              description="Your avatar will be displayed next to your name."
            >
              <Group spacing={24}>
                <ReactNoSSR>
                  <Avatar
                    src={
                      uploadedAvatarData
                        ? uploadedAvatarData
                        : user.avatarUri ||
                          `https://avatars.dicebear.com/api/identicon/${user.id}.png`
                    }
                    alt={user.username}
                    radius={999}
                    size={48}
                  />
                </ReactNoSSR>

                <Group>
                  <FileButton
                    onChange={(file) => {
                      if (file) {
                        setUploadedAvatar(file);
                        setCropModalOpen(true);
                      } else {
                        setUploadedAvatar(null);
                        setUploadedAvatarData(null);
                      }
                    }}
                    accept="image/png,image/jpeg"
                  >
                    {(props) => (
                      <Button leftIcon={<HiIdentification />} {...props}>
                        Change avatar
                      </Button>
                    )}
                  </FileButton>

                  {uploadedAvatar && (
                    <Button
                      leftIcon={<HiTrash />}
                      onClick={() => {
                        setUploadedAvatar(null);
                        setUploadedAvatarData(null);
                      }}
                      color="red"
                    >
                      Remove avatar
                    </Button>
                  )}
                </Group>
              </Group>
            </Descriptive>
          </Grid.Col>
          <Grid.Col span={mobile ? 2 : 1}>
            <TextInput
              label="Username"
              description="Your username represents you on Framework."
              defaultValue={user.username}
              onChange={(e) => {
                update("username", e.target.value);
              }}
              icon={<HiUser />}
              onFocus={() => setUsernameSelected(true)}
              onBlur={() => setUsernameSelected(false)}
              styles={{
                input: {
                  ...(usernameSelected
                    ? {
                        borderBottomLeftRadius: "0!important",
                        borderBottomRightRadius: "0!important",
                      }
                    : {}),
                },
              }}
            />
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: usernameSelected ? 1 : 0,
                height: usernameSelected ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                icon={<HiInformationCircle size={14} />}
                sx={{
                  borderTopRightRadius: "0!important",
                  borderTopLeftRadius: "0!important",
                }}
              >
                You will be charged 500 tickets to change your username.
              </Alert>
            </motion.div>
          </Grid.Col>
          <Grid.Col span={mobile ? 2 : 1}>
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
          </Grid.Col>
          <Grid.Col span={mobile ? 2 : 1}>
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
          </Grid.Col>
          <Grid.Col span={mobile ? 2 : 1}>
            <Textarea
              label="Bio"
              description="Tell other users about yourself."
              defaultValue={user.bio}
              onChange={(e) => {
                update("bio", e.target.value);
              }}
            />
          </Grid.Col>
          <Grid.Col span={mobile ? 2 : 1}>
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
          </Grid.Col>
        </Grid>
      </SettingsTab>
    </>
  );
};

export default AccountTab;
