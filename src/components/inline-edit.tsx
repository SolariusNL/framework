import React, { useEffect, useRef, useState } from "react";

type InlineEditProps<T> = {
  content: T;
  onSave: (newContent: T) => void;
  render: (content: T, startEditing: () => void) => React.ReactNode;
};

function InlineEdit<T>({ content, onSave, render }: InlineEditProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div>
      {isEditing ? (
        <div>
          {render(editedContent, () => {
            handleSave();
          })}
          <button onClick={handleSave}>Save</button>
          <button onClick={handleEditCancel}>Cancel</button>
        </div>
      ) : (
        <div onClick={handleEditStart}>{render(content, handleEditStart)}</div>
      )}
    </div>
  );
}

export default InlineEdit;
