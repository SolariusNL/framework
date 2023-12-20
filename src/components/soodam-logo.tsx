const SoodamLogo = (
  props: React.ComponentPropsWithoutRef<"svg">
): JSX.Element => {
  return (
    <svg
      viewBox="0 0 202 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        clip-path="url(#clip0_843_2)"
        className="dark:fill-[#B6B0DA] fill-[#120C35]"
      >
        <path
          d="M67.6728 33.7646C65.7222 33.7646 63.9995 33.4353 62.5048 32.7766C61.0102 32.0926 59.8322 31.1299 58.9708 29.8886C58.1095 28.6219 57.6662 27.0893 57.6408 25.2906H62.7708C62.8215 26.5319 63.2648 27.5833 64.1008 28.4446C64.9622 29.2806 66.1402 29.6986 67.6348 29.6986C68.9268 29.6986 69.9528 29.3946 70.7128 28.7866C71.4728 28.1533 71.8528 27.3173 71.8528 26.2786C71.8528 25.1893 71.5108 24.3406 70.8268 23.7326C70.1682 23.1246 69.2815 22.6306 68.1668 22.2506C67.0522 21.8706 65.8615 21.4653 64.5948 21.0346C62.5428 20.3253 60.9722 19.4133 59.8828 18.2986C58.8188 17.1839 58.2868 15.7019 58.2868 13.8526C58.2615 12.2819 58.6288 10.9393 59.3888 9.82459C60.1742 8.68459 61.2382 7.81059 62.5808 7.20259C63.9235 6.56926 65.4688 6.25259 67.2168 6.25259C68.9902 6.25259 70.5482 6.56926 71.8908 7.20259C73.2588 7.83593 74.3228 8.72259 75.0828 9.86259C75.8682 11.0026 76.2862 12.3579 76.3368 13.9286H71.1308C71.1055 12.9913 70.7382 12.1679 70.0288 11.4586C69.3448 10.7239 68.3822 10.3566 67.1408 10.3566C66.0768 10.3313 65.1775 10.5973 64.4428 11.1546C63.7335 11.6866 63.3788 12.4719 63.3788 13.5106C63.3788 14.3973 63.6575 15.1066 64.2148 15.6386C64.7722 16.1453 65.5322 16.5759 66.4948 16.9306C67.4575 17.2853 68.5595 17.6653 69.8008 18.0706C71.1182 18.5266 72.3215 19.0586 73.4108 19.6666C74.5002 20.2746 75.3742 21.0853 76.0328 22.0986C76.6915 23.0866 77.0208 24.3659 77.0208 25.9366C77.0208 27.3299 76.6662 28.6219 75.9568 29.8126C75.2475 31.0033 74.1962 31.9659 72.8028 32.7006C71.4095 33.4099 69.6995 33.7646 67.6728 33.7646ZM90.1947 33.7646C88.3707 33.7646 86.724 33.3466 85.2547 32.5106C83.8107 31.6746 82.658 30.5219 81.7967 29.0526C80.9607 27.5579 80.5427 25.8353 80.5427 23.8846C80.5427 21.9339 80.9733 20.2239 81.8347 18.7546C82.696 17.2599 83.8487 16.0946 85.2927 15.2586C86.762 14.4226 88.4087 14.0046 90.2327 14.0046C92.0313 14.0046 93.6527 14.4226 95.0967 15.2586C96.566 16.0946 97.7187 17.2599 98.5547 18.7546C99.416 20.2239 99.8467 21.9339 99.8467 23.8846C99.8467 25.8353 99.416 27.5579 98.5547 29.0526C97.7187 30.5219 96.566 31.6746 95.0967 32.5106C93.6273 33.3466 91.9933 33.7646 90.1947 33.7646ZM90.1947 29.5466C91.4613 29.5466 92.5633 29.0779 93.5007 28.1406C94.438 27.1779 94.9067 25.7593 94.9067 23.8846C94.9067 22.0099 94.438 20.6039 93.5007 19.6666C92.5633 18.7039 91.474 18.2226 90.2327 18.2226C88.9407 18.2226 87.826 18.7039 86.8887 19.6666C85.9767 20.6039 85.5207 22.0099 85.5207 23.8846C85.5207 25.7593 85.9767 27.1779 86.8887 28.1406C87.826 29.0779 88.928 29.5466 90.1947 29.5466ZM104.196 33.3086V5.94859H109.06V33.3086H104.196ZM120.528 33.7646C118.906 33.7646 117.576 33.5113 116.538 33.0046C115.499 32.4726 114.726 31.7759 114.22 30.9146C113.713 30.0533 113.46 29.1033 113.46 28.0646C113.46 26.3166 114.144 24.8979 115.512 23.8086C116.88 22.7193 118.932 22.1746 121.668 22.1746H126.456V21.7186C126.456 20.4266 126.088 19.4766 125.354 18.8686C124.619 18.2606 123.707 17.9566 122.618 17.9566C121.63 17.9566 120.768 18.1973 120.034 18.6786C119.299 19.1346 118.843 19.8186 118.666 20.7306H113.916C114.042 19.3626 114.498 18.1719 115.284 17.1586C116.094 16.1453 117.133 15.3726 118.4 14.8406C119.666 14.2833 121.085 14.0046 122.656 14.0046C125.341 14.0046 127.456 14.6759 129.002 16.0186C130.547 17.3613 131.32 19.2613 131.32 21.7186V33.3086H127.178L126.722 30.2686C126.164 31.2819 125.379 32.1179 124.366 32.7766C123.378 33.4353 122.098 33.7646 120.528 33.7646ZM121.63 29.9646C123.023 29.9646 124.1 29.5086 124.86 28.5966C125.645 27.6846 126.139 26.5573 126.342 25.2146H122.2C120.908 25.2146 119.983 25.4553 119.426 25.9366C118.868 26.3926 118.59 26.9626 118.59 27.6466C118.59 28.3813 118.868 28.9513 119.426 29.3566C119.983 29.7619 120.718 29.9646 121.63 29.9646ZM135.961 33.3086V14.4606H140.293L140.749 17.9946C141.433 16.7786 142.358 15.8159 143.523 15.1066C144.714 14.3719 146.107 14.0046 147.703 14.0046V19.1346H146.335C145.271 19.1346 144.321 19.2993 143.485 19.6286C142.649 19.9579 141.991 20.5279 141.509 21.3386C141.053 22.1493 140.825 23.2766 140.825 24.7206V33.3086H135.961ZM153.65 11.5346C152.763 11.5346 152.028 11.2686 151.446 10.7366C150.888 10.2046 150.61 9.53326 150.61 8.72259C150.61 7.91193 150.888 7.25326 151.446 6.74659C152.028 6.21459 152.763 5.94859 153.65 5.94859C154.536 5.94859 155.258 6.21459 155.816 6.74659C156.398 7.25326 156.69 7.91193 156.69 8.72259C156.69 9.53326 156.398 10.2046 155.816 10.7366C155.258 11.2686 154.536 11.5346 153.65 11.5346ZM151.218 33.3086V14.4606H156.082V33.3086H151.218ZM168.226 33.7646C165.87 33.7646 164.046 33.0299 162.754 31.5606C161.488 30.0913 160.854 27.9379 160.854 25.1006V14.4606H165.68V24.6446C165.68 26.2659 166.01 27.5073 166.668 28.3686C167.327 29.2299 168.366 29.6606 169.784 29.6606C171.127 29.6606 172.229 29.1793 173.09 28.2166C173.977 27.2539 174.42 25.9113 174.42 24.1886V14.4606H179.284V33.3086H174.99L174.61 30.1166C174.028 31.2313 173.179 32.1179 172.064 32.7766C170.975 33.4353 169.696 33.7646 168.226 33.7646ZM192.068 33.7646C190.396 33.7646 188.926 33.4986 187.66 32.9666C186.393 32.4093 185.38 31.6493 184.62 30.6866C183.86 29.7239 183.404 28.6093 183.252 27.3426H188.154C188.306 28.0773 188.711 28.7106 189.37 29.2426C190.054 29.7493 190.928 30.0026 191.992 30.0026C193.056 30.0026 193.828 29.7873 194.31 29.3566C194.816 28.9259 195.07 28.4319 195.07 27.8746C195.07 27.0639 194.715 26.5193 194.006 26.2406C193.296 25.9366 192.308 25.6453 191.042 25.3666C190.231 25.1893 189.408 24.9739 188.572 24.7206C187.736 24.4673 186.963 24.1506 186.254 23.7706C185.57 23.3653 185.012 22.8586 184.582 22.2506C184.151 21.6173 183.936 20.8446 183.936 19.9326C183.936 18.2606 184.594 16.8546 185.912 15.7146C187.254 14.5746 189.129 14.0046 191.536 14.0046C193.765 14.0046 195.538 14.5239 196.856 15.5626C198.198 16.6013 198.996 18.0326 199.25 19.8566H194.652C194.373 18.4633 193.322 17.7666 191.498 17.7666C190.586 17.7666 189.876 17.9439 189.37 18.2986C188.888 18.6533 188.648 19.0966 188.648 19.6286C188.648 20.1859 189.015 20.6293 189.75 20.9586C190.484 21.2879 191.46 21.5919 192.676 21.8706C193.993 22.1746 195.196 22.5166 196.286 22.8966C197.4 23.2513 198.287 23.7959 198.946 24.5306C199.604 25.2399 199.934 26.2659 199.934 27.6086C199.959 28.7739 199.655 29.8253 199.022 30.7626C198.388 31.6999 197.476 32.4346 196.286 32.9666C195.095 33.4986 193.689 33.7646 192.068 33.7646Z"
          className="dark:fill-indigo-300 fill-indigo-400"
        />
        <path
          d="M40 14.4906H26.4471V1H13.4588C13.4588 8.45283 7.43529 14.4906 0 14.4906V27.5094H13.4588V41H26.4471C26.4471 33.5472 32.5647 27.5094 40 27.5094V14.4906Z"
          fill="#170F49"
          className="dark:fill-indigo-400/50 fill-indigo-400/50"
        />
      </g>
      <defs>
        <clipPath id="clip0_843_2">
          <rect width="202" height="41" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SoodamLogo;
