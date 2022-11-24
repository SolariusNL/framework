import { Message as Msg } from "../../util/prisma-types";
import Message from "./Message";

interface Inbox {
  messages: Msg[];
}

const Inbox: React.FC<Inbox> = ({ messages }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {messages.map((message) => (
        <Message message={message} key={message.id} />
      ))}
    </div>
  );
};

export default Inbox;
