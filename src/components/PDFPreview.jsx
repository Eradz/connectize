import { DownloadIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { generatePDF } from "../lib/generatePDF";
import { ButtonWithTooltipIcon } from "./ButtonWithTooltipIcon";
import ReusableModal from "./custom/ResusableModal";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PDFPreview({ postTitle, postBody, postImages = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handlePostDownloadPDF = () => {
    setIsOpen(true);

    setPdfUrl(generatePDF(postTitle, postBody, postImages));
  };

  return (
    <>
      <ButtonWithTooltipIcon
        IconName={DownloadIcon}
        tip="Download post"
        onClick={handlePostDownloadPDF}
      />
      <ReusableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Post PDF Preview"
        size="xl"
        primaryAction={() => {
          if (pdfUrl) {
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = `Connectize-post-${new Date().toISOString()}.pdf`;
            a.click();
          }
        }}
        primaryText="Download"
        secondaryText="Close"
        disabled={!pdfUrl}
      >
        {pdfUrl && (
          <div className="mt-4">
            <Document file={pdfUrl}>
              <Page pageNumber={1} width={400} renderTextLayer={false} />
            </Document>
          </div>
        )}
      </ReusableModal>
    </>
  );
}
