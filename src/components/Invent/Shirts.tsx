import InventTab from "@/components/Invent/InventTab";
import { User } from "@/util/prisma-types";

interface ShirtsProps {
  user: User;
}

const Shirts = ({ user }: ShirtsProps) => {
  return (
    <InventTab
      tabValue="shirts"
      tabTitle="Shirts"
      unavailable
      tabSubtitle="Sell shirts that the community can use on their avatars."
    ></InventTab>
  );
};

export default Shirts;
