import InventTab from "@/components/invent/invent";
import { GetSoundsResponse } from "@/pages/api/sounds/[[...params]]";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson, { fetchAndSetData } from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Button,
  FileInput,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useEffect, useRef, useState } from "react";
import {
  HiCheck,
  HiMusicNote,
  HiPlay,
  HiStop,
  HiTag,
  HiUpload,
  HiXCircle,
} from "react-icons/hi";
import AssetCard from "../asset-card";
import ModernEmptyState from "../modern-empty-state";

type SoundsProps = {
  user: User;
};
type Form = {
  name: string;
  description: string;
  audio: File | null;
};

const Sounds = ({ user }: SoundsProps) => {
  const [opened, setOpened] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [sounds, setSounds] = useState<AssetFrontend[]>([]);
  const form = useForm<Form>({
    initialValues: {
      name: "",
      description: "",
      audio: null,
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
            },
            auth: true,
          })
            .then(async (res) => {
              const formData = new FormData();
              formData.append("sound", values.audio!);

              await fetch(`/api/media/upload/sound/${res.data?.sound.id}`, {
                method: "POST",
                headers: {
                  authorization: String(getCookie(".frameworksession")),
                },
                body: formData,
              }).then(() => {
                showNotification({
                  title: "Sound created",
                  message: "Your sound has been created successfully.",
                  icon: <HiCheck />,
                });
                setOpened(false);
                form.reset();
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
            {...form.getInputProps("audio")}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
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
            >
              {previewing ? "Stop preview" : "Preview"}
            </Button>
            <Button leftIcon={<HiCheck />} type="submit">
              Create sound
            </Button>
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
