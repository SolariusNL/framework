import { FC, SVGProps } from "react";

const AnalyticsLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        width="66"
        height="66"
        rx="8"
        className="dark:fill-white fill-[#333338]"
      />
      <rect
        x="14"
        y="37.1279"
        width="9.72"
        height="15.11"
        rx="4.86"
        fill="#4A3AFF"
      />
      <rect x="14" y="14" width="9.72" height="9.72" rx="4.86" fill="#9328FF" />
      <rect
        x="28.1426"
        y="25.2485"
        width="9.72"
        height="26.9894"
        rx="4.86"
        fill="#4A3AFF"
      />
      <rect
        x="42.2852"
        y="14"
        width="9.72"
        height="38.2377"
        rx="4.86"
        fill="#4A3AFF"
      />
    </svg>
  );
};

export default AnalyticsLogo;
