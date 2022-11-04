import {
  Alert,
  AspectRatio,
  Button,
  Image,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import { BsMarkdown } from "react-icons/bs";
import { HiCheckCircle, HiCloud } from "react-icons/hi";
import getFileFromImg from "../../util/getFileFromImg";
import { Game } from "../../util/prisma-types";
import { genreMap } from "../../util/universe/genre";
import Descriptive from "../Descriptive";
import ImageUploader from "../ImageUploader";
import RichText from "../RichText";
import Grouped from "../Settings/Grouped";
import SideBySide from "../Settings/SideBySide";
import EditGameTab from "./EditGameTab";

interface DetailsProps {
  game: Game;
}

enum EditableType {
  Text,
  Select,
  Numeric,
  RichText,
}

const Details = ({ game }: DetailsProps) => {
  const editable = [
    {
      property: game.name,
      label: "Game name",
      description:
        "Use an appealing name that describes your game to drive more traffic.",
      type: EditableType.Text,
      pointer: "name",
      title: "Name",
    },
    {
      property: game.genre,
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
      property: game.description,
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
      property: game.maxPlayersPerSession,
      label: "Players per server",
      description:
        "Set the maximum number of players that can join a server at once.",
      type: EditableType.Numeric,
      pointer: "maxPlayersPerSession",
      title: "Players per server",
    },
  ];

  const [updated, setUpdated] = React.useState({});
  const [detailsLoading, setDetailsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [uploadedIcon, setUploadedIcon] = React.useState<string | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = React.useState<
    string | null
  >(null);

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
      body: JSON.stringify(updated),
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
      });
  };

  return (
    <EditGameTab value="details">
      <Stack spacing={12}>
        <Grouped title="General Information">
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
                        defaultValue={property}
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
                        defaultValue={String(property)}
                        data={options ?? []}
                        onChange={(s) => {
                          setUpdated({ ...updated, [value.pointer]: s });
                        }}
                      />
                    )}

                    {type == EditableType.Numeric && (
                      <NumberInput
                        label={label}
                        description={description}
                        defaultValue={Number(property)}
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
                  </>
                }
              />
            );
          })}
        </Grouped>
        <Grouped title="Images">
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
                    src={uploadedIcon ?? game.iconUri}
                    alt={`No icon uploaded for ${game.name}`}
                    height={128}
                    width={128}
                  />
                </Paper>
              </>
            }
            actions={
              <ImageUploader onFinished={(imgStr) => setUploadedIcon(imgStr)} />
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
                    src={uploadedThumbnail ?? game.gallery[0]}
                    alt={`No thumbnail uploaded for ${game.name}`}
                    width="100%"
                    height="100%"
                  />
                </AspectRatio>
              </>
            }
            actions={
              <ImageUploader
                onFinished={(imgStr) => setUploadedThumbnail(imgStr)}
              />
            }
          />
        </Grouped>
      </Stack>

      {success && (
        <Alert color="green" icon={<HiCheckCircle />} title="Success" mt={30}>
          Your game has been updated.
        </Alert>
      )}

      <Button
        leftIcon={<HiCloud />}
        onClick={updateDetails}
        loading={detailsLoading}
        mt={30}
      >
        Save Changes
      </Button>
    </EditGameTab>
  );
};

export default Details;
