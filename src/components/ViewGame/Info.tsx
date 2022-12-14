import {
  Badge,
  Card,
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
