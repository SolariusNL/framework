import { Tooltip, UnstyledButton } from "@mantine/core";
import { motion } from "framer-motion";
import { useState } from "react";
import { HiStar } from "react-icons/hi";
import clsx from "../util/clsx";

type RatingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  onRatingConfirmation?: (rating: number) => void;
  loading?: boolean;
  value?: number;
  onChange?: (rating: number) => void;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  editable?: boolean;
};

const Rating: React.FC<RatingProps> = ({
  editable = true,
  loading = false,
  ...props
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="justify-center flex" {...props}>
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <Tooltip
            label={`${
              editable
                ? `Rate experience ${index} star${index > 1 ? "s" : ""}`
                : `Rated ${index} star${index > 1 ? "s" : ""}`
            }`}
            key={index}
            openDelay={200}
          >
            <motion.div
              animate={{
                scale: hover === index ? 1.19 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <UnstyledButton
                type="button"
                className={clsx(
                  index <= (hover || props.value || 0)
                    ? "dark:text-yellow-300 text-yellow-500"
                    : "text-gray-400/50",
                  "text-3xl",
                  loading &&
                    index <= props.value! &&
                    "dark:text-yellow-300/30 text-yellow-500/30 cursor-not-allowed",
                  "transition-colors duration-200 ease-in-out"
                )}
                onClick={() => {
                  if (loading) return;
                  props.setValue(index);
                  if (props.onRatingConfirmation)
                    props.onRatingConfirmation(index);
                }}
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(props.value || 0)}
              >
                <HiStar />
              </UnstyledButton>
            </motion.div>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default Rating;
