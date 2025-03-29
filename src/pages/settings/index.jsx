import { Button, Input, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deactivateAccount } from "../../api-services/authentication";
import ReusableModal from "../../components/custom/ResusableModal";
import CustomInput from "../../components/form/customInput";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import { useAuth } from "../../context/userContext";
import { goToLogin } from "../../lib/helpers";
import ChangePassword from "./components/ChangePassword";

const SettingsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const { user } = useAuth();

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
      setTimeout(() => goToLogin(), 3000);
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Settings on connectize";
  }, []);

  return (
    <main className="p-6 bg-white rounded-md min-h-[80vh] space-y-6">
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
