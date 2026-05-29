import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/authContext";
export default function Home () {
  // once again reaches into context to retrieve saved username so it can be used
  const { username } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {username} </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    flex: 1,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center'
  }
})