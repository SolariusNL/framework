/* eslint-disable react/display-name */

import { Group, Select, Text } from "@mantine/core";
import { forwardRef } from "react";
import ReactCountryFlag from "react-country-flag";
import countries from "../data/countries";
import { BLACK } from "../pages/teams/t/[slug]/issue/create";

interface CountrySelectProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  value: string;
}

const SelectItem = forwardRef<HTMLDivElement, CountrySelectProps>(
  ({ label, value, ...others }: CountrySelectProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <ReactCountryFlag
          countryCode={value}
          svg
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "8px",
          }}
          title={label}
        />

        <div>
          <Text size="sm">{label}</Text>
          <Text size="xs" color="dimmed">
            {value}
          </Text>
        </div>
      </Group>
    </div>
  )
);

const CountrySelect = ({
  label = "",
  onChange = (code: string) => {},
  defaultValue = "",
}) => {
  return (
    <Select
      placeholder="Choose a country"
      itemComponent={SelectItem}
      data={countries.map((country) => ({
        label: country.name,
        value: country.code,
      }))}
      searchable
      label={label}
      defaultValue={defaultValue}
      onChange={(val) => {
        onChange(String(val));
      }}
      classNames={BLACK}
    />
  );
};

export default CountrySelect;
