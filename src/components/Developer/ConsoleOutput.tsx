import { Text, useMantineTheme } from "@mantine/core";
import { openModal } from "@mantine/modals";

type ConsoleOutputProps = {
  stdout: string[];
};

const ConsoleOutput: React.FC<ConsoleOutputProps> = (props) => {
  const theme = useMantineTheme();

  return (
    <div
      className="bg-black p-4 rounded-md"
      style={{
        height: 300,
        flexDirection: "column-reverse",
        overflowX: "hidden",
        overflowY: "auto",
        display: "flex",
      }}
    >
      <div className="flex gap-2 flex-col-reverse">
        {props.stdout.map((s, i) => (
          <div
            className="cursor-pointer hover:bg-zinc-900/75 text-sm p-2 rounded-md text-white"
            style={{
              fontFamily: "Fira Code VF, monospace",
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
        {props.stdout.length === 0 && (
          <Text color="dimmed">No console output available.</Text>
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
