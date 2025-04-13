import { makeApiRequest } from "../lib/helpers";

export const getMessagesForUser = async (params) => {
  const { results: messages } = await makeApiRequest({
    url: "api/messages/",
    method: "GET",
    params,
  });

  return messages;
};

export const messageUser = async (formData) => {
  // {
  //     "sender": null,
  //     "recipient": null,
  //     "content": "",
  // }

  const message = await makeApiRequest({
    url: "api/messages/",
    method: "POST",
    data: formData,
    contentType: "multipart/form-data",
  });

  return message;
};

export const markMessageAsRead = async (room_name, user_id, isReadLength) => {
  // if (isReadLength <= 0) return "no query";

  const message = await makeApiRequest({
    url: "api/messages/mark-all-as-read/",
    method: "POST",
    data: { room_name, user_id },
    contentType: "multipart/form-data",
  });

  return message;
};
