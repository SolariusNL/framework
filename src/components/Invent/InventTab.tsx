import { Badge, CloseButton, Group, Tabs, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Image from "next/image";
import Link from "next/link";
import StudioPromptBackground from "../../assets/subtlebackground.png";
import useMediaQuery from "../../util/media-query";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";

interface InventTabProps {
  tabValue: string;
  tabTitle: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  unavailable?: boolean;
  tabSubtitle?: string;
}

const InventTab = ({
  tabValue,
  tabTitle,
  actions,
  children,
  unavailable,
  tabSubtitle,
}: InventTabProps) => {
  const mobile = useMediaQuery("768");
  const [seenStudioPrompt, setSeen] = useLocalStorage({
    key: "studio-prompt-seen",
    defaultValue: false,
  });

  return (
    <Tabs.Panel
      value={tabValue}
      pl={!mobile ? "lg" : undefined}
      pt={mobile ? "lg" : undefined}
    >
      {!seenStudioPrompt && (
        <div className="relative mb-6 rounded-md h-[11rem] md:block hidden">
          <Image
            src={StudioPromptBackground.src}
            alt="Subtle background"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="absolute inset-0 rounded-md"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md" />
          <div className="absolute inset-0 p-6 flex">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <Title order={2}>Framework Studio</Title>
                <Badge
                  variant="gradient"
                  gradient={{
                    from: "pink",
                    to: "grape",
                  }}
                >
                  Alpha
                </Badge>
              </div>
              <Text color="dimmed" mt="sm">
                Framework Studio is our new tool for building experiences on
                Framework. Right now, it is in alpha and requires an activation
                key to use.
              </Text>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col items-end gap-3">
              <CloseButton onClick={() => setSeen(true)} />
              <Link href="/studio/activate" passHref>
                <a
                  style={{
                    marginTop: "auto",
                  }}
                  onClick={() => setSeen(true)}
                  className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-0 text-pink-200/95 transition-all font-semibold h-10 px-4 rounded-lg w-full text-sm flex items-center justify-center sm:w-auto dark:bg-pink-800 dark:highlight-white/20 dark:hover:bg-pink-700 no-underline"
                >
                  Activate now
                </a>
              </Link>
            </div>
          </div>
        </div>
      )}
      <ShadedCard>
        <Title order={3} mb={6}>
          {tabTitle}
        </Title>
        {tabSubtitle && (
          <Text color="dimmed" mb={16}>
            {tabSubtitle}
          </Text>
        )}

        {actions && <Group mb={20}>{actions}</Group>}

        {children}
        {unavailable && (
          <ModernEmptyState
            title="Feature unavailable"
            body="This feature is not yet available."
          />
        )}
      </ShadedCard>
    </Tabs.Panel>
  );
};

export default InventTab;
