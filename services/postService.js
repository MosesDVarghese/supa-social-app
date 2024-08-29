import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post) => {
  try {
    // upload image
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileRes = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileRes.success) {
        post.file = fileRes.data;
      } else {
        return fileRes;
      }
    }
    const { data, error } = await supabase
      .from("posts")
      .upsert(post)
      .select()
      .single();
    if (error) {
      console.log("createPost error: ", error);
      return { success: false, msg: "Could not create post" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.log("createPost error: ", error);
    return { success: false, msg: "Could not create post" };
  }
};

export const fetchPosts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, 
        user: users (id, name, image), 
        postLikes (*), 
        comments (count)`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetchPost error: ", error);
      return { success: false, msg: "Could not fetch the posts" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPost error: ", error);
    return { success: false, msg: "Could not fetch the posts" };
  }
};

export const fetchUserPosts = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, 
        user: users (id, name, image), 
        postLikes (*), 
        comments (count)`
      )
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.log("fetchPost error: ", error);
      return { success: false, msg: "Could not fetch user's posts" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPost error: ", error);
    return { success: false, msg: "Could not fetch user's posts" };
  }
};

export const fetchPostsDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, 
        user: users (id, name, image), 
        postLikes (*), 
        comments (*, user: users(id, name, image))`
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.log("fetchPostDetails error: ", error);
      return { success: false, msg: "Could not fetch the post details" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("fetchPostDetails error: ", error);
    return { success: false, msg: "Could not fetch the post details" };
  }
};

export const createPostLike = async (postLike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.log("postLike error: ", error);
      return { success: false, msg: "Could not like the post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("postLike error: ", error);
    return { success: false, msg: "Could not like the post" };
  }
};

export const removePostLike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.log("postLike error: ", error);
      return { success: false, msg: "Could not remove the post like" };
    }
    return { success: true };
  } catch (error) {
    console.log("postLike error: ", error);
    return { success: false, msg: "Could not remove the post like" };
  }
};

export const createComment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.log("comment error: ", error);
      return { success: false, msg: "Could not post comment" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log("comment error: ", error);
    return { success: false, msg: "Could not post comment" };
  }
};

export const removeComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log("removeComment error:", error);
      return { msg: "Could not remove the comment", success: false };
    }
    return { success: true };
  } catch (error) {
    console.log("removeComment error:", error);
    return { msg: "Could not remove the comment", success: false };
  }
};
