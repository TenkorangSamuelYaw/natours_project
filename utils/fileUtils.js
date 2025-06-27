import fs from 'fs/promises';
import path from 'path';

export const renameUploadedFile = async (tempFilePath, newFileName) => {
  const directory = path.dirname(tempFilePath);
  const newFilePath = path.join(directory, newFileName);
  await fs.rename(tempFilePath, newFilePath);
  return newFileName;
};
