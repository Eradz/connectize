export const imageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
export const imageSize = 4 * 1024 * 1024; // 4MB

export const isImageFile = (files) =>
  Array.isArray(files)
    ? files.every((file) => imageTypes.includes(file.type.toLowerCase()))
    : imageTypes.includes(files.type.toLowerCase());

export const isImageSize = (files) =>
  Array.isArray(files)
    ? files.every((file) => file.size <= imageSize)
    : files.size <= imageSize;
