import { Tooltip, UnstyledButton } from "@mantine/core";
import { useState } from "react";
import { HiStar } from "react-icons/hi";
import clsx from "../util/clsx";

type RatingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  onRatingConfirmation: (rating: number) => void;
  loading: boolean;
};

const Rating: React.FC<RatingProps> = (props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="justify-around flex" {...props}>
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <Tooltip
            label={`Rate experience ${index} star${index > 1 ? "s" : ""}`}
            key={index}
          >
            <UnstyledButton
              type="button"
              className={clsx(
                index <= (hover || rating)
                  ? "dark:text-yellow-300 text-yellow-500"
                  : "text-gray-400/50",
                "text-2xl",
                props.loading &&
                  index <= rating &&
                  "dark:text-yellow-300/30 text-yellow-500/30 cursor-not-allowed"
              )}
              onClick={() => {
                if (props.loading) return;
                setRating(index);
                if (props.onRatingConfirmation)
                  props.onRatingConfirmation(index);
              }}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(rating)}
            >
              <HiStar />
            </UnstyledButton>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default Rating;
