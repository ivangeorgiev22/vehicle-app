import { useAuth } from "../context/authContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { API_URL } from "@env";
import { launchImageLibrary } from "react-native-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";

export default function Profile() {
  const {token, username, image, setImage, logout} = useAuth();
  const route = useRoute();
  const {id} = route.params as {id: string};
  const navigation = useNavigation<NativeStackNavigationProp<Params>>()

  const uploadImage = async () => {
    //open image gallery
    const res = await launchImageLibrary({mediaType: 'photo'});

    if(res.didCancel || !res.assets || res.assets.length === 0) return;

    const image = res.assets[0];

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName
      })
      const result = await fetch(`${API_URL}/users/${id}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (result.ok) {
        const data = await result.json();
        const imageRes = await fetch(data.image_url);
        const blob = await imageRes.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setImage(base64);
        };
        reader.readAsDataURL(blob)
        Alert.alert('Image uploaded successully');
      } else {
        Alert.alert('Failed to upload image')
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerUsername}>{username}</Text>
        </View>
      </View>
      <View style={styles.card}>
        {image ? (
          <Image source={{uri: image}} style={styles.img} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTxt}>No image</Text>
          </View>
        )}
        <Text style={styles.username}>{username}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={uploadImage}
        >
          <Text style={styles.buttonTxt}>
            {image ? 'Change Image' : 'Upload Image'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutBtnTxt}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
  },
  headerUsername: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    elevation: 2,
  },
  img: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#d5d2d2'
  },
  placeholderTxt: {
    fontSize: 13,
    color: '#383636',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10
  },
  buttonTxt: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    alignSelf: 'center',
    backgroundColor: '#d21b1b',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 15,
  },
  logoutBtnTxt: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  }
});
