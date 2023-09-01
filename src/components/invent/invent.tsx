import ModernEmptyState from "@/components/modern-empty-state";
import useMediaQuery from "@/util/media-query";
import { Group, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

interface InventTabProps {
  tabValue: string;
  tabTitle: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  unavailable?: boolean;
  tabSubtitle?: string;
}

const InventTab = ({
  tabValue,
  tabTitle,
  actions,
  children,
  unavailable,
  tabSubtitle,
}: InventTabProps) => {
  const mobile = useMediaQuery("768");
  const [seenStudioPrompt, setSeen] = useLocalStorage({
    key: "studio-prompt-seen",
    defaultValue: false,
  });

  return (
    <>
      <Title order={3} mb={2}>
        {tabTitle}
      </Title>
      {tabSubtitle && (
        <Text color="dimmed" mb={16} size="sm">
          {tabSubtitle}
        </Text>
      )}

      {actions && <Group mb={20}>{actions}</Group>}

      {children}
      {unavailable && (
        <ModernEmptyState
          title="Feature unavailable"
          body="This feature is not yet available."
        />
      )}
    </>
  );
};

export default InventTab;
