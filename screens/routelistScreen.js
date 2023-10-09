import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'

// You can import from local files
import { getbusarrivaltime, getallagencies, getallroutesbyagency, getallstopbylocation } from '../services/Api';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';
import { AdMobID_Banner } from '../components/AdMobIDs';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import {AdMobBanner} from 'expo-ads-admob';

export default function RoutelistScreen({navigation}) {

  //static variables
  const MTAagencies = ["NYCT","MTABC"]

  //change variables
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchtext, setSearchtext] = useState()
  const [NYCTroutes, setNYCTroutes] = useState([])
  const [NYCTroutesshow, setNYCTroutesshow] = useState([])
  const [MTABCroutes, setMTABCroutes] = useState([])
  const [MTABCroutesshow, setMTABCroutesshow] = useState([])

  {/* comment out coz no need to fetch agencies every time -- There is only 2 agencies.
  async function fetchagencies(){
    const response = await getallagencies()
    const parser = new XMLParser();
    let obj = parser.parse(response);
  }

  useEffect(() => {
    fetchagencies()
  },[])
  */}


  async function fetchroutes(agency){
    const response = await getallroutesbyagency(agency)
    const parser = new XMLParser();
    let obj = parser.parse(response);
    //console.log("here")
    //console.log(obj["response"]["data"]["list"]["route"][0])
    if (agency=="MTA%20NYCT"){
      setNYCTroutes(obj["response"]["data"]["list"]["route"])
      setNYCTroutesshow(obj["response"]["data"]["list"]["route"])
    } else if (agency=="MTABC") {
      setMTABCroutes(obj["response"]["data"]["list"]["route"])
      setMTABCroutesshow(obj["response"]["data"]["list"]["route"])
    }
    //console.log("finish")
  }

  function renderItem(item){
    return(
      <TouchableOpacity onPress={() => {navigation.push("RoutedirectionScreen", {route_id: item["item"]["id"], shortName: item["item"]["shortName"]})}}>
      <View style={styles.routebox}>
        <Text style={styles.routename}>{item["item"]["shortName"]}</Text>
        <Text style={styles.routedest}>{item["item"]["longName"]}</Text>
      </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    if (selectedIndex==0){
      var agency = "MTA%20NYCT"
    } else if (selectedIndex==1){
      var agency = "MTABC"
    }

    fetchroutes(agency)

  },[selectedIndex])

  useEffect(() => {
    if (searchtext!= null){
      if (selectedIndex == 0){
          setNYCTroutesshow(NYCTroutes.filter(item => item["shortName"].substring(0,searchtext.length).toLowerCase().includes(searchtext.toLowerCase())))
      }
      if (selectedIndex == 1){
          setMTABCroutesshow(MTABCroutes.filter(item => item["shortName"].substring(0,searchtext.length).toLowerCase().includes(searchtext.toLowerCase())       ))
      }
    }
  }, [searchtext, selectedIndex])

  return (
    <View style={styles.container}>
      <View>
        <Text style={{color: "white", textAlign: "center", fontSize: 22}}>MTA Bus Time</Text>
        <TextInput
          style={styles.input}
          onChangeText={setSearchtext}
          placeholder="Search..."
        />
        <ButtonGroup
          selectedIndex={selectedIndex}
          onPress={(index) => {setSelectedIndex(index)}}
          buttons={MTAagencies}
          containerStyle={{borderRadius: 30, borderWidth: 0}}
          textStyle={{fontSize: 17}}
        />
      </View>
      <View style={{paddingHorizontal: 8, backgroundColor: "white", flex: 1}}>
        <FlatList
          data={selectedIndex==0 ? NYCTroutesshow : MTABCroutesshow}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={{alignItems: "center", backgroundColor: "#345cb4", padding: widthPercentageToDP(1)}}> 
        <AdMobBanner
                bannerSize='largeBanner'
                adUnitID= {AdMobID_Banner}
                servePersonalizedAds={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#345cb4",
  },
  input: {
    marginHorizontal: 12,
    marginVertical: 3,
    borderWidth: 0,
    padding: 10,
    borderColor: "lightgray",
    backgroundColor: "white",
    borderRadius: 30,
    fontSize: 17
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
