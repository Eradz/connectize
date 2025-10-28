import { WarningOutlined, FlagOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "@chakra-ui/react";

const ContentWarningBadge = ({ flagReason, isOwner = false }) => {
  if (!flagReason) return null;
  
  const warningConfig = {
    inappropriate_language: {
      title: "Content Flagged",
      message: isOwner 
        ? "Your post was flagged for inappropriate language. It may be hidden from some users."
        : "This post contains language that may be inappropriate for some users.",
      colorScheme: "orange",
      icon: <WarningOutlined className="text-xs" />
    },
    under_review: {
      title: "Under Review",
      message: isOwner
        ? "Your post is under review by our moderation team."
        : "This post is currently under review.",
      colorScheme: "yellow",
      icon: <FlagOutlined className="text-xs" />
    }
  };
  
  const config = warningConfig[flagReason] || warningConfig.under_review;
  
  return (
    <Tooltip label={config.message} placement="top" hasArrow>
      <span
        className={`flex items-center justify-center cursor-help ${
          config.colorScheme === 'orange' ? 'text-orange-500' : 'text-yellow-600'
        }`}
      >
        {config.icon}
      </span>
    </Tooltip>
  );
};

export default ContentWarningBadge;
