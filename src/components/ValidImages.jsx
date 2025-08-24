import { CloseButton } from "@chakra-ui/react";
import React from "react";
import { ButtonWithTooltipIcon } from "./ButtonWithTooltipIcon";

export default function ValidImages({
  validImages,
  setValidImages,
  header = "Image Preview",
}) {
  return (
    <>
      {validImages.length > 0 && (
        <section className="mt-2">
          <div className="flex justify-between items-center">
            <h5 className="font-bold mb-2">
              {header}
              {validImages.length > 1 ? "s" : ""}
            </h5>

            <ButtonWithTooltipIcon
              text="Clear all"
              onClick={() => setValidImages([])}
            />
          </div>
          <div className="flex gap-4 overflow-x-auto">
            {validImages.map((image, index) => (
              <div key={index} className="relative shrink-0 group">
                <CloseButton
                  onClick={() =>
                    setValidImages((prevItems) =>
                      prevItems.filter((_, i) => i !== index)
                    )
                  }
                  className="absolute -right-1 -top-1 bg-white !text-[.5rem] !size-6 xs:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  className="w-full h-20 object-cover rounded-md shadow"
                />
                <p className="text-center mt-1 text-xs font-semibold">
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
