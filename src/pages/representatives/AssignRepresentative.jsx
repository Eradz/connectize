import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getCompanyByIdOrEmail } from "../../api-services/companies";
import {
  getAllRepresentatives,
  getOrCreateRepresentativeCategory,
} from "../../api-services/representatives";
import { getAllUsers } from "../../api-services/users";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import { RepresentativesList } from "../../components/representatives/RepresentativesList";
import { UserList } from "../../components/representatives/UserList";
import { UserSearchInput } from "../../components/representatives/UserSearchInput";
import Restricted from "../../components/Restricted";
import SEO, { createSEO } from "../../components/SEO";

export const meta = () =>
  createSEO({
    title: "Assign Representative | Connectize",
    description: "Manage and assign company representatives on Connectize to expand your business network.",
  keywords: "assign representative, company management, delegates, Connectize",
  });

import { useCustomQuery } from "../../context/queryContext";
import { useAuth } from "../../context/userContext";
import { UserType } from "../../lib/helpers/types";

export default function AssignRepresentative() {
  const [username, setUsername] = useState("");
  const { user: currentUser } = useAuth();
  const { refetchInterval } = useCustomQuery();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: username.length > 0, // ✅ Only fetch when searching
    staleTime: 5 * 60 * 1000, // ✅ Cache for 5 minutes
  });

  const { data: companies, isLoading: companyLoading } = useQuery({
    // gets its own unique queryKey in order to not collide with other similar queries cause that was causing a bug before
    queryKey: ["companies", "assign-reps"],
    queryFn: async () => getCompanyByIdOrEmail(undefined, true),
  });

  const company_id = companies?.[0]?.id;

  // console.log("Company id", company_id, companies);

  const { data: representatives, isLoading: repsLoading } = useQuery({
    queryKey: ["representatives", company_id],
    queryFn: () => getAllRepresentatives({ company_id }),
    enabled: !!company_id,
    staleTime: 2 * 60 * 1000, // ✅ Cache for 2 minutes, no constant polling
  });

  const { data: representativeCategories, isLoading: repsCatLoading } =
    useQuery({
      queryKey: ["representatives-categories"],
      queryFn: getOrCreateRepresentativeCategory,
    });

  const filteredUsers = useMemo(() => {
    return users?.filter((user) => {
      const thisUsername = (user?.first_name + user?.last_name)
        ?.toString()
        .toLowerCase();
      const currentUsername = (currentUser?.first_name + currentUser?.last_name)
        ?.toString()
        ?.toLowerCase();
      const isCurrentUser = currentUsername === thisUsername;
      const isUsernameValid =
        user?.first_name !== null && user?.first_name !== undefined;

      if (username?.trim()) {
        return (
          isUsernameValid &&
          thisUsername.includes(username.toLowerCase().trim()) &&
          !isCurrentUser
        );
      }

      return isUsernameValid && !isCurrentUser;
    });
  }, [users, username, currentUser]);

  const [cachedReps, setCachedReps] = useState([]);

  useEffect(() => {
    setCachedReps(representatives);
  }, [representatives]);

  // ✅ Memoize category lookup map for O(1) access
  const categoryMap = useMemo(() => {
    return representativeCategories?.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});
  }, [representativeCategories]);

  // ✅ Memoize user lookup map for O(1) access  
  const userMap = useMemo(() => {
    return users?.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
  }, [users]);

  const memoizedRepresentatives = useMemo(() => {
    return cachedReps?.map((reps) => {
      // ✅ API returns nested objects, not IDs
      const user = typeof reps?.user === 'object' ? reps.user : userMap?.[reps?.user];
      const category = typeof reps?.category === 'object' ? reps.category : categoryMap?.[reps?.category];
      const company = typeof reps?.company === 'object' ? reps.company : companies?.[0];
      
      return {
        id: reps?.id,
        user,
        company,
        status: reps?.status,
        role: category?.type,
        category: category?.id,
        invited: reps?.invited,
        permissions: reps?.permissions || [],
      };
    });
  }, [cachedReps, userMap, categoryMap, companies]);

  // console.log("Com", company_id, "Reps", representatives);
  return currentUser?.user_type === UserType ? (
    <Restricted fallback="assigning new representatives" />
  ) : (
    <section className="max-md:container p-3">
      <section className="space-y-6">
        <div className="">
          <HeadingText>Assign Representatives</HeadingText>
          <LightParagraph>
            Assign representatives to manage your company on connectize and
            specify the role of representation{" "}
            <strong className="text-black">
              (e.g human resources, technical, commercial)
            </strong>
          </LightParagraph>
        </div>
        {/* Company ID{company_id} <br />
        Re{JSON.stringify(representatives?.length)} */}
        <UserSearchInput username={username} setUsername={setUsername} />
        <UserList
          isLoading={isLoading}
          filteredUsers={filteredUsers}
          setCachedReps={setCachedReps}
        />
        <RepresentativesList
          isLoading={repsLoading || companyLoading || repsCatLoading}
          representatives={memoizedRepresentatives}
          setCachedReps={setCachedReps}
        />
      </section>
    </section>
  );
}
