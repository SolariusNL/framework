import ShadedCard from "@/components/shaded-card";
import ViewGameTab from "@/components/view-game/view-game";
import { Game } from "@/util/prisma-types";
import { Card, Text, TypographyStylesProvider } from "@mantine/core";
import sanitize from "sanitize-html";

interface InfoTabProps {
  game: Game;
}

const InfoTab = ({ game }: InfoTabProps) => {
  return (
    <ViewGameTab
      value="info"
      title="About"
      description="See information about this game."
    >
      <TypographyStylesProvider className="text-sm">
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(game.description, {
              transformTags: {
                a: (tagName, attribs) => {
                  attribs.href = `http://${
                    process.env.NODE_ENV === "development"
                      ? "localhost:3000"
                      : "framework.solarius.me"
                  }/link?url=${attribs.href}`;
                  return { tagName, attribs };
                },
              },
            }),
          }}
        />
      </TypographyStylesProvider>

      {game.copyrightMetadata.length > 0 && (
        <>
          <ShadedCard withBorder>
            {game.copyrightMetadata.map((x, i) => (
              <Card.Section key={i} withBorder p={12}>
                <Text weight={500} color="dimmed" size="sm">
                  {x.title}
                </Text>
                <Text>{x.description}</Text>
              </Card.Section>
            ))}
          </ShadedCard>
        </>
      )}
    </ViewGameTab>
  );
};

export default InfoTab;
