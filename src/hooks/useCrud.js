import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/utils";

export const useCrudQuery = (key, fetchFn) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : key,
    queryFn: fetchFn,
  });
};

export const useCrudCreate = (key, createFn, onClose) => {
  return useMutation({
    mutationFn: createFn,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousData = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old = []) => [
        ...old,
        { ...newItem, optimistic: true },
      ]);

      return { previousData };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(key, context?.previousData);
    },
    onSuccess: () => {
      onClose?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCrudUpdate = (key, updateFn, onClose) => {
  return useMutation({
    mutationFn: updateFn,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousData = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old = []) =>
        old.map((item) =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        )
      );

      return { previousData };
    },
    onError: (err, updatedItem, context) => {
      queryClient.setQueryData(key, context?.previousData);
    },
    onSuccess: () => {
      onClose?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};

export const useCrudDelete = (key, deleteFn) => {
  return useMutation({
    mutationFn: deleteFn,
    onMutate: async (deletedItemId) => {
      await queryClient.cancelQueries({ queryKey: key });

      const previousData = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (old = []) =>
        old.filter((item) => item.id !== deletedItemId)
      );

      return { previousData };
    },
    onError: (err, deletedItemId, context) => {
      queryClient.setQueryData(key, context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};
