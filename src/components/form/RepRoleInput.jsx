import { Avatar, Checkbox, Spinner } from "@chakra-ui/react";
import { CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { getCompanyByIdOrEmail } from "../../api-services/companies";
import {
  assignRepresentative,
  getAvailableRepresentativePermissions,
} from "../../api-services/representatives";
import Modal from "../ui/Modal";

const ALL_COMPANY_CODES = [
  "company_post",
  "company_manage_products",
  "company_edit_profile",
  "company_manage_events",
  "company_view_analytics",
  "company_manage_jobs",
  "company_respond_reviews",
  "company_manage_representatives",
];

const TEMPLATE_DEFAULT_PERMISSIONS = {
  human_resources: ["company_post", "company_manage_jobs", "company_view_analytics"],
  technical: ["company_post", "company_manage_products"],
  commercial: ["company_post", "company_manage_products", "company_respond_reviews", "company_view_analytics"],
  marketing: ["company_post", "company_manage_events", "company_respond_reviews"],
  cofounder: ALL_COMPANY_CODES,
  partner: ["company_post", "company_view_analytics"],
  developer: ["company_post", "company_manage_products"],
  product_designer: ["company_post", "company_manage_products"],
  custom: [],
};

const ROLE_TEMPLATES = [
  { id: "human_resources", label: "Human Resources", description: "Manages hiring, team profiles, and HR communications for the company.", emoji: "👥", color: "#4CAF50" },
  { id: "technical", label: "Technical", description: "Oversees technical content, products, and services.", emoji: "🔧", color: "#2196F3" },
  { id: "commercial", label: "Commercial", description: "Handles business partnerships and commercial activity.", emoji: "💼", color: "#FF9800" },
  { id: "marketing", label: "Marketing", description: "Creates content and manages brand presence on Connectize.", emoji: "📣", color: "#E91E63" },
  { id: "cofounder", label: "Co-Founder", description: "Full access to manage the company and all its representatives.", emoji: "👑", color: "#d4af37" },
  { id: "partner", label: "Partner", description: "Represents the company in external partnerships.", emoji: "🤝", color: "#9C27B0" },
  { id: "developer", label: "Developer", description: "Manages software development updates and technical listings.", emoji: "💻", color: "#00BCD4" },
  { id: "product_designer", label: "Product Designer", description: "Manages design assets and visual product listings.", emoji: "🎨", color: "#FF5722" },
  { id: "custom", label: "Custom Role", description: "Define a custom role specific to your company.", emoji: "✏️", color: "#607D8B" },
];

export default function RepRoleInput({ user }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [customRole, setCustomRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companies } = useQuery({
    queryKey: ["companies", "assign-reps"],
    queryFn: () => getCompanyByIdOrEmail(undefined, true),
    staleTime: 5 * 60 * 1000,
  });

  const { data: availablePermissions = [] } = useQuery({
    queryKey: ["available-permissions"],
    queryFn: getAvailableRepresentativePermissions,
    staleTime: 10 * 60 * 1000,
  });

  const permissionLabel = useMemo(
    () => Object.fromEntries(availablePermissions.map((p) => [p.code, p.label])),
    [availablePermissions]
  );

  const handleOpen = () => {
    setSelectedTemplate(null);
    setSelectedPermissions([]);
    setCustomRole("");
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    if (templateId === "cofounder") {
      setSelectedPermissions(availablePermissions.map((p) => p.code));
    } else {
      const defaults = TEMPLATE_DEFAULT_PERMISSIONS[templateId] || [];
      setSelectedPermissions(
        defaults.filter((code) => availablePermissions.some((p) => p.code === code))
      );
    }
  };

  const handleTogglePermission = (code) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleAssign = async () => {
    if (!companies?.[0]) return;
    const template = ROLE_TEMPLATES.find((t) => t.id === selectedTemplate);
    const roleName =
      selectedTemplate === "custom" ? customRole.trim() : template?.label || "";
    if (!roleName) return;

    setIsSubmitting(true);
    try {
      const value = await assignRepresentative({
        user,
        company: companies[0],
        role: roleName,
        permissions: selectedPermissions,
      });
      if (value?.category || value?.id) {
        queryClient.invalidateQueries({ queryKey: ["representatives"] });
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAssign =
    !!selectedTemplate &&
    (selectedTemplate !== "custom" || customRole.trim().length > 0) &&
    !isSubmitting;

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-gold text-white text-sm font-semibold rounded-full hover:bg-gold/80 active:scale-95 transition-all duration-200"
      >
        <PlusIcon />
        Assign
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Assign Representative" size="md">
        {/* User preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
          <Avatar
            src={user?.avatar || ""}
            name={`${user?.first_name} ${user?.last_name}`}
            size="md"
          />
          <div>
            <p className="font-semibold text-sm text-gray-800">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <p className="text-sm font-bold text-gray-800 mb-0.5">Select a Role</p>
        <p className="text-xs text-gray-400 mb-3">
          This defines what {user?.first_name} can do for your company.
        </p>

        {/* Role template list */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {ROLE_TEMPLATES.map((item) => {
            const active = selectedTemplate === item.id;
            const defaults =
              item.id === "cofounder"
                ? availablePermissions.map((p) => p.code)
                : TEMPLATE_DEFAULT_PERMISSIONS[item.id] || [];
            const visible = defaults.slice(0, 2);
            const remaining = defaults.length - 2;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTemplate(item.id)}
                className={clsx(
                  "w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150",
                  active
                    ? "border-gold bg-amber-50"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <span
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: item.color + "22" }}
                >
                  {item.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={clsx(
                      "text-sm font-semibold",
                      active ? "text-gold" : "text-gray-800"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                  {visible.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {visible.map((code) => (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: item.color + "18",
                            color: item.color,
                          }}
                        >
                          ✓ {permissionLabel[code] || code}
                        </span>
                      ))}
                      {remaining > 0 && (
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: item.color }}
                        >
                          +{remaining} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {active && (
                  <CheckIcon className="flex-shrink-0 text-gold mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom role input */}
        <AnimatePresence>
          {selectedTemplate === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              <input
                type="text"
                placeholder="Enter custom role name…"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gold rounded-xl focus:outline-none bg-amber-50 placeholder:text-gray-400"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permissions section */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700">
                    🛡️ Permissions
                  </p>
                  <span className="text-xs text-gray-400 font-semibold">
                    {selectedPermissions.length}/{availablePermissions.length}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Customise what {user?.first_name} can do. Toggle permissions on or off.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(({ code, label }) => (
                    <Checkbox
                      key={code}
                      isChecked={selectedPermissions.includes(code)}
                      onChange={() => handleTogglePermission(code)}
                      colorScheme="yellow"
                      size="sm"
                    >
                      <span className="text-xs text-gray-600">{label}</span>
                    </Checkbox>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!canAssign}
            className="flex-[2] py-2.5 text-sm font-semibold text-white bg-gold rounded-xl hover:bg-gold/80 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="xs" /> : "Assign Role & Invite"}
          </button>
        </div>
      </Modal>
    </>
  );
}
