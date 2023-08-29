import { FC, SVGProps } from "react";

const InfraLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
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
      <path
        d="M35.2261 35.2727C34.6486 28.2733 28.7848 22.7727 21.6364 22.7727C14.1052 22.7727 8 28.8779 8 36.4091C8 43.9402 14.1052 50.0454 21.6364 50.0454H42.0909V35.2727H35.2261Z"
        fill="#528BFF"
      />
      <circle cx="40.9546" cy="33" r="17.0455" fill="#7839EE" />
    </svg>
  );
};

export default InfraLogo;
