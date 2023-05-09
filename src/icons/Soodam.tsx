import Image, { ImageProps } from "next/image";
import { FC } from "react";

const Soodam: FC<
  Omit<ImageProps, "src"> & {
    width?: number;
    height?: number;
  }
> = (props) => {
  return (
    <Image
      src="/brand/white.png"
      width={16 || props.width}
      height={16 || props.height}
      alt="Soodam.re Logo"
      quality={100}
      {...props}
    />
  );
};

export default Soodam;
