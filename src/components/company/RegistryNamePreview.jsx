import { Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { verifyRegistryName } from "../../api-services/companies";

const MIN_CHARS = 3;
const DEBOUNCE_MS = 400;

/**
 * Live preview of the Nigeria oil & gas registry check while the user is still typing
 * their company name (step 1 of company creation). Read-only - the actual match gets
 * computed and persisted server-side once the company is saved (see
 * CompanyViewSet.perform_create), and confirming/rejecting a fuzzy suggestion only
 * becomes possible after that, from the edit profile page (RegistryVerificationBadge).
 */
export default function RegistryNamePreview({ companyName }) {
  const [debounced, setDebounced] = useState((companyName || "").trim());

  useEffect(() => {
    const id = setTimeout(() => setDebounced((companyName || "").trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [companyName]);

  const enabled = debounced.length >= MIN_CHARS;

  const { data, isFetching } = useQuery({
    queryKey: ["verify-registry-name", debounced],
    queryFn: () => verifyRegistryName(debounced),
    enabled,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });

  if (!enabled) return null;

  if (isFetching && !data) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
        <Spinner size="xs" /> Checking against the Nigeria Oil &amp; Gas registry...
      </p>
    );
  }

  if (!data) return null;

  if (data.confidence === "exact" && data.match) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-green-700">
        <CheckCircle2 className="size-3.5 shrink-0" />
        Matches registry record &quot;{data.match.company_name}&quot; · ID{" "}
        {data.match.registry_company_id}
      </p>
    );
  }

  if (data.confidence === "fuzzy" && data.suggestions?.length > 0) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
        <HelpCircle className="size-3.5 shrink-0" />
        Possible registry match: &quot;{data.suggestions[0].company_name}&quot; — you can
        confirm this from your company profile after saving.
      </p>
    );
  }

  return null;
}
