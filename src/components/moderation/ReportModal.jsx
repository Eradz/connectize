/**
 * Report Content Modal
 * Allows users to flag objectionable content for moderation
 * App Store Compliance Requirement
 */
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Textarea,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { reportContent } from "../../api-services/moderation";

const ReportModal = ({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId = null,
}) => {
  const [reportType, setReportType] = useState("spam");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: "spam", label: "Spam or Misleading" },
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "violence", label: "Violence or Threats" },
    { value: "nudity", label: "Nudity or Sexual Content" },
    { value: "fake_profile", label: "Fake Profile or Impersonation" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      return;
    }

    setLoading(true);
    try {
      await reportContent({
        content_type: contentType,
        content_id: String(contentId),
        reported_user_id: reportedUserId,
        report_type: reportType,
        description: description.trim(),
      });
      
      // Reset and close
      setDescription("");
      setReportType("spam");
      onClose();
    } catch (error) {
      console.error("Error reporting content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setReportType("spam");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Report Content</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="space-y-4">
          <FormControl>
            <FormLabel className="!text-sm font-medium">
              Why are you reporting this?
            </FormLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="!text-sm"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel className="!text-sm font-medium">
              Additional Details
            </FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details about why you're reporting this content..."
              rows={4}
              className="!text-sm"
              resize="none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Our team will review this report within 24 hours
            </p>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="!text-sm"
          >
            Cancel
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!description.trim()}
            ml={3}
            className="!text-sm"
          >
            Submit Report
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReportModal;
