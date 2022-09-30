import { Group, Tabs, Title } from "@mantine/core";
import useMediaQuery from "../../util/useMediaQuery";
import EmptyState from "../EmptyState";
import ModernEmptyState from "../ModernEmptyState";

interface InventTabProps {
  tabValue: string;
  tabTitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  unavailable?: boolean;
}

const InventTab = ({
  tabValue,
  tabTitle,
  actions,
  children,
  unavailable,
}: InventTabProps) => {
  const mobile = useMediaQuery("768");
  return (
    <Tabs.Panel
      value={tabValue}
      pl={!mobile ? "lg" : undefined}
      pt={mobile ? "lg" : undefined}
    >
      <Title order={3} mb={10}>
        {tabTitle}
      </Title>

      {actions && <Group mb={20}>{actions}</Group>}

      {children}
      {unavailable && (
        <ModernEmptyState
          title="Feature unavailable"
          body="This feature is not yet available."
        />
      )}
    </Tabs.Panel>
  );
};

export default InventTab;
