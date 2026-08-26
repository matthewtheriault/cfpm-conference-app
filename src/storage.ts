import Constants from "expo-constants";

const cloudinaryConfig = (Constants.expoConfig?.extra?.cloudinary ?? {}) as {
  cloudName?: string;
  uploadPreset?: string;
};

/**
 * Uploads a local image (a `file://`/`blob:` URI from expo-image-picker) to
 * Cloudinary via an unsigned upload preset and returns its public URL. Used
 * by the admin content editors so photos/logos/maps can be picked straight
 * from the organizer's device instead of hosting them elsewhere first.
 *
 * Cloudinary (not Firebase Storage) so this stays on Firebase's free Spark
 * plan — Google now requires the paid Blaze plan just to enable Storage.
 * See README.md for the Cloudinary setup + upload-preset restrictions.
 */
export async function uploadImageAsync(folder: string, localUri: string): Promise<string> {
  const { cloudName, uploadPreset } = cloudinaryConfig;
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary isn't configured. Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your .env file."
    );
  }

  const response = await fetch(localUri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  if (!uploadResponse.ok) {
    throw new Error("Cloudinary upload failed");
  }
  const data = await uploadResponse.json();
  return data.secure_url as string;
}
