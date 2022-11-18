import { Title, TitleProps } from "@mantine/core";

const HeaderStyle = {
  marginTop: 0,
  marginBottom: 0,
  backgroundImage:
    "url('https://assets-global.website-files.com/600ead1452cf056d0e52dbed/603408f80d379f66929884cf_PurpleBackground%20(1).png')",
  backgroundPosition: "0 15%",
  backgroundSize: "cover",
  fontSize: "1.2rem",
  lineHeight: "1em",
  fontWeight: "900",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  opacity: 1,
  transform:
    "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
  transformStyle: "preserve-3d",
} as React.CSSProperties;

const FrameworkLogo = (props: TitleProps) => {
  return (
    <Title
      // @ts-ignore
      sx={{
        ":hover": {
          backgroundPosition: "0 100%",
          backgroundRepeat: "no-repeat",
          transition: "all 0.8s ease",
        },
        transition: "all 0.8s ease",
        cursor: "pointer",
        ":active": {
          transform: "scale(0.9)",
          transition: "transform 0.3s ease",
        },
        ":focus": {
          outline: "none",
        },
        ...HeaderStyle,
      }}
      order={5}
      {...props}
    >
      Framework
    </Title>
  );
};

export default FrameworkLogo;
