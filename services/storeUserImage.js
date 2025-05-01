import UImage from '../models/uimage.models.js'; // Adjust the path to your UserImage model

const storeUserImage = async (userId, imagePath, fileType, createdBy) => {
  try {
    // Create a new record in the UserImage table
    const userImage = await UImage.create({
      userId,
      imagePath,
      fileType,
      createdBy,
    });

    console.log('User image stored successfully:', userImage);
    return userImage;
  } catch (error) {
    console.error('Error storing user image:', error);
    throw new Error('Failed to store user image');
  }
};

export default storeUserImage;