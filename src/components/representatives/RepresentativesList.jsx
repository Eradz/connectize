import { Badge, Switch, Checkbox } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  cancelOrDeclineRepRequest,
  changeRepStatus,
  resendRepInvitation,
  updateRepresentativePermissions,
  getAvailableRepresentativePermissions,
} from "../../api-services/representatives";
import { capitalizeFirst } from "../../lib/utils";
import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { ConJoinedImages } from "../ResponsiveNav";
import Username from "../Username";

export const RepresentativesList = ({
  representatives,
  isLoading,
  setCachedReps,
}) => {
  const { data: availablePermissions = [] } = useQuery({
    queryKey: ["available-permissions"],
    queryFn: getAvailableRepresentativePermissions,
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section className="flex flex-col gap-4">
      <section className="border-b pb-2">
        <HeadingText weight="semibold">Manage Representatives</HeadingText>
      </section>
      <section className="flex justify-between gap-4">
        {/* {["Representative", "Category", "Status"].map((heading, index) => (
          <h2 key={index} className="font-semibold even:max-lg:hidden">
            {heading}
          </h2>
        ))} */}

        <h2 className="font-semibold even:max-lg:hidden flex-1">
          Representative
        </h2>
        <h2 className="font-semibold even:max-lg:hidden flex-1 text-center">
          Category
        </h2>
        <h2 className="font-semibold even:max-lg:hidden flex-1 text-right">
          Status
        </h2>
      </section>
      <section className="divide-y divide-gray-200/70">
        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <CircleTitleSubtitleSkeleton key={index} />
          ))
        ) : representatives?.length < 1 ? (
          <div className="py-4">
            <LightParagraph>No representatives yet...</LightParagraph>
          </div>
        ) : (
          representatives?.map((params, index) => (
            <RepsTile key={index} {...params} availablePermissions={availablePermissions} setCachedReps={setCachedReps} />
          ))
        )}
      </section>
    </section>
  );
};

const RepsTile = ({
  id,
  user,
  company,
  status,
  role,
  category,
  invited,
  permissions: initialPermissions,
  availablePermissions,
  setCachedReps,
}) => {
  const [isChecked, setIsChecked] = useState(status);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions || []);
  const [saving, setSaving] = useState(false);

  const handleToggle = async () => {
    setIsChecked(!isChecked);
    await changeRepStatus(id, {
      user: user?.id,
      company: company?.id,
      status: !isChecked,
      category,
      permissions,
    });
  };

  const togglePermission = (code) => {
    setPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const savePermissions = async () => {
    setSaving(true);
    await updateRepresentativePermissions(id, permissions);
    setSaving(false);
    setShowPermissions(false);
  };

  return (
    <motion.section
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 lg:mb-4 pt-4 border-b border-gray-100 pb-2"
    >
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-4 relative">
        <div className="flex items-center w-full col-span-2">
          <ConJoinedImages
            animate={false}
            array={[
              {
                name: `${company?.company_name}`,
                src: company?.logo || "/images/default-company-logo.png",
                href: `/${company?.slug}`,
              },
              {
                name: `${user?.first_name} ${user?.last_name}`,
                src: user?.avatar,
                href: `/co/${user?.id}`,
              },
            ]}
            size={35}
            sizeVariant="sm"
          />
          <div className="flex flex-col">
            <Username user={user} />
            <small className="text-gray-400 !-my-1 line-clamp-2">
              {role ? capitalizeFirst(role) : "Representative"}{" "}
              &bull;{" "}
              <Badge
                className="!text-[.6rem] cursor-pointer"
                onClick={async () => {
                  await cancelOrDeclineRepRequest(id);
                  setCachedReps((prev) => prev.filter((rep) => rep.id !== id));
                }}
              >
                {invited ? "Remove representative" : "Cancel Request"}
              </Badge>
              {!invited && (
                <>
                  {" "}&bull;{" "}
                  <Badge
                    className="!text-[.6rem] cursor-pointer"
                    colorScheme="yellow"
                    onClick={() => resendRepInvitation(id)}
                  >
                    Resend Invitation
                  </Badge>
                </>
              )}
            </small>
          </div>
        </div>

        <div className="col-span-1 max-lg:absolute max-lg:-bottom-8 max-lg:left-2 lg:flex lg:flex-1 items-center justify-center">
          <Badge className="!w-fit">{role}</Badge>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-3">
          {invited && (
            <button
              onClick={() => setShowPermissions((v) => !v)}
              className="text-xs text-gold underline hover:opacity-70 transition-opacity"
            >
              {showPermissions ? "Hide permissions" : "Permissions"}
            </button>
          )}
          {invited ? (
            <Switch
              id={`rep_${user?.id}`}
              isChecked={isChecked}
              onChange={handleToggle}
            />
          ) : null}
        </div>
      </div>

      {/* Permissions panel */}
      <AnimatePresence>
        {showPermissions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 ml-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Permissions for {user?.first_name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map(({ code, label }) => (
                  <Checkbox
                    key={code}
                    isChecked={permissions.includes(code)}
                    onChange={() => togglePermission(code)}
                    colorScheme="yellow"
                    size="sm"
                  >
                    <span className="text-sm text-gray-600">{label}</span>
                  </Checkbox>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={savePermissions}
                  disabled={saving}
                  className="px-4 py-1.5 bg-gold text-dark text-sm rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setPermissions(initialPermissions || []);
                    setShowPermissions(false);
                  }}
                  className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};
