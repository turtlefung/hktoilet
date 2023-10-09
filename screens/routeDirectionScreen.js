import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// You can import from local files
import { getroutedetails } from '../services/Api';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';

export default function RoutedirectionScreen({navigation, route}) {

  //static variables
  const route_id = route.params.route_id
  const shortName = route.params.shortName

  //state variables
  const [stopGroup, setStopGroup] = useState([])
  const [stopList, setStopList] = useState([])

  function renderItem(item){
    console.log(item.item.id)
    return(
      <TouchableOpacity onPress={() => {navigation.push("RoutedetailsScreen",{stopGroup: stopGroup, stopList: stopList, item_id: item.item.id, route_id: route_id, shortName: route.params.shortName})}}>
      <View style={styles.routebox}>
        <Text style={styles.routename}>{item.item.name.name}</Text>
        <View style={{alignItems: "flex-end"}}>
          <MaterialCommunityIcons name="chevron-right" color="black" size={40} />
        </View>
      </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    async function fetchroutedetails(){
      const response = await getroutedetails(route_id)
      setStopGroup(response.data.entry.stopGroupings[0].stopGroups)
      //console.log(response.data.references.stops)
      setStopList(response.data.references.stops)
    }

    fetchroutedetails()
  },[route_id])

  return (
    <View style={styles.container}>
      <View style={{flexDirection: "row"}}>
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" color="white" size={40} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 3}}>
          <View style={{alignItems: "center", backgroundColor: "white", borderRadius: 20, alignSelf: "center", marginVertical: 10, paddingHorizontal: 10}}>
            <Text style={{textAlign: "center", fontSize: 22, color: "#345cb4"}}>{shortName}</Text>
          </View>
        </View>
        <View style={{flex: 1}} />
      </View>
      <View style={{paddingHorizontal: 8, backgroundColor: "white", flex: 1}}>
        <FlatList
          data={stopGroup}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#345cb4',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: "lightgray"
  },
  routebox:{
    marginVertical: 10,
    paddingHorizontal: 8,
    borderBottomColor: "lightgray",
    borderBottomWidth: 1
  },
  routename: {
    fontSize: 20
  },
  routedest: {
    fontSize: 15
  }
});
