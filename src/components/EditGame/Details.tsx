import {
  AspectRatio,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GameCopyrightMetadata, GameGenre } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { useEffect } from "react";
import { BsMarkdown } from "react-icons/bs";
import { HiCheckCircle, HiCloud, HiPlus } from "react-icons/hi";
import getFileFromImg from "../../util/files";
import getMediaUrl from "../../util/get-media";
import { Game } from "../../util/prisma-types";
import { genreMap } from "../../util/universe/genre";
import Descriptive from "../Descriptive";
import Floater from "../Floater";
import { Section } from "../Home/FriendsWidget";
import ImageUploader from "../ImageUploader";
import ModernEmptyState from "../ModernEmptyState";
import RichText from "../RichText";
import SaveChanges from "../SaveChanges";
import SideBySide from "../Settings/SideBySide";
import ShadedCard from "../ShadedCard";
import EditGameTab from "./EditGameTab";

interface DetailsProps {
  game: Game;
}

enum EditableType {
  Text,
  Select,
  Numeric,
  RichText,
  ListTitleDescriptionPair,
  Bool,
}

type CopyrightMetadata = {
  title: string;
  description: string;
};

const Details = ({ game: g }: DetailsProps) => {
  const [game, setGame] = React.useState(g);
  const [updated, setUpdated] = React.useState(game);
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [uploadedIcon, setUploadedIcon] = React.useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = React.useState<
    string | null
  >(null);
  const [copyrightMetadata, setCopyrightMetadata] = React.useState<
    CopyrightMetadata[]
  >(game.copyrightMetadata);
  const [editing, setEditing] = React.useState(false);
  const [editingMetadata, setEditingMetadata] =
    React.useState<CopyrightMetadata>();
  const iconRef = React.useRef<HTMLImageElement>(null);
  const thumbnailRef = React.useRef<HTMLImageElement>(null);
  const [dirty, setDirty] = React.useState(false);
  const [deletedMetadata, setDeletedMetadata] =
    React.useState<CopyrightMetadata[]>();
  const [metadataChangeMap, setMetadataChangeMap] = React.useState<
    Record<string, boolean>
  >({});

  const editable = [
    {
      property: updated.name,
      label: "Game name",
      description:
        "Use an appealing name that describes your game to drive more traffic.",
      type: EditableType.Text,
      pointer: "name",
      title: "Name",
    },
    {
      property: updated.genre,
      label: "Game genre",
      description:
        "Select a genre that best describes your game to help discoverability.",
      type: EditableType.Select,
      options: Object.keys(genreMap).map((key) => ({
        value: key,
        label: genreMap[key as GameGenre],
      })),
      pointer: "genre",
      title: "Genre",
    },
    {
      property: updated.description,
      label: "Game description",
      description:
        "Describe your game in detail to help users understand what it's about.",
      type: EditableType.RichText,
      pointer: "description",
      title: "Description",
      hint: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BsMarkdown />
          <Text color="dimmed">Rich text editing is supported</Text>
        </div>
      ),
    },
    {
      property: updated.maxPlayersPerSession,
      label: "Players per server",
      description:
        "Set the maximum number of players that can join a server at once.",
      type: EditableType.Numeric,
      pointer: "maxPlayersPerSession",
      title: "Players per server",
    },
    {
      property: copyrightMetadata,
      label: "Copyright metadata",
      description:
        "Add up to 5 copyright notices to your game to protect your intellectual property.",
      type: EditableType.ListTitleDescriptionPair,
      pointer: "copyrightMetadata",
      title: "Copyright metadata",
      hint: (
        <div>
          <Text color="dimmed" size="sm" mb={8}>
            Click on a notice to edit it.
          </Text>
          <Button
            onClick={async () => {
              await createCopyRightMetadata();
              setDirty(true);
            }}
            disabled={copyrightMetadata.length >= 5}
            leftIcon={<HiPlus />}
          >
            Create
          </Button>
        </div>
      ),
    },
  ];

  const createCopyRightMetadata = async () => {
    setCopyrightMetadata([
      ...copyrightMetadata,
      {
        title: "New notice",
        description: "This is a new notice",
      },
    ]);
  };

  const metadataForm = useForm<{
    title: string;
    description: string;
  }>({
    initialValues: {
      title: "",
      description: "",
    },
    validate: {
      title: (value) => {
        if (value.length < 3 || value.length > 40) {
          return "Title must be between 3 and 40 characters";
        }
      },
      description: (value) => {
        if (value.length < 3 || value.length > 120) {
          return "Description must be between 3 and 120 characters";
        }
      },
    },
  });

  const updateDetails = async () => {
    setDetailsLoading(true);
    setSuccess(false);

    if (uploadedIcon) {
      const formData = new FormData();
      formData.append("icon", getFileFromImg(uploadedIcon));
      await fetch(`/api/media/upload/icon/${game.id}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            throw new Error(res.error);
          }
        });
    }

    if (uploadedThumbnail) {
      const formData = new FormData();
      formData.append("thumbnail", getFileFromImg(uploadedThumbnail));
      await fetch(`/api/media/upload/thumbnail/${game.id}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) {
            throw new Error(res.error);
          }
        });
    }

    await fetch(`/api/games/${game.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        ...updated,
        copyrightMetadata,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(
            res.error ||
              "A terrible error has occurred, and we couldn't update your game."
          );
        }

        setSuccess(true);
      })
      .catch((err) => {
        alert(err);
      })
      .finally(() => {
        setDetailsLoading(false);
        setDirty(false);
        setGame(updated);
        setDeletedMetadata(undefined);
      });
  };

  useEffect(() => {
    if (editingMetadata) {
      metadataForm.setValues({
        title: editingMetadata.title,
        description: editingMetadata.description,
      });
    }
  }, [editingMetadata]);

  useEffect(() => {
    const dirty = Object.keys(updated).some(
      (key) => updated[key as keyof typeof updated] !== game[key as keyof Game]
    );

    setDirty(dirty);
  }, [updated]);

  return (
    <>
      <Modal
        title={`Editing ${editingMetadata?.title}`}
        opened={editing}
        onClose={() => setEditing(false)}
      >
        <form
          onSubmit={metadataForm.onSubmit((values) => {
            setCopyrightMetadata(
              (prev) =>
                prev.map((item) =>
                  item === editingMetadata
                    ? {
                        ...item,
                        title: values.title,
                        description: values.description,
                      }
                    : item
                ) || []
            );
            setEditing(false);
            showNotification({
              title: "Saved",
              message:
                "Your changes have been saved. Make sure to sync your changes using the 'Save' button at the bottom of the page.",
              icon: <HiCheckCircle />,
            });
            if (
              editingMetadata?.title !== values.title ||
              editingMetadata?.description !== values.description
            ) {
              setDirty(true);
            }
          })}
        >
          <Stack spacing={8}>
            <TextInput
              label="Title"
              placeholder="Title of the notice"
              title="Title"
              description="A quick summary of the notice. Ex: 'Soodam.re Notice'"
              {...metadataForm.getInputProps("title")}
            />
            <TextInput
              label="Description"
              placeholder="Description of the notice"
              title="Description"
              description="A detailed description of the notice. Ex: 'Copyright 2022 Soodam.re B.V.'"
              {...metadataForm.getInputProps("description")}
            />
            <Group mt={8}>
              <Button type="submit">Save</Button>
              <Button
                color="red"
                variant="subtle"
                onClick={() => {
                  setCopyrightMetadata(
                    (prev) =>
                      prev.filter((item) => item !== editingMetadata) || []
                  );
                  setEditing(false);
                  showNotification({
                    title: "Deleted",
                    message:
                      "Your changes have been saved. Make sure to sync your changes using the 'Save' button at the bottom of the page.",
                    icon: <HiCheckCircle />,
                  });
                  setDirty(true);
                  setDeletedMetadata((prev) => [
                    ...(prev || []),
                    editingMetadata as CopyrightMetadata,
                  ]);
                }}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <EditGameTab value="details">
        <Section
          title="Details"
          description="General information about your game."
        />
        <Stack spacing={12}>
          {editable.map((value, index) => {
            const { property, label, description, type, options, title, hint } =
              value;

            return (
              <SideBySide
                title={title}
                description={description}
                key={index}
                actions={hint}
                noUpperBorder
                shaded
                right={
                  <>
                    {type == EditableType.Text && (
                      <TextInput
                        label={label}
                        description={description}
                        value={String(property)}
                        onChange={(event) => {
                          setUpdated({
                            ...updated,
                            [value.pointer]: event.currentTarget.value,
                          });
                        }}
                      />
                    )}

                    {type == EditableType.Select && (
                      <Select
                        label={label}
                        description={description}
                        value={String(property)}
                        data={
                          options ?? ([] as { label: string; value: any }[])
                        }
                        onChange={(s) => {
                          setUpdated({ ...updated, [value.pointer]: s });
                        }}
                      />
                    )}

                    {type == EditableType.Bool && (
                      <Descriptive title={label} description={description}>
                        <Switch
                          onChange={(e) => {
                            setUpdated({
                              ...updated,
                              [value.pointer]: e.currentTarget.checked,
                            });
                          }}
                          checked={Boolean(property)}
                        />
                      </Descriptive>
                    )}

                    {type == EditableType.Numeric && (
                      <NumberInput
                        label={label}
                        description={description}
                        value={Number(property)}
                        onChange={(s) => {
                          setUpdated({ ...updated, [value.pointer]: s });
                        }}
                      />
                    )}

                    {type == EditableType.RichText && (
                      <Descriptive title={label} description={description}>
                        <RichText
                          value={String(property)}
                          onChange={(s) => {
                            setUpdated({ ...updated, [value.pointer]: s });
                          }}
                          styles={{
                            root: {
                              maxHeight: "300px!important",
                              overflowY: "auto",
                            },
                          }}
                          controls={[
                            ["bold", "italic", "underline", "link"],
                            ["h1", "h2", "h3", "h4"],
                            ["blockquote"],
                            ["code", "codeBlock"],
                          ]}
                        />
                      </Descriptive>
                    )}

                    {type == EditableType.ListTitleDescriptionPair && (
                      <ShadedCard withBorder p={12}>
                        {(property as GameCopyrightMetadata[]).map(
                          (value, index) => {
                            return (
                              <Card.Section
                                withBorder
                                p={12}
                                sx={(theme) => ({
                                  "&:hover": {
                                    backgroundColor:
                                      theme.colorScheme === "dark"
                                        ? theme.colors.dark[7]
                                        : theme.colors.gray[1],
                                  },
                                  cursor: "pointer",
                                  transition: "background-color 0.2s",
                                })}
                                key={index}
                                onClick={() => {
                                  setEditingMetadata(value);
                                  setEditing(true);
                                }}
                              >
                                <Text
                                  weight={500}
                                  color="dimmed"
                                  size="sm"
                                  mb={6}
                                >
                                  {value.title}
                                </Text>
                                <Text lineClamp={1}>
                                  {value.description.slice(0, 40)}
                                  {value.description.length > 40 && "..."}
                                </Text>
                              </Card.Section>
                            );
                          }
                        )}
                        {(property as GameCopyrightMetadata[]).length == 0 && (
                          <Stack spacing={16}>
                            <ModernEmptyState
                              title="No copyright notices"
                              body="You haven't added any copyright notices yet."
                            />
                            <Button
                              variant="default"
                              onClick={async () => {
                                await createCopyRightMetadata();
                                setDirty(true);
                              }}
                            >
                              Create
                            </Button>
                          </Stack>
                        )}
                      </ShadedCard>
                    )}
                  </>
                }
              />
            );
          })}
          <Divider mt="xl" mb="xl" />
          <Section
            title="Media"
            description="Your games media, such as icon and thumbnail."
          />
          <SideBySide
            title="Icon"
            description="The icon is the image that represents your game in discoverability and search results."
            shaded
            noUpperBorder
            right={
              <>
                <Paper
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={uploadedIcon ?? getMediaUrl(game.iconUri)}
                    alt={`No icon uploaded for ${game.name}`}
                    height={128}
                    width={128}
                    ref={iconRef}
                  />
                </Paper>
              </>
            }
            actions={
              <ImageUploader
                onFinished={(imgStr) => {
                  setUploadedIcon(imgStr);
                  setDirty(true);
                }}
                crop
                ratio={1}
                imgRef={iconRef}
              />
            }
          />
          <SideBySide
            title="Thumbnail"
            description="Your thumbnail is the main image that represents your game, make it pop!"
            shaded
            noUpperBorder
            right={
              <>
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={uploadedThumbnail ?? getMediaUrl(game.gallery[0])}
                    alt={`No thumbnail uploaded for ${game.name}`}
                    width="100%"
                    height="100%"
                    ref={thumbnailRef}
                  />
                </AspectRatio>
              </>
            }
            actions={
              <ImageUploader
                onFinished={(imgStr) => {
                  setUploadedThumbnail(imgStr);
                  setDirty(true);
                }}
                crop
                ratio={16 / 9}
                imgRef={thumbnailRef}
              />
            }
          />
        </Stack>

        <Floater mounted={dirty}>
          <SaveChanges
            saveProps={{
              loading: detailsLoading,
              leftIcon: <HiCloud />,
            }}
            onClick={updateDetails}
            onDiscard={() => {
              setUpdated(game);
              setDirty(false);
              if (deletedMetadata?.length! > 0) {
                setCopyrightMetadata((prev) => [...prev, ...deletedMetadata!]);
                setDeletedMetadata([]);
              }
            }}
          />
        </Floater>
      </EditGameTab>
    </>
  );
};

export default Details;
