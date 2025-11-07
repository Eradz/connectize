import { makeApiRequest } from "../lib/helpers/index";

export const getMessagesForUser = async (params) => {
  const res = await makeApiRequest({
    url: "api/messages/",
    method: "GET",
    params,
  });

  // If backend returns { results: [...] } use that; otherwise assume res is already an array
  return res?.results ?? res ?? [];
};

export const getFavoriteChats = async () => {
  const { favorites } = await makeApiRequest({
    url: "api/messages/favorite-chats/",
    method: "GET",
  });

  return favorites || [];
};

export const favoriteChat = async ({ room_name, markAsFavorite = true }) => {
  const formData = new FormData();

  formData.set("room_name", room_name);
  const favoritedRespose = await makeApiRequest({
    url: markAsFavorite
      ? "api/messages/favorite-chat/"
      : "api/messages/unfavorite-chat/",
    method: "POST",
    // params: { room_name },
    data: formData,
    contentType: "multipart/form-data",
  });

  return favoritedRespose;
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
