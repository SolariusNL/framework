const Pants: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={props.fill || "currentColor"}
      width={props.width || "1em"}
      height={props.height || "1em"}
      {...props}
    >
      <path d="M 13.5 4.0019531 C 11.032499 4.0019531 9 6.0344522 9 8.5019531 L 9 40.53125 C 9 42.445938 10.585045 44.03125 12.5 44.03125 L 15.916016 44.03125 C 17.4385 44.03125 18.798951 43.032767 19.255859 41.580078 A 1.50015 1.50015 0 0 0 19.265625 41.542969 L 24.042969 24.8125 L 29.128906 41.599609 A 1.50015 1.50015 0 0 0 29.142578 41.638672 C 29.617336 43.062945 30.962193 44.03125 32.462891 44.03125 L 35.5 44.03125 C 37.414955 44.03125 39 42.446205 39 40.53125 L 39 11.746094 A 1.50015 1.50015 0 0 0 39 11.259766 L 39 8.5019531 C 39 6.0344522 36.967501 4.0019531 34.5 4.0019531 L 13.5 4.0019531 z M 13.5 7.0019531 L 34.5 7.0019531 C 35.346499 7.0019531 36 7.655454 36 8.5019531 L 36 10 L 12 10 L 12 8.5019531 C 12 7.655454 12.653501 7.0019531 13.5 7.0019531 z M 12 13 L 16.943359 13 C 16.792078 15.57713 15.631499 16.632493 14.330078 17.283203 C 13.183856 17.856314 12.379999 17.850236 12 17.873047 L 12 13 z M 19.929688 13 L 28.070312 13 C 28.261367 16.675722 30.319704 18.96161 32.330078 19.966797 C 34.03091 20.817213 35.417896 20.926587 36 20.953125 L 36 40.53125 C 36 40.826295 35.795045 41.03125 35.5 41.03125 L 32.462891 41.03125 C 32.243588 41.03125 32.057523 40.899133 31.988281 40.691406 L 25.435547 19.064453 A 1.50015 1.50015 0 0 0 22.558594 19.087891 L 16.392578 40.681641 L 16.390625 40.683594 C 16.322745 40.895214 16.138499 41.03125 15.916016 41.03125 L 12.5 41.03125 C 12.204955 41.03125 12 40.824562 12 40.53125 L 12 20.953125 C 12.582104 20.926585 13.96909 20.817213 15.669922 19.966797 C 17.680296 18.96161 19.738634 16.675722 19.929688 13 z M 31.056641 13 L 36 13 L 36 17.873047 C 35.620001 17.850236 34.816144 17.856314 33.669922 17.283203 C 32.368501 16.632493 31.207922 15.57713 31.056641 13 z" />
    </svg>
  );
};

export default Pants;