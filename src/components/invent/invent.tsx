import ModernEmptyState from "@/components/modern-empty-state";
import { Anchor, Breadcrumbs, Group, Text, Title } from "@mantine/core";
import Link from "next/link";
import { HiOutlineTag } from "react-icons/hi";

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
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <HiOutlineTag className="text-dimmed" />
        <Breadcrumbs>
          <Link href="/invent/games">
            <Anchor color="dimmed">Invent</Anchor>
          </Link>
          <Text color="dimmed">{tabTitle}</Text>
        </Breadcrumbs>
      </div>
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
