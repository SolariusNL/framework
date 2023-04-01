import { Stack } from "@mantine/core";
import { useState } from "react";
import Markdown from "../../Markdown";
import SideBySide from "../../Settings/SideBySide";
import ShadedCard from "../../ShadedCard";

const Experiments: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>("");

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
    </Stack>
  );
};

export default Experiments;
