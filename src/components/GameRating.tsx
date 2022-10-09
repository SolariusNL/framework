import { Badge, Card, Stack, Text } from "@mantine/core";
import { HiChat, HiLibrary, HiXCircle } from "react-icons/hi";
import { Game } from "../util/prisma-types";
import { getRatingTypeDescription } from "../util/universe/ratings";

interface GameRatingProps {
  game: Game;
}

const GameRating = ({ game }: GameRatingProps) => {
  const rating = game.rating!;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="xs" mb={16}>
        <Text weight={500}>Age Rating</Text>
      </Card.Section>

      <div style={{ textAlign: "center" }}>
        <Badge
          size="lg"
          color={
            rating.type === "EC" ||
            rating.type === "E" ||
            rating.type === "E10" ||
            rating.type === "T"
              ? "green"
              : rating.type === "M" ||
                rating.type === "AO" ||
                rating.type === "RP"
              ? "red"
              : "gray"
          }
          mb={6}
        >
          {rating.type}
        </Badge>

        <Text color="dimmed" size="sm" mb={12}>
          {getRatingTypeDescription(rating.type)}
        </Text>

        <Stack
          spacing={6}
          sx={{
            textAlign: "left",
          }}
        >
          {[
            {
              title: "Social",
              icon: HiChat,
              description: "Does not include uncontrolled social interactions",
              property: rating.scores.find((s) => s.category == "SOCIAL"),
            },
            {
              title: "Drugs & Alcohol",
              icon: HiLibrary,
              description: "Does not include references to drugs or alcohol",
              property: rating.scores.find((s) => s.category == "DRUGS"),
            },
            {
              title: "Nudity",
              icon: HiXCircle,
              description: "Does not include nudity or sexual content",
              property: rating.scores.find((s) => s.category == "NUDITY"),
            },
          ].map((i) => (
            <div
              key={i.title}
              style={{
                marginBottom: 10,
                display: "flex",
                gap: 10,
              }}
            >
              <Badge
                radius="xl"
                color={i.property!.score == "PASSING" ? "green" : "red"}
                sx={{
                  padding: "6px",
                  width: "3em",
                }}
              >
                <i.icon />
              </Badge>
              <Stack spacing={4}>
                <Text weight={500}>{i.title}</Text>
                <Text color="dimmed" size="sm">
                  {i.property?.description || i.description}
                </Text>
              </Stack>
            </div>
          ))}
        </Stack>
      </div>
    </Card>
  );
};

export default GameRating;
