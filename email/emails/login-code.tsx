import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface LoginCodeProps {
  username: string;
  os: string;
  ip: string;
  code: string;
  url: string;
}

const LoginCode: React.FC<LoginCodeProps> = ({
  username = "Example",
  os = "Windows",
  ip = "10.1.1.1",
  code = "123456",
  url = "https://example.com",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify login attempt</Preview>
      <EmailLayout
        title={
          <>
            Verify your <b>Framework</b> login attempt
          </>
        }
      >
        <Text style={styles.text}>
          Hello <b>{username}</b>,
        </Text>
        <Text style={styles.text}>
          Someone (hopefully you) just tried to sign in to your Framework
          account from a <b>{os}</b> device using the IP address <b>{ip}</b>.
        </Text>
        <Text style={styles.text}>
          If this wasn&apos;t you, you should change your password immediately.
          Otherwise, you can verify this login attempt by entering the following
          code into the Framework app, or by clicking the button below.
        </Text>
        <Text
          style={{
            ...styles.h1,
            fontFamily: "monospace",
          }}
        >
          <b>{code}</b>
        </Text>
        <Section
          style={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            display: "flex",
          }}
        >
          <Button pX={20} pY={12} style={styles.btn} href={url}>
            Authorize
          </Button>
        </Section>
        <Text style={styles.dimmed}>
          <br />
          or copy and paste this URL into your browser:{" "}
          <Link href={url} target="_blank" style={styles.link} rel="noreferrer">
            {url}
          </Link>
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default LoginCode;
