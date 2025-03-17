import { useState } from "react";
import { Button, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@chakra-ui/react";
import { toast, Toaster } from "sonner";
import HeadingText from "../../components/HeadingText";
import LightParagraph from "../../components/ParagraphText";
import { useAuth } from "../../context/userContext";
import ReusableModal from "../../components/custom/ResusableModal";

const SettingsPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setPassword] = useState("");
  const {user} = useAuth()

  const handleDeactivate = () => {
    if (!password) {
      toast.error("Please enter your password to proceed.");
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success("Your account has been deactivated successfully.");
      onClose();
    }, 1500);
  };

  return (
    <main className="p-6 bg-white rounded-md min-h-[80vh] space-y-6">
      <HeadingText weight="semibold">Settings</HeadingText>

      {/* User Information Section */}
      <section className="mb-6">
        <h2 className="text-lg font-medium">Profile Information</h2>
        <section className="gap-2 flex flex-col pointer-events-none">
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
      {/* <div className="mb-6">
        <h2 className="text-lg font-medium">Change Password</h2>
        <Input type="password" placeholder="New Password" className="mt-2" />
      </div> */}

      {/* Deactivate Account Section */}
      <div className="border-t pt-4 flex flex-col gap-4 w-full">
        {/* <h2 className="text-xl font-semibold">Danger zone</h2> */}
        <section className="">
          <h2 className="text-lg font-medium text-red-600">
            Deactivate Account
          </h2>
          <LightParagraph>
            Deactivated account will be deleted after 30days. You can apply for
            reactivation of account within this 30days
          </LightParagraph>
          <Button colorScheme="red" onClick={onOpen} className="mt-4">
            Deactivate
          </Button>
        </section>
      </div>

      {/* Deactivation Confirmation Modal */}
      <ReusableModal
        onClose={onClose}
        isOpen={isOpen}
        primaryAction={handleDeactivate}
        title="Confirm Deactivation"
        secondaryText="Cancel"
        primaryText="Deactivate"
      >
        <p className="mb-2 text-sm">
          Deactivating your account means you lose temporary access to your
          account. Deactivated account can be reactivated within 30days of
          deactivation
        </p>
        <p className="mb-2 font-semibold text-black">
          Please enter your password to continue
        </p>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </ReusableModal>
    </main>
  );
};

export default SettingsPage;
