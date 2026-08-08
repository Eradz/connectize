// Mirrors authentication/models.py's looks_like_business_name() on the backend
// (and ConnectizeMobile's src/lib/businessNameHeuristic.ts). Keep all three in
// sync if the marker list or structural rules change.
const BUSINESS_NAME_MARKERS = new Set([
  "ltd", "llc", "inc", "incorporated", "corp", "corporation", "co",
  "group", "enterprise", "enterprises", "solutions", "ventures",
  "company", "companies", "holding", "holdings", "partners",
  "agency", "services", "industries", "plc", "gmbh", "limited",
  "associates", "technologies", "consulting", "trading", "resources",
  // Evidence-based: seen in real flagged profile names.
  "integrated", "multi", "purpose", "global",
  // Nigeria / West Africa + this platform's oil & gas niche.
  "nigeria", "petroleum", "logistics", "oil", "gas", "energy", "energies",
  // Spanish / French legal entity forms.
  "sa", "sas", "sl", "srl", "sarl", "cia", "compania",
]);

export const looksLikeBusinessName = (value) => {
  const text = (value || "").trim();
  if (!text) return false;

  const words = text.toLowerCase().split(/[^a-z0-9]+/i).filter(Boolean);
  if (words.some((word) => BUSINESS_NAME_MARKERS.has(word))) return true;

  if (/[0-9&@+]/.test(text)) return true;
  if (words.length > 3) return true;

  return false;
};

export const BUSINESS_NAME_WARNING =
  "This looks like a company name. Please enter your own name here — " +
  "you can create a company profile after completing your profile.";
