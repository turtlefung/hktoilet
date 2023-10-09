import * as React from 'react';
import {useEffect, useState} from 'react'
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, AsyncStorage } from 'react-native';
import Constants from 'expo-constants';
import { XMLParser } from 'fast-xml-parser';
import {ButtonGroup} from 'react-native-elements'
import MapView, { Marker, Polyline } from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// You can import from local files
import { getroutedetails, getarrivaltime } from '../services/Api';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';

export default function RoutedetailsScreen({navigation, route}) {

  //static variables
  const stopGroup = route.params.stopGroup
  const stopList = route.params.stopList
  const item_id = route.params.item_id
  const route_id = route.params.route_id
  const shortName = route.params.shortName
  const mapRef = React.createRef();

  //state variables
  const [arrivaltimelist, setArrivaltimelist] = useState([])
  const [arrivaltimedict, setArrivaltimedict] = useState({})
  const [savedlist, setSavedlist] = useState([])
  const [expandlist, setexpandlist] = useState([])
  const [startlat, setStartlat] = useState()
  const [startlong, setStartlong] = useState()
  const [coordinatelist, setCoordinatelist] = useState([])
  
  const MINUTE_MS = 60000;

  useEffect(() => {
    if(arrivaltimedict) {
      let interval = setInterval(() => {
        updatetime()
      }, MINUTE_MS);
      return () => clearInterval(interval)
    } 
  }, [arrivaltimedict])

    async function expandorcontrad(item){
      if (expandlist.includes(item)){
        setexpandlist(expandlist.filter(iteme => iteme!=item))
      } else {
        setexpandlist(expandlist.concat(item))
        const arrivaltime = await getarrivaltime(route_id, item["code"])
        //console.log(arrivaltime)
        arrivaltimedict[item["code"]] = arrivaltime
        setArrivaltimedict({...arrivaltimedict})
      }
    }

    async function updatetime(){
      const listofstopseqtoupdate = Object.keys(arrivaltimedict)
      console.log(listofstopseqtoupdate)
      const temparrivaltimedict = {}
      for (let i =0 ; i < listofstopseqtoupdate.length; i++){
        const arrivaltime = await getarrivaltime(route_id, listofstopseqtoupdate[i])
        temparrivaltimedict[listofstopseqtoupdate[i]] = arrivaltime
      }
      //console.log(temparrivaltimedict)
      setArrivaltimedict(temparrivaltimedict)
    }

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
      getsavedlist()
    },[])


  function renderItem(item){
    const stopname = stopList.filter(itemy => itemy.id == item.item)[0]["name"]
    const stopcode = stopList.filter(itemy => itemy.id == item.item)[0]

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
      <TouchableOpacity onPress={() => {expandorcontrad(stopcode)}}>
        <View style={styles.routebox}>
          <View style={{flexDirection: "row"}}>
            <View style={{flex: 1}}>
              <Text style={styles.routename}>{stopname}</Text>
            </View>
            <View style={{flexDirection: "column"}}>
              
              <TouchableOpacity onPress={() => savetosavedlist({"route_id": route_id, "code": stopcode["id"], "shortName": shortName, "stopName": stopname, "routeDirection": stopGroup[stopGroup.findIndex(item => item.id == item_id)]["name"]["name"]})}>
                {(savedlist.findIndex(itemy => ((itemy.route_id == route_id) && (itemy.code == stopcode["id"])))!=-1)
                ?
                <MaterialCommunityIcons name="star" color={"orange"} size={wp(10)} />
                :
                <MaterialCommunityIcons name="star-outline" color={"darkgray"} size={wp(10)} />
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => {expandorcontrad(stopcode)}}>
                  <MaterialCommunityIcons name="chevron-down" color="black" size={40} />
              </TouchableOpacity>
            </View>
          </View>
          {/*<Text style={styles.routename}>{item.item}</Text>*/}
          {expandlist.includes(stopcode) &&
          <View>
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
          }
        </View>
      </TouchableOpacity>
    )
  }

  function setstartlonglat(){
    if (stopList && stopGroup){
    const firststopgroup = stopGroup[stopGroup.findIndex(item => item.id == item_id)]["stopIds"]
    const firststop = firststopgroup[Math.floor(firststopgroup.length/2)]
    var temp_startlat = stopList.filter(itemy => itemy["id"] == firststop)[0]["lat"]
    var temp_startlong = stopList.filter(itemy => itemy["id"] == firststop)[0]["lon"]
    setStartlat(temp_startlat)
    setStartlong(temp_startlong)

    var tempcoordinatelist = stopGroup[stopGroup.findIndex(item => item.id == item_id)]["stopIds"].map((item) => ({latitude : stopList.filter(itemy => itemy["id"] == item)[0]["lat"], longitude: stopList.filter(itemy => itemy["id"] == item)[0]["lon"]}))
    //console.log(tempcoordinatelist)
    setCoordinatelist(tempcoordinatelist)

    }
  }

  useEffect(()=>{
    setstartlonglat()
  },[stopList, stopGroup])

  useEffect(() => {
        if (expandlist!= null) {
          if (expandlist[expandlist.length-1] != null) {
            console.log(expandlist[expandlist.length-1])
            mapRef.current.animateToRegion({
                    latitude: expandlist[expandlist.length-1]["lat"],
                    longitude: expandlist[expandlist.length-1]["lon"],
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005
                  })
          }
            }
    }, [mapRef, expandlist])




  return (
    <View style={styles.container}>
      <View style={{flexDirection: "row"}}>
        <View style={{flex: 1}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" color="white" size={40} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 3, flexDirection: "column"}}>
          <View style={{alignItems: "center", backgroundColor: "white", borderRadius: 20, alignSelf: "center", marginTop: 10, paddingHorizontal: 10}}>
            <Text style={{textAlign: "center", fontSize: 20, color: "#345cb4"}}>{shortName}</Text>
          </View>
          <Text style={{textAlign: "center", fontSize: 20, marginTop: 2, color: "white"}}>
            {stopGroup[stopGroup.findIndex(item => item.id == item_id)]["name"]["name"]}
          </Text>
        </View>
        <View style={{flex: 1}} />
      </View>
      {startlat && startlong &&
      <MapView 
              ref={mapRef}
              style={{width: wp(100), height: hp(30)}}
              initialRegion={{
                latitude: startlat, 
                longitude: startlong,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              
              >
          {coordinatelist.map((item, index) => (
              <Marker
              key={index}
              coordinate={item}
              />
            ))}
          <Polyline 
            coordinates={coordinatelist}
            strokeWidth={4}
            strokeColor="#345cb4"
          />
      </MapView>
      }
      <View style={{flex:1, backgroundColor: "white", paddingHorizontal: 8}}>
        <FlatList
          data={stopGroup[stopGroup.findIndex(item => item.id == item_id)]["stopIds"]}
          renderItem={renderItem}
          keyExtractor={(item, index) => index}
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
    borderBottomWidth: 1,
    paddingBottom: 40,
  },
  routename: {
    fontSize: 20
  },
  routedest: {
    fontSize: 15
  },
  time: {
    fontSize: 20,
    color: "#545454"
  }
});
