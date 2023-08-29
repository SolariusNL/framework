import { FC, SVGProps } from "react";

const VerseLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
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
        d="M12 30.7503C12 20.3948 20.3948 12 30.7503 12V12V36.0053C30.7503 46.3608 22.3555 54.7556 12 54.7556V54.7556V30.7503Z"
        fill="#4A3AFF"
      />
      <path
        d="M33.4702 22.0378C33.4702 16.4941 37.9643 12 43.508 12H43.81C49.3537 12 53.8477 16.4941 53.8477 22.0378V22.0378C53.8477 27.5815 49.3537 32.0756 43.81 32.0756H43.508C37.9643 32.0756 33.4702 27.5815 33.4702 22.0378V22.0378Z"
        fill="#4CBFFF"
      />
      <path
        d="M33.4702 44.7178C33.4702 39.1741 37.9643 34.6801 43.508 34.6801H43.81C49.3537 34.6801 53.8477 39.1741 53.8477 44.7178V44.7178C53.8477 50.2615 49.3537 54.7556 43.81 54.7556H43.508C37.9643 54.7556 33.4702 50.2615 33.4702 44.7178V44.7178Z"
        fill="#9328FF"
      />
    </svg>
  );
};

export default VerseLogo;
