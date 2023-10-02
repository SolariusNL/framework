import ViewGameTab from "@/components/view-game/view-game";
import { Game } from "@/util/prisma-types";
import { Text, TypographyStylesProvider } from "@mantine/core";
import { TbCopyright } from "react-icons/tb";
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
        <div className="flex flex-col gap-4 mt-8">
          {game.copyrightMetadata.map((x, i) => (
            <div className="flex flex-col gap-1" key={i}>
              <div className="flex items-center gap-1">
                <TbCopyright className="text-dimmed mt-0" />
                <Text weight={600} color="dimmed" size="sm">
                  {x.title}
                </Text>
              </div>
              <Text>{x.description}</Text>
            </div>
          ))}
        </div>
      )}
    </ViewGameTab>
  );
};

export default InfoTab;
