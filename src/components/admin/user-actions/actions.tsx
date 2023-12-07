import ShadedButton from "@/components/shaded-button";
import { Anchor, Text } from "@mantine/core";

const Action: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  icon: React.FC<{ className?: string }>;
  condition?: boolean;
}> = ({ title, description, onClick, icon: Icon, condition }) => {
  return (
    <ShadedButton
      className="flex w-full items-center justify-between gap-6 px-6"
      onClick={() => {
        if (!condition) onClick();
      }}
    >
      <Icon className="flex-shrink-0" />
      <div className="flex-grow">
        <Text size="lg">{title}</Text>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </div>
    </ShadedButton>
  );
};

export default Action;
