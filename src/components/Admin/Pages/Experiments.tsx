import Markdown from "@/components/Markdown";
import SideBySide from "@/components/Settings/SideBySide";
import ShadedCard from "@/components/ShadedCard";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { Stack, TextInput, Title, TitleOrder } from "@mantine/core";
import { useState } from "react";
import { HiInbox } from "react-icons/hi";

const Experiments: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>("");
  const [titleText, setTitleText] = useState<string>("Hello, world!");

  return (
    <Stack spacing="lg">
      <SideBySide
        title="Markdown editor"
        description="Markdown editor to replace Quill html-based editor."
        right={
          <ShadedCard>
            <Markdown value={markdown} onChange={setMarkdown} />
          </ShadedCard>
        }
        noUpperBorder
      />
      <SideBySide
        title="New heading font"
        description="Mona Sans for the new heading font."
        noUpperBorder
        right={
          <ShadedCard>
            <Stack spacing="xl">
              {[1, 2, 3, 4, 5, 6].map((order) => (
                <Title order={order as TitleOrder} key={order}>
                  {titleText}
                </Title>
              ))}
            </Stack>
          </ShadedCard>
        }
        actions={
          <TextInput
            classNames={BLACK}
            onChange={(e) => setTitleText(e.currentTarget.value)}
            value={titleText}
            icon={<HiInbox />}
            placeholder="Enter text"
          />
        }
      />
    </Stack>
  );
};

export default Experiments;
