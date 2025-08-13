import { makeApiRequest } from "../lib/helpers";

export const getMessagesForUser = async (params) => {
  const res = await makeApiRequest({
    url: "api/messages/",
    method: "GET",
    params,
  });

  // If backend returns { results: [...] } use that; otherwise assume res is already an array
  return res?.results ?? res ?? [];
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
  contentType: "application/json",
  });

  return message;
};

export const bulkDeleteMessages = async (ids) => {
  const res = await makeApiRequest({
    url: "api/messages/bulk-delete/",
    method: "POST",
    data: { ids },
  });
  return res;
};

export const updateMessage = async (id, { content }) => {
  const res = await makeApiRequest({
    url: `api/messages/${id}/`,
    method: "PATCH",
    data: { content },
    contentType: "application/json",
  });
  return res;
};
