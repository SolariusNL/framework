const Premium: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={props.fill || "currentColor"}
      width={props.width || "1em"}
      height={props.height || "1em"}
      {...props}
    >
      <path
        d="M8 12C8 10.5194 8.8044 9.22675 10 8.53513V15.4649C8.8044 14.7733 8 13.4806 8 12Z"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="4"
      />
      <path
        d="M14 15.4649V8.53513C15.1956 9.22675 16 10.5194 16 12C16 13.4806 15.1956 14.7733 14 15.4649Z"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="4"
      />
      <path
        d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
};

export default Premium;