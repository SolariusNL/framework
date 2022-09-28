import { Select } from "@mantine/core";

interface AscDescFilter {
  label: string;
  onChange: (value: "asc" | "desc") => void;
  value: "asc" | "desc";
  description?: string;
}

const AscDescFilter = ({
  label,
  onChange,
  value,
  description,
}: AscDescFilter) => {
  return (
    <Select
      label={label}
      onChange={onChange}
      value={value}
      description={description}
      placeholder="Sort by"
      data={[
        { value: "asc", label: "Ascending" },
        { value: "desc", label: "Descending" },
      ]}
    />
  );
};

export default AscDescFilter;
