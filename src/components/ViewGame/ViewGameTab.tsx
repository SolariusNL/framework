import { Tabs, Title } from "@mantine/core";

interface ViewGameTabProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

const ViewGameTab = ({ value, title, children }: ViewGameTabProps) => {
  return (
    <Tabs.Panel value={value} pt="md">
      <Title order={3} mb={16}>
        {title}
      </Title>

      {children}
    </Tabs.Panel>
  );
};

export default ViewGameTab;
