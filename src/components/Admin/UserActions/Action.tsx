import { Anchor, Text } from "@mantine/core";

const Action: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  icon: React.FC<{ className?: string }>;
}> = ({ title, description, onClick, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <Icon className="flex-shrink-0" />
      <div>
        <Text size="lg">{title}</Text>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </div>
      <Anchor onClick={onClick} className="flex-1 text-right">
        Run
      </Anchor>
    </div>
  );
};

export default Action;
