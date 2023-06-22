import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface JoinFrameworkProps {
  code: string;
}

const JoinFramework: React.FC<JoinFrameworkProps> = ({
  code = "0000-0000-0000-0000",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Join Framework</Preview>
      <EmailLayout title={<>You have been invited to join Framework</>}>
        <Text style={styles.text}>Hello!</Text>
        <Text style={styles.text}>
          You&apos;ve been invited to join Framework! Framework is a free, open
          source, decentralized & federated game platform that puts the power
          back in the hands of the players. We&apos;re excited to have you on
          board.
        </Text>
        <Text style={styles.text}>Use the code below to join Framework:</Text>
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
          <Button
            pX={20}
            pY={12}
            style={styles.btn}
            href="https://framework.solarius.me/register"
          >
            Create an account
          </Button>
        </Section>
        <Text style={styles.dimmed}>
          <br />
          or copy and paste this URL into your browser:{" "}
          <Link
            href="https://framework.solarius.me/register"
            target="_blank"
            style={styles.link}
            rel="noreferrer"
          >
            https://framework.solarius.me/register
          </Link>
        </Text>
      </EmailLayout>
    </Html>
  );
};

export default JoinFramework;
