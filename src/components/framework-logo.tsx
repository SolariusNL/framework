import { TitleProps } from "@mantine/core";

const FrameworkLogo = (props: TitleProps & { square?: boolean }) => {
  return props.square ? (
    <svg
      width="40"
      height="40"
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(props as React.SVGProps<SVGSVGElement>)}
    >
      <mask
        id="mask0_2_72"
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
      <g mask="url(#mask0_2_72)">
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
  ) : (
    <svg
      width="135"
      height="40"
      viewBox="0 0 285 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: "pointer" }}
      {...(props as React.SVGProps<SVGSVGElement>)}
    >
      <path
        d="M73.5908 45.3086V18.7086H90.7668V22.6226H78.4548V30.0706H88.4108V33.9086H78.4548V45.3086H73.5908ZM94.4065 45.3086V26.4606H98.7385L99.1945 29.9946C99.8785 28.7786 100.803 27.8159 101.969 27.1066C103.159 26.3719 104.553 26.0046 106.149 26.0046V31.1346H104.781C103.717 31.1346 102.767 31.2993 101.931 31.6286C101.095 31.9579 100.436 32.5279 99.9545 33.3386C99.4985 34.1493 99.2705 35.2766 99.2705 36.7206V45.3086H94.4065ZM115.971 45.7646C114.35 45.7646 113.02 45.5113 111.981 45.0046C110.942 44.4726 110.17 43.7759 109.663 42.9146C109.156 42.0533 108.903 41.1033 108.903 40.0646C108.903 38.3166 109.587 36.8979 110.955 35.8086C112.323 34.7193 114.375 34.1746 117.111 34.1746H121.899V33.7186C121.899 32.4266 121.532 31.4766 120.797 30.8686C120.062 30.2606 119.15 29.9566 118.061 29.9566C117.073 29.9566 116.212 30.1973 115.477 30.6786C114.742 31.1346 114.286 31.8186 114.109 32.7306H109.359C109.486 31.3626 109.942 30.1719 110.727 29.1586C111.538 28.1453 112.576 27.3726 113.843 26.8406C115.11 26.2833 116.528 26.0046 118.099 26.0046C120.784 26.0046 122.9 26.6759 124.445 28.0186C125.99 29.3613 126.763 31.2613 126.763 33.7186V45.3086H122.621L122.165 42.2686C121.608 43.2819 120.822 44.1179 119.809 44.7766C118.821 45.4353 117.542 45.7646 115.971 45.7646ZM117.073 41.9646C118.466 41.9646 119.543 41.5086 120.303 40.5966C121.088 39.6846 121.582 38.5573 121.785 37.2146H117.643C116.351 37.2146 115.426 37.4553 114.869 37.9366C114.312 38.3926 114.033 38.9626 114.033 39.6466C114.033 40.3813 114.312 40.9513 114.869 41.3566C115.426 41.7619 116.161 41.9646 117.073 41.9646ZM131.405 45.3086V26.4606H135.699L136.117 29.0066C136.725 28.0946 137.523 27.3726 138.511 26.8406C139.524 26.2833 140.689 26.0046 142.007 26.0046C144.92 26.0046 146.985 27.1319 148.201 29.3866C148.885 28.3479 149.797 27.5246 150.937 26.9166C152.102 26.3086 153.369 26.0046 154.737 26.0046C157.194 26.0046 159.081 26.7393 160.399 28.2086C161.716 29.6779 162.375 31.8313 162.375 34.6686V45.3086H157.511V35.1246C157.511 33.5033 157.194 32.2619 156.561 31.4006C155.953 30.5393 155.003 30.1086 153.711 30.1086C152.393 30.1086 151.329 30.5899 150.519 31.5526C149.733 32.5153 149.341 33.8579 149.341 35.5806V45.3086H144.477V35.1246C144.477 33.5033 144.16 32.2619 143.527 31.4006C142.893 30.5393 141.918 30.1086 140.601 30.1086C139.309 30.1086 138.257 30.5899 137.447 31.5526C136.661 32.5153 136.269 33.8579 136.269 35.5806V45.3086H131.405ZM176.15 45.7646C174.25 45.7646 172.566 45.3593 171.096 44.5486C169.627 43.7379 168.474 42.5979 167.638 41.1286C166.802 39.6593 166.384 37.9619 166.384 36.0366C166.384 34.0859 166.79 32.3506 167.6 30.8306C168.436 29.3106 169.576 28.1326 171.02 27.2966C172.49 26.4353 174.212 26.0046 176.188 26.0046C178.038 26.0046 179.672 26.4099 181.09 27.2206C182.509 28.0313 183.611 29.1459 184.396 30.5646C185.207 31.9579 185.612 33.5159 185.612 35.2386C185.612 35.5173 185.6 35.8086 185.574 36.1126C185.574 36.4166 185.562 36.7333 185.536 37.0626H171.21C171.312 38.5319 171.818 39.6846 172.73 40.5206C173.668 41.3566 174.795 41.7746 176.112 41.7746C177.1 41.7746 177.924 41.5593 178.582 41.1286C179.266 40.6726 179.773 40.0899 180.102 39.3806H185.042C184.688 40.5713 184.092 41.6606 183.256 42.6486C182.446 43.6113 181.432 44.3713 180.216 44.9286C179.026 45.4859 177.67 45.7646 176.15 45.7646ZM176.188 29.9566C174.998 29.9566 173.946 30.2986 173.034 30.9826C172.122 31.6413 171.54 32.6546 171.286 34.0226H180.672C180.596 32.7813 180.14 31.7933 179.304 31.0586C178.468 30.3239 177.43 29.9566 176.188 29.9566ZM192.647 45.3086L187.137 26.4606H191.963L195.231 40.0266L199.031 26.4606H204.427L208.227 40.0266L211.533 26.4606H216.359L210.811 45.3086H205.757L201.729 31.2106L197.701 45.3086H192.647ZM227.804 45.7646C225.98 45.7646 224.333 45.3466 222.864 44.5106C221.42 43.6746 220.267 42.5219 219.406 41.0526C218.57 39.5579 218.152 37.8353 218.152 35.8846C218.152 33.9339 218.583 32.2239 219.444 30.7546C220.305 29.2599 221.458 28.0946 222.902 27.2586C224.371 26.4226 226.018 26.0046 227.842 26.0046C229.641 26.0046 231.262 26.4226 232.706 27.2586C234.175 28.0946 235.328 29.2599 236.164 30.7546C237.025 32.2239 237.456 33.9339 237.456 35.8846C237.456 37.8353 237.025 39.5579 236.164 41.0526C235.328 42.5219 234.175 43.6746 232.706 44.5106C231.237 45.3466 229.603 45.7646 227.804 45.7646ZM227.804 41.5466C229.071 41.5466 230.173 41.0779 231.11 40.1406C232.047 39.1779 232.516 37.7593 232.516 35.8846C232.516 34.0099 232.047 32.6039 231.11 31.6666C230.173 30.7039 229.083 30.2226 227.842 30.2226C226.55 30.2226 225.435 30.7039 224.498 31.6666C223.586 32.6039 223.13 34.0099 223.13 35.8846C223.13 37.7593 223.586 39.1779 224.498 40.1406C225.435 41.0779 226.537 41.5466 227.804 41.5466ZM241.805 45.3086V26.4606H246.137L246.593 29.9946C247.277 28.7786 248.202 27.8159 249.367 27.1066C250.558 26.3719 251.951 26.0046 253.547 26.0046V31.1346H252.179C251.115 31.1346 250.165 31.2993 249.329 31.6286C248.493 31.9579 247.834 32.5279 247.353 33.3386C246.897 34.1493 246.669 35.2766 246.669 36.7206V45.3086H241.805ZM256.871 45.3086V17.9486H261.735V34.0986L268.423 26.4606H274.199L266.485 35.0486L275.453 45.3086H269.373L261.735 35.8466V45.3086H256.871Z"
        fill="#6563CC"
        className="dark:fill-indigo-300 fill-indigo-600"
      />
      <mask
        id="mask0_2_2"
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
      <g mask="url(#mask0_2_2)">
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
