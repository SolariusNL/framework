import InventTab from "@/components/Invent/InventTab";
import { User } from "@/util/prisma-types";

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
