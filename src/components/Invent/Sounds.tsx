import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface SoundsProps {
  user: User;
}

const Sounds = ({ user }: SoundsProps) => {
  return (
    <InventTab
      tabValue="sounds"
      tabTitle="Sounds"
      unavailable
      tabSubtitle="Sell sounds that other users can purchase for use in their games."
    ></InventTab>
  );
};

export default Sounds;
