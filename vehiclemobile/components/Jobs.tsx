import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable, Image, Alert } from "react-native";
import { useAuth } from "../context/authContext";
import { WEBSOCKET_URL } from "@env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Params } from "../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/SimpleLineIcons";
import User from 'react-native-vector-icons/Feather';
import { theme } from "../theme";

interface Job {
  id: string;
  job_title: string;
  job_status: string;
  plate?: string;
}

export default function Jobs() {
  const { userId, image } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<Params>>();
  const {token, logout} = useAuth();

  useEffect(() => {
    const webSocket = new WebSocket(WEBSOCKET_URL);
    webSocket.onopen = () => {
      console.log('Websocket Connected');
      webSocket.send(JSON.stringify({action: 'getBacklogJobs', token}));
    };
    webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message:', data)

      if(data.type === 'auth:expired') {
        logout();
        Alert.alert('Session expired', 'Please log in again.');
      }
      if(data.type === 'jobs:backlog') {
        setJobs(data.jobs);
      }
    };
    webSocket.onerror = (error) => {
      console.log('Error', error)
    };
    webSocket.onclose = (event) => {
      console.log('Websocket Disconnected', event.code, event.reason);
    };
    return () => {
      webSocket.close();
    }
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Jobs</Text>
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
        data={jobs} 
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{padding: 15}}
        renderItem={({item}) => (
          <Pressable onPress={() => navigation.navigate('Job Details', {id: item.id})}>
            <View style={styles.jobItem}>
              <View style={styles.label} />
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{item.job_title}</Text>
                {item.plate && (
                  <Text style={styles.vehicle}>Vehicle Reg: {item.plate}</Text>
                )}
              </View>
              <Icon name="arrow-right" size={15} />
            </View>
          </Pressable>
        )} 
      />
    </SafeAreaView>
  )
}

const styles= StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '700',
    color: theme.colors.text
  },
  jobItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: theme.elevation.card,

  },
  jobTitle: {
    fontSize: theme.fontSize.body
  },
  header: {
    backgroundColor: theme.colors.header,
    paddingHorizontal: theme.spacing.horizontal,
    paddingVertical: theme.spacing.vertical,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
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
  },
  label: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 14,
    backgroundColor: '#0d4fc0'
  },
  jobInfo: {
    flex: 1
  },
  vehicle: {
    fontSize: theme.fontSize.subtitle,
    color: '#777',
    marginTop: 2,
    fontStyle: 'italic'
  }
})