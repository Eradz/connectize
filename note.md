- Passing the room name to the mark_all_as_read api call makes the call not work.
- Only the sender of a message can actually mark the messages as read

So my messages (as a user) only get marked as read when:

- The person who sent me the message marks all messages as read
- I send a message to the person who sent me a message and then mark all messages as read

So i must have sent a message too that has not been marked as read to mark all messages as read.

Meaning only a sender can mark messages as read.

Important components

- src/components/messages/MessagesList.jsx
