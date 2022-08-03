import React, { ReactNode } from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type PropType = {
  options?: EmblaOptionsType;
  slides: ReactNode[];
  p?: number;
};

const ThumbnailCarousel = (props: PropType) => {
  const { options, slides, p } = props;
  const [emblaRef] = useEmblaCarousel(options, [Autoplay({
    delay: 2500
  })]);

  return (
    <div className="embla" ref={emblaRef} style={{
      ...(p ? { padding: `${p}px` } : {})
    }}>
      <div className="embla__container">
        {slides.map((slide, index) => (
          <div className="embla__slide" key={index}>
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailCarousel;