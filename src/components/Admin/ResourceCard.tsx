import { createStyles, Paper, Text, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import ShadedCard from "../ShadedCard";

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    transition: "transform 150ms ease, box-shadow 100ms ease",
    padding: theme.spacing.xl,
    paddingLeft: theme.spacing.xl * 2,

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.02)",
    },

    "&::before": {
      content: "''",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 6,
      backgroundImage: theme.fn.linearGradient(
        0,
        theme.colors.pink[6],
        theme.colors.orange[6]
      ),
      borderTopLeftRadius: theme.radius.md,
      borderBottomLeftRadius: theme.radius.md,
    },
  },
}));

interface CardGradientProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ResourceCard = ({
  title,
  description,
  icon,
  link,
}: CardGradientProps) => {
  const { classes } = useStyles();
  return (
    <Link href={link}>
      <ShadedCard withBorder className={classes.card}>
        <div className="ml-4">
          <ThemeIcon
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ deg: 0, from: "pink", to: "orange" }}
          >
            {icon}
          </ThemeIcon>
          <Text size="xl" weight={500} mt="md">
            {title}
          </Text>
          <Text size="sm" mt="sm" color="dimmed">
            {description}
          </Text>
        </div>
      </ShadedCard>
    </Link>
  );
};

export default ResourceCard;
