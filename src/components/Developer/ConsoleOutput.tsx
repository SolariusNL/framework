import { ActionIcon, Text, useMantineTheme } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { HiSearch } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { incrementPage } from "../../reducers/stdout";
import { RootState } from "../../reducers/store";

type ConsoleOutputProps = React.ComponentPropsWithoutRef<"div">;

const ConsoleOutput: React.FC<ConsoleOutputProps> = (props) => {
  const theme = useMantineTheme();
  const stdout = useSelector((state: RootState) => state.stdout);
  const dispatch = useDispatch();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const max = target.scrollHeight - target.clientHeight;
    const scrolledToTop = target.scrollTop === -max;

    if (scrolledToTop) {
      dispatch(incrementPage());
    }
  };

  return (
    <div className="relative group" style={{ height: 300 }}>
      <div className="flex items-center z-10 p-4 gap-2 group-hover:opacity-100 opacity-0 absolute top-0 right-0 transition-all">
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
                        className="bg-black rounded-md p-4"
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
                    </>
                  ),
                });
              }}
              key={i}
              dangerouslySetInnerHTML={{ __html: s }}
            />
          ))}
          {stdout.lines.length === 0 && (
            <Text color="dimmed">No console output available.</Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsoleOutput;
