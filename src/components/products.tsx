import ShadedButton from "@/components/shaded-button";
import products from "@/config/products";
import useExperimentsStore, {
  ExperimentId,
} from "@/stores/useExperimentsStore";
import clsx from "@/util/clsx";
import {
  ActionIcon,
  Popover,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { FC } from "react";
import { HiOutlineArchive } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

const Products: FC = () => {
  const { experiments } = useExperimentsStore();
  const { colorScheme } = useMantineColorScheme();

  return experiments.includes(ExperimentId.ProductPicker) ? (
    <ReactNoSSR>
      <Popover transition="pop">
        <Popover.Target>
          <ActionIcon
            variant="subtle"
            className="md:-ml-10 absolute md:flex hidden text-dimmed items-center justify-center"
          >
            <HiOutlineArchive />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown className={clsx("px-1 py-1", colorScheme)}>
          <div className="grid grid-cols-2 gap-2">
            {products.map((product) => (
              <a
                href={product.href}
                key={product.name}
                className="no-underline"
              >
                <ShadedButton className="flex gap-4 items-center rounded-[4px] dark:hover:bg-slate-400/5">
                  <product.icon className="h-6 w-6" />
                  <Text className="font-title font-semibold">
                    {product.name}
                  </Text>
                </ShadedButton>
              </a>
            ))}
          </div>
        </Popover.Dropdown>
      </Popover>
    </ReactNoSSR>
  ) : (
    <></>
  );
};

export default Products;
