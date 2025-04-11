import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
} from "@chakra-ui/react";
import clsx from "clsx";
import React from "react";

const ReusableModal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
  size = "md",
  primaryAction,
  primaryText = "Proceed",
  secondaryText = "Close",
  colorScheme = "",
  disabled = false,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay />
      <ModalContent className="rounded-lg shadow-lg !mx-2 max-h-[77vh] md:max-h-[90vh]">
        {title && (
          <>
            <ModalHeader className="!text-lg !font-semibold text-gray-800">
              {title}
            </ModalHeader>
            <Divider className="mb-0.5 mx-auto !w-[95%]" />
            <ModalCloseButton className="focus:!outline-none" />
          </>
        )}
        <ModalBody className="text-gray-700 overflow-y-auto scrollbar-hidden">
          {children}
        </ModalBody>
        <ModalFooter className="flex justify-end space-x-3">
          {footerContent || (
            <>
              <Button onClick={onClose} className="!text-sm">
                {secondaryText}
              </Button>
              {primaryAction && (
                <Button
                  colorScheme={colorScheme}
                  onClick={primaryAction}
                  disabled={disabled}
                  className={clsx("!text-sm", {
                    "!bg-gold !text-black": !colorScheme,
                  })}
                >
                  {loading ? <Spinner /> : primaryText}
                </Button>
              )}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReusableModal;
