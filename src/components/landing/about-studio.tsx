import studioSample from "@/assets/landing-carousel/studio-ui.png";
import { rem } from "@/util/rem";
import { Container, Text, Title, createStyles } from "@mantine/core";
import Image from "next/image";
import { FC } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },

  title: {
    fontWeight: 900,
    marginBottom: theme.spacing.md,
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      textAlign: "left",
    },
  },
}));

type AboutStudioProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

const AboutStudio: FC<AboutStudioProps> = ({
  title = "World class development",
  description = "Feel the power of our advanced integrated development environment, Studio, and jumpstart your game development journey.",
}) => {
  const { classes } = useStyles();

  return (
    <section className="my-24">
      <Container className={classes.wrapper}>
        <Title className={classes.title}>{title}</Title>
        <Container size={560} p={0}>
          <Text size="sm" className={classes.description}>
            {description}
          </Text>
        </Container>
      </Container>
      <div className="max-w-6xl px-4 mx-auto mt-16">
        <Image
          src={studioSample}
          alt="Interface of Framework Studio"
          layout="responsive"
          quality={100}
          priority
          className="rounded-md"
        />
      </div>
    </section>
  );
};

export default AboutStudio;
