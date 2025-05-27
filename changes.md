added the @ symbol to the login password validation logic

#problems

- Using @ symbol in the login password field causes the validation to fail
  --solution: updated the validation logic in the login page to accept the @ sign

- The messages panel does not auto scroll to the bottom(latest messages) when you open a chat
  -- solution: The chat panel now keeps track of your scroll position in a chat and returns back to that position whenever you return to the chat. if you are just opening the chat (asing the messages page just loaded) you would be scrolled to the bottom.
