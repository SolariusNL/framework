import ShadedCard from "@/components/ShadedCard";
import clsx from "@/util/clsx";
import { CardProps, Text, Title } from "@mantine/core";

type DetailCardProps = {
  title: string;
  description: string;
} & React.HTMLAttributes<HTMLDivElement>;

type DetailCardGroupProps = React.HTMLAttributes<HTMLDivElement>;

const DetailCard: React.FC<DetailCardProps> & {
  Group: React.FC<DetailCardGroupProps>;
} = ({ title, description, className, ...props }) => {
  return (
    <ShadedCard
      className={clsx("shadow px-4 py-5 sm:p-6", className)}
      {...(props as CardProps)}
    >
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <Title order={4} className="font-medium leading-6 mb-2">
            {title}
          </Title>
          <Text className="mt-1" size="sm" color="dimmed">
            {description}
          </Text>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2 space-y-7">
          {props.children}
        </div>
      </div>
    </ShadedCard>
  );
};

DetailCard.Group = ({ className, ...props }) => {
  return <div className={clsx("space-y-6", className)} {...props} />;
};

export default DetailCard;
