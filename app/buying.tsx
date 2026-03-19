import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
} from "react-native";

// Mock streaming data
const streamingData = [
  {
    id: "1",
    title: "Premium Music Streaming",
    description: "Unlimited access to millions of songs",
    price: 9999,
    // image: "https://via.placeholder.com/150/007AFF/FFFFFF?text=Music",
    image:
      "https://i.pinimg.com/736x/71/37/73/713773f67dc3bf18fb417e6074679426.jpg",
  },
  {
    id: "2",
    title: "Video Streaming Bundle",
    description: "HD movies and TV shows",
    price: 14999,
    // image: "https://via.placeholder.com/150/FF3B30/FFFFFF?text=Video",
    image:
      "https://i.pinimg.com/1200x/ad/17/52/ad1752b41ce3c70d4722e6c02e4cdd24.jpg",
  },
  {
    id: "3",
    title: "Gaming Stream Pass",
    description: "Live gaming streams and tournaments",
    price: 7999,
    // image: "https://via.placeholder.com/150/34C759/FFFFFF?text=Gaming",
    image:
      "https://i.pinimg.com/736x/6a/c5/73/6ac573f796d704ce16747de2e9cd8d14.jpg",
  },
  {
    id: "4",
    title: "Sports Premium",
    description: "Live sports events and highlights",
    price: 19999,
    // image: "https://via.placeholder.com/150/FF9500/FFFFFF?text=Sports",
    image:
      "https://i.pinimg.com/736x/53/28/26/5328262c2b2ad5d067a96d3776a2ccd6.jpg",
  },
  {
    id: "5",
    title: "Educational Streams",
    description: "Learn from expert instructors",
    price: 5999,
    // image: "https://via.placeholder.com:150/5856D6/FFFFFF?text=Edu",
    image:
      "https://i.pinimg.com/1200x/84/2e/5b/842e5b20a7781b7356b90257a695d7e9.jpg",
  },
  {
    id: "6",
    title: "Podcast Premium",
    description: "Ad-free podcast listening",
    price: 3999,
    // image: "https://via.placeholder.com/150/AF52DE/FFFFFF?text=Podcast",
    image:
      "https://i.pinimg.com/736x/40/fd/80/40fd8040d923c0ade48735c89ffeb686.jpg",
  },
];

export default function BuyingScreen() {
  const router = useRouter();

  const handleSelectItem = (item: any) => {
    // Navigate to payment proceed page with the selected item
    router.push({
      pathname: "/paymentProceed",
      params: {
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price.toString(),
      },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectItem(item)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.cardPrice}>{item.price.toLocaleString()} MMK</Text>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => handleSelectItem(item)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buy Streams</Text>
      <Text style={styles.subtitle}>Choose your streaming package</Text>

      <FlatList
        data={streamingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#ddd",
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#8E8E93",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
