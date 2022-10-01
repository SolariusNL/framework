import { Text, Title } from "@mantine/core";
import { User } from "../../util/prisma-types";
import ConnectionsWidget from "../Widgets/Connections";
import InventTab from "./InventTab";

interface ConnectionsProps {
  user: User;
}

const Connections = ({ user }: ConnectionsProps) => {
  return (
    <>
      <InventTab tabValue="connections" tabTitle="Connections">
        <Text mb={16}>
          Connections are self-hosted servers that can be used as an alternative
          to dedicated servers. They allow for more flexibility, customization,
          and control, but requires a bit more technical knowledge to set up and
          maintain. If you&apos;re not sure what you&apos;re doing, it&apos;s
          recommended to use a dedicated server instead.
        </Text>

        <Title order={4} mb={6}>
          Your Connections
        </Title>
        <ConnectionsWidget />
      </InventTab>
    </>
  );
};

export default Connections;
