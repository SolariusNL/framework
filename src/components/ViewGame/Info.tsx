import {
  Badge,
  Grid,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { HiServer, HiUsers, HiViewGrid, HiViewList } from "react-icons/hi";
import sanitize from "sanitize-html";
import { Game } from "../../util/prisma-types";
import { getGenreText } from "../../util/universe/genre";
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

      <Grid>
        {[
          {
            icon: <HiViewList />,
            item: getGenreText(game.genre),
            label: "Genre",
          },
          {
            icon: <HiUsers />,
            item: game.maxPlayersPerSession,
            label: "Max Players",
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
        ].map((x, i) => (
          <Grid.Col md={6} sm={6} xs={4} span={6} key={i}>
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
          </Grid.Col>
        ))}
      </Grid>
    </ViewGameTab>
  );
};

export default InfoTab;
