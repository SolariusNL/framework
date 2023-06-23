import { Text, TypographyStylesProvider } from "@mantine/core";
import { GameUpdateLog } from "@prisma/client";
import {
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineTag,
} from "react-icons/hi";
import clsx from "../util/clsx";
import { Fw } from "../util/fw";
import DataGrid from "./DataGrid";
import ShadedCard from "./ShadedCard";

const UpdateCard: React.FC<{
  update: GameUpdateLog;
  light?: boolean;
  sm?: boolean;
}> = ({ update, light, sm }) => {
  return (
    <>
      <ShadedCard
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark"
              ? light
                ? theme.colors.dark[8]
                : theme.colors.dark[9]
              : theme.colors.gray[1],
        })}
      >
        <div className="flex items-center gap-2 mb-4">
          <Text size="lg">{update.title}</Text>
          <Text size="sm" color="dimmed">
            {update.tag}
          </Text>
        </div>
        <TypographyStylesProvider className="text-sm">
          <div dangerouslySetInnerHTML={{ __html: update.content }} />
        </TypographyStylesProvider>
      </ShadedCard>
      <DataGrid
        items={[
          {
            tooltip: "Created on",
            value: new Date(update.createdAt).toLocaleDateString(),
            icon: <HiOutlineCalendar />,
          },
          {
            tooltip: "Created at",
            value: new Date(update.createdAt).toLocaleTimeString(),
            icon: <HiOutlineClock />,
          },
          {
            tooltip: "Update type",
            value: Fw.Strings.upper(update.type),
            icon: <HiOutlineTag />,
          },
        ]}
        className={clsx(sm && "!mt-3")}
      />
    </>
  );
};

export default UpdateCard;
