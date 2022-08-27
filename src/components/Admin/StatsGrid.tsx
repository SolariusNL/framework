import { Group, Paper, SimpleGrid, Text } from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons";

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
    <Paper withBorder p="md" radius="md" key={title}>
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
          {value}
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
            <span>{diff}%</span>
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
    </Paper>
  );
};

export default StatsGrid;
