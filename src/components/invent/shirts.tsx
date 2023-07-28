import InventTab from "@/components/invent/invent";
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
