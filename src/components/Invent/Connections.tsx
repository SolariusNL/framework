import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface ConnectionsProps {
  user: User;
}

const Connections = ({ user }: ConnectionsProps) => {
  return (
    <InventTab tabValue="connections" tabTitle="Connections" unavailable>
    
    </InventTab>
  );
};

export default Connections;