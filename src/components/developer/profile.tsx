import { Tabs, Title } from "@mantine/core";

const DeveloperProfile: React.FC = () => {
  return (
    <Tabs.Panel value="profile">
      <Title order={3} mb="md">
        Developer Profile
      </Title>
    </Tabs.Panel>
  );
};

export default DeveloperProfile;
