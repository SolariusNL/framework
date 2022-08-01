import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface AdvertisementsProps {
  user: User;
}

const Advertisements = ({ user }: AdvertisementsProps) => {
  return (
    <InventTab tabValue="advertisements" tabTitle="Advertisements" unavailable>
    
    </InventTab>
  );
};

export default Advertisements;