import { Tabs, Text, Title } from "@mantine/core";

interface ViewGameTabProps {
  value: string;
  title: string;
  children: React.ReactNode;
  description?: string;
}

const ViewGameTab = ({
  value,
  title,
  children,
  description,
}: ViewGameTabProps) => {
  return (
    <Tabs.Panel value={value}>
      <div className="flex md:flex-row md:items-center mb-4 flex-col md:gap-3 gap-1">
        <Title order={3}>{title}</Title>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </div>

      {children}
    </Tabs.Panel>
  );
};

export default ViewGameTab;
