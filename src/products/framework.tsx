import { FC, SVGProps } from "react";

const FrameworkLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="66" height="66" rx="8" className="fill-transparent" />
      <mask
        id="mask0_802_2"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="9"
        y="7"
        width="49"
        height="53"
      >
        <path
          d="M28.4512 8.21978C31.2682 6.59341 34.7388 6.59341 37.5558 8.21977L52.4548 16.8217C55.2717 18.4481 57.007 21.4537 57.007 24.7065V41.9103C57.007 45.1631 55.2717 48.1687 52.4548 49.7951L37.5558 58.397C34.7388 60.0234 31.2682 60.0234 28.4513 58.397L13.5523 49.7951C10.7353 48.1687 9 45.1631 9 41.9103V24.7065C9 21.4537 10.7353 18.4481 13.5523 16.8217L28.4512 8.21978Z"
          fill="#C4C4C4"
        />
      </mask>
      <g mask="url(#mask0_802_2)">
        <rect
          width="30.3817"
          height="30.3817"
          transform="matrix(0.866025 0.5 -0.866025 0.5 33.0039 5.13965)"
          fill="#4A3AFF"
        />
        <rect
          width="27.9554"
          height="27.9554"
          transform="matrix(0.866025 0.5 -2.20305e-08 1 8.79297 20.5503)"
          fill="#4CBFFF"
        />
        <rect
          width="27.9554"
          height="27.9554"
          transform="matrix(0.866025 -0.5 2.20305e-08 1 33.0039 34.5317)"
          fill="#9328FF"
        />
      </g>
    </svg>
  );
};

export default FrameworkLogo;
