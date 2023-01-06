import { Tabs, Title } from "@mantine/core";

const DeveloperActivity: React.FC = () => {
  return (
    <Tabs.Panel value="activity">
      <Title order={3} mb="md">
        Activity Log
      </Title>
    </Tabs.Panel>
  );
};

export default DeveloperActivity;
