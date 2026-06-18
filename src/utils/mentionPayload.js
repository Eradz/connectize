import { getUserDisplayName, getUserHandle } from "../lib/userDisplay";

const mentionPattern = /(^|[\s([{*_~])@([A-Za-z0-9_][A-Za-z0-9_-]*)/g;

const normalizeToken = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCompanyDisplayName = (company) =>
  company?.company_name || company?.name || company?.slug || "";

const tokenMatches = (token, values) => {
  const normalizedToken = normalizeToken(token);
  return values.filter(Boolean).some((value) => normalizeToken(value) === normalizedToken);
};

export const extractMentionIdsFromText = (text = "", users = [], companies = []) => {
  const tokens = [];
  let match;

  mentionPattern.lastIndex = 0;
  while ((match = mentionPattern.exec(text)) !== null) {
    tokens.push(match[2]);
  }

  if (!tokens.length) {
    return { mentions: [], companyMentions: [] };
  }

  const mentions = new Set();
  const companyMentions = new Set();

  tokens.forEach((token) => {
    const user = users.find((item) =>
      tokenMatches(token, [
        item?.username,
        getUserHandle(item),
        getUserDisplayName(item),
      ])
    );

    if (user?.id) {
      mentions.add(Number(user.id));
      return;
    }

    const company = companies.find((item) =>
      tokenMatches(token, [
        item?.slug,
        item?.company_name,
        item?.name,
        getCompanyDisplayName(item),
      ])
    );

    if (company?.id) {
      companyMentions.add(Number(company.id));
    }
  });

  return {
    mentions: Array.from(mentions).filter(Number.isFinite),
    companyMentions: Array.from(companyMentions).filter(Number.isFinite),
  };
};

export const appendMentionIdsToFormData = (formData, mentionPayload = {}) => {
  if (mentionPayload.mentions?.length) {
    formData.append("mentions", JSON.stringify(mentionPayload.mentions));
  }

  if (mentionPayload.companyMentions?.length) {
    formData.append("company_mentions", JSON.stringify(mentionPayload.companyMentions));
  }
};
