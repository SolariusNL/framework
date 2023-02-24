import clsx from "../util/clsx";

const Background: React.FC = () => (
  <>
    <span className={clsx("fixed inset-0 bg-background")} />
    <span
      className="fixed inset-0"
      style={{
        backgroundImage:
          "url('https://mintlify.s3-us-west-1.amazonaws.com/frpc/images/lightbackground.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
        backgroundAttachment: "fixed",
      }}
    />
  </>
);

export default Background;
