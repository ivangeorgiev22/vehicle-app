import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useAuth } from "../context/authContext";
import { API_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { io, Socket } from "socket.io-client";

interface Job {
  id: number;
  job_title: string;
  job_status: string;
}

export default function Jobs() {
  const { token, userId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs`, {
        headers: {'Authorization': `Bearer ${token}`}
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.log('Error', error);
    }
  }

  useEffect(() => {
    fetchJobs();
  //  const socket: Socket = io(API_URL, {
  //   auth: {token}
  //  });
  //  //upon connection, server sends all backlog jobs
  //  socket.on('connect', () => {
  //   console.log('Connected');
  //  });
  //  //listens for updates from server
  //  socket.on('jobs:backlog', (data: Job[]) => {
  //   setJobs(data);
  //  });
  //  //disconnects
  //  socket.on('disconnect', () => {
  //   console.log('Disconnected');
  //  });

  //  //on screen unmount clean up
  //  return () => {
  //   socket.disconnect();
  //  };
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