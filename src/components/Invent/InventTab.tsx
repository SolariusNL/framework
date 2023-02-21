import { Group, Tabs, Text, Title } from "@mantine/core";
import useMediaQuery from "../../util/media-query";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";

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
  return (
    <Tabs.Panel
      value={tabValue}
      pl={!mobile ? "lg" : undefined}
      pt={mobile ? "lg" : undefined}
    >
      <ShadedCard>
        <Title order={3} mb={6}>
          {tabTitle}
        </Title>
        {tabSubtitle && (
          <Text color="dimmed" mb={16}>
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
      </ShadedCard>
    </Tabs.Panel>
  );
};

export default InventTab;
