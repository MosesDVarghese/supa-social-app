export const getUserImageSrc = (imagePath) => {
  if (imagePath) {
    return { uri: imagePath };
  }
  return require("../assets/images/defaultUser.png");
};
