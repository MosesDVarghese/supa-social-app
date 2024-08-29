import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import { fetchUserPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [noMore, setNoMore] = useState(false);

  const handlePostEvent = async (payload) => {
    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `userId=eq.${user.id}`,
        },
        handlePostEvent
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, []);

  const getPosts = async () => {
    // call the api
    if (noMore) {
      console.log("all posts fetched");
      return null;
    }
    limit = limit + 4;
    // fetching posts
    let res = await fetchUserPosts(user.id, limit);
    if (res.success) {
      if (posts.length == res.data.length) {
        setNoMore(true);
      }
      setPosts(res.data);
    }
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Sign out", "Error signing out!");
    }
  };

  const handleLogout = async () => {
    // show confirm modal
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("modal cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
        <View style={{ paddingHorizontal: wp(4) }}>
          <View>
            <Header title="Profile" mb={30} />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Icon name="logout" color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        </View>

        {/* user info + posts */}
        <View style={styles.container}>
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listStyle, { marginBottom: 10 }]}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PostCard item={item} currentUser={user} router={router} />
            )}
            onEndReached={() => {
              getPosts();
              console.log("got to the end");
            }}
            onEndReachedThreshold={0}
            ListHeaderComponent={
              <View style={styles.container}>
                <View style={{ gap: 15, marginBottom: 20 }}>
                  <View style={styles.avatarContainer}>
                    <Avatar
                      uri={user?.image}
                      size={hp(12)}
                      rounded={theme.radius.xxl * 1.4}
                    />
                    <Pressable
                      style={styles.editIcon}
                      onPress={() => router.push("editProfile")}
                    >
                      <Icon name="edit" strokeWidth={2.5} size={20} />
                    </Pressable>
                  </View>

                  {/* username and address */}
                  <View style={{ alignItems: "center", gap: 4 }}>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.address}>{user?.address}</Text>
                  </View>

                  {/* email, phone, bio */}
                  <View style={{ gap: 10 }}>
                    <View style={styles.info}>
                      <Icon
                        name="mail"
                        size={20}
                        color={theme.colors.textLight}
                      />
                      <Text style={styles.infoText}>{user?.email}</Text>
                    </View>
                    {user?.phoneNumber && (
                      <View style={styles.info}>
                        <Icon
                          name="call"
                          size={20}
                          color={theme.colors.textLight}
                        />
                        <Text style={styles.infoText}>{user?.phoneNumber}</Text>
                      </View>
                    )}
                    {user?.bio && (
                      <Text style={styles.infoText}>{user?.bio}</Text>
                    )}
                  </View>
                </View>
              </View>
            }
            ListFooterComponent={
              noMore ? (
                <View style={{ marginVertical: 30, bottom: 20 }}>
                  <Text style={styles.noPosts}>No more posts</Text>
                </View>
              ) : (
                <View style={{ marginVertical: posts.length == 0 ? 20 : 30 }}>
                  <Loading />
                </View>
              )
            }
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingBottom: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});
