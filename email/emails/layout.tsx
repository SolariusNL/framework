import { Container } from "@react-email/container";
import { Hr } from "@react-email/hr";
import { Img } from "@react-email/img";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { styles } from "./framework";

interface EmailLayoutProps {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const EmailLayout: React.FC<EmailLayoutProps> = ({
  title,
  children,
  footer,
}) => {
  return (
    <Section style={styles.main}>
      <Container style={styles.container}>
        <Section style={{ marginTop: "32px" }}>
          <Img
            src="https://cloud.soodam.rocks/index.php/s/HdJMkjfyxJ5LTPT/preview"
            width="50"
            height="50"
            alt="Soodam.re Logo"
            style={styles.logo}
          />
        </Section>
        <Text style={styles.h1}>{title}</Text>
        {children}
        <Hr style={styles.hr} />
        <Text style={styles.footer}>{footer}</Text>
        <Text style={styles.footer}>
          Copyright © 2021-2023 Soodam.re B.V. All rights reserved.
        </Text>
      </Container>
    </Section>
  );
};

export default EmailLayout;
