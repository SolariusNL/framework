import InventTab from "@/components/invent/invent";
import { User } from "@/util/prisma-types";
import { Loader, Text } from "@mantine/core";

interface ConnectionsProps {
  user: User;
}

const Connections = ({ user }: ConnectionsProps) => {
  return (
    <>
      <InventTab
        tabValue="connections"
        tabTitle="Connections"
        tabSubtitle="Redirecting to your connections..."
      >
        <div className="flex flex-col items-center justify-center w-full h-full mt-12">
          <Text size="xl" weight={500}>
            Redirecting to your connections...
          </Text>
          <Loader mt="md" size="lg" />
        </div>
      </InventTab>
    </>
  );
};

export default Connections;
