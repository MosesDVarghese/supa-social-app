import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import React from "react";

import moment from "moment";

import Avatar from "./Avatar";
import Icon from "../assets/icons";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";

const CommentCard = ({
  canDelete = false,
  comment,
  onDelete,
  highlight = false,
}) => {
  const handleDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to do this?", [
      {
        onPress: () => console.log("Modal cancel"),
        style: "cancel",
        text: "Cancel",
      },
      {
        onPress: () => onDelete?.(comment),
        style: "destructive",
        text: "Delete",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Avatar uri={comment?.user?.image} />

      <View style={[styles.content, highlight && styles.highlight]}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={styles.nameContainer}>
            <Text style={styles.text}>{comment?.user?.name}</Text>
            <Text>{"•"}</Text>
            <Text style={[styles.text, { color: theme.colors.textLight }]}>
              {moment(comment?.user?.created_at).format("MMM D Y")}
            </Text>
          </View>

          {canDelete && (
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete}>
              <Icon color={theme.colors.rose} name={"delete"} size={20} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.text, { fontWeight: "normal" }]}>
          {comment?.text}
        </Text>
      </View>
    </View>
  );
};

export default CommentCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 7,
  },
  content: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderCurve: "continuous",
  },
  highlight: {
    borderWidth: 0.2,
    backgroundColor: "white",
    borderColor: theme.colors.dark,
    shadowColor: theme.colors.dark,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
});
