const Solarius: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 45 45"
      fill={props.fill || "currentColor"}
      width={props.width || "1em"}
      height={props.height || "1em"}
      {...props}
    >
      <g clip-path="url(#clip0_822_6)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.5 45C34.9264 45 45 34.9264 45 22.5C45 10.0736 34.9264 0 22.5 0C10.0736 0 0 10.0736 0 22.5C0 34.9264 10.0736 45 22.5 45ZM39.0585 20.1652C36.9605 22.6185 34.0053 24.1464 30.7312 24.1464C24.3665 24.1464 19.2069 18.3725 19.2069 11.2501C19.2069 9.45816 19.5334 7.75161 20.1236 6.20089C12.148 7.41222 6.03644 14.2986 6.03644 22.6125C6.03644 25.0382 6.55672 27.3424 7.49178 29.4196C8.44032 28.5372 9.77341 27.988 11.2499 27.988C14.1291 27.988 16.4633 30.0764 16.4633 32.6527C16.4633 34.3825 15.4108 35.8925 13.8476 36.6979C16.3965 38.2918 19.4092 39.2131 22.6371 39.2131C31.8053 39.2131 39.2377 31.7807 39.2377 22.6125C39.2377 21.781 39.1765 20.9638 39.0585 20.1652Z"
          fill="#9E8EFF"
        />
      </g>
      <defs>
        <clipPath id="clip0_822_6">
          <rect width="45" height="45" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default Solarius;
