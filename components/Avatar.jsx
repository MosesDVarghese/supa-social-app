import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Icon from "../assets/icons";
import { hp } from "../helpers/common";
import { theme } from "../constants/theme";
import { Image } from "expo-image";
import { getUserImageSrc } from "../services/imageService";

const Avatar = ({
  uri,
  size = hp(4.5),
  rounded = theme.radius.md,
  style = {},
}) => {
  return (
    <View>
      {/* <Icon
        name="user"
        size={hp(3.2)}
        strokeWidth={2}
        color={theme.colors.text}
      /> */}
      <Image
        source={getUserImageSrc(uri)}
        transition={100}
        style={[
          styles.avatar,
          { height: size, width: size, borderRadius: rounded },
          style,
        ]}
      />
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderCurve: "continuous",
    borderColor: theme.colors.darkLight,
    borderWidth: 1,
  },
});
