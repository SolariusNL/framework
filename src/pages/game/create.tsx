import Descriptive from "@/components/Descriptive";
import Framework from "@/components/Framework";
import LabelledRadio from "@/components/LabelledRadio";
import sanitizeInappropriateContent from "@/components/ReconsiderationPrompt";
import RichText from "@/components/RichText";
import { BLACK, FormSection } from "@/pages/teams/t/[slug]/issue/create";
import authorizedRoute from "@/util/auth";
import { getCookie } from "@/util/cookies";
import { User } from "@/util/prisma-types";
import { getGenreText } from "@/util/universe/genre";
import {
  Button,
  Checkbox,
  Divider,
  NumberInput,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import ReactNoSSR from "react-no-ssr";

const InlineInput = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4">{children}</div>
  );
};

InlineInput.Label = ({
  children,
  description,
}: {
  children: React.ReactNode;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <div className="flex items-center gap-2">
        <Text size="lg">{children}</Text>
        <Text size="sm" color="red">
          *
        </Text>
      </div>
      <Text size="sm" color="dimmed">
        {description}
      </Text>
    </div>
  );
};

InlineInput.Input = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-1">{children}</div>;
};

interface CreateGameProps {
  user: User;
}

interface CreateGameForm {
  gameName: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
  communityGuidelines: boolean;
  access: "public" | "private" | "paid";
}

const CreateGame: NextPage<CreateGameProps> = ({ user }) => {
  const router = useRouter();
  const form = useForm<CreateGameForm>({
    initialValues: {
      gameName: "",
      description: "",
      genre: GameGenre.OTHER,
      maxPlayers: 15,
      communityGuidelines: false,
      access: "public",
    },

    validate: {
      gameName: (value) =>
        value.length < 3 || value.length > 40
          ? "Game name must be between 3 and 40 characters"
          : null,
      description: (value) =>
        value.length < 3 || value.length > 4000
          ? "Description must be between 3 and 4000 characters"
          : null,
      maxPlayers: (value) =>
        value < 1 || value > 50 ? "Max players must be between 1 and 50" : null,
      access: (value: string) => {
        if (value == "paid") {
          return "Paid access is not yet supported";
        }
      },
    },
  });

  const onSubmit = async (values: CreateGameForm) => {
    if (values.communityGuidelines == false) {
      form.setErrors({
        gameName: "You must accept the community guidelines",
        genre: "You must accept the community guidelines",
        description: "You must accept the community guidelines",
        maxPlayers: "You must accept the community guidelines",
      });
      return;
    }

    await fetch("/api/games/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${getCookie(".frameworksession")}`,
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push(`/game/${res.game.id}`);
        } else {
          form.setErrors({
            gameName: "Unable to create game",
            genre: "Unable to create game",
            description: "Unable to create game",
            maxPlayers: "Unable to create game",
          });
        }
      })
      .catch((err) => {
        form.setErrors({
          gameName: "Unable to create game",
          genre: "Unable to create game",
          description: "Unable to create game",
          maxPlayers: "Unable to create game",
        });
      });
  };

  return (
    <Framework
      user={user}
      activeTab="invent"
      modernTitle="Create a game"
      modernSubtitle="Create a game and build your dream on Framework"
    >
      <ReactNoSSR>
        <form
          onSubmit={form.onSubmit(async (values) => {
            [values.gameName].reduce((acc: boolean, val: string) => {
              if (acc) return acc;
              const match = sanitizeInappropriateContent(val, () =>
                onSubmit(values)
              );
              return match;
            }, false);
          })}
          className="gap-6 flex flex-col"
        >
          <FormSection
            title="Details"
            description="General information about your game like the name and description."
          >
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                placeholder="My Game"
                required
                label="Game name"
                classNames={BLACK}
                {...form.getInputProps("gameName")}
              />
              <Select
                data={Object.values(GameGenre).map((genre) => ({
                  value: genre,
                  label: getGenreText(genre),
                }))}
                required
                label="Genre"
                classNames={BLACK}
                {...form.getInputProps("genre")}
              />
            </div>
            <Descriptive required title="Description">
              <RichText
                styles={() => ({
                  root: {
                    height: 240,
                    overflow: "auto",
                  },
                })}
                classNames={{
                  root: BLACK.input,
                  toolbar: BLACK.input,
                  toolbarControl: BLACK.input,
                }}
                placeholder="A detailed description of your game."
                required
                controls={[
                  ["bold", "italic", "underline", "link"],
                  ["h3", "h4", "h5", "h6"],
                  ["blockquote"],
                  ["code", "codeBlock"],
                  ["orderedList", "unorderedList"],
                ]}
                {...form.getInputProps("description")}
              />
            </Descriptive>
          </FormSection>
          <FormSection
            title="Access"
            description="Adjust access preferences for your game."
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Public",
                  description:
                    "Anyone can join and discover your game. This is the default access level.",
                  value: "public",
                },
                {
                  label: "Private",
                  description:
                    "Only you and invited users can join your game. Recommended for games that are still in development.",
                  value: "private",
                },
                {
                  label: "Paid",
                  description:
                    "Only users who pay can join your game. This is not yet supported.",
                  value: "paid",
                  disabled: true,
                },
              ].map((option) => (
                <LabelledRadio
                  label={option.label}
                  description={option.description}
                  value={option.value}
                  disabled={option.disabled}
                  key={option.value}
                  checked={form.values.access === option.value}
                  classNames={{
                    radio: BLACK.input,
                  }}
                  onChange={(e) =>
                    form.setFieldValue(
                      "access",
                      option.value as "public" | "private" | "paid"
                    )
                  }
                />
              ))}
            </div>
            <Divider mt="xs" mb="xs" />
            <NumberInput
              placeholder="15"
              label="Max players"
              description="Maximum players per session."
              required
              min={1}
              max={50}
              classNames={BLACK}
              {...form.getInputProps("maxPlayers")}
            />
          </FormSection>
          <FormSection title="Submit" description="Submit your game.">
            <Checkbox
              required
              {...form.getInputProps("communityGuidelines")}
              classNames={BLACK}
              label="I agree to the Framework community guidelines"
            />
            <Button size="lg" type="submit">
              Create your game
            </Button>
          </FormSection>
        </form>
      </ReactNoSSR>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default CreateGame;
