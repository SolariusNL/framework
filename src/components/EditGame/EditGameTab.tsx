import { Tabs } from "@mantine/core";

interface EditGameTabProps {
  value: string;
  children: React.ReactNode;
}

const EditGameTab = ({ value, children }: EditGameTabProps) => {
  return (
    <Tabs.Panel value={value} mt={20}>
      {children}
    </Tabs.Panel>
  );
};

export default EditGameTab;
