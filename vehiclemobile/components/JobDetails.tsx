import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert, Pressable, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../context/authContext";
import { API_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import User from 'react-native-vector-icons/Feather';
import { theme } from "../theme";

interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}

export default function JobDetails() {
  const { token, image, userId } = useAuth();
  const route = useRoute(); //gives access to current screen route object
  const { id } = route.params as {id: string}; //typed unknown by default so assure typescript there is a valid id
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();
  const callApi = useFetch();

  const fetchJob = async () => {
    try {
      const res = await callApi(`${API_URL}/jobs/${id}`, {
        headers: {'Authorization': `Bearer ${token}`}
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  const updateTaskStatus = async (key: string, task_status: 'Accepted' | 'Completed') => {
    try {
      const res = await callApi(`${API_URL}/jobs/${id}/task/${key}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({task_status})
      })

      if (res.ok) {
        fetchJob();
      } else {
        Alert.alert('Failed to update task')
      }
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Profile', { id: userId })}>
          <View style={styles.avatar}>
            {image ? (
              <Image source={{uri: image }} style={styles.img} />
            ):(
              <User name="user" size={22} />
            )}
          </View>
        </Pressable>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{padding: 15}}
        renderItem={({item}) => (
          <View style={styles.taskItem}>
            <View style={styles.label} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskDesc}>{item.description}</Text>
              <Text style={styles.taskStatus}>Status: {item.task_status}</Text>
            </View>

            {item.task_status === 'Waiting' && (
              <Pressable onPress={() => updateTaskStatus(item.key, 'Accepted')} style={styles.acceptButton}>
                <Text style={styles.buttonTxt}>Accept</Text>
              </Pressable>
            )}

            {item.task_status === 'Accepted' && (
              <Pressable onPress={() => updateTaskStatus(item.key, 'Completed')} style={styles.completeButton}>
                <Text style={styles.buttonTxt}>Complete</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.text
  },
  taskItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.item,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    elevation: theme.elevation.card,
  },
  taskDesc: {
    fontSize: 20,
  },
  taskStatus: {
    fontSize: theme.fontSize.subtitle,
    color: '#666',
    marginTop: 7,
    fontStyle: 'italic',
  },
  acceptButton: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  buttonTxt: {
    color: theme.colors.text
  },
  completeButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  header: {
    backgroundColor: theme.colors.header,
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.vertical,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50
  },
  label: {
    width: 4,
    height: 'auto',
    borderRadius: 2,
    marginRight: 14,
    backgroundColor: '#0d4fc0'
  },
  taskInfo: {
    flex: 1
  },
  avatar: {
    width: theme.avatar.size,
    height: theme.avatar.size,
    borderRadius: theme.borderRadius.avatar,
    backgroundColor: theme.colors.avatar,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: theme.avatar.size,
    height: theme.avatar.size,
    borderRadius: theme.borderRadius.avatar,
  }
})