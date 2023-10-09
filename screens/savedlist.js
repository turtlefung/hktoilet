import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import * as StoreReview from 'expo-store-review';
import {AdMobBanner, requestPermissionsAsync, getPermissionsAsync} from 'expo-ads-admob';

// You can import from local files
import { getarrivaltime } from '../services/Api';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';
import { AdMobID_Banner } from '../components/AdMobIDs';

export default function SavedlistScreen({navigation}) {

  //change variables
  const [savedlist, setSavedlist] = useState([])
  const [arrivaltimelist, setArrivaltimelist] = useState([])
  const [arrivaltimedict, setArrivaltimedict] = useState({})
  

  async function savetosavedlist(item){
      if (savedlist.findIndex(itemy => ((itemy.route_id == item.route_id) && (itemy.code == item.code)))!=-1) {
        console.log("existed")
        const newsavelist = savedlist.filter(items => items!=savedlist[savedlist.findIndex(itemy => ((itemy.route_id == item.route_id) && (itemy.code == item.code)))])
        setSavedlist(newsavelist)
        AsyncStorage.setItem("savedlist", JSON.stringify(newsavelist))
      } else {
        console.log("not existed")
        const tempobjecttosave = {
          "code": item.code, 
          "route_id": item.route_id,
          "shortName": item.shortName,
          "stopName": item.stopName,
          "routeDirection": item.routeDirection 
        }

        const existingobjectlistasync = await AsyncStorage.getItem("savedlist")
        if (existingobjectlistasync != null) {
          var existingobjectlist = JSON.parse(existingobjectlistasync)
        } else {
          var existingobjectlist = []
        }
        if (existingobjectlist.includes(tempobjecttosave) == false){
          const newobjectlist = existingobjectlist.concat(tempobjecttosave)
          console.log(newobjectlist)
          AsyncStorage.setItem("savedlist", JSON.stringify(newobjectlist))
          setSavedlist(newobjectlist)
        }
      }
    }

    async function getsavedlist(){
      const response = await AsyncStorage.getItem("savedlist")
      if (response!=null){
        const parsedresponse = JSON.parse(response)
        setSavedlist(parsedresponse)
      }
    }

    useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getsavedlist()
    });
    return unsubscribe;
  }, [navigation]);

  async function updatetime(){
      const temparrivaltimedict = {}
      for (let i =0 ; i < savedlist.length; i++){
        const arrivaltime = await getarrivaltime(savedlist[i].route_id, savedlist[i].code)
        temparrivaltimedict[savedlist[i].code] = arrivaltime
      }
      console.log(temparrivaltimedict)
      setArrivaltimedict(temparrivaltimedict)
    }

  
  const MINUTE_MS = 60000;

  useEffect(() => {
    if(arrivaltimedict) {
      let interval = setInterval(() => {
        updatetime()
      }, MINUTE_MS);
      return () => clearInterval(interval)
    } 
  }, [arrivaltimedict])

  useEffect(() => {
    updatetime()
  },[savedlist])

    function renderItem(item){

      const stopname = item.item.stopName
      const stopcode = item.item

      //console.log(stopList.filter(itemy => itemy["id"] == item["item"])[0]["lat"])
      //console.log(stopList.filter(itemy => itemy["id"] == item["item"])[0]["lon"])



      var currenttime = new Date()
      //console.log(currenttime)
      if (arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"]!=null){
      if (arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 0) {
        var arrivaltime = new Date(arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][0]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"])
        var diffMs = arrivaltime - currenttime
        var diffMins = (Math.round(((diffMs % 86400000) % 3600000) / 60000)).toString();
        }
      if (arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 1) {
        var arrivaltime1 = new Date(arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][1]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"])
        var diffMs1 = arrivaltime1 - currenttime
        var diffMins1 = (Math.round(((diffMs1 % 86400000) % 3600000) / 60000)).toString();
        }
      if (arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 2) {
        var arrivaltime2 = new Date(arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][2]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"])
        var diffMs2 = arrivaltime2 - currenttime
        var diffMins2 = (Math.round(((diffMs2 % 86400000) % 3600000) / 60000)).toString();
        }}

      return(
        <View style={{borderBottomColor: "darkgray", borderBottomWidth: 0.5}}>
          <View style={{flexDirection: "row"}}>
            <View style={{flex: 1}}>
                <View style={{backgroundColor: "#345cb4", borderRadius: 20, alignSelf: "flex-start", marginTop: 10, marginBottom: 5, paddingHorizontal: 10}}>
                  <Text style={{color: "white", fontSize: 17}}>{item.item.shortName}</Text>
                  <Text style={{color: "white", fontSize: 17}}>To {item.item.routeDirection}</Text>
                </View>
                <Text style={{color: "black", fontSize: 17}}>{item.item.stopName}</Text>
              </View>
            <View style={{marginTop: 10}}>
              <TouchableOpacity onPress={() => savetosavedlist({"route_id": item.item.route_id, "code": item.item.code, "shortName": item.item.shortName, "stopName": item.item.stopname, "routeDirection": item.item.routeDirection})}>
                  {(savedlist.findIndex(itemy => ((itemy.route_id == item.item.route_id) && (itemy.code == item.item.code)))!=-1)
                  ?
                  <MaterialCommunityIcons name="star" color={"orange"} size={wp(10)} />
                  :
                  <MaterialCommunityIcons name="star-outline" color={"darkgray"} size={wp(10)} />
                  }
                </TouchableOpacity>
            </View>
          </View>
          {arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"]!=null 
            ?
            <View style={{paddingLeft: 50}}>
            <Text style={styles.time}>
            {arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 0 ?
            arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][0]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][0]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[0] + ":" + arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][0]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[1] + " (" + diffMins + " mins)" : ""}
            </Text>
            <Text style={styles.time}>
            {arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 1 ? arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][1]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"] && arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][1]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[0] + ":" + arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][1]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[1] + " (" + diffMins1 + " mins)"  : ""}
            </Text>
            <Text style={styles.time}>
            {arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"].length > 2 ? arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][2]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"] && arrivaltimedict[stopcode["code"]] && arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][2]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[0] + ":" + arrivaltimedict[stopcode["code"]]["Siri"]["ServiceDelivery"]["StopMonitoringDelivery"][0]["MonitoredStopVisit"][2]["MonitoredVehicleJourney"]["MonitoredCall"]["ExpectedArrivalTime"].split("T")[1].split(":")[1] + " (" + diffMins2 + " mins)"  : ""}
            </Text>
            </View>
            :
            <View>
              <Text />
              <Text />
              <Text />
            </View>
            }
        </View>
      )
    }

    useEffect(() => {
      (async () => {
        const  current_status  = await getPermissionsAsync()
        console.log(current_status)
        console.log("hi")
        const { status } = await requestPermissionsAsync();
        console.log(status)
        if (status === 'granted') {
          console.log('Yay! I have user permission to track data');
        }
      })();
    }, []);

    async function checkusagetime() {
      try {
          const storestring = StoreReview.storeUrl()
          console.log("storestring: " + storestring)
          var asyncusagetime = await AsyncStorage.getItem("usagetime")
          if (asyncusagetime == null) {
              AsyncStorage.setItem("usagetime", "1")
              return
          }
  
          var usagetime = JSON.parse(asyncusagetime)
          console.log("usagetime: " + asyncusagetime)
          if (asyncusagetime == "3") {
              StoreReview.requestReview()
          } else {
              var newusagetime = usagetime+1
              AsyncStorage.setItem("usagetime", JSON.stringify(newusagetime))
          }
      } catch {
          console.log("error in opening review")
      }
    } 

    useEffect(() => {
      checkusagetime()
    },[])


  return (
    <View style={styles.container}>
      <View>
        <Text style={{color: "white", textAlign: "center", fontSize: 22}}>Saved list</Text>
      </View>
      <View style={{flex: 1, backgroundColor: "white"}}>
        <FlatList
         data={savedlist}
         renderItem={(item) => renderItem(item)}
         style={{paddingHorizontal: 8}}
          keyExtractor={item => item.code + item.route_id}
          showsVerticalScrollIndicator={false}
         />
      </View>
      <View style={{alignItems: "center", backgroundColor: "#345cb4", padding: wp(1)}}> 
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
