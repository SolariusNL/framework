import { rem } from "@/util/rem";
import {
  Container,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
  createStyles,
} from "@mantine/core";
import { FC } from "react";
import {
  HiOutlineAdjustments,
  HiOutlineCash,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineUserCircle,
  HiStatusOnline,
} from "react-icons/hi";

export const featuresData = [
  {
    icon: HiOutlineUserCircle,
    title: "For you and your friends",
    description:
      "We cherish the community and strive to continuously improve the experience for everyone.",
  },
  {
    icon: HiOutlineCube,
    title: "Developer friendly",
    description:
      "We provide a huge set of tools to help new developers get started with game development on Framework.",
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: "Free and open source",
    description:
      "Framework is free and open source, and will always be. We believe that open source is the future of software.",
  },
  {
    icon: HiStatusOnline,
    title: "Always online",
    description:
      "Framework is federated - meaning that your experience is never interrupted by the failure of a single server.",
  },
  {
    icon: HiOutlineAdjustments,
    title: "Customizable",
    description:
      "Framework is highly customizable, and doesn't impose any harsh limits on your creativity.",
  },
  {
    icon: HiOutlineCash,
    title: "Monetizable",
    description:
      "Framework allows you to monetize your creations, and make quick money off of your passion.",
  },
];

type FeatureProps = {
  icon: React.FC<any>;
  title: React.ReactNode;
  description: React.ReactNode;
};

export function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div>
      <ThemeIcon variant="light" color="pink" size={40} radius={40}>
        <Icon size="24" />
      </ThemeIcon>
      <Title order={4} mt="sm" mb={7}>
        {title}
      </Title>
      <Text size="sm" color="dimmed" sx={{ lineHeight: 1.6 }}>
        {description}
      </Text>
    </div>
  );
}

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

type FeaturesGridProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  data?: FeatureProps[];
};

const Features: FC<FeaturesGridProps> = ({
  title = "What makes us different?",
  description = "Framework is built with the community in mind. Ordinary people, like you, can contribute to the project and make it better.",
  data = featuresData,
}) => {
  const { classes } = useStyles();
  const features = data.map((feature, index) => (
    <Feature {...feature} key={index} />
  ));

  return (
    <section className="my-24">
      <Container className={classes.wrapper}>
        <Title className={classes.title}>{title}</Title>
        <Container size={560} p={0}>
          <Text size="sm" className={classes.description}>
            {description}
          </Text>
        </Container>

        <SimpleGrid
          mt={60}
          cols={3}
          spacing={50}
          breakpoints={[
            { maxWidth: 980, cols: 2, spacing: "xl" },
            { maxWidth: 755, cols: 1, spacing: "xl" },
          ]}
        >
          {features}
        </SimpleGrid>
      </Container>
    </section>
  );
};

export default Features;
