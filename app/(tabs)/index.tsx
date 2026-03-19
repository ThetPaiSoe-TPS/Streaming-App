import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  FlatList,
} from "react-native";

// Featured streams data
const featuredStreams = [
  {
    id: "1",
    title: "Live Concert",
    viewerCount: "12.5K",
    image:
      "https://via.placeholder.com/400x200/FF3B30/FFFFFF?text=Live+Concert",
    isLive: true,
  },
  {
    id: "2",
    title: "Gaming Tournament",
    viewerCount: "8.2K",
    image: "https://via.placeholder.com/400x200/34C759/FFFFFF?text=Gaming",
    isLive: true,
  },
  {
    id: "3",
    title: "Sports Highlights",
    viewerCount: "5.1K",
    image: "https://via.placeholder.com/400x200/FF9500/FFFFFF?text=Sports",
    isLive: false,
  },
];

// Categories
const categories = [
  { id: "1", name: "Music", icon: "🎵", color: "#FF3B30" },
  { id: "2", name: "Gaming", icon: "🎮", color: "#34C759" },
  { id: "3", name: "Sports", icon: "⚽", color: "#FF9500" },
  { id: "4", name: "Movies", icon: "🎬", color: "#5856D6" },
  { id: "5", name: "Education", icon: "📚", color: "#007AFF" },
  { id: "6", name: "Podcasts", icon: "🎙️", color: "#AF52DE" },
];

// Popular channels
const popularChannels = [
  {
    id: "1",
    name: "Music Channel",
    subscriberCount: "1.2M",
    image: "https://via.placeholder.com/100x100/FF3B30/FFFFFF?text=MC",
  },
  {
    id: "2",
    name: "Gaming Pro",
    subscriberCount: "850K",
    image: "https://via.placeholder.com/100x100/34C759/FFFFFF?text=GP",
  },
  {
    id: "3",
    name: "Sports TV",
    subscriberCount: "2.1M",
    image: "https://via.placeholder.com/100x100/FF9500/FFFFFF?text=ST",
  },
  {
    id: "4",
    name: "Movie Club",
    subscriberCount: "500K",
    image: "https://via.placeholder.com/100x100/5856D6/FFFFFF?text=MoC",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace("/login");
  };

  const renderFeaturedItem = ({ item }: { item: any }) => (
    <View style={styles.featuredCard}>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredViewers}>
          👁 {item.viewerCount} watching
        </Text>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View
        style={[styles.categoryIcon, { backgroundColor: item.color + "20" }]}
      >
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderChannelItem = ({ item }: { item: any }) => (
    <View style={styles.channelItem}>
      <Image source={{ uri: item.image }} style={styles.channelImage} />
      <Text style={styles.channelName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.channelSubs}>{item.subscriberCount} subscribers</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Discover amazing live streams</Text>
        </View>
        <Link href="/buying" asChild>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>🛒 Buy</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Featured Streams Banner */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Featured Streams</Text>
        <FlatList
          data={featuredStreams}
          renderItem={renderFeaturedItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📺 Browse Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Popular Channels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Popular Channels</Text>
        <FlatList
          data={popularChannels}
          renderItem={renderChannelItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.channelList}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Link href="/(tabs)/explore" asChild>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>🔍 Explore More</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 300,
    height: 170,
    borderRadius: 16,
    marginRight: 15,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  liveBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  liveBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  featuredViewers: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 4,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  },
  channelList: {
    paddingHorizontal: 20,
  },
  channelItem: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  channelImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  channelName: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  channelSubs: {
    color: "#666",
    fontSize: 10,
    marginTop: 2,
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  exploreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
