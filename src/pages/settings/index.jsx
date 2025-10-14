import { Button, Input, useDisclosure, Switch, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { deactivateAccount } from "../../api-services/authentication";
import { 
  getContentPreferences, 
  updateContentPreferences,
  getBlockedUsers 
} from "../../api-services/moderation";
import ReusableModal from "../../components/custom/ResusableModal";
import CustomInput from "../../components/form/customInput";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import SEO, { createSEO } from "../../components/SEO";
import { useAuth } from "../../context/userContext";
import { goToLogin } from "../../lib/helpers";
import ChangePassword from "./components/ChangePassword";

export const meta = () =>
  createSEO({
    title: "Settings | connectize",
  });

const SettingsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const { user } = useAuth();

  // Content Preferences State
  const [preferences, setPreferences] = useState({
    safe_mode_enabled: false,
    profanity_filter_enabled: true,
    hide_sensitive_content: false,
    hide_reported_content: true,
  });
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [blockedUsersCount, setBlockedUsersCount] = useState(0);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
    loadBlockedUsersCount();
  }, []);

  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true);
      const prefs = await getContentPreferences();
      setPreferences({
        safe_mode_enabled: prefs.safe_mode_enabled || false,
        profanity_filter_enabled: prefs.profanity_filter_enabled !== undefined ? prefs.profanity_filter_enabled : true,
        hide_sensitive_content: prefs.hide_sensitive_content || false,
        hide_reported_content: prefs.hide_reported_content !== undefined ? prefs.hide_reported_content : true,
      });
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const loadBlockedUsersCount = async () => {
    try {
      const blocked = await getBlockedUsers();
      setBlockedUsersCount(blocked?.length || 0);
    } catch (error) {
      console.error("Failed to load blocked users:", error);
    }
  };

  const handlePreferenceToggle = async (key, value) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value,
    };
    
    setPreferences(updatedPreferences);
    
    try {
      await updateContentPreferences(updatedPreferences);
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleDeactivate = async () => {
    if (!user?.email) {
      goToLogin();
      return;
    }

    if (!password) {
      setErrorText("Please enter your password to proceed.");
      return;
    }

    setLoading(true);

    const success = await deactivateAccount({ email: user?.email, password });

    if (success) {
      toast.success("Your account has been deactivated successfully.");
      onClose();
      localStorage.clear();
      setTimeout(goToLogin, 2000);
    }
    setLoading(false);
  };

  return (
    <main className="p-6 bg-white rounded-md h-screen space-y-6 overflow-y-auto">
      {/* <SEO title="Settings | connectize" /> */}
      <HeadingText weight="semibold">Settings</HeadingText>

      <section className="space-y-8">
        {/* User Information Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium">Profile Information</h2>
          <section className="gap-2 lg:gap-4 flex max-lg:flex-col pointer-events-none">
            <Input
              value={user?.first_name}
              placeholder="First name"
              className="mt-2"
            />
            <Input
              value={user?.last_name}
              placeholder="Last name"
              className="mt-2"
            />
            <Input value={user?.email} placeholder="Email" className="mt-2" />
          </section>
        </section>

        {/* Change Password Section */}
        <ChangePassword />

        {/* Content Preferences Section */}
        <section className="border-t pt-6">
          <h2 className="text-lg font-medium mb-2">Content Preferences</h2>
          <LightParagraph className="mb-4">
            Control what content you see in your feed
          </LightParagraph>

          {preferencesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Safe Mode Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-base">Safe Mode</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Hide posts flagged as potentially inappropriate or sensitive
                  </p>
                </div>
                <Switch
                  colorScheme="blue"
                  size="lg"
                  isChecked={preferences.safe_mode_enabled}
                  onChange={(e) =>
                    handlePreferenceToggle("safe_mode_enabled", e.target.checked)
                  }
                />
              </div>

              {/* Profanity Filter Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-base">Filter Profanity</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically filter or blur posts containing profanity
                  </p>
                </div>
                <Switch
                  colorScheme="blue"
                  size="lg"
                  isChecked={preferences.profanity_filter_enabled}
                  onChange={(e) =>
                    handlePreferenceToggle(
                      "profanity_filter_enabled",
                      e.target.checked
                    )
                  }
                />
              </div>

              {/* Hide Sensitive Content Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-base">Hide Sensitive Content</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Hide content marked as sensitive (violence, nudity, etc.)
                  </p>
                </div>
                <Switch
                  colorScheme="blue"
                  size="lg"
                  isChecked={preferences.hide_sensitive_content}
                  onChange={(e) =>
                    handlePreferenceToggle(
                      "hide_sensitive_content",
                      e.target.checked
                    )
                  }
                />
              </div>

              {/* Hide Reported Content Toggle */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-base">Hide Reported Content</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically hide content you've reported
                  </p>
                </div>
                <Switch
                  colorScheme="blue"
                  size="lg"
                  isChecked={preferences.hide_reported_content}
                  onChange={(e) =>
                    handlePreferenceToggle(
                      "hide_reported_content",
                      e.target.checked
                    )
                  }
                />
              </div>

              {/* Blocked Users */}
              <div className="pt-4 border-t">
                <p className="font-medium text-base">Blocked Users</p>
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  Manage users you've blocked from interacting with you
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/co/blocked-users")}
                >
                  View Blocked Users ({blockedUsersCount})
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Deactivate Account Section */}
        <section className="border-t pt-4 flex flex-col gap-4 w-full">
          {/* <h2 className="text-xl font-semibold">Danger zone</h2> */}
          <section className="">
            <h2 className="text-lg font-medium text-red-600">
              Deactivate Account
            </h2>
            <LightParagraph>
              Deactivated account will be deleted after 30days. You can apply
              for reactivation of account within this 30days
            </LightParagraph>
            <Button colorScheme="red" onClick={onOpen} className="mt-4">
              Deactivate
            </Button>
          </section>
        </section>
      </section>
      {/* Deactivation Confirmation Modal */}
      <ReusableModal
        onClose={onClose}
        isOpen={isOpen}
        primaryAction={handleDeactivate}
        title="Confirm Deactivation"
        secondaryText="Cancel"
        primaryText="Deactivate"
        colorScheme="red"
        disabled={!password || password.length < 6}
        loading={loading}
      >
        <p className="mb-2 text-sm">
          Deactivating your account means you lose temporary access to your
          account. Deactivated account can be reactivated within 30days of
          deactivation
        </p>
        <p className="mb-2 font-semibold text-black text-sm">
          Please enter your password to continue
        </p>

        <CustomInput
          type="password"
          placeholder="Enter password"
          value={password}
          fontSize="14"
          onChange={(e) => setPassword(e.target.value.trim())}
          error={errorText}
        />
      </ReusableModal>
    </main>
  );
};

export default SettingsPage;
