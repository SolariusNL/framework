import { Anchor, Text } from "@mantine/core";

const Action: React.FC<{
  title: string;
  description: string;
  onClick: () => void;
  icon: React.FC<{ className?: string }>;
  condition?: boolean;
}> = ({ title, description, onClick, icon: Icon, condition }) => {
  return (
    <div className="flex items-center justify-between gap-6">
      <Icon className="flex-shrink-0" />
      <div>
        <Text size="lg">{title}</Text>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </div>
      <Anchor
        onClick={() => {
          if (!condition) onClick();
        }}
        className={`flex-1 text-right${
          !condition ? "" : " opacity-30 cursor-not-allowed"
        }`}
      >
        Run
      </Anchor>
    </div>
  );
};

export default Action;
