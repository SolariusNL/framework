import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface ShirtsProps {
  user: User;
}

const Shirts = ({ user }: ShirtsProps) => {
  return (
    <InventTab tabValue="shirts" tabTitle="Shirts" unavailable>
    
    </InventTab>
  );
};

export default Shirts;