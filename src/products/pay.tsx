import { FC, SVGProps } from "react";

const PayLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
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
      <rect
        x="12"
        y="14"
        width="42.8743"
        height="37.1917"
        rx="12"
        fill="#4A3AFF"
        stroke="#4A3AFF"
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M57.0001 25.7826H39.7551C35.9924 25.7826 32.9421 28.8328 32.9421 32.5955C32.9421 36.3582 35.9924 39.4085 39.7551 39.4085H57.0001V25.7826Z"
        fill="#4CBFFF"
      />
      <circle cx="39.5262" cy="32.5955" r="3.40648" fill="white" />
    </svg>
  );
};

export default PayLogo;
