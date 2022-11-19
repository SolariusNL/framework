import { Anchor, Card, CardProps, Text } from "@mantine/core";
import { ProfileLink } from "@prisma/client";
import { NonUser } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";

interface LinksProps {
  user: NonUser & {
    profileLinks: ProfileLink[];
  };
}

const Links = ({
  user,
  ...props
}: LinksProps & Omit<CardProps, "children">) => {
  return (
    <Card withBorder p="md" {...props}>
      {user.profileLinks.map((link, i) => (
        <Card.Section key={i} p="md" withBorder>
          <Text weight={700} size="sm" color="dimmed" mb={4}>
            {link.name}
          </Text>
          <Anchor href={link.url} target="_blank">
            {link.url}
          </Anchor>
        </Card.Section>
      ))}
      {user.profileLinks.length === 0 && (
        <div className="w-full justify-center flex">
          <ModernEmptyState title="No links" body="This user has no links." />
        </div>
      )}
    </Card>
  );
};

export default Links;
