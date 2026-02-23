/**
 * Report Content Modal
 * Allows users to flag objectionable content for moderation
 * App Store Compliance Requirement
 */
import React, { useState, useEffect } from "react";
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
import { reportContent, getReportTypes } from "../../api-services/moderation";

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

  const defaultReportTypes = [
    { value: "spam", label: "Spam or Misleading" },
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "violence", label: "Violence or Threats" },
    { value: "nudity", label: "Nudity or Sexual Content" },
    { value: "fake_profile", label: "Fake Profile or Impersonation" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "other", label: "Other" },
  ];
  const [reportTypes, setReportTypes] = useState(defaultReportTypes);

  // Fetch admin-managed report types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await getReportTypes();
        const types = Array.isArray(res) ? res : res?.results || res?.data || [];
        if (types.length > 0) {
          setReportTypes(types.map(t => ({ value: t.name, label: t.display_name })));
        }
      } catch (err) {
        console.error('Failed to fetch report types:', err);
        // Keep default fallback
      }
    };
    fetchTypes();
  }, []);

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

  const getModalTitle = () => {
    switch (contentType) {
      case "user":
        return "Report User";
      case "company":
        return "Report Company";
      case "post":
        return "Report Post";
      case "comment":
        return "Report Comment";
      default:
        return "Report Content";
    }
  };

  const getDescriptionPlaceholder = () => {
    switch (contentType) {
      case "user":
        return "Please describe the issue with this user's behavior or profile...";
      case "company":
        return "Please describe the issue with this company or its activities...";
      default:
        return "Please provide specific details about why you're reporting this content...";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
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
              placeholder={getDescriptionPlaceholder()}
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
