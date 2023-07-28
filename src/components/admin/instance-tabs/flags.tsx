import PrefTable from "@/components/admin/instance/pref-table";
import { PrefCategory, fetchPrefs } from "@/components/admin/pages/instance";
import { Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { updateEnv } from "./email";

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
