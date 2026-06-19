import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet, Pressable, Alert, Image } from "react-native";
import { API_URL } from "@env";
import { launchImageLibrary } from "react-native-image-picker";

export default function Profile() {
  const {token} = useAuth();
  const route = useRoute();
  const {id} = route.params as {id: string};
  const [image, setImage] = useState<string | null>(null);

  const fetchImage = async () => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/image`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      if(res.ok) {
        const data = await res.json();
        console.log(data)
        setImage(data.image_url);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

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
        setImage(data.image_url);
        Alert.alert('Image uploaded successully');
      } else {
        Alert.alert('Failed to upload image')
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {image ? (
        <Image 
          source={{uri: image}} style={styles.img} 
          onError={(e) => console.log('Image error:', e.nativeEvent.error)}
          onLoad={() => console.log('Image loaded successfully')}/>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTxt}>No image</Text>
        </View>
      )}
      <Pressable onPress={uploadImage} style={styles.button}>
        <Text style={styles.buttonTxt}>
          {image ? 'Change image' : 'Upload image'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  img: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    marginTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#cac8c8'
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5
  },
  buttonTxt: {
    color: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#ffffff'

  },
  placeholderTxt: {
    fontSize: 13,
    color: '#383636'
  }
})