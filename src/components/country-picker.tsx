import countries from "@/data/countries";
import { Select, Text } from "@mantine/core";
import React, { CSSProperties, forwardRef } from "react";
import ReactCountryFlag from "react-country-flag";

type Country = {
  name: string;
  code: string;
};
type SelectItemProps = {
  label: string;
  value: string;
};

const selectItemStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
};
const flagStyles: CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "8px",
  marginRight: "16px",
};
const labelStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ label, value, ...others }, ref) => (
    <div ref={ref} {...others} style={selectItemStyles}>
      <ReactCountryFlag
        countryCode={value}
        svg
        style={flagStyles}
        title={label}
      />
      <div style={labelStyles}>
        <Text size="sm">{label}</Text>
        <Text size="xs" color="dimmed">
          {value}
        </Text>
      </div>
    </div>
  )
);

type CountrySelectProps = {
  label?: string;
  onChange?: (code: string) => void;
  defaultValue?: string;
};

const CountrySelect: React.FC<CountrySelectProps> = ({
  label = "",
  onChange = (code: string) => {},
  defaultValue = "",
}) => {
  return (
    <Select
      placeholder="Choose a country"
      itemComponent={SelectItem}
      data={countries.map((country: Country) => ({
        label: country.name,
        value: country.code,
      }))}
      searchable
      label={label}
      defaultValue={defaultValue}
      onChange={(val) => {
        onChange(String(val));
      }}
    />
  );
};

export default CountrySelect;
