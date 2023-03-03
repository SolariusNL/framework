import { Text, Tooltip, useMantineTheme } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { HiQuestionMarkCircle } from "react-icons/hi";
import ShadedCard from "../ShadedCard";

type ConsoleOutputProps = {
  stdout: string[];
};

const ConsoleOutput: React.FC<ConsoleOutputProps> = (props) => {
  const theme = useMantineTheme();

  return (
    <ShadedCard>
      <div className="flex items-center gap-2">
        <Text color="dimmed" weight={500}>
          Console output
        </Text>
        <Tooltip label="Console output is polled every 5 seconds to prevent DDoS attacks">
          <div>
            <HiQuestionMarkCircle
              color={theme.colors.gray[5]}
              className="items-center flex justify-center flex-shrink-0"
            />
          </div>
        </Tooltip>
      </div>
      <div
        className="mt-4 bg-black p-2 rounded-md"
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
                      <div className="bg-black rounded-md p-4">
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
    </ShadedCard>
  );
};

export default ConsoleOutput;
