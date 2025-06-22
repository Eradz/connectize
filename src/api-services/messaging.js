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
  const message = await makeApiRequest({
    url: "api/messages/",
    method: "POST",
    data: formData,
    contentType: "multipart/form-data",
  });

  return message;
};

export const markMessageAsRead = async (room_name) => {
  const message = await makeApiRequest({
    url: "api/messages/mark-all-as-read/",
    method: "POST",
    data: { room_name },
    contentType: "multipart/form-data",
  });

  return message;
};
