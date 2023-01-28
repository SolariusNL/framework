import { Tabs } from "@mantine/core";

interface EditGameTabProps {
  value: string;
  children: React.ReactNode;
}

const EditGameTab = ({ value, children }: EditGameTabProps) => {
  return <>{children}</>;
};

export default EditGameTab;
