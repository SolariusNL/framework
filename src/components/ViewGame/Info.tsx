import {
  Badge,
  Card,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import {
  HiCode,
  HiServer,
  HiShoppingBag,
  HiUsers,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import sanitize from "sanitize-html";
import { Game } from "../../util/prisma-types";
import { getGenreText } from "../../util/universe/genre";
import ShadedCard from "../ShadedCard";
import ViewGameTab from "./ViewGameTab";

interface InfoTabProps {
  game: Game;
}

const InfoTab = ({ game }: InfoTabProps) => {
  return (
    <ViewGameTab value="info" title="Information">
      <Title order={5} mb={10}>
        Description
      </Title>
      <TypographyStylesProvider mb={26}>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitize(game.description, {
              transformTags: {
                a: (tagName, attribs) => {
                  attribs.href = `http://${
                    process.env.NODE_ENV === "development"
                      ? "localhost:3000"
                      : "framework.soodam.rocks"
                  }/link?url=${attribs.href}`;
                  return { tagName, attribs };
                },
              },
            }),
          }}
        />
      </TypographyStylesProvider>

      <div className="grid md:grid-cols-3 grid-cols-2 gap-6 gap-y-12">
        {[
          {
            icon: <HiViewList />,
            item: getGenreText(game.genre),
            label: "Genre",
          },
          {
            icon: <HiUsers />,
            item: game.maxPlayersPerSession,
            label: "Max players",
          },
          {
            icon: <HiServer />,
            item: game.playing,
            label: "Playing",
          },
          {
            icon: <HiViewGrid />,
            item: game.visits,
            label: "Visits",
          },
          {
            icon: <HiShoppingBag />,
            item: game.paywall ? "Paid access" : "Free access",
            label: "Paywall",
          },
          {
            icon: <HiCode />,
            item: <Badge>{game.updateLogs[0].tag}</Badge>,
            label: "Latest version",
          },
        ].map((x, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Stack spacing={10} align="center">
              {x.icon}
              <Text weight={550} mb={6}>
                {x.label}
              </Text>
              {x.label == "Genre" ? (
                <Badge color="blue">{getGenreText(game.genre)}</Badge>
              ) : (
                <Text>{x.item}</Text>
              )}
            </Stack>
          </div>
        ))}
      </div>

      {game.copyrightMetadata.length > 0 && (
        <>
          <Title order={5} mb={6} mt={26}>
            Copyright
          </Title>
          <Text color="dimmed" size="sm" mb={10}>
            These notices are provided by the authors of the game. They have not
            been verified for accuracy. If you believe that any of the
            information below is incorrect or misleading, please contact us, and
            we will investigate the matter.
          </Text>
          <ShadedCard withBorder mt={26}>
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
