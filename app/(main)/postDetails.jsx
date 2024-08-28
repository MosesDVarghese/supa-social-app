import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostsDetails,
  removeComment,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentCard from "../../components/CommentCard";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../services/notificationService";

const PostDetails = () => {
  const { postId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const inputRef = useRef(null);
  const commentRef = useRef("");
  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState(null);

  useEffect(() => {
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handleNewComment
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const handleNewComment = async (payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};

      setPost((prevPost) => {
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments],
        };
      });
    }
  };

  const getPostDetails = async () => {
    // fetch post details
    let res = await fetchPostsDetails(postId);
    if (res.success) {
      setPost(res.data);
      setStartLoading(false);
    }
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Post not found!</Text>
      </View>
    );
  }

  const onNewComment = async () => {
    if (!commentRef.current) {
      return null;
    }
    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current,
    };
    // create comment
    setLoading(true);
    let res = await createComment(data);
    setLoading(false);
    if (res.success) {
      // notify on new comment (ensure commenter and poster are different)
      if (user.id != post.userId) {
        // send notification
        let notify = {
          senderId: user.id,
          receiverId: post.userId,
          title: "commented on your post",
          data: JSON.stringify({
            postId: post.id,
            commentId: res?.data?.id,
          }),
        };
        createNotification(notify);
      }
      inputRef?.current.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeleteComment = async (comment) => {
    let res = await removeComment(comment?.id);

    if (res.success) {
      setPost((prev) => {
        let updatedPost = { ...prev };
        updatedPost.comments = updatedPost.comments.filter(
          (e) => e.id !== comment.id
        );

        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post, comments: [{ count: post.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMore={false}
        />
        {/* comment input */}
        <View style={styles.inputContainer}>
          <Input
            inputRef={inputRef}
            placeholderText="Type a comment..."
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (commentRef.current = value)}
            containerStyle={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
          />

          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* comment list */}
        <View style={{ gap: 17, marginVertical: 15 }}>
          {post?.comments?.map((item) => (
            <CommentCard
              key={item?.id?.toString()}
              comment={item}
              onDelete={onDeleteComment}
              canDelete={item.userId === user?.id || user?.id === post.userId}
              highlight={item.id == commentId}
            />
          ))}

          {post?.comments?.length == 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Be first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
