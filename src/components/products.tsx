import products from "@/config/products";
import useExperimentsStore, {
  ExperimentId,
} from "@/stores/useExperimentsStore";
import { ActionIcon, Popover, Text, Title } from "@mantine/core";
import { FC } from "react";
import { HiOutlineArchive } from "react-icons/hi";
import ShadedButton from "./shaded-button";

const Products: FC = () => {
  const { experiments } = useExperimentsStore();
  return experiments.includes(ExperimentId.ProductPicker) ? (
    <Popover transition="pop" width={500}>
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          className="md:-ml-10 absolute md:flex hidden text-dimmed items-center justify-center"
        >
          <HiOutlineArchive />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <ShadedButton
              sx={(theme) => ({
                border: `1px solid transparent`,
                borderRadius: theme.radius.sm * 2,
                backgroundColor:
                  theme.colors[product.color][
                    theme.colorScheme == "dark" ? 9 : 0
                  ] + "15",
                "&:hover": {
                  borderColor:
                    theme.colors[product.color][
                      theme.colorScheme == "dark" ? 2 : 9
                    ] + "50",
                },
              })}
              className="flex gap-4 p-2"
            >
              <div className="flex items-start">{product.icon}</div>
              <div className="flex gap-2 flex-col">
                <Title order={5}>{product.name}</Title>
                <Text size="sm" color="dimmed">
                  {product.subname}
                </Text>
              </div>
            </ShadedButton>
          ))}
        </div>
      </Popover.Dropdown>
    </Popover>
  ) : null;
};

export default Products;
