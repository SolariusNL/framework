import { Code, Text, Title } from "@mantine/core";
import { FC } from "react";
import LoadingIndicator from "../loading-indicator";

const SettingUpDatabaseStep: FC = () => {
  return (
    <>
      <Title order={2} mb="sm">
        Configuring database
      </Title>
      <Text size="sm" color="dimmed">
        We are adding your database configuration to the <Code>.env</Code> file.
      </Text>
      <div className="pt-8 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    </>
  );
};

export default SettingUpDatabaseStep;
