import Descriptive from "@/components/descriptive";
import ModernEmptyState from "@/components/modern-empty-state";
import RichText from "@/components/rich-text";
import ShadedCard from "@/components/shaded-card";
import UpdateCard from "@/components/update-card";
import { Game } from "@/util/prisma-types";
import {
  Button,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GameUpdateLog, GameUpdateLogType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiPlus, HiX } from "react-icons/hi";

interface UpdatesProps {
  game: Game;
}

const Updates = ({ game }: UpdatesProps) => {
  const [updates, setUpdates] = useState<GameUpdateLog[]>();
  const [updatePage, setUpdatePage] = useState(1);
  const [pages, setPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [latest, setLatest] = useState("");
  const updateForm = useForm<{
    title: string;
    content: string;
    tag: string;
    type: GameUpdateLogType;
  }>({
    initialValues: {
      title: "",
      content: "",
      tag: "",
      type: GameUpdateLogType.MINOR,
    },
    validate: {
      title: (value) => {
        if (value.length < 3 || value.length > 75) {
          return "Title must be between 3 and 75 characters.";
        }
      },
      content: (value) => {
        if (value.length < 3 || value.length > 5000) {
          return "Content must be between 3 and 5000 characters.";
        }
      },
      tag: (value) => {
        const semver =
          /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
        if (!semver.test(value)) {
          return "Tag must be a valid semver version.";
        }
      },
    },
  });
  const headers = {
    headers: {
      Authorization: String(getCookie(".frameworksession")),
      "Content-Type": "application/json",
    },
  };

  const getUpdates = async () => {
    await fetch(`/api/games/updates/${game.id}/${updatePage}`, headers)
      .then((res) => res.json())
      .then((res) => {
        setUpdates(res.updates);
        setPages(res.pages);
      });
  };

  const getLatestTag = async () => {
    await fetch(`/api/games/updates/${game.id}/latest/tag`, headers)
      .then((res) => res.json())
      .then((res) => {
        setLatest(res.tag);
      });
  };

  useEffect(() => {
    getUpdates();
    getLatestTag();
  }, [updatePage]);

  return (
    <>
      <Modal
        title="New update"
        opened={formOpen}
        onClose={() => setFormOpen(false)}
      >
        <form
          onSubmit={updateForm.onSubmit(async (values) => {
            await fetch(`/api/games/updates/${game.id}/create`, {
              method: "POST",
              body: JSON.stringify(values),
              ...headers,
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.success) {
                  setFormOpen(false);
                  getUpdates();
                  showNotification({
                    title: "Update created",
                    message: "Your update has been created.",
                    icon: <HiCheckCircle />,
                  });
                } else {
                  showNotification({
                    title: "Error",
                    message: res.message,
                    color: "red",
                    icon: <HiX />,
                  });
                  updateForm.setFieldError("title", res.error);
                  updateForm.setFieldError("content", res.error);
                  updateForm.setFieldError("tag", res.error);
                  updateForm.setFieldError("type", res.error);
                }
              });
          })}
        >
          <Stack spacing={12}>
            <TextInput
              placeholder={latest || "1.0.0"}
              label="Tag"
              description="Semantic versioning tag for this update."
              required
              {...updateForm.getInputProps("tag")}
            />
            <TextInput
              placeholder="Winter update"
              label="Title"
              description="Short title for this update."
              required
              {...updateForm.getInputProps("title")}
            />
            <Descriptive
              title="Description"
              description="A detailed description of this update. Rich text is supported."
              required
            >
              <RichText
                required
                controls={[
                  ["bold", "italic", "underline"],
                  ["orderedList", "unorderedList"],
                  ["h4", "h5", "h6"],
                ]}
                {...updateForm.getInputProps("content")}
              />
            </Descriptive>
            <Select
              label="Type"
              description="The type of update this is."
              required
              data={[
                { label: "Minor", value: GameUpdateLogType.MINOR },
                { label: "Major", value: GameUpdateLogType.MAJOR },
                { label: "Patch", value: GameUpdateLogType.PATCH },
              ]}
              {...updateForm.getInputProps("type")}
            />
            <div className="flex justify-end">
              <Button type="submit">Create update</Button>
            </div>
          </Stack>
        </form>
      </Modal>
      <Text mb="md">
        Keep your players up to date with the latest changes to your game.
        Framework uses semantic versioning to keep track of your game&apos;s
        updates. Click &quot;New update&quot; to create a new update log.
      </Text>
      <Text size="sm" color="dimmed" mb="xl">
        Players who follow your game will be notified of new updates, so make
        sure to keep them informed!
      </Text>
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="subtle"
          leftIcon={<HiPlus />}
          onClick={() => setFormOpen(true)}
        >
          New update
        </Button>
        <Text size="sm" color="dimmed">
          Latest tag: <b>{latest || "None"}</b>
        </Text>
      </div>
      <Pagination
        radius="md"
        page={updatePage}
        total={pages || 1}
        onChange={setUpdatePage}
        mb="md"
      />
      {updates && updates.length > 0 ? (
        <Stack spacing="xl">
          {updates
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((update) => (
              <div key={update.id}>
                <UpdateCard update={update} sm />
              </div>
            ))}
        </Stack>
      ) : (
        <ShadedCard className="w-full flex justify-center items-center">
          <ModernEmptyState
            title="No updates"
            body="No updates found. Why not create one?"
          />
        </ShadedCard>
      )}
    </>
  );
};

export default Updates;
