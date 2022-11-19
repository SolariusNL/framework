import { Avatar, Button, Table, Text } from "@mantine/core";
import { UserAdminNotes } from "@prisma/client";
import { useEffect, useState } from "react";
import getMediaUrl from "../../util/getMedia";
import { NonUser } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import Stateful from "../Stateful";
import Note from "./Note";

interface NoteTable {
  user: NoteUser;
}

export interface NoteUser extends NonUser {
  notes: Array<
    {
      author: NonUser;
      user: NonUser;
    } & UserAdminNotes
  >;
}

const NoteTable: React.FC<NoteTable> = ({ user }) => {
  const [notes, setNotes] = useState(user.notes);

  useEffect(() => {
    setNotes(user.notes);
  }, [user]);

  return (
    <>
      <Text size="sm" color="dimmed" weight={500} mb={8}>
        {user.username} - Notes
      </Text>
      <Table striped mb={8}>
        <thead>
          <tr>
            <th>Author</th>
            <th>Note</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {notes
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((note) => (
              <tr key={note.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <Avatar
                      size={24}
                      src={getMediaUrl(note.author.avatarUri)}
                    />
                    {note.author.username}
                  </div>
                </td>
                <td>{note.content}</td>
                <td>{new Date(note.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          {notes.length === 0 && (
            <tr>
              <td colSpan={3}>
                <ModernEmptyState
                  title="No notes"
                  body="This user has no notes."
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Stateful>
        {(open, setOpen) => (
          <>
            <Button variant="subtle" onClick={() => setOpen(true)}>
              Add note
            </Button>
            <Note
              user={user}
              opened={open}
              setOpened={setOpen}
              onNoteCreated={(note) => {
                setNotes(
                  notes.concat({
                    ...note,
                  })
                );
              }}
            />
          </>
        )}
      </Stateful>
    </>
  );
};

export default NoteTable;
