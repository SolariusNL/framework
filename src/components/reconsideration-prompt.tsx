import ShadedCard from "@/components/shaded-card";
import { isRestricted } from "@/data/reconsiderWords";
import { Anchor, Badge, Code, Divider, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import Link from "next/link";

const sanitizeInappropriateContent = (
  content: string,
  onConfirm: () => void,
  onReconsider?: () => void
) => {
  const { hasMatch, matchedWords } = isRestricted(content);
  if (hasMatch) {
    openConfirmModal({
      title: "Reconsider content",
      children: (
        <>
          <Text size="sm" color="dimmed" mb="lg">
            Your content contains words that may violate our{" "}
            <Link href="/guidelines" passHref>
              <Anchor>Community Guidelines</Anchor>
            </Link>
            . If you change your mind, you can always change your content.
          </Text>
          <ShadedCard>
            {matchedWords.map((word, i) => (
              <>
                {i !== 0 && <Divider mt="md" mb="md" />}
                <div className="grid md:grid-cols-2 grid-cols-1 gap-4 gap-y-6">
                  <div className="flex flex-col gap-2">
                    <Text size="sm" color="dimmed" weight={700}>
                      Word
                    </Text>
                    <Text>{word.word}</Text>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Text size="sm" color="dimmed" weight={700}>
                      Matched
                    </Text>
                    <Text>{word.matched}</Text>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Text size="sm" color="dimmed" weight={700}>
                      Confidence
                    </Text>
                    <Code
                      className="font-mono text-pink-600 rounded-md"
                      sx={(theme) => ({
                        backgroundColor:
                          theme.colorScheme === "dark" ? "#000" : "#fff",
                      })}
                    >
                      {word.score}
                    </Code>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Text size="sm" color="dimmed" weight={700}>
                      Ranking
                    </Text>
                    <Badge
                      color={
                        word.score < 0.65
                          ? "red"
                          : word.score < 0.78
                          ? "orange"
                          : word.score < 0.85
                          ? "yellow"
                          : "green"
                      }
                      className="w-fit"
                    >
                      {word.score < 0.65
                        ? "Very low"
                        : word.score < 0.78
                        ? "Low"
                        : word.score < 0.85
                        ? "Medium"
                        : "High"}
                    </Badge>
                  </div>
                </div>
              </>
            ))}
          </ShadedCard>
        </>
      ),
      labels: {
        confirm: "Continue anyway",
        cancel: "Go back",
      },
      onConfirm,
      onCancel: onReconsider,
    });
  } else {
    onConfirm();
  }

  return hasMatch;
};

export default sanitizeInappropriateContent;
