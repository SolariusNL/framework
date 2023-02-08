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
      <Checkbox {...props} />
      <div>
        <Text
          size="sm"
          weight={500}
          onClick={() => {
            if (props.onChange) {
              if (props.disabled) return;
              props.onChange(
                !props.checked as unknown as ChangeEvent<HTMLInputElement>
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
