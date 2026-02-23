import { Avatar, Button, Spinner, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getBlockedCompanies, unblockCompany } from "../../api-services/moderation";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import ReusableModal from "../../components/custom/ResusableModal";
import { createSEO } from "../../components/SEO";
import { avatarStyle } from "../../components/ResponsiveNav";
import { BlockOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";
import { webRoutes } from "../../lib/webRoutes";

export const meta = () =>
  createSEO({
    title: "Blocked Companies | Connectize",
  });

const BlockedCompaniesPage = () => {
  const [blockedCompanies, setBlockedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadBlockedCompanies();
  }, []);

  const loadBlockedCompanies = async () => {
    try {
      setLoading(true);
      const companies = await getBlockedCompanies();
      setBlockedCompanies(companies || []);
    } catch (error) {
      console.error("Failed to load blocked companies:", error);
      toast.error("Failed to load blocked companies");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockClick = (company) => {
    setSelectedCompany(company);
    onOpen();
  };

  const handleUnblock = async () => {
    if (!selectedCompany) return;

    try {
      setUnblocking(selectedCompany.id);
      await unblockCompany(selectedCompany.company_id);
      
      // Remove from list with optimistic update
      setBlockedCompanies(prev => 
        prev.filter(company => company.id !== selectedCompany.id)
      );
      
      toast.success(`${selectedCompany.company?.company_name || 'Company'} has been unblocked`);
      onClose();
    } catch (error) {
      console.error("Failed to unblock company:", error);
      toast.error("Failed to unblock company. Please try again.");
    } finally {
      setUnblocking(null);
      setSelectedCompany(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" color="yellow.500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <HeadingText 
          title="Blocked Companies" 
          className="text-2xl md:text-3xl font-bold mb-2"
        />
        <LightParagraph className="text-gray-600">
          Companies you've blocked won't be able to interact with your content or see your activity.
        </LightParagraph>
      </div>

      {/* Blocked Companies List */}
      {blockedCompanies.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <BlockOutlined className="text-6xl text-gray-300 mb-4" />
          <HeadingText 
            title="No Blocked Companies" 
            className="text-xl font-semibold mb-2"
          />
          <LightParagraph className="text-gray-500 mb-6">
            You haven't blocked any companies yet. When you block a company, they'll appear here.
          </LightParagraph>
          <Link to={webRoutes.companies}>
            <Button colorScheme="yellow" variant="outline">
              Discover Companies
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {blockedCompanies.map((blockedCompany) => (
            <div
              key={blockedCompany.id}
              className={clsx(
                "bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow",
                "flex items-center justify-between gap-4"
              )}
            >
              {/* Company Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar
                  name={blockedCompany.company_name || "Company"}
                  src={blockedCompany.company?.logo}
                  size="md"
                  className={avatarStyle}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {blockedCompany.company_name || "Unknown Company"}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500">
                    {blockedCompany.reason && (
                      <span className="truncate">
                        Reason: {blockedCompany.reason}
                      </span>
                    )}
                    <span className="text-xs">
                      Blocked {formatDistanceToNow(new Date(blockedCompany.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unblock Button */}
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => handleUnblockClick(blockedCompany)}
                isLoading={unblocking === blockedCompany.id}
                loadingText="Unblocking..."
                className="shrink-0"
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Unblock Confirmation Modal */}
      <ReusableModal
        isOpen={isOpen}
        onClose={onClose}
        title="Unblock Company"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Avatar
              name={selectedCompany?.company_name || "Company"}
              src={selectedCompany?.company?.logo}
              size="md"
              className={avatarStyle}
            />
            <div>
              <p className="font-semibold text-gray-900">
                {selectedCompany?.company_name || "Unknown Company"}
              </p>
              <p className="text-sm text-gray-500">
                @{selectedCompany?.company?.slug || "company"}
              </p>
            </div>
          </div>

          <LightParagraph className="text-gray-600">
            Are you sure you want to unblock this company? They will be able to:
          </LightParagraph>

          <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
            <li>See your posts and activity</li>
            <li>Interact with your content</li>
            <li>Send you messages (if enabled)</li>
            <li>View your profile</li>
          </ul>

          <div className="flex gap-3 pt-4">
            <Button
              flex="1"
              variant="outline"
              onClick={onClose}
              isDisabled={!!unblocking}
            >
              Cancel
            </Button>
            <Button
              flex="1"
              colorScheme="blue"
              onClick={handleUnblock}
              isLoading={!!unblocking}
              loadingText="Unblocking..."
            >
              Unblock Company
            </Button>
          </div>
        </div>
      </ReusableModal>
    </div>
  );
};

export default BlockedCompaniesPage;
