import ShadedCard from "@/components/shaded-card";
import { Game } from "@/util/prisma-types";
import {
  getRatingColor,
  getRatingTypeDescription,
} from "@/util/universe/ratings";
import { Badge, Stack, Text } from "@mantine/core";
import { RatingType } from "@prisma/client";
import { HiChat, HiLibrary, HiXCircle } from "react-icons/hi";

interface GameRatingProps {
  game: Game;
}

const GameRating = ({ game }: GameRatingProps) => {
  const rating = game.rating! || {
    type: RatingType.RP,
    scores: [
      {
        category: "SOCIAL",
        score: 0,
        description: "Social interactions not rated",
      },
      {
        category: "DRUGS",
        score: 0,
        description: "Drug and alcohol references not rated",
      },
      {
        category: "NUDITY",
        score: 0,
        description: "Nudity and sexual content not rated",
      },
    ],
  };

  return (
    <ShadedCard>
      <div className="text-center">
        <Badge size="lg" color={getRatingColor(rating)} mb={6}>
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
          ].map((i, iter) => (
            <div
              key={i.title}
              style={{
                marginBottom: iter === 2 ? 0 : 12,
                display: "flex",
                gap: 10,
              }}
            >
              <Badge
                radius="xl"
                color={i.property!.score == "PASSING" ? "green" : "red"}
                sx={{
                  overflow: "visible",
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
    </ShadedCard>
  );
};

export default GameRating;
