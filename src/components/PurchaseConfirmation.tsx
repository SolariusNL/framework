import {
  Button,
  Modal,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { HiCheckCircle, HiStop } from "react-icons/hi";
import clsx from "../util/clsx";
import RenderMarkdown from "./RenderMarkdown";

interface PurchaseConfirmationProps {
  productTitle: string;
  productDescription: string;
  price: number;
  onPurchaseComplete: () => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  proseDescription?: boolean;
}

const PurchaseConfirmation: React.FC<PurchaseConfirmationProps> = ({
  productTitle,
  productDescription,
  price,
  onPurchaseComplete,
  opened,
  setOpened,
  proseDescription,
}) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      className={clsx(
        "flex items-center justify-center flex-col text-center",
        colorScheme === "dark" && "dark"
      )}
      withCloseButton={false}
    >
      <Text color="dimmed" size="sm" weight={700} mb={16}>
        Purchase Confirmation
      </Text>
      <Title order={4} mb={8}>
        {productTitle}
      </Title>
      {proseDescription ? (
        <RenderMarkdown proseAddons="prose-sm text-left">
          {productDescription}
        </RenderMarkdown>
      ) : (
        <Text color="dimmed">{productDescription}</Text>
      )}
      <Button
        fullWidth
        leftIcon={<HiCheckCircle />}
        mb={6}
        mt="lg"
        onClick={() => {
          onPurchaseComplete();
          setOpened(false);
        }}
        size="lg"
      >
        Purchase for {price}T$
      </Button>
      <Button
        fullWidth
        leftIcon={<HiStop />}
        onClick={() => setOpened(false)}
        variant="subtle"
        color="gray"
        mb={16}
      >
        Cancel
      </Button>
      <Text color="dimmed" size="sm">
        Your accounts tickets will be deducted by {price}T$. This is a
        user-to-user transaction and is not refundable, you are purchasing this
        product at your own discretion.
      </Text>
    </Modal>
  );
};

export default PurchaseConfirmation;
