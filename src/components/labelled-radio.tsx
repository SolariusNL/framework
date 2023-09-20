import cast from "@/util/cast";
import { Radio, RadioProps, Text } from "@mantine/core";
import { ChangeEvent } from "react";

interface LabelledRadioProps {
  label: string;
  description: string;
}

const LabelledRadio: React.FC<LabelledRadioProps & RadioProps> = ({
  label,
  description,
  ...props
}) => {
  return (
    <div className="flex gap-3 items-start">
      <Radio classNames={props.classNames} {...props} />
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

export default LabelledRadio;
