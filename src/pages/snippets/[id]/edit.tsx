import { Affix, Button, Grid, Loader, Transition, useMantineColorScheme } from "@mantine/core";
import Editor from "@monaco-editor/react";
import { CodeSnippet } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { HiSave } from "react-icons/hi";
import Framework from "../../../components/Framework";
import authorizedRoute from "../../../util/authorizedRoute";
import { getCookie } from "../../../util/cookies";
import prisma from "../../../util/prisma";
import { User } from "../../../util/prisma-types";

interface EditSnippetProps {
  user: User;
  snippet: CodeSnippet;
}

const EditSnippet: NextPage<EditSnippetProps> = ({ user, snippet }) => {
  const [dirty, setDirty] = React.useState(false);
  const [code, setCode] = React.useState(snippet.code);
  const [updatedCode, setUpdatedCode] = React.useState(snippet.code);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  globalThis.onbeforeunload = (event: BeforeUnloadEvent) => {
    const message = "You have unsaved changes.";

    if (typeof event == "undefined") {
      (event as Event | undefined) = window.event;
    }
    if (event && dirty) {
      event.returnValue = message;
    }

    if (dirty) {
      return message;
    }

    return;
  };

  const saveChanges = async () => {
    await fetch(`/api/snippets/${snippet.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        code,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDirty(false);
          setUpdatedCode(code);
        } else {
          alert(
            "Something went wrong, and your changes were not saved. Please try again."
          );
        }
      })
      .catch((err) => {
        alert(
          "Something went wrong, and your changes were not saved. Please try again."
        );
      });
  };

  return (
    <>
      <Head>
        {/* @ts-ignore */}
        <style>
          {`
            html, body {
              overflow: hidden;
            }
          `}
        </style>
      </Head>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={dirty}>
          {(styles) => (
            <Button
              size="lg"
              fullWidth
              leftIcon={<HiSave />}
              onClick={saveChanges}
              disabled={!dirty}
              style={styles}
            >
              {dirty ? "Save Changes" : "Saved"}
            </Button>
          )}
        </Transition>
      </Affix>

      <Framework user={user} activeTab="none" noPadding>
        <Editor
          defaultLanguage="typescript"
          defaultValue={snippet.code}
          loading={<Loader size="xl" />}
          className="monaco-editor"
          onChange={(val) => {
            if (val !== updatedCode) {
              setDirty(true);
            }

            setCode(String(val));
          }}
          options={{
            theme: dark ? "vs-dark" : "vs",
          }}
        />
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const auth = await authorizedRoute(context, true, false);

  if (auth.redirect) {
    return auth;
  }

  const snippet = await prisma.codeSnippet.findFirst({
    where: { id: String(id), userId: auth.props.user?.id },
  });

  if (!snippet) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
      snippet: JSON.parse(JSON.stringify(snippet)),
    },
  };
}

export default EditSnippet;
