import InventTab from "@/components/invent/invent";
import { User } from "@/util/prisma-types";

interface DeveloperProfileProps {
  user: User;
}

const DeveloperProfile = ({ user }: DeveloperProfileProps) => {
  return (
    <InventTab
      tabValue="developer"
      tabTitle="Developer Profile"
      unavailable
      tabSubtitle="Looking for work? Showcase your skills and experience on your developer profile."
    ></InventTab>
  );
};

export default DeveloperProfile;
