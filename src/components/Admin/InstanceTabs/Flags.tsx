import PrefTable from "@/components/Admin/Instance/PrefTable";
import { PrefCategory, fetchPrefs } from "@/components/Admin/Pages/Instance";
import { Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { updateEnv } from "./Email";

const FlagsTab: React.FC = () => {
  const [flagPrefs, setFlagPrefs] = useState(new Map<string, string>());

  useEffect(() => {
    fetchPrefs(PrefCategory.Flags, setFlagPrefs);
  }, []);

  return (
    <Tabs.Panel value="flags">
      <PrefTable
        data={flagPrefs}
        editable={true}
        onEditSubmit={async (k, v) => await updateEnv(k, v)}
      />
    </Tabs.Panel>
  );
};

export default FlagsTab;
