import { Radio, RadioProps, Text } from "@mantine/core";

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
      <Radio {...props} />
      <div>
        <Text
          size="sm"
          weight={500}
          onClick={() => {
            if (props.onChange) {
              props.onChange(!props.checked as any);
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
