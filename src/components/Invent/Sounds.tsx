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
import { useEffect, useRef, useState } from "react";
import {
  HiCheck,
  HiMusicNote,
  HiPlay,
  HiStop,
  HiTag,
  HiUpload,
} from "react-icons/hi";
import { BLACK } from "../../pages/teams/t/[slug]/issue/create";
import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

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
  const form = useForm<Form>({
    initialValues: {
      name: "",
      description: "",
      audio: null,
    },
    validate: {
      name: (value) => value.trim().length > 0 && value.trim().length < 50,
      description: (value) =>
        value.trim().length > 0 && value.trim().length < 500,
      audio: (value: File) => value !== null,
    },
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    audioRef.current?.addEventListener("ended", () => setPreviewing(false));

    return () => {
      audioRef.current?.removeEventListener("ended", () =>
        setPreviewing(false)
      );
    };
  }, [previewing]);

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
        onSubmit={form.onSubmit((values) => {
          console.log(values);
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
      ></InventTab>
    </>
  );
};

export default Sounds;
