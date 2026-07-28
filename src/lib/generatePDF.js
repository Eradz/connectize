import { jsPDF } from "jspdf";

export const createPDFDocument = (
  title,
  body,
  images = []
) => {
  const doc = new jsPDF();
  let yOffset = 10;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 10, yOffset);
  yOffset += 10;

  // Set Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const textHeight = doc.splitTextToSize(body, 180);
  doc.text(textHeight, 10, yOffset);
  yOffset += textHeight.length * 6;

  // Add Images (if available)
  images.forEach((image) => {
    if (yOffset + 40 > doc.internal.pageSize.height - 10) {
      doc.addPage(); // Add new page if space is insufficient
      yOffset = 10;
    }
    doc.addImage(image, "JPEG", 10, yOffset, 100, 50);
    yOffset += 55;
  });

  return doc;
};

export const generatePDF = (
  title,
  body,
  images = [],
  save = false,
  saveTitle = `Connectize-post-${new Date().toISOString()}.pdf`
) => {
  const doc = createPDFDocument(title, body, images);

  // Convert to Blob URL for preview
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  if (save) doc.save(saveTitle);

  return pdfUrl;
};
