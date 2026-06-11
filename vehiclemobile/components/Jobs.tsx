import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useAuth } from "../context/authContext";
import { WEBSOCKET_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";

interface Job {
  id: number;
  job_title: string;
  job_status: string;
}

export default function Jobs() {
  const { token, userId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  useEffect(() => {
    const webSocket = new WebSocket(WEBSOCKET_URL);

    webSocket.onopen = () => {
      console.log('Websocket Connected');
    };

    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message:', data)
      
      if(data.type === 'jobs:backlog') {
        setJobs(data.jobs);
      }
    };

    webSocket.onerror = (error) => {
      console.log('Error', error)
    };
    
    webSocket.onclose = () => {
      console.log('Websocket Disconnected');
    };

    return () => {
      webSocket.close();
    }
  }, [])

  return (
    <View style={styles.container}>
       <Pressable onPress={() => navigation.navigate('Profile', {id: userId }) }>
        <Text style={styles.profileTitle}>Profile</Text>
      </Pressable>
      <Text style={styles.title}>Jobs</Text>
      <FlatList 
        data={jobs} 
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <Pressable onPress={() => navigation.navigate('Job Details', {id: item.id})}>
            <View style={styles.jobItem}>
              <Text style={styles.jobTitle}>{item.job_title}</Text>
            </View>
          </Pressable>
        )} 
      />
    </View>
  )
}

const styles= StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 20
  },
  jobItem: {
    padding: 12,
    borderColor: '#151414',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 15
  },
  profileTitle: {
    fontSize: 20
  }
})