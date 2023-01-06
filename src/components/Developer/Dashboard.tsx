import { Tabs, Title } from "@mantine/core";

const DeveloperDashboard: React.FC = () => {
  return (
    <Tabs.Panel value="dashboard">
      <Title order={3} mb="md">
        Dashboard
      </Title>
    </Tabs.Panel>
  );
};

export default DeveloperDashboard;
