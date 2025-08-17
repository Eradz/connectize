import { useQuery } from "@tanstack/react-query";
import {
  getAllCompanies,
  getCompanyByIdOrEmail,
  getSingleCompany,
} from "../api-services/companies";
import { getMessagesForUser } from "../api-services/messaging";
import { getPosts } from "../api-services/posts";
import { getAllUsers, getUserById } from "../api-services/users";
import { useAuth } from "../context/userContext";

export const messagesQueryKey = ["messages"];

export const useCompanies = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["allConnectizeCompanies"],
    queryFn: async () => await getAllCompanies(),
    enabled: !!currentUser,
  });
};

export const useGetSingleUser = () => {
  const { user: currentUser } = useAuth();

  return (id) =>
    useQuery({
      queryKey: ["users", id],
      queryFn: () => getUserById(id),
      enabled: !!currentUser,
    });
};
export const useUsers = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser,
  });
};

export const useGetCurrentCompany = (id, enabled = true) => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["myCompanies", id],
    queryFn: () => getCompanyByIdOrEmail(id),
    enabled: !!currentUser && enabled,
  });
};
export const useGetSingleCompany = (name, { enabled = true }) => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: ["company", name],
    queryFn: () => getSingleCompany(name),
    enabled: !!currentUser && enabled,
  });
};

export const useGetMessages = () => {
  const { user: currentUser } = useAuth();
  return useQuery({
    queryKey: messagesQueryKey,
    queryFn: getMessagesForUser,
    enabled: !!currentUser,
    refetchInterval: 1000,
  });
};

export const usePosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    refetchInterval: 3000,
  });
};
