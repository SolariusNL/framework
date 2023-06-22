import {
  Badge,
  Card,
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
import DataGrid from "../DataGrid";
import ShadedCard from "../ShadedCard";
import ViewGameTab from "./ViewGameTab";

interface InfoTabProps {
  game: Game;
}

const InfoTab = ({ game }: InfoTabProps) => {
  return (
    <ViewGameTab value="info" title="Information">
      <TypographyStylesProvider mb={26}>
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

      <DataGrid
        items={[
          {
            icon: <HiViewList />,
            value: getGenreText(game.genre),
            tooltip: "Genre",
          },
          {
            icon: <HiUsers />,
            value: game.maxPlayersPerSession,
            tooltip: "Max players",
          },
          {
            icon: <HiServer />,
            value: game.playing,
            tooltip: "Playing",
          },
          {
            icon: <HiViewGrid />,
            value: game.visits,
            tooltip: "Visits",
          },
          {
            icon: <HiShoppingBag />,
            value: game.paywall ? "Paid access" : "Free access",
            tooltip: "Paywall",
          },
          {
            icon: <HiCode />,
            value: (
              <Badge>
                {game.updateLogs[0] ? game.updateLogs[0].tag : "N/A"}
              </Badge>
            ),
            tooltip: "Latest version",
          },
        ]}
      />

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
