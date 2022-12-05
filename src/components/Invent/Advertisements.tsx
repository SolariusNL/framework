import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface AdvertisementsProps {
  user: User;
}

const Advertisements = ({ user }: AdvertisementsProps) => {
  return (
    <InventTab
      tabValue="advertisements"
      tabTitle="Advertisements"
      unavailable
      tabSubtitle="Advertisements are a way to promote your games and bring in more players."
    ></InventTab>
  );
};

export default Advertisements;
