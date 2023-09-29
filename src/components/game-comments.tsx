import ShadedCard from "@/components/shaded-card";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import { getCookie } from "@/util/cookies";
import fetchJson from "@/util/fetch";
import getMediaUrl from "@/util/get-media";
import { Game, NonUser, User } from "@/util/prisma-types";
import {
  Avatar,
  Button,
  Group,
  Pagination,
  Stack,
  Textarea,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { HiChat } from "react-icons/hi";
import Comment from "./comment";
import ModernEmptyState from "./modern-empty-state";
import sanitizeInappropriateContent from "./reconsideration-prompt";

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
  const [comments, setComments] = useState<Comment[]>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
          setComments([...comments!, res.comment]);
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getComments = async () => {
    await fetchJson<
      IResponseBase<{
        comments: Comment[];
        pages: number;
      }>
    >(`/api/games/comments/${game.id}/${page}`, {
      method: "GET",
      auth: true,
    }).then((res) => {
      if (res.success) {
        setComments(res.data?.comments!);
        setTotal(res.data?.pages!);
      }
    });
  };

  useEffect(() => {
    getComments();
  }, [page]);

  return (
    <>
      <Group
        sx={{
          alignItems: "flex-start",
        }}
        className="mb-4"
      >
        <div
          style={{
            flexGrow: 0,
          }}
        >
          <Avatar
            src={
              getMediaUrl(user.avatarUri) ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`
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
            classNames={BLACK}
          />
          <div className="flex justify-between items-center">
            <Pagination
              page={page}
              onChange={setPage}
              total={total || 1}
              radius="xl"
              withEdges
              size="sm"
              classNames={{
                item: BLACK.input,
              }}
            />
            <Button
              leftIcon={<HiChat />}
              disabled={commentText.length === 0 || commentText.length > 500}
              onClick={() => {
                sanitizeInappropriateContent(commentText, () =>
                  submitComment()
                );
              }}
              loading={loading}
            >
              Send
            </Button>
          </div>
        </Stack>
      </Group>

      {comments && comments.length == 0 ? (
        <ShadedCard>
          <ModernEmptyState
            title="No comments"
            body="No one has commented on this game yet."
          />
        </ShadedCard>
      ) : (
        <>
          <Stack spacing="sm">
            {comments &&
              comments
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
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
