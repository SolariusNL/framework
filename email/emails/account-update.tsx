import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Text } from "@react-email/text";
import React from "react";
import { styles } from "./framework";
import EmailLayout from "./layout";

interface AccountUpdateProps {
  content: string;
}

const AccountUpdate: React.FC<AccountUpdateProps> = ({
  content = "Your account username has been changed to <b>Framework</b>.",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Account Update</Preview>
      <EmailLayout
        title={<>Account Update</>}
        footer={
          <>
            This is an automated email to notify you that your account has been
            updated. Contact us at our{" "}
            <Link href="https://framework.solarius.me/support">
              support center
            </Link>{" "}
            if you have any questions.
          </>
        }
      >
        <Text
          style={styles.text}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </EmailLayout>
    </Html>
  );
};

export default AccountUpdate;
