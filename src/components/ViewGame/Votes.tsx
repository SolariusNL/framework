import { ActionIcon, Progress, Tooltip } from "@mantine/core";
import { getCookie } from "cookies-next";
import { HiThumbDown, HiThumbUp } from "react-icons/hi";
import { useFrameworkUser } from "@/contexts/FrameworkUser";
import { Game, NonUser } from "@/util/prisma-types";

interface VotesProps {
  game: Game;
  setGame: (game: Game) => void;
}

const Votes = ({ game, setGame }: VotesProps) => {
  const user = useFrameworkUser();

  const totalFeedback = game.likedBy.length + game.dislikedBy.length;
  const positive = (game.likedBy.length / totalFeedback) * 100;
  const negative = (game.dislikedBy.length / totalFeedback) * 100;

  const like = async () => {
    setGame({
      ...game,
      likedBy: game.likedBy.find((u) => u.id == user?.id)
        ? game.likedBy.filter((u) => u.id != user?.id)
        : [...game.likedBy, user as NonUser],
    });

    await fetch(`/api/games/${game.id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setGame(game);
        }
      })
      .catch((err) => {
        setGame(game);
      });
  };

  const dislike = async () => {
    setGame({
      ...game,
      dislikedBy: game.dislikedBy.find((u) => u.id == user?.id)
        ? game.dislikedBy.filter((u) => u.id != user?.id)
        : [...game.dislikedBy, user as NonUser],
    });

    await fetch(`/api/games/${game.id}/dislike`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setGame(game);
        }
      })
      .catch((err) => {
        setGame(game);
      });
  };

  const liked = game.likedBy.find((u) => u.id == user?.id) != undefined;
  const disliked = game.dislikedBy.find((u) => u.id == user?.id) != undefined;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tooltip label="Like">
          <ActionIcon
            radius="xl"
            mr={6}
            variant={liked ? "light" : "subtle"}
            color="teal"
            size="lg"
            disabled={disliked}
            onClick={like}
          >
            <HiThumbUp size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip
          label={`${game.likedBy.length} likes, ${game.dislikedBy.length} dislikes`}
        >
          <Progress
            sections={[
              {
                value: positive,
                color: "green",
              },
              {
                value: negative,
                color: "red",
              },
            ]}
            mb="sm"
            size="lg"
            sx={{
              width: "100%",
              alignSelf: "end",
            }}
            className="transition-all"
          />
        </Tooltip>
        <Tooltip label="Dislike">
          <ActionIcon
            radius="xl"
            ml={6}
            variant={disliked ? "light" : "subtle"}
            color="red"
            disabled={liked}
            onClick={dislike}
            size="lg"
          >
            <HiThumbDown size={14} />
          </ActionIcon>
        </Tooltip>
      </div>
    </>
  );
};

export default Votes;
