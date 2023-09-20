import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import cast from "@/util/cast";
import { Checkbox, CheckboxProps, Text } from "@mantine/core";
import { ChangeEvent } from "react";

interface LabelledCheckboxProps {
  label: string;
  description: string;
}

const LabelledCheckbox: React.FC<LabelledCheckboxProps & CheckboxProps> = ({
  label,
  description,
  ...props
}) => {
  return (
    <div className="flex gap-3 items-start">
      <Checkbox classNames={BLACK} {...props} />
      <div>
        <Text
          size="sm"
          weight={500}
          onClick={() => {
            if (props.onChange) {
              if (props.disabled) return;
              props.onChange(
                cast<ChangeEvent<HTMLInputElement>>(!props.checked)
              );
            }
          }}
          className="cursor-default"
        >
          {label}
        </Text>
        <Text size="xs" color="dimmed" className="cursor-default">
          {description}
        </Text>
      </div>
    </div>
  );
};

export default LabelledCheckbox;
