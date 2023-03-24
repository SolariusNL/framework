import clsx from "../util/clsx";
import BackgroundImg from "../assets/subtlebackground.png";

const Background: React.FC = () => (
  <>
    <span className={clsx("fixed inset-0 bg-background")} />
    <span
      className="fixed inset-0"
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
