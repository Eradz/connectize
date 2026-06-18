import { Avatar } from "@chakra-ui/react";
import { BuildingOffice2Icon, UserIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { avatarStyle } from "../ResponsiveNav";
import { getUserDisplayName, getUserHandle } from "../../lib/userDisplay";

const normalizeToken = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCompanyDisplayName = (company = {}) =>
  company.company_name || company.name || company.slug || "";

const getUserMentionToken = (user = {}) =>
  normalizeToken(
    getUserHandle(user) ||
      getUserDisplayName(user) ||
      (user.id ? `user-${user.id}` : "")
  );

const getCompanyMentionToken = (company = {}) =>
  normalizeToken(
    company.slug ||
      getCompanyDisplayName(company) ||
      (company.id ? `company-${company.id}` : "")
  );

const getMentionTrigger = (value, cursorPosition) => {
  if (typeof cursorPosition !== "number") return null;

  for (let index = cursorPosition - 1; index >= 0; index -= 1) {
    const character = value[index];

    if (character === "@") {
      const previousCharacter = index > 0 ? value[index - 1] : " ";
      const query = value.slice(index + 1, cursorPosition);

      if (!/\s/.test(previousCharacter) && previousCharacter !== "(" && previousCharacter !== "[") {
        return null;
      }

      if (/\s/.test(query)) return null;

      return {
        start: index,
        end: cursorPosition,
        query,
      };
    }

    if (/\s/.test(character)) break;
  }

  return null;
};

const buildMentionResults = (users = [], companies = [], query = "") => {
  const lowerQuery = query.toLowerCase();

  const matchedUsers = users
    .filter((user) => {
      if (!lowerQuery) return true;

      const fullName = user.full_name?.toLowerCase() || "";
      const firstName = user.first_name?.toLowerCase() || "";
      const lastName = user.last_name?.toLowerCase() || "";
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";

      return (
        fullName.includes(lowerQuery) ||
        firstName.includes(lowerQuery) ||
        lastName.includes(lowerQuery) ||
        username.includes(lowerQuery) ||
        email.includes(lowerQuery)
      );
    })
    .slice(0, 4)
    .map((user) => ({ ...user, type: "user" }));

  const matchedCompanies = companies
    .filter((company) => {
      if (!lowerQuery) return true;

      const name = company.company_name?.toLowerCase() || "";
      const slug = company.slug?.toLowerCase() || "";
      const tagline = company.tag_line?.toLowerCase() || "";

      return (
        name.includes(lowerQuery) ||
        slug.includes(lowerQuery) ||
        tagline.includes(lowerQuery)
      );
    })
    .slice(0, 4)
    .map((company) => ({ ...company, type: "company" }));

  return [...matchedUsers, ...matchedCompanies];
};

const MentionSuggestion = ({ item, onSelect }) => (
  <button
    type="button"
    onMouseDown={(event) => {
      event.preventDefault();
      onSelect(item);
    }}
    className="w-full flex items-center gap-3 px-3 py-2 text-left border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
  >
    {item.type === "user" ? (
      <>
        <Avatar
          name={getUserDisplayName(item)}
          src={item.avatar}
          size="sm"
          className={avatarStyle}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900">
            {getUserDisplayName(item)}
          </div>
          <div className="truncate text-xs text-blue-600">
            @{getUserMentionToken(item)} • User
          </div>
        </div>
        <UserIcon className="h-4 w-4 flex-shrink-0 text-blue-500" />
      </>
    ) : (
      <>
        <Avatar
          name={item.company_name}
          src={item.logo}
          size="sm"
          className={avatarStyle}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900">
            {getCompanyDisplayName(item) || "Company"}
          </div>
          <div className="truncate text-xs text-green-600">
            @{getCompanyMentionToken(item)} • Company
          </div>
        </div>
        <BuildingOffice2Icon className="h-4 w-4 flex-shrink-0 text-green-500" />
      </>
    )}
  </button>
);

const MentionTextarea = forwardRef(
  (
    {
      value = "",
      onValueChange,
      users = [],
      companies = [],
      className,
      wrapperClassName,
      onBlur,
      onClick,
      onKeyUp,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef(null);
    const [trigger, setTrigger] = useState(null);

    const setTextareaRef = useCallback(
      (node) => {
        internalRef.current = node;

        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    const results = useMemo(
      () => (trigger ? buildMentionResults(users, companies, trigger.query) : []),
      [companies, trigger, users]
    );

    const updateTrigger = useCallback((nextValue, cursorPosition) => {
      setTrigger(getMentionTrigger(nextValue, cursorPosition));
    }, []);

    const handleChange = (event) => {
      const nextValue = event.target.value;
      onValueChange?.(nextValue, event);
      updateTrigger(nextValue, event.target.selectionStart);
    };

    const handleClick = (event) => {
      onClick?.(event);
      updateTrigger(value, event.currentTarget.selectionStart);
    };

    const handleKeyUp = (event) => {
      onKeyUp?.(event);
      updateTrigger(event.currentTarget.value, event.currentTarget.selectionStart);
    };

    const handleBlur = (event) => {
      onBlur?.(event);
      window.setTimeout(() => setTrigger(null), 120);
    };

    const handleSelect = (item) => {
      if (!trigger) return;

      const mentionName =
        item.type === "user"
          ? getUserMentionToken(item)
          : getCompanyMentionToken(item);
      const nextValue = `${value.slice(0, trigger.start)}@${mentionName} ${value.slice(trigger.end)}`;
      const nextCursorPosition = trigger.start + mentionName.length + 2;

      onValueChange?.(nextValue);
      setTrigger(null);

      window.requestAnimationFrame(() => {
        internalRef.current?.focus();
        internalRef.current?.setSelectionRange(nextCursorPosition, nextCursorPosition);
      });
    };

    return (
      <div className={clsx("relative", wrapperClassName)}>
        <textarea
          {...props}
          ref={setTextareaRef}
          value={value}
          onChange={handleChange}
          onClick={handleClick}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          className={className}
        />

        {trigger && results.length > 0 && (
          <div className="absolute left-0 top-full z-[1200] mt-2 w-72 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
            {results.map((item) => (
              <MentionSuggestion
                key={`${item.type}-${item.id}`}
                item={item}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

MentionTextarea.displayName = "MentionTextarea";

export default MentionTextarea;
