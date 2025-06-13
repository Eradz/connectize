import { CircleTitleSubtitleSkeleton } from "../admin/feeds/TopServiceSuggestions";
import HeadingText from "../HeadingText";
import LightParagraph from "../ParagraphText";
import { motion } from "framer-motion";
import { ConJoinedImages } from "../ResponsiveNav";
import Username from "../Username";
import { Badge, Switch } from "@chakra-ui/react";
import { capitalizeFirst } from "../../lib/utils";
import { useState } from "react";
import {
  cancelOrDeclineRepRequest,
  changeRepStatus,
} from "../../api-services/representatives";

export const RepresentativesList = ({
  representatives,
  isLoading,
  setCachedReps,
}) => {
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
            <RepsTile key={index} {...params} setCachedReps={setCachedReps} />
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
  setCachedReps,
}) => {
  const [isChecked, setIsChecked] = useState(status);

  const handleToggle = async () => {
    setIsChecked(!isChecked);
    await changeRepStatus(id, {
      user: user?.id,
      company: company?.id,
      status: !isChecked,
      category,
    });
  };
  return (
    <motion.section
      key={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-4 lg:grid-cols-5 gap-4 mb-10 lg:mb-4 pt-4 relative"
    >
      <div className="flex items-center w-full col-span-2">
        <ConJoinedImages
          animate={false}
          array={[
            {
              name: `${company?.company_name}`,
              src: company?.logo || "/images/default-company-logo.png",
              href: `/${company?.company_name}`,
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
            {capitalizeFirst(user?.role)}{" "}
            <>
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
            </>
          </small>
        </div>
      </div>

      <div className="col-span-1 max-lg:absolute max-lg:-bottom-8 max-lg:left-2 lg:flex lg:flex-1 items-center justify-center">
        <Badge className="!w-fit">{role}</Badge>
      </div>

      <div className="col-span-2 flex items-center justify-end">
        {invited ? (
          <Switch
            id={`rep_${user?.id}`}
            isChecked={isChecked}
            onChange={handleToggle}
          />
        ) : null}
      </div>
    </motion.section>
  );
};
