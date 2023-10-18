import InventTab from "@/components/invent/invent";
import {
  GetSoundLicenseHolderNamesResponse,
  GetSoundsResponse,
  LicenseHolderDetails,
} from "@/pages/api/sounds/[[...params]]";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson, { fetchAndSetData } from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Button,
  Checkbox,
  FileInput,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { read } from "jsmediatags";
import { useEffect, useRef, useState } from "react";
import {
  HiCheck,
  HiMusicNote,
  HiOutlineTag,
  HiPlay,
  HiStop,
  HiTag,
  HiUpload,
  HiXCircle,
} from "react-icons/hi";
import AssetCard from "../asset-card";
import DataGrid from "../data-grid";
import ModernEmptyState from "../modern-empty-state";

type SoundsProps = {
  user: User;
};
type Form = {
  name: string;
  description: string;
  audio: File | null;
  licensed: boolean;
  licenseHolderId?: string;
  additionalFields?: {
    artist: string;
    album: string;
    year: string;
  };
};

const Sounds = ({ user }: SoundsProps) => {
  const [opened, setOpened] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sounds, setSounds] = useState<AssetFrontend[]>([]);
  const [automaticallyPopulateMusicInfo, setAutomaticallyPopulateMusicInfo] =
    useState(false);
  const [picture, setPicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [licenseHolders, setLicenseHolders] = useState<LicenseHolderDetails[]>(
    []
  );
  const form = useForm<Form>({
    initialValues: {
      name: "",
      description: "",
      audio: null,
      licensed: false,
    },
    validate: {
      name: (value) => {
        if (!value) return "Name is required.";
        if (value.length > 32) return "Name must be less than 32 characters.";
      },
      description: (value) => {
        if (!value) return "Description is required.";
        if (value.length > 256)
          return "Description must be less than 256 characters.";
      },
      audio: (value: File) => {
        if (!value) return "Audio file is required.";
      },
    },
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const createSound = (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Create sound"
      className={useMantineColorScheme().colorScheme}
    >
      <Text size="sm" color="dimmed" mb="lg">
        Sounds are an essential part of any game. Upload your own sounds for use
        in your own games, or to distribute to other users.
      </Text>
      <form
        onSubmit={form.onSubmit(async (values) => {
          setLoading(true);

          const duration = await new Promise<number>((resolve) => {
            const audio = new Audio(URL.createObjectURL(values.audio as File));
            audio.addEventListener("loadedmetadata", () => {
              resolve(audio.duration);
            });
          });

          await fetchJson<
            IResponseBase<{
              sound: {
                id: string;
              };
            }>
          >("/api/sounds/create", {
            method: "POST",
            body: {
              name: values.name,
              description: values.description,
              duration: Math.round(duration),
              fields: values.additionalFields,
              licensed: values.licensed,
              licenseHolderId: values.licenseHolderId,
            },
            auth: true,
          })
            .then(async (res) => {
              const formData = new FormData();
              formData.append("file", values.audio!);
              formData.append("bucket", "sounds");
              formData.append("soundId", res.data?.sound.id!);

              await fetch("/api/media/upload", {
                method: "POST",
                headers: {
                  authorization: String(getCookie(".frameworksession")),
                },
                body: formData,
              }).then(async () => {
                if (picture) {
                  const formData = new FormData();
                  formData.append(
                    "file",
                    new File(
                      [
                        Buffer.from(
                          picture.replace(/^data:image\/\w+;base64,/, ""),
                          "base64"
                        ),
                      ],
                      "asset.jpeg",
                      {
                        type: "image/jpeg",
                      }
                    )
                  );
                  formData.append("bucket", "assets");
                  formData.append("assetId", res.data?.sound.id!);

                  await fetch(`/api/media/upload?type=sound`, {
                    method: "POST",
                    body: formData,
                    headers: {
                      authorization: String(getCookie(".frameworksession")),
                    },
                  });
                }
                showNotification({
                  title: "Sound created",
                  message: "Your sound has been created successfully.",
                  icon: <HiCheck />,
                });
                setOpened(false);
                form.reset();
                setPicture(null);
                setAutomaticallyPopulateMusicInfo(false);
                fetchSounds();
                setLoading(false);
              });
            })
            .catch((err) => {
              showNotification({
                title: "Failed to create sound",
                message: err.message || "An unknown error occurred.",
                color: "red",
                icon: <HiXCircle />,
              });
            });
        })}
      >
        <Stack spacing="sm">
          <TextInput
            icon={<HiTag />}
            label="Name"
            placeholder="My sound"
            required
            classNames={BLACK}
            description="The name of your sound."
            {...form.getInputProps("name")}
          />
          <Textarea
            minRows={3}
            maxRows={6}
            label="Description"
            placeholder="This sound is a..."
            required
            classNames={BLACK}
            description="A description of your sound. Describe what it sounds like, what it can be used for, etc."
            {...form.getInputProps("description")}
          />
          <FileInput
            variant="default"
            icon={<HiUpload />}
            placeholder="Upload audio file"
            label="Audio file"
            description={
              <>
                The audio file that will be played when this sound is used.{" "}
                <span className="font-semibold">
                  Must be in .mp3, .wav, or .ogg format.
                </span>
              </>
            }
            classNames={BLACK}
            accept="audio/mp3,audio/wav,audio/ogg"
            required
            onChange={(file) => {
              form.setFieldValue("audio", file);
              if (automaticallyPopulateMusicInfo) {
                setLoading(true);
                setPicture(null);
                read(file, {
                  onSuccess: (tag) => {
                    const { artist, album, year, picture, title } = tag.tags;
                    form.setFieldValue("additionalFields", {
                      artist: artist || "Unknown artist",
                      album: album || "Unknown album",
                      year: year || "Unknown year",
                    });
                    if (picture) {
                      const base64String = picture.data.reduce(
                        (str, byte) => str + String.fromCharCode(byte),
                        ""
                      );
                      setPicture(
                        `data:${picture.format};base64,${btoa(base64String)}`
                      );
                    }
                    if (!form.values.name)
                      form.setFieldValue("name", title || "Unknown track");
                    if (!form.values.description)
                      form.setFieldValue(
                        "description",
                        `${title || "unknown track"} by ${
                          artist || "unknown artist"
                        }.` +
                          (album ? ` From the album ${album}.` : "") +
                          (year ? ` Released in ${year}.` : "")
                      );

                    setLoading(false);
                  },
                  onError: () => {
                    setLoading(false);
                    showNotification({
                      title: "Failed to read metadata",
                      message:
                        "We were unable to read the metadata from your audio file.",
                      color: "red",
                      icon: <HiXCircle />,
                    });
                  },
                });
              }
            }}
          />
          {form.values.additionalFields !== undefined && (
            <div className="flex flex-col gap-2 my-4">
              <Text size="sm" color="dimmed" weight={500}>
                Detected metadata
              </Text>
              <DataGrid
                className="!mt-2"
                items={Object.entries(form.values.additionalFields).map(
                  ([key, value]) => ({
                    tooltip: key,
                    value,
                    icon: <HiOutlineTag />,
                  })
                )}
              />
            </div>
          )}
          <Checkbox
            label="This sound is licensed by a company or individual"
            className="mt-4 mb-2"
            {...form.getInputProps("licensed", { type: "checkbox" })}
          />
          {form.values.licensed && (
            <Select
              label="License holder"
              description="Select a license holder that has been approved for use on our platform. These license holders are authorized because we have acquired the rights to use their content."
              data={licenseHolders.map((holder) => ({
                value: holder.id,
                label: holder.name,
              }))}
              required
              classNames={BLACK}
              placeholder="Select a license holder"
              className="mb-4"
              {...form.getInputProps("licenseHolderId")}
            />
          )}
          <div className="flex justify-between gap-4 items-center">
            <Checkbox
              label="Get track info"
              checked={automaticallyPopulateMusicInfo}
              onChange={(e) =>
                setAutomaticallyPopulateMusicInfo(e.currentTarget.checked)
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="light"
                leftIcon={previewing ? <HiStop /> : <HiPlay />}
                disabled={form.values.audio === null}
                onClick={() => {
                  setPreviewing(!previewing);
                  if (!audioRef.current) return;

                  if (previewing) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.src = URL.createObjectURL(
                      form.values.audio!
                    );
                    audioRef.current.play();
                  }
                }}
                radius="xl"
              >
                {previewing ? "Stop preview" : "Preview"}
              </Button>
              <Button
                leftIcon={<HiCheck />}
                type="submit"
                variant="light"
                radius="xl"
                loading={loading}
              >
                Create
              </Button>
            </div>
          </div>
        </Stack>
      </form>
    </Modal>
  );

  const fetchSounds = async () => {
    await Promise.all([
      fetchAndSetData<GetSoundsResponse>("/api/sounds/my", (data) =>
        setSounds(data?.sounds || [])
      ),
      fetchAndSetData<GetSoundLicenseHolderNamesResponse>(
        "/api/sounds/licenses/holders",
        (data) => setLicenseHolders(data?.licenseHolderNames || [])
      ),
    ]);
  };

  useEffect(() => {
    audioRef.current?.addEventListener("ended", () => setPreviewing(false));

    return () => {
      audioRef.current?.removeEventListener("ended", () =>
        setPreviewing(false)
      );
    };
  }, [previewing]);

  useEffect(() => {
    fetchSounds();
  }, []);

  return (
    <>
      {createSound}
      <audio ref={audioRef} />
      <InventTab
        tabValue="sounds"
        tabTitle="Sounds"
        tabSubtitle="Sell sounds that other users can purchase for use in their games."
        actions={
          <>
            <Button
              leftIcon={<HiMusicNote />}
              variant="default"
              onClick={() => setOpened(true)}
            >
              Create sound
            </Button>
          </>
        }
      >
        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
          {sounds.length === 0 ? (
            <div className="col-span-full">
              <ModernEmptyState
                title="No sounds"
                body="You haven't created any sounds yet."
              />
            </div>
          ) : (
            sounds.map((sound) => (
              <AssetCard key={sound.id} asset={sound} type="sound" />
            ))
          )}
        </div>
      </InventTab>
    </>
  );
};

export default Sounds;
