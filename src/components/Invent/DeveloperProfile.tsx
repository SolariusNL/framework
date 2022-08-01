import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface DeveloperProfileProps {
  user: User;
}

const DeveloperProfile = ({ user }: DeveloperProfileProps) => {
  return (
    <InventTab tabValue="developer" tabTitle="Developer Profile" unavailable>
    
    </InventTab>
  );
};

export default DeveloperProfile;