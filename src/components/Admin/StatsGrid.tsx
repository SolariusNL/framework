import { Group, Paper, SimpleGrid, Skeleton, Text } from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons";
import ShadedCard from "../ShadedCard";

interface StatsGridProps {
  children: React.ReactNode;
}

interface StatGridItemProps {
  title: string;
  value: string | number;
  hasDiff?: boolean;
  diff?: number;
  icon: React.ReactNode;
  diffHint?: string;
}

const StatsGrid = ({ children }: StatsGridProps) => {
  return (
    <div>
      <SimpleGrid
        cols={3}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {children}
      </SimpleGrid>
    </div>
  );
};

StatsGrid.Item = ({
  title,
  value,
  hasDiff,
  diff,
  icon,
  diffHint = "Compared to previous month",
}: StatGridItemProps) => {
  return (
    <ShadedCard withBorder p="md" radius="md" key={title}>
      <Group position="apart">
        <Text
          size="xs"
          color="dimmed"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
        {icon}
      </Group>

      <Group align="flex-end" spacing="xs" mt={25}>
        <Text
          sx={{
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value || <Skeleton height={32} width={100} />}
        </Text>
        {hasDiff && diff && (
          <Text
            color={diff > 0 ? "teal" : "red"}
            size="sm"
            weight={500}
            sx={{
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>{(diff > 0 ? "+" : "") + Math.round(diff * 100) / 100}%</span>
            {diff > 0 ? (
              <IconArrowUpRight size={16} stroke={1.5} />
            ) : (
              <IconArrowDownRight size={16} stroke={1.5} />
            )}
          </Text>
        )}
      </Group>

      {hasDiff && (
        <Text size="xs" color="dimmed" mt={7}>
          {diffHint}
        </Text>
      )}
    </ShadedCard>
  );
};

export default StatsGrid;
