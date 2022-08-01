import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface PluginsProps {
  user: User;
}

const Plugins = ({ user }: PluginsProps) => {
  return (
    <InventTab tabValue="plugins" tabTitle="Plugins" unavailable>
    
    </InventTab>
  );
};

export default Plugins;