import forestSample from "@/assets/landing-carousel/forest-sample.png";
import clsx from "@/util/clsx";
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

type ForestSampleProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
};

const ForestSample: FC<ForestSampleProps> = ({
  title = "Stunning graphics",
  description = "We've built a powerful graphics engine to allow you to create stunning worlds. Framework comes with thousands of public domain assets, textures, and models to help you get started.",
}) => {
  const { classes, theme } = useStyles();

  return (
    <section className="my-24">
      <div
        className={clsx(classes.wrapper, "py-16 my-16 mx-auto rounded-3xl")}
        style={{
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[0],
        }}
      >
        <Container>
          <Title className={classes.title}>{title}</Title>
          <Container size={560} p={0}>
            <Text size="sm" className={classes.description}>
              {description}
            </Text>
          </Container>
        </Container>
        <div className="max-w-6xl px-4 mx-auto mt-16">
          <Image
            src={forestSample}
            alt="Forest sample - Made with Studio"
            layout="responsive"
            quality={100}
            priority
            className="rounded-md"
          />
        </div>
      </div>
    </section>
  );
};

export default ForestSample;
