import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import prisma from "@/util/prisma";
import { Game, User, gameSelect } from "@/util/prisma-types";
import {
  Anchor,
  Breadcrumbs,
  Button,
  Divider,
  Radio,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { marked } from "marked";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import React from "react";
import { HiCheckCircle } from "react-icons/hi";

type LegalityQuestionnaireProps = {
  user: User;
  game: Game;
};
type AnswerId =
  | "explicit-yes"
  | "explicit-no"
  | "hate-yes"
  | "hate-no"
  | "gambling-yes"
  | "gambling-no"
  | "loot-yes"
  | "loot-no"
  | "copyright-yes"
  | "copyright-no"
  | "user-content-yes"
  | "user-content-no"
  | "real-money-yes"
  | "real-money-no"
  | "personal-info-yes"
  | "personal-info-no";
type Question = {
  id: number;
  question: string;
  description: string;
  answers: Answer[];
};
type Answer = {
  answer: string;
  id: AnswerId;
};
type Trigger = {
  message: string;
};
type Triggers = Partial<Record<AnswerId, Trigger>>;

const questions: Question[] = [
  {
    id: 1,
    question: "Does your game include any explicit or adult content?",
    description: "This includes nudity, sexual content, or graphic violence.",
    answers: [
      {
        id: "explicit-yes",
        answer: "Yes",
      },
      {
        id: "explicit-no",
        answer: "No",
      },
    ],
  },
  {
    id: 2,
    question:
      "Does your game feature any hate speech, discrimination, or offensive imagery?",
    description:
      "This includes any content that is offensive to a specific group of people. This includes insignia, symbols, or gestures that are associated with hate groups.",
    answers: [
      {
        id: "hate-yes",
        answer: "Yes",
      },
      {
        id: "hate-no",
        answer: "No",
      },
    ],
  },
  {
    id: 3,
    question: "Does your game feature any gambling?",
    description:
      "This includes any game of chance that involves Tickets or a custom in-game currency.",
    answers: [
      {
        id: "gambling-yes",
        answer: "Yes",
      },
      {
        id: "gambling-no",
        answer: "No",
      },
    ],
  },
  {
    id: 4,
    question: "Does your game feature any loot boxes?",
    description:
      "Loot boxes are defined as a randomised reward system that is purchased with Tickets or a custom in-game currency.",
    answers: [
      {
        id: "loot-yes",
        answer: "Yes",
      },
      {
        id: "loot-no",
        answer: "No",
      },
    ],
  },
  {
    id: 5,
    question:
      "Does your game contain any copyrighted material, including music, art, or other content?",
    description:
      "This includes using copyrighted content without proper authorization or licenses.",
    answers: [
      {
        id: "copyright-yes",
        answer: "Yes",
      },
      {
        id: "copyright-no",
        answer: "No",
      },
    ],
  },
  {
    id: 6,
    question: "Does your game involve sharing user-generated content?",
    description:
      "User-generated content may include text, images, videos, or other media created by players. This content can raise legal issues if it includes copyrighted material or harmful content.",
    answers: [
      {
        id: "user-content-yes",
        answer: "Yes",
      },
      {
        id: "user-content-no",
        answer: "No",
      },
    ],
  },
  {
    id: 7,
    question: "Does your game involve any real-money transactions?",
    description:
      "This includes selling in-game items, currency, or other content for real money.",
    answers: [
      {
        id: "real-money-yes",
        answer: "Yes",
      },
      {
        id: "real-money-no",
        answer: "No",
      },
    ],
  },
  {
    id: 8,
    question: "Does your game collect personal information from users?",
    description:
      "Personal information includes data like names, email addresses, and location. This can have legal implications, especially when involving minors.",
    answers: [
      {
        id: "personal-info-yes",
        answer: "Yes",
      },
      {
        id: "personal-info-no",
        answer: "No",
      },
    ],
  },
];
const triggers: Triggers = {
  "explicit-yes": {
    message:
      "Under the German Youth Protection Act (JuSchG), games that contain explicit or adult content must be rated by the USK.",
  },
  "hate-yes": {
    message: `Hate speech, discrimination, and offensive imagery can face legal consequences in many countries:
- Germany: § 130 StGB - Incitement to hatred
- France: Loi n° 90-615 du 13 juillet 1990 tendant à réprimer tout acte raciste, antisémite ou xénophobe
- United Kingdom: Public Order Act 1986
- United States: Civil Rights Act of 1964

It can also violate the Framework Terms of Service.`,
  },
  "gambling-yes": {
    message: `Gambling is regulated in many countries, and can face legal consequences if not properly licensed:
- Germany: Glücksspielstaatsvertrag (GlüStV)
- Denmark: Spilleloven (Act on Gambling)
- United Kingdom: Gambling Act 2005

Gambling can also violate the Framework Terms of Service. If your game features gambling, it must not be performed with Tickets or off-platform currencies, including real money.`,
  },
  "loot-yes": {
    message: `Loot boxes are regulated in various countries, and can face legal consequences if not properly implemented:

- South Korea: South Korea requires disclosure of loot box odds, and has fined game developers for not disclosing odds.
- Belgium: Belgian Gaming Commission has ruled that loot boxes are a form of gambling, and are therefore illegal.`,
  },
  "user-content-yes": {
    message:
      "User-generated content can face legal consequences if it contains harmful content.",
  },
  "real-money-yes": {
    message:
      "Real-money transactions are prohibited by the Framework Terms of Service.",
  },
  "personal-info-yes": {
    message: `Collecting personal information from users can face legal consequences, especially when involving minors. This includes data like names, email addresses, and location. You may be subjected to litigation under:
- Germany: Bundesdatenschutzgesetz (BDSG)
- United States: Children's Online Privacy Protection Act (COPPA)
- United Kingdom: Data Protection Act 2018
- France: Loi n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés
- Denmark: Persondataloven (Personal Data Act)
- Australia: Privacy Act 1988`,
  },
  "copyright-yes": {
    message: `Using content without proper authorization or licenses can face legal consequences. This includes:
- Music
- Art
- Other content`,
  },
};

const TransferGameToTeam: React.FC<LegalityQuestionnaireProps> = ({
  user,
  game,
}) => {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [completed, setCompleted] = React.useState(false);

  return (
    <Framework activeTab="invent" user={user} noPadding>
      <div className="w-full flex justify-center mt-12">
        <div className="max-w-xl w-full px-4">
          <Breadcrumbs className="mb-4">
            <Link href="/invent/games">
              <Anchor>Invent</Anchor>
            </Link>
            <Link href={`/game/${game.id}`}>
              <Anchor>{game.name}</Anchor>
            </Link>
            <Link href={`/game/${game.id}/legality`}>
              <Anchor>Legality questionnaire</Anchor>
            </Link>
          </Breadcrumbs>
          <Title order={3} mb="sm">
            Game legality questionnaire
          </Title>
          <Text size="sm" color="dimmed">
            This is a compliance questionnaire to determine steps needed to make
            your game legal in countries around the world. Please answer the
            following questions to the best of your ability.
          </Text>
          <Divider my={32} />
          {completed ? (
            <div className="flex flex-col gap-4">
              {Object.values(answers).map((answer) => {
                const trigger = triggers[answer as keyof typeof triggers];
                if (!trigger) return null;
                return (
                  <div key={answer}>
                    <div className="dark:bg-red-800/10 bg-red-500/90 rounded-md p-2">
                      <TypographyStylesProvider
                        className="dark:text-red-200 text-red-100 text-sm"
                        sx={{
                          "*:last-child": {
                            marginBottom: "0 !important",
                          },
                          "ul, ol": {
                            paddingLeft: 32,
                          },
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked(trigger.message),
                          }}
                        />
                      </TypographyStylesProvider>
                    </div>
                  </div>
                );
              })}
              {Object.values(answers).filter(
                (answer) => triggers[answer as keyof typeof triggers]
              ).length === 0 && (
                <div className="dark:bg-green-800/10 bg-green-400/80 rounded-md p-2">
                  <Text
                    size="sm"
                    className="dark:text-green-200 text-green-900"
                  >
                    Your game seems to be compliant with most laws and
                    regulations. However, if you are still unsure, please
                    consult a legal professional.
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {questions.map((question) => (
                <div key={question.id} className="mb-8">
                  <Title order={4} mb="xs">
                    {question.question}
                  </Title>
                  <Text size="sm" color="dimmed" mb="md">
                    {question.description}
                  </Text>
                  <div className="flex flex-col gap-3">
                    {question.answers.map((answer) => (
                      <Radio
                        label={answer.answer}
                        value={answer.id}
                        checked={answers[question.id] === answer.id}
                        onChange={(event) =>
                          setAnswers({
                            ...answers,
                            [question.id]: event.currentTarget.value,
                          })
                        }
                        key={answer.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Divider my={32} />
          <div className="flex justify-end">
            <Button
              radius="xl"
              leftIcon={<HiCheckCircle />}
              variant="light"
              disabled={
                Object.keys(answers).length < questions.length || completed
              }
              onClick={() => {
                setCompleted(true);
                window.scrollTo(0, 0);
              }}
            >
              Receive legal advice
            </Button>
          </div>
        </div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx);
  if (auth.redirect) {
    return auth;
  }

  const { id } = ctx.query;
  const game: Game = JSON.parse(
    JSON.stringify(
      await prisma.game.findFirst({
        where: { id: Number(id) },
        select: gameSelect,
      })
    )
  );

  if (!game) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (game.author.id != auth.props.user?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      game: game,
      user: auth?.props?.user,
    },
  };
}

export default TransferGameToTeam;
