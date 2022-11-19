import { Button, Modal, Text, Textarea } from "@mantine/core";
import { UserAdminNotes } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { NonUser } from "../../util/prisma-types";

interface NoteProps {
  user: NonUser;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  onNoteCreated?: (
    note: UserAdminNotes & {
      user: NonUser;
      author: NonUser;
    }
  ) => void;
}

const Note: React.FC<NoteProps> = ({
  user,
  opened,
  setOpened,
  onNoteCreated,
}) => {
  const [note, setNote] = useState("");

  return (
    <Modal title="Note" opened={opened} onClose={() => setOpened(false)}>
      <Text mb={6}>
        You are authoring a note for {user.username}. This note will be visible
        to all admins, and cannot be edited or deleted.
      </Text>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.currentTarget.value)}
        minLength={3}
        maxLength={1024}
        label="Note"
        description="Enter the contents of the note here. Be sure to be as descriptive as possible, and to include any relevant information."
        required
      />
      <Button
        mt={12}
        onClick={async () => {
          await fetch(`/api/admin/users/${user.id}/note/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
            body: JSON.stringify({ note }),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.error) {
                alert(res.error);
              } else {
                setOpened(false);
                if (onNoteCreated) onNoteCreated(res.note);
                setNote("");
              }
            });
        }}
      >
        Save
      </Button>
    </Modal>
  );
};

export default Note;
