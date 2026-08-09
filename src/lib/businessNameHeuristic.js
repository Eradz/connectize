import axios from "axios";
import { baseURL } from "./helpers";

// Mirrors authentication/models.py's looks_like_business_name() on the backend
// (and ConnectizeMobile's src/lib/businessNameHeuristic.ts). Keep all three in
// sync if the structural rules change. The marker *words* are admin-editable
// (BusinessNameMarker) — this set is only the seed/fallback used until
// fetchBusinessNameMarkers() resolves, or if that request fails.
const DEFAULT_BUSINESS_NAME_MARKERS = new Set([
  "ltd", "llc", "inc", "incorporated", "corp", "corporation", "co",
  "group", "enterprise", "enterprises", "solutions", "ventures",
  "company", "companies", "holding", "holdings", "partners",
  "agency", "services", "industries", "plc", "gmbh", "limited",
  "associates", "technologies", "consulting", "trading", "resources",
  "integrated", "multi", "purpose", "global",
  "nigeria", "petroleum", "logistics", "oil", "gas", "energy", "energies",
  "sa", "sas", "sl", "srl", "sarl", "cia", "compania",
]);

export const looksLikeBusinessName = (value, extraMarkers = []) => {
  const text = (value || "").trim();
  if (!text) return false;

  const markers = extraMarkers.length
    ? new Set([...DEFAULT_BUSINESS_NAME_MARKERS, ...extraMarkers])
    : DEFAULT_BUSINESS_NAME_MARKERS;

  const words = text.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
  if (words.some((word) => markers.has(word))) return true;

  if (/[0-9&@+]/.test(text)) return true;
  if (words.length > 3) return true;

  return false;
};

export const BUSINESS_NAME_WARNING =
  "This looks like a company name. Please enter your own name here — " +
  "you can create a company profile after completing your profile.";

// Fetches the live, admin-editable marker list so the "looks like a company
// name" check reflects new words without a redeploy. Falls back to an empty
// list on failure — callers should merge with DEFAULT_BUSINESS_NAME_MARKERS
// (handled automatically by looksLikeBusinessName) rather than fail loudly.
export const fetchBusinessNameMarkers = async () => {
  try {
    const { data } = await axios.get(`${baseURL}/api/auth/business-name-markers/`);
    return data?.results?.markers || [];
  } catch {
    return [];
  }
};
