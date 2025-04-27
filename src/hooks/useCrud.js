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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      onClose?.();
    },
  });
};

export const useCrudUpdate = (key, updateFn, onClose) => {
  return useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      onClose?.();
    },
  });
};

export const useCrudDelete = (key, deleteFn) => {
  return useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
};
