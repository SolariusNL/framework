import {
  Button,
  Checkbox,
  Grid,
  Group,
  NumberInput,
  Select,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Framework from "../../components/Framework";
import RichText from "../../components/RichText";
import authorizedRoute from "../../util/authorizedRoute";
import { getCookie } from "../../util/cookies";
import { User } from "../../util/prisma-types";
import { genreMap } from "../../util/universe/genre";
import useMediaQuery from "../../util/useMediaQuery";

interface CreateGameProps {
  user: User;
}

interface CreateGameForm {
  gameName: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
  communityGuidelines: boolean;
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
    },

    validate: {
      gameName: (value) =>
        value.length < 3 || value.length > 40
          ? "Game name must be between 3 and 40 characters"
          : null,
      description: (value) =>
        value.length < 3 || value.length > 526
          ? "Description must be between 3 and 526 characters"
          : null,
      maxPlayers: (value) =>
        value < 1 || value > 50 ? "Max players must be between 1 and 50" : null,
    },
  });

  const onSubmit = async (values: CreateGameForm) => {
    console.log(values);
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

  const mobile = useMediaQuery("768");

  return (
    <Framework user={user} activeTab="invent" key="frameworkshell">
      <Title mb={24}>Create a game</Title>
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Grid columns={mobile ? 1 : 3} key="meta">
          <Grid.Col span={1} key="name_area">
            <TextInput
              key="gameName"
              label="Game name"
              description="The name of your game. This will be displayed to players, so make it pretty."
              placeholder="amogus"
              required
              {...form.getInputProps("gameName")}
            />
          </Grid.Col>

          <Grid.Col span={1} key="genre_area">
            <Select
              key="genre"
              label="Genre"
              description="Genre of your game. Used to help players find your game."
              placeholder="Choose a genre"
              required
              data={Object.keys(genreMap).map((key) => ({
                value: key,
                label: genreMap[key as GameGenre],
              }))}
              {...form.getInputProps("genre")}
            />
          </Grid.Col>

          <Grid.Col span={1} key="max_players_area">
            <NumberInput
              key="maxPlayers"
              label="Max players"
              description="Maximum number of players allowed in your game per server."
              placeholder="15"
              required
              min={1}
              max={50}
              {...form.getInputProps("maxPlayers")}
            />
          </Grid.Col>
        </Grid>

        <Grid columns={3} mt={25} key="description_submit">
          <Grid.Col span={mobile ? 3 : 2} key="description_area">
            <RichText
              styles={() => ({
                root: {
                  height: "200px",
                },
              })}
              label="Description"
              description="A description of your game."
              placeholder="A short description of your game."
              required
              controls={[
                ["bold", "italic", "underline", "link"],
                ["h1", "h2", "h3", "h4"],
                ["alignCenter", "alignLeft", "alignRight"],
                ["blockquote"],
                ["code", "codeBlock"],
              ]}
              {...form.getInputProps("description")}
            />
          </Grid.Col>

          <Grid.Col span={mobile ? 3 : 1} key="submit_area">
            <Checkbox
              key="communityGuidelines"
              label="I agree to the Framework community guidelines"
              {...form.getInputProps("communityGuidelines", {
                type: "checkbox",
              })}
              mb={10}
            />
            <Button fullWidth type="submit">
              Create
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, true, false);
}

export default CreateGame;
