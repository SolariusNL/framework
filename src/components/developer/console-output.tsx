import DataGrid from "@/components/data-grid";
import {
  CATEGORY_REGEX,
  DATE_REGEX,
  TIME_REGEX,
  incrementPage,
  resetFilter,
  setFilterParam,
} from "@/reducers/stdout";
import { RootState } from "@/reducers/store";
import {
  ActionIcon,
  Badge,
  Button,
  Code,
  Modal,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useState } from "react";
import {
  HiClock,
  HiFilter,
  HiOutlineClock,
  HiOutlineTag,
  HiSearch,
} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

type ConsoleOutputProps = React.ComponentPropsWithoutRef<"div">;
export type LogLevel = "info" | "debug" | "warn" | "error" | "recv" | "send";

const ConsoleOutput: React.FC<ConsoleOutputProps> = (props) => {
  const theme = useMantineTheme();
  const stdout = useSelector((state: RootState) => state.stdout);
  const dispatch = useDispatch();
  const [filterOpen, setFilterOpen] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const max = target.scrollHeight - target.clientHeight;
    const scrolledToTop = target.scrollTop === -max;

    if (scrolledToTop) {
      dispatch(incrementPage());
    }
  };

  const getTime = (line: string) => {
    const match = line.match(TIME_REGEX);

    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const milliseconds = parseInt(match[4]);
      const date = new Date();

      date.setUTCHours(hours);
      date.setUTCMinutes(minutes);
      date.setUTCSeconds(seconds);
      date.setUTCMilliseconds(milliseconds);

      const formattedTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return formattedTime;
    }
  };

  return (
    <>
      <Modal
        title="Filter console output"
        opened={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <Select
          data={
            [
              { value: "all", label: "All" },
              { value: "info", label: "Info" },
              { value: "debug", label: "Debug" },
              { value: "warn", label: "Warn" },
              { value: "error", label: "Error" },
              { value: "recv", label: "Receive" },
              { value: "send", label: "Send" },
            ] as { value: LogLevel | "all"; label: string }[]
          }
          value={stdout.filter.category}
          onChange={(value) =>
            dispatch(setFilterParam({ category: value as LogLevel }))
          }
          description="Filter console output by category."
          label="Category"
          placeholder="All"
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => {
              dispatch(resetFilter());
            }}
            variant="default"
          >
            Reset
          </Button>
        </div>
      </Modal>
      <div className="relative group" style={{ height: 300 }}>
        <div className="flex items-center z-10 p-4 gap-2 group-hover:opacity-100 opacity-0 absolute top-0 right-0 transition-all">
          <Badge
            color="dark"
            variant="outline"
            radius="md"
            classNames={{
              root: "!px-2 !py-0",
            }}
            style={{
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
          >
            {stdout.lines.length}
          </Badge>
          <ActionIcon
            size="lg"
            variant="outline"
            radius="xl"
            style={{
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
            }}
            onClick={() => setFilterOpen(true)}
          >
            <HiFilter />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="outline"
            radius="xl"
            onClick={() =>
              openModal({
                title: "Coming soon",
                children: (
                  <Text size="sm" color="dimmed">
                    This feature is coming soon.
                  </Text>
                ),
              })
            }
          >
            <HiSearch />
          </ActionIcon>
        </div>
        <div
          className="bg-black p-4 rounded-md relative"
          style={{
            height: 300,
            flexDirection: "column-reverse",
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
          }}
          onScroll={handleScroll}
          {...props}
        >
          <div className="flex gap-2 flex-col-reverse">
            {stdout.lines.map((s, i) => (
              <div
                className="cursor-pointer hover:bg-zinc-900/75 text-sm p-2 rounded-md text-white"
                style={{
                  fontFamily: "Fira Code VF, monospace",
                  wordBreak: "break-word",
                }}
                onClick={() => {
                  openModal({
                    title: "Console line details",
                    className: theme.colorScheme === "dark" ? "dark" : "",
                    children: (
                      <>
                        <div
                          className="bg-black rounded-md p-4 text-sm"
                          style={{
                            fontFamily: "Fira Code VF, monospace",
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: s,
                            }}
                          />
                        </div>
                        <DataGrid
                          items={[
                            {
                              tooltip: "Date",
                              value: DATE_REGEX.exec(s)?.[1] ?? "Unknown",
                              icon: <HiClock />,
                            },
                            {
                              tooltip: "Time",
                              value: getTime(s) ?? "Unknown",
                              icon: <HiOutlineClock />,
                            },
                            {
                              tooltip: "Category",
                              value: (
                                <Code>
                                  {CATEGORY_REGEX.exec(s)?.[1] ?? "info"}
                                </Code>
                              ),
                              icon: <HiOutlineTag />,
                            },
                          ]}
                        />
                      </>
                    ),
                  });
                }}
                key={i}
                dangerouslySetInnerHTML={{ __html: s }}
              />
            ))}
            {stdout.lines.length === 0 && (
              <Text color="dimmed">
                No console output available (with applied filters).
              </Text>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsoleOutput;
