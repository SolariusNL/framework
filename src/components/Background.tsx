import BackgroundImg from "../assets/subtlebackground.png";
import clsx from "../util/clsx";

const Background: React.FC<{ className?: string }> = ({ className }) => (
  <>
    <span className={clsx("fixed inset-0 bg-background", className)} />
    <span
      className={clsx("fixed inset-0", className)}
      style={{
        backgroundImage: `url(${BackgroundImg.src})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundAttachment: "fixed",
      }}
    />
  </>
);

export default Background;
