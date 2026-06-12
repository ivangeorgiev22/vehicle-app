import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert, Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../context/authContext";
import { API_URL } from "@env";

interface Task {
  key: string;
  description: string;
  task_status: 'Waiting' | 'Accepted' | 'Completed'
}

export default function JobDetails() {
  const { token } = useAuth();
  const route = useRoute(); //gives access to current screen route object
  const { id } = route.params as {id: string}; //typed unknown by default so assure typescript there is a valid id
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
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
      const res = await fetch(`${API_URL}/jobs/${id}/task/${key}/status`, {
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
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.key}
        renderItem={({item}) => (
          <View style={styles.taskList}>
            <Text style={styles.taskDesc}>{item.description}</Text>
            <Text style={styles.taskStatus}>Status: {item.task_status}</Text>

            {item.task_status === 'Waiting' && (
              <Pressable onPress={() => updateTaskStatus(item.key, 'Accepted')} style={styles.acceptButton}>
                <Text>Accept Task</Text>
              </Pressable>
            )}

            {item.task_status === 'Accepted' && (
              <Pressable onPress={() => updateTaskStatus(item.key, 'Completed')} style={styles.completeButton}>
                <Text>Complete Task</Text>
              </Pressable>
            )}
          </View>
        )}
       />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 15
  },
  taskList: {
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'column',
    padding: 20,
    marginBottom: 12
  },
  taskDesc: {
    fontSize: 20,
  },
  taskStatus: {
    fontSize: 13,
    color: '#666',
    marginTop: 7,
    fontStyle: 'italic',
    alignSelf: 'baseline'
  },
  acceptButton: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 7,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  completeButton: {
    backgroundColor: '#4caf50',
    borderRadius: 4,
    padding: 7,
    alignItems: 'center',
    alignSelf: 'flex-end',
  }
})