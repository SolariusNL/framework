import { Text, TypographyStylesProvider } from "@mantine/core";
import { GameUpdateLog } from "@prisma/client";
import ShadedCard from "./ShadedCard";

const UpdateCard: React.FC<{
  update: GameUpdateLog;
  light?: boolean;
}> = ({ update, light }) => {
  return (
    <ShadedCard sx={(theme) => ({
      backgroundColor: theme.colorScheme === "dark" && light ? theme.colors.dark[8] : undefined,
    })}>
      <div className="flex items-center gap-2 mb-4">
        <Text size="lg">{update.title}</Text>
        <Text size="sm" color="dimmed">
          {update.tag}
        </Text>
      </div>
      <TypographyStylesProvider mb="md">
        <div dangerouslySetInnerHTML={{ __html: update.content }} />
      </TypographyStylesProvider>
      <div className="flex justify-end">
        <Text size="sm" color="dimmed">
          {new Date(update.createdAt).toLocaleDateString()} -{" "}
          {update.type === "MAJOR"
            ? "Major"
            : update.type === "MINOR"
            ? "Minor"
            : "Patch"}
        </Text>
      </div>
    </ShadedCard>
  );
};

export default UpdateCard;
