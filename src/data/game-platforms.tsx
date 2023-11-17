import { GamePlatform } from "@prisma/client";
import {
  HiOutlineAcademicCap,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
} from "react-icons/hi";

export const gamePlatforms: Record<
  GamePlatform,
  { label: string; icon: React.ReactNode }
> = {
  [GamePlatform.PC]: {
    label: "Desktop",
    icon: <HiOutlineDesktopComputer />,
  },
  [GamePlatform.MOBILE]: {
    label: "Mobile",
    icon: <HiOutlineDeviceMobile />,
  },
  [GamePlatform.VR]: {
    label: "Virtual Reality",
    icon: <HiOutlineAcademicCap />,
  },
};
