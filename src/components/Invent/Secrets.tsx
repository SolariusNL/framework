import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface SecretsProps {
  user: User;
}

const Secrets = ({ user }: SecretsProps) => {
  return (
    <InventTab tabValue="secrets" tabTitle="Secrets" unavailable>
    
    </InventTab>
  );
};

export default Secrets;