import {
  Avatar,
  Button,
  Divider,
  Group,
  Pagination,
  Stack,
  Textarea,
} from "@mantine/core";
import { usePagination } from "@mantine/hooks";
import { useState } from "react";
import { HiChat } from "react-icons/hi";
import { getCookie } from "../util/cookies";
import getMediaUrl from "../util/getMedia";
import { Game, NonUser, User } from "../util/prisma-types";
import Comment from "./Comment";
import ModernEmptyState from "./ModernEmptyState";

interface GameCommentsProps {
  user: User;
  game: Game;
}

interface Comment {
  user: NonUser;
  text: string;
  createdAt: Date;
  id: string;
}

const GameComments = ({ user, game }: GameCommentsProps) => {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>(game.comments);
  const pagination = usePagination({
    total: Math.ceil(comments.length / 8),
    initialPage: 1,
  });

  const submitComment = async () => {
    setLoading(true);
    setError(null);

    await fetch(`/api/games/${game.id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        body: commentText,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setError(res.message || "Something went wrong");
        } else {
          setCommentText("");
          setComments([...comments, res.comment]);
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Group
        sx={{
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flexGrow: 0,
          }}
        >
          <Avatar
            src={
              getMediaUrl(user.avatarUri) ||
              `https://avatars.dicebear.com/api/identicon/${user.id}.png`
            }
            alt={user.username}
            radius="xl"
            size={32}
          />
        </div>

        <Stack
          spacing={10}
          sx={{
            flexGrow: 1,
          }}
        >
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            sx={{
              resize: "none",
            }}
            maxLength={500}
          />
          <Button
            leftIcon={<HiChat />}
            disabled={commentText.length == 0 || commentText.length > 500}
            onClick={submitComment}
            loading={loading}
          >
            Send
          </Button>
        </Stack>
      </Group>

      <Divider mt={24} mb={24} />

      {comments.length == 0 ? (
        <ModernEmptyState
          title="No comments"
          body="No one has commented on this game yet."
        />
      ) : (
        <>
          <Pagination
            page={pagination.active}
            onChange={pagination.setPage}
            total={Math.ceil(comments.length / 8)}
            mb={24}
            size="sm"
            radius="xl"
            withEdges
          />
          <Stack spacing={10}>
            {comments
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice((pagination.active - 1) * 8, pagination.active * 8)
              .map((comment) => (
                <Comment
                  user={comment.user}
                  body={comment.text}
                  key={Math.floor(Math.random() * 1000000)}
                  postedAt={comment.createdAt}
                  id={comment.id}
                  destroy={() => {
                    setComments(comments.filter((c) => c.id !== comment.id));
                  }}
                  gameId={game.id}
                />
              ))}
          </Stack>
        </>
      )}
    </>
  );
};

export default GameComments;
