import { useEffect, useState } from 'react';
import React from 'react' 
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, AsyncStorage } from 'react-native';
import { gettime } from '../services/Api';
import { ButtonGroup } from 'react-native-elements'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { AdMobID_Banner } from './AdMobIDs';
import { AdMobBanner } from 'expo-ads-admob';
import route_list from './routelist';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RouteScreen({navigation}) {

  const [allstationlist, setAllstationlist] = useState([])


  function renderitem(item) {
    return(
        <TouchableOpacity onPress={() => navigation.push("RouteStopScreen", {"item": item})}>
          <View style={{marginHorizontal: wp(5), marginVertical: hp(1), borderBottomWidth: 0.5, borderBottomColor: "darkgray", paddingBottom: hp(1), flexDirection: "row"}}>
            <View style={{borderWidth: wp(0.7), borderColor: "black", borderRadius: wp(10), flex: 1}}>
              <View style={{borderWidth: wp(1.5), borderColor: item.color, borderRadius: wp(5), flex: 1}}>
                  <Text style={{fontSize: wp(5), textAlign: "center", alignSelf: "center"}}>{item.route}</Text>
              </View>
            </View>
            <View style={{flex: 2.5, alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontSize: wp(5), textAlign: "center", alignSelf: "center"}}>{allstationlist!=[] && allstationlist.findIndex(itemy => itemy["name_en"] == item.stops[0])!=-1 && allstationlist[allstationlist.findIndex(itemy => itemy["name_en"] == item.stops[0])].name_cn} - {allstationlist!=[] &&  allstationlist.findIndex(itemy => itemy["name_en"] == item.stops[item.stops.length-1])!=-1  && allstationlist[allstationlist.findIndex(itemy => itemy["name_en"] == item.stops[item.stops.length-1])].name_cn}</Text>
            </View>
          </View>
        </TouchableOpacity>
    )
  }

  async function loadfromjson(){
    const jsonStationData = require('../assets/lrt_station_list.json');
    setAllstationlist(jsonStationData)
  }

  useEffect(() => {
    loadfromjson()
  }, [])

    
  return (
    <View style={styles.container}>
        <View style={{flex: 1, width: wp(100)}}>
            <View style={{backgroundColor: "#11254A", paddingTop: hp(5)}}>
              <Text style={{color: "white", textAlign: "center", fontSize: wp(5)}}>全部路線</Text>
            </View>
            <View style={{backgroundColor: "lightgray", flex: 1}}>
              <FlatList 
                  data={Object.values(route_list)}
                  renderItem={({item, index}) => renderitem(item)}
                  keyExtractor={(item, index) => index.toString()}
              />
            </View>
            <View style={{alignItems: "center", backgroundColor: "#11254A", padding: wp(1)}}> 
              <AdMobBanner
                      bannerSize='largeBanner'
                      adUnitID= {AdMobID_Banner}
                      servePersonalizedAds={true} />
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
