import { Avatar, Button, Spinner, useDisclosure } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import { getBlockedUsers, unblockUser } from "../../api-services/moderation";
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
    title: "Blocked Users | Connectize",
  });

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const users = await getBlockedUsers();
      setBlockedUsers(users || []);
    } catch (error) {
      console.error("Failed to load blocked users:", error);
      toast.error("Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockClick = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleUnblock = async () => {
    if (!selectedUser) return;

    try {
      setUnblocking(selectedUser.blocked);
      await unblockUser(selectedUser.blocked);
      
      // Remove from list
      setBlockedUsers(blockedUsers.filter((u) => u.id !== selectedUser.id));
      
      onClose();
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to unblock user:", error);
    } finally {
      setUnblocking(null);
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="gold" />
      </section>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="flex items-center justify-between border-b pb-4">
        <div>
          <HeadingText weight="semibold">Blocked Users</HeadingText>
          <LightParagraph className="mt-1">
            Manage users you've blocked from interacting with you
          </LightParagraph>
        </div>
        <Link to={webRoutes.settings}>
          <Button size="sm" variant="outline" className="!text-sm">
            Back to Settings
          </Button>
        </Link>
      </section>

      {/* Empty State */}
      {blockedUsers.length === 0 ? (
        <section className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <BlockOutlined className="text-4xl text-gray-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              No Blocked Users
            </h3>
            <LightParagraph className="max-w-md">
              You haven't blocked anyone yet. When you block users, they'll appear here.
            </LightParagraph>
          </div>
          <Link to={webRoutes.settings}>
            <Button size="sm" className="!bg-gold !text-black !text-sm mt-4">
              Go to Settings
            </Button>
          </Link>
        </section>
      ) : (
        <>
          {/* Count */}
          <section className="flex items-center justify-between px-2">
            <LightParagraph>
              {blockedUsers.length} {blockedUsers.length === 1 ? "user" : "users"} blocked
            </LightParagraph>
          </section>

          {/* Blocked Users List */}
          <section className="space-y-3">
            {blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        // Prevent navigation since user is blocked
                        e.preventDefault();
                        toast.info("Unblock this user to view their profile");
                      }}
                    >
                      <Avatar
                        size="md"
                        src={blockedUser.blocked_user_avatar}
                        name={blockedUser.blocked_user_name}
                        className={clsx(avatarStyle, "cursor-pointer")}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {blockedUser.blocked_user_name}
                        </h3>
                      </div>
                      
                      {blockedUser.reason && (
                        <p className="text-sm text-gray-600 truncate mt-0.5">
                          Reason: {blockedUser.reason}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Blocked {formatDistanceToNow(new Date(blockedUser.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Unblock Button */}
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleUnblockClick(blockedUser)}
                    isLoading={unblocking === blockedUser.blocked}
                    className="!text-sm flex-shrink-0"
                  >
                    Unblock
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Unblock Confirmation Modal */}
      <ReusableModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Unblock User"
        primaryAction={handleUnblock}
        primaryText="Unblock"
        secondaryText="Cancel"
        colorScheme="red"
        loading={!!unblocking}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Are you sure you want to unblock{" "}
            <span className="font-semibold">
              {selectedUser?.blocked_user_name}
            </span>
            ?
          </p>
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            <p className="text-sm text-gray-600">
              After unblocking, this user will be able to:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-2">
              <li>See your posts and comments</li>
              <li>Interact with your content</li>
              <li>Send you messages</li>
              <li>View your profile</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            You can block them again at any time from their profile.
          </p>
        </div>
      </ReusableModal>
    </main>
  );
};

export default BlockedUsersPage;
