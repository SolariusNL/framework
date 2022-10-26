import {
  Alert,
  Button,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { getCookie } from "cookies-next";
import React from "react";
import { HiCheckCircle, HiCloud } from "react-icons/hi";
import { Game } from "../../util/prisma-types";
import { genreMap } from "../../util/universe/genre";
import Descriptive from "../Descriptive";
import RichText from "../RichText";
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

  const updateDetails = async () => {
    setDetailsLoading(true);
    setSuccess(false);
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
      <Stack mb={32}>
        {editable.map((value, index) => {
          const { property, label, description, type, options, title } = value;

          return (
            <SideBySide
              title={title}
              description={description}
              key={index}
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
      </Stack>

      {success && (
        <Alert color="green" icon={<HiCheckCircle />} title="Success" mb={30}>
          Your game has been updated.
        </Alert>
      )}

      <Button
        leftIcon={<HiCloud />}
        onClick={updateDetails}
        loading={detailsLoading}
      >
        Save Changes
      </Button>
    </EditGameTab>
  );
};

export default Details;
