import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { clearRegistryMatch, confirmRegistryMatch } from "../../api-services/companies";

/**
 * Shows the Nigeria oil & gas registry match already computed server-side for this
 * company (see Company.registry_verification). Exact matches are trusted outright;
 * fuzzy matches need the owner to confirm or reject before they're treated as verified.
 *
 * `editable` controls whether Confirm/Not-my-company actions are offered - the backend
 * already rejects those calls from non-owners, but an unconfirmed suggestion also isn't
 * useful to show a random visitor on the public profile, so pass editable={isCurrentUser}
 * there and it's hidden entirely until the owner has confirmed it.
 */
export default function RegistryVerificationBadge({ company, editable = true }) {
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const registry = company?.registry_verification;

  if (!registry) return null;

  const isTrusted = registry.confidence === "exact" || registry.confirmed;

  if (!isTrusted && !editable) return null;

  const handleDecision = async (action) => {
    setBusy(true);
    const toastId = toast.loading(
      action === "confirm" ? "Confirming registry match" : "Clearing registry match"
    );
    try {
      if (action === "confirm") {
        await confirmRegistryMatch(company.slug, registry.registry_company_id);
        toast.success("Registry match confirmed", { id: toastId });
      } else {
        await clearRegistryMatch(company.slug);
        toast.success("Registry match cleared", { id: toastId });
      }
      await queryClient.invalidateQueries({ queryKey: ["myCompanies"] });
      // Partial match: invalidates usePollCurrentCompany's ["companies", companyName]
      // regardless of whether companyName is the slug or the display name.
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    } catch (err) {
      toast.error("Something went wrong, please try again", { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  if (isTrusted) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-4 py-3">
        <CheckCircle2 className="size-5 shrink-0 text-green-600" />
        <p className="text-sm text-green-800">
          Matches Nigeria Oil &amp; Gas registry record{" "}
          <span className="font-semibold">{registry.registry_company_name}</span>{" "}
          <span className="text-green-600">· ID {registry.registry_company_id}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-md border border-amber-100 bg-amber-50 p-4">
      <div className="flex items-start gap-2">
        <HelpCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm text-amber-900">
            We found a possible registry match:{" "}
            <span className="font-semibold">{registry.registry_company_name}</span>{" "}
            <span className="text-amber-700">· ID {registry.registry_company_id}</span>. Is
            this your company?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDecision("confirm")}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              Yes, that's us
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDecision("clear")}
              className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
            >
              Not my company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
