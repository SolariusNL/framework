import EditGameTab from "@/components/edit-game/edit-game-tab";
import GameRating from "@/components/game-rating";
import useMediaQuery from "@/util/media-query";
import { Game } from "@/util/prisma-types";
import { Badge, Button, Select, Stack, Text, Title } from "@mantine/core";
import {
  RatingCategory,
  RatingCategoryScore,
  RatingType,
} from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

interface AgeRatingProps {
  game: Game;
}

export const scoreDescriptions = {
  [RatingCategory.SOCIAL]: {
    [RatingCategoryScore.PASSING]:
      "Does not include uncontrolled social interactions",
    [RatingCategoryScore.FAILING]:
      "Includes uncontrolled social interactions or has no safeguards",
  },
  [RatingCategory.DRUGS]: {
    [RatingCategoryScore.PASSING]:
      "Does not include references to drugs or alcohol",
    [RatingCategoryScore.FAILING]: "Includes references to drugs or alcohol",
  },
  [RatingCategory.NUDITY]: {
    [RatingCategoryScore.PASSING]: "Does not include nudity or sexual content",
    [RatingCategoryScore.FAILING]: "Includes nudity or sexual content",
  },
};

const AgeRating = ({ game }: AgeRatingProps) => {
  const mobile = useMediaQuery("768");
  const [gameState, setGameState] = useState(game);
  const [loading, setLoading] = useState(false);

  const updateProperty = (property: string, value: any) => {
    setGameState((prev) => ({ ...prev, [property]: value }));
  };

  useEffect(() => {
    if (!gameState.rating) {
      updateProperty("rating", {
        id: null,
        type: RatingType.RP,
        scores: [
          {
            id: null,
            category: RatingCategory.SOCIAL,
            score: RatingCategoryScore.PASSING,
            description:
              scoreDescriptions[RatingCategory.SOCIAL][
                RatingCategoryScore.PASSING
              ],
          },
          {
            id: null,
            category: RatingCategory.DRUGS,
            score: RatingCategoryScore.PASSING,
            description:
              scoreDescriptions[RatingCategory.DRUGS][
                RatingCategoryScore.PASSING
              ],
          },
          {
            id: null,
            category: RatingCategory.NUDITY,
            score: RatingCategoryScore.PASSING,
            description:
              scoreDescriptions[RatingCategory.NUDITY][
                RatingCategoryScore.PASSING
              ],
          },
        ],
      });
    }
  }, []);

  const saveData = async () => {
    setLoading(true);
    const data = {
      type: gameState.rating?.type,
      scores: gameState.rating?.scores.map((score) => ({
        category: score.category,
        score: score.score,
        description: score.description,
      })),
    };

    await fetch(`/api/games/${gameState.id}/rating/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <EditGameTab value="age">
      <div
        style={{
          display: mobile ? "block" : "flex",
          gap: mobile ? "0" : "32px",
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          <Text mb={8}>
            Age ratings are used to indicate the suitability of a game for
            different age groups. You can choose from a range of age ratings
            provided by the Entertainment Software Rating Board (ESRB).
          </Text>
          <Text mb={32}>
            Note that age ratings are not required and is only used to indicate
            the safety of a game for different age groups, and you will not
            receive any penalties if you do not provide an age rating.
          </Text>
          <Stack mb={32}>
            {[
              [
                "Passing",
                "Indicates that this category passes the rating criteria",
                "green",
              ],
              [
                "Failing",
                "Indicates that this category fails the rating criteria. Adjust your rating accordingly",
                "red",
              ],
            ].map((item) => (
              <div className="flex items-center gap-4" key={item[0]}>
                <Badge color={item[2]} className="flex-grow flex-shrink-0">
                  {item[0]}
                </Badge>
                <Text className="flex-grow">{item[1]}</Text>
              </div>
            ))}
          </Stack>
          <Stack>
            {[
              <>
                <Select
                  searchable
                  label="Overall rating"
                  description="The overall rating of your game."
                  data={Object.values(RatingType)}
                  value={gameState.rating?.type || undefined}
                  placeholder="Select rating"
                  onChange={(value) =>
                    updateProperty("rating", {
                      ...gameState.rating,
                      type: value,
                    })
                  }
                />
              </>,
              ...Object.values(RatingCategory).map((category) => (
                <Select
                  key={category}
                  searchable
                  label={category
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
                  description={
                    scoreDescriptions[category][
                      gameState.rating?.scores.find(
                        (s) => s.category == category
                      )?.score || RatingCategoryScore.PASSING
                    ]
                  }
                  data={Object.values(RatingCategoryScore)}
                  value={
                    gameState.rating?.scores.find((s) => s.category == category)
                      ?.score || undefined
                  }
                  placeholder="Select rating"
                  onChange={(value) =>
                    updateProperty("rating", {
                      ...gameState.rating,
                      scores: gameState.rating?.scores.map((s) =>
                        s.category == category
                          ? {
                              ...s,
                              score: value,
                              description:
                                scoreDescriptions[category][
                                  value as RatingCategoryScore
                                ],
                            }
                          : s
                      ),
                    })
                  }
                />
              )),
            ].map((Component, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                }}
              >
                {Component}
              </div>
            ))}
            <Button
              mt={16}
              variant="default"
              loading={loading}
              onClick={saveData}
            >
              Save age rating
            </Button>
          </Stack>
        </div>
        <div
          style={{
            flex: 1,
          }}
        >
          <Title order={4} mb={32}>
            Preview
          </Title>
          {gameState.rating && <GameRating game={gameState} />}
        </div>
      </div>
    </EditGameTab>
  );
};

export default AgeRating;
