import React, {useState, useEffect, useRef} from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Modal, Linking, Platform, Alert, Image, ActivityIndicator, FlatList, StatusBar} from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, Polyline, Callout, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Dropdown } from 'react-native-material-dropdown-v2-fixed';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import * as Device from 'expo-device';
import * as StoreReview from 'expo-store-review';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// You can import from local files
import AssetExample from './components/AssetExample';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';
import { AdMobID_Banner } from './screens/AdMobIDs';

export default function App() {

  const mapRef = useRef()
  const markerRef = useRef()

  const [toiletlist, setToiletlist] = useState([])
  const [toiletlistshow, setToiletlistshow] = useState([])
  const [filtermodal, setFiltermodal] = useState(false)
  const [toilettype, setToilettype] = useState("all")
  const [toilettypelist, setToilettypelist] = useState([
    {label: '所有', value: 'all'},
    {label: '商場廁所', value: 'malltoilet'},
    {label: '公廁(不包括旱廁)', value: 'toilet'},
    {label: '公廁(包括旱廁)', value: 'aptoilet'},
  ])
  const [district, setDistrict] = useState("all")
  const [districtlist, setDistrictlist] = useState([
    {label: '所有', value: "all", coords: {latitude: 22.314016661743462, longitude: 114.17092492129424}},
    {label: '中西區', value: "CW", coords: {latitude: 22.284435120366577, longitude: 114.1554172340286}},
    {label: '東區', value: "E", coords: {latitude: 22.280793220683165, longitude: 114.22577186082289}},
    {label: '灣仔區', value: "Wch", coords: {latitude: 22.277157342069884, longitude: 114.17270192090746}},
    {label: '離島區', value: "Is", coords: {latitude: 22.290497095541145, longitude: 113.94227897949253}},
    {label: '南區', value: "S", coords: {latitude: 22.24699170766872, longitude: 114.15488715302429}},
    {label: '黃大仙區', value: "WTS", coords: {latitude: 22.341772992998717, longitude: 114.19426996466494}},
    {label: '屯門區', value: "TM", coords: {latitude: 22.393711274977576, longitude: 113.9731807157011}},
    {label: '油尖區', value: "YT", coords: {latitude: 22.29824157006353, longitude: 114.17145715761198}},
    {label: '旺角區', value: "MK", coords: {latitude: 22.31931774642973, longitude: 114.16921459441775}},
    {label: '深水埗區', value: "SSP", coords: {latitude: 22.330993861303746, longitude: 114.16206398745223}},
    {label: '觀塘區', value: "KT", coords: {latitude: 22.312329462171533, longitude: 114.22602142513004}},
    {label: '葵青區', value: "KwT", coords: {latitude: 22.36684017349007, longitude: 114.1305406993267}},
    {label: '荃灣區', value: "TW", coords: {latitude: 22.371107348124106, longitude: 114.11361403921788}},
    {label: '元朗區', value: "YL", coords: {latitude: 22.44454563610323, longitude: 114.02680117640831}},
    {label: '北區', value: "N", coords: {latitude: 22.500930328468144, longitude: 114.13156467094451}},
    {label: '九龍城區', value: "KC", coords: {latitude: 22.32909268030236, longitude: 114.18944843034035}},
    {label: '西貢區', value: "SK", coords: {latitude: 22.380816585444816, longitude: 114.27214366721813}},
    {label: '大埔區', value: "TP", coords: {latitude: 22.44893493475887, longitude: 114.16927425696726}},
    {label: '沙田區', value: "ST", coords: {latitude: 22.38298357660627,  longitude: 114.18969125101597}}
    ])
  const [region, setRegion] = useState()

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("denied")
  const [locationLoading, setLocationLoading] = useState(false)
  const [nearbyToilet, setNearbyToilet] = useState()
  const [selectedToilet, setSelectedToilet] = useState()

  async function getlocation(){
    setLocationLoading(true)
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status)
      if (status !== 'granted') {
        Alert.alert(
          "請設定本程式的位置使用權限",
          "",
          [
            {
              text: "取消",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            { text: "立即設定", onPress: () => Linking.openSettings() }
          ]
        );

        setLocationLoading(false)
        return;
      }
      setDistrict("all")
      let location = await Location.getCurrentPositionAsync({ accuracy: ((Platform.OS === "ios")|(Platform.OS === "iPadOS")) ? Location.Accuracy.Lowest : Location.Accuracy.Low });
      console.log(location)
      setLocation({latitude: location.coords.latitude, longitude: location.coords.longitude})
      mapRef.current.animateToRegion({
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
     })


      var temptoiletlist = toiletlist.filter(item => getDistance({latitude: location.coords.latitude, longitude: location.coords.longitude}, {latitude: item["map_coordinate"].split(",")[0], longitude: item["map_coordinate"].split(",")[1]}, accuracy = 1) <= 2000)
      temptoiletlist=temptoiletlist.map(item => ({...item, distance: Math.round(getDistance({latitude: location.coords.latitude, longitude: location.coords.longitude}, {latitude: item["map_coordinate"].split(",")[0], longitude: item["map_coordinate"].split(",")[1]}, accuracy = 1)/100)*10}))
      temptoiletlist.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setNearbyToilet(temptoiletlist)

     setLocationLoading(false)
  }


  useEffect(() => {
    function readjson(){
      const toiletData = require('./assets/fehdtoilet.json');
      const temptoiletlist = toiletData["DATA"]["fehd_service_locations"]["map"].filter(item => ((item["map_type"] == "toilet")|(item["map_type"] == "malltoilet")|(item["map_type"] == "ap")))
      //console.log(temptoiletlist.length)
      setToiletlist(temptoiletlist)
      setToiletlistshow(temptoiletlist)

      //console.log([...new Set(temptoiletlist.map(item => item["districtID"]))])
    }
    readjson()
  },[])

  useEffect(() => {{
    if (toiletlist!=[])
      if (toilettype!="all"){
        if (toilettype=="aptoilet"){
          const temptoiletlist = toiletlist.filter(item => ((item["map_type"] == "ap")|(item["map_type"] == "toilet")))
          setToiletlistshow(temptoiletlist)
        } else {
          const temptoiletlist = toiletlist.filter(item => (item["map_type"] == toilettype))
          setToiletlistshow(temptoiletlist)
        }
      } else {
        setToiletlistshow(toiletlist)
      }
    }
  },[toilettype, toiletlist])

  useEffect(() => {{
    if (toiletlist!=[])
      if (district!="all"){
        const temptoiletlist = toiletlist.filter(item => (item["districtID"] == district))
        setToiletlistshow(temptoiletlist)
      } else {
        setToiletlistshow(toiletlist)
      }
    }
  },[district, toiletlist])

  useEffect(() => {

    if (markerRef && markerRef.current && markerRef.current.showCallout) {
      console.log("show callout")
      markerRef.current.showCallout();
    }
  },[location, markerRef])

  async function onlygetlocation(){
    if (location){
      let location = await Location.getCurrentPositionAsync({ accuracy: Platform.OS === "ios" ? Location.Accuracy.Lowest : Location.Accuracy.Low });
      setLocation({latitude: location.coords.latitude, longitude: location.coords.longitude})
    }
  }

  useEffect(() => {
    if (locationStatus=="granted"){
      const interval = setInterval(() => {
        onlygetlocation()
      }, 2000);
      return () => clearInterval(interval);
    }
  },[locationStatus])

  useEffect(() => {
    mapRef.current.animateToRegion({
        longitude: districtlist.filter(item => item.value == district)[0].coords.longitude,
        latitude: districtlist.filter(item => item.value == district)[0].coords.latitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    })
  },[district])

  function directToToilet(item){
    setSelectedToilet(item)
    mapRef.current.animateToRegion({
        longitude: parseFloat(item.map_coordinate.split(",")[1]),
        latitude: parseFloat(item.map_coordinate.split(",")[0]),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    })
  }

  function canceleverything(){
    setSelectedToilet()
    setLocation()
    setNearbyToilet()
    setDistrict("all")
    setToilettype("all")
    setToiletlistshow(toiletlist)
  }

  function renderItem(item){
    return(
      <TouchableOpacity onPress={() => directToToilet(item.item)}>
        <View style={{borderBottomWidth: 1, borderBottomColor: "lightgray", flexDirection: "row", marginHorizontal: wp(2), marginBottom: hp(2)}}>
          <View style={{flexDirection: "column", flex: 1, marginHorizontal: wp(2)}}>
              <View style={{width: wp(55)}}>
                <Text style={{fontSize: wp(5), fontWeight: "bold"}}>{item.item.name_c}</Text>
              </View>
              <View style={{justifyContent: "center", borderRadius: wp(4), backgroundColor: item.item.map_type=="toilet" ? "green" : item.item.map_type=="malltoilet" ? "red" :  item.item.map_type=="ap" && "brown", width: wp(20), height: wp(7)}}>
                <Text style={{fontSize: wp(4), color: "white", textAlign: "center", fontWeight: "bold"}}>{item.item.map_type=="toilet" ? "公廁" : item.item.map_type=="malltoilet" ? "商場廁所" :  item.item.map_type=="ap" && "旱廁"}</Text>
              </View>
            <Text style={{fontSize: wp(4)}}>{item.item.address_c}</Text>
            <Text style={{fontSize: wp(4)}}>
              距離 {Math.round(getDistance({latitude: location.latitude, longitude: location.longitude}, {latitude: item.item["map_coordinate"].split(",")[0], longitude: item.item["map_coordinate"].split(",")[1]}, accuracy = 1)/100)/10} 公里
            </Text>
          </View>
          <View style={{justifyContent: "center", alignItems: "center", marginHorizontal: wp(2)}}>
            <TouchableOpacity onPress={() => {
                Linking.openURL("https://www.google.com/maps?saddr=My+Location&daddr=" + item.item["map_coordinate"])}}>
              <View>
                <MaterialCommunityIcons color="black" name="arrow-right-bold" size={wp(10)} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

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
    <>
      <StatusBar
          animated={true}
          backgroundColor="#24E2F0"
          barStyle={'dark-content'} />
    <View style={styles.container}>

      <Modal visible={filtermodal}>
        <View style={{flex:1, justifyContent: "center"}}>
          <View style={{flex:1, justifyContent: "center"}}>
            <View style={{padding: 10}}>
              {/*<Text style={{fontSize: wp(5)}}>廁所種類</Text>*/}
              <Text />
              <Dropdown
                icon='chevron-down'
                iconColor='#E1E1E1'
                label='廁所種類'
                data={toilettypelist}
                onChangeText={item => setToilettype(item)}
                value={toilettype}
              />
              {/*<Text style={{fontSize: wp(5)}}>地區</Text>*/}
              <Text />
              <Dropdown
                icon='chevron-down'
                iconColor='#E1E1E1'
                label='地區'
                data={districtlist}
                onChangeText={item => setDistrict(item)}
                value={district}
              />
            </View>

            <TouchableOpacity onPress={() => setFiltermodal(false)}>
            <View style={{backgroundColor: "#F4485E", paddingHorizontal: wp(2), paddingVertical: hp(1),marginVertical: hp(1), alignSelf: "center", width: wp(55), alignItems: "center", flexDirection: "row", justifyContent: "center", elevation: 20, shadowColor: '#52006A'}}>
                <Text style={{color: "white", fontSize: wp(5), textAlign: "center"}}>確定</Text>
              </View>
            </TouchableOpacity>
          </View>
            {(Constants.isDevice) &&
              <View style={{alignItems: "center", justifyContent: 'center', width: wp(100)}}>
                <BannerAd
                  unitId={AdMobID_Banner}
                  size={BannerAdSize.FULL_BANNER}
                  requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                  }}
                />
              </View>
                }
        </View>
      </Modal>


      <MapView 
        style={{width: wp(100), height: nearbyToilet ? hp(55) : hp(100)}} 
        initialRegion={{
          latitude: 22.314016661743462,
          longitude: 114.17092492129424,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,}}
          onRegionChangeComplete={
            (region) => {setRegion(region)}
          }
        ref={mapRef}
        provider={((["iOS", "iPadOS"].includes(Device.osName) && Device.osVersion.split(".")[0] >= 13)) ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        tracksViewChanges={false}
      >
        {region!=null && toiletlistshow.map((item, index) => {
          return(
            <Marker
              key={index}
              coordinate={{latitude: parseFloat(item["map_coordinate"].split(",")[0]), longitude: parseFloat(item["map_coordinate"].split(",")[1])}}
              tracksViewChanges={false}
              icon={item["map_type"]=="malltoilet" ? require("./assets/malltoilet.png") : item["map_type"]=="toilet" ? require("./assets/toilet.png") : item["map_type"]=="ap" && require("./assets/ap.png")}
            >
              {/*<Image source={require("./assets/toilet.png")} style={{width: wp(13), height: wp(13)}} />*/}
              <Callout onPress={() => {
                Linking.openURL("https://www.google.com/maps?saddr=My+Location&daddr=" + item["map_coordinate"])}}>
                <View style={{width: wp(40)}}>
                  <Text style={{fontSize: wp(5), fontWeight: "bold", textAlign: "center"}}>{item["name_c"]}</Text>
                  <Text  style={{fontSize: wp(4), textAlign: "center"}}>地址: {item["address_c"]}</Text>
                </View>
              </Callout>
            </Marker>
          )
        })}
        {selectedToilet && 
        <Marker 
          coordinate={{latitude: parseFloat(selectedToilet["map_coordinate"].split(",")[0]), longitude: parseFloat(selectedToilet["map_coordinate"].split(",")[1])}}
          icon={require("./assets/selected.png")}
          >
        </Marker>
        }
        {location && 
        <Marker 
          coordinate={location} 
          icon={require("./assets/yourlocation.png")}
          ref={markerRef}>
          <Callout>
            <Text style={{fontSize: 20}}>你的位置</Text>
          </Callout>
        </Marker>
        }
      </MapView>


      <View style={{position: "absolute", bottom: nearbyToilet ? hp(50) : hp(5), alignSelf: "center"}}>
        <TouchableOpacity onPress={() => setFiltermodal(true)}>
          <View style={{backgroundColor: "#F4485E", paddingHorizontal: wp(2), paddingVertical: hp(1),marginVertical: hp(1), alignSelf: "center", width: wp(75), alignItems: "center", flexDirection: "row", justifyContent: "center", elevation: 20, shadowColor: '#52006A'}}>
            <Text style={{color: "white", fontSize: hp(3), textAlign: "center", marginRight: wp(1), fontWeight: "bold"}}>篩選條件</Text>
            <MaterialCommunityIcons name="cog" color="white" size={wp(7)} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => getlocation()}>
          <View style={{backgroundColor: "#FED80B", paddingHorizontal: wp(2), paddingVertical: hp(1), alignSelf: "center", width: wp(75), alignItems: "center", flexDirection: "row", justifyContent: "center", elevation: 20, shadowColor: '#52006A'}}>
            <Text style={{color: "black", fontSize: hp(3), textAlign: "center", marginRight: wp(1), fontWeight: "bold"}}>附近的廁所</Text>
            {locationLoading == false ?
            <MaterialCommunityIcons name="map-marker" color="black" size={wp(7)} />
            :
            <ActivityIndicator color="black" size={wp(5)} />
            }
          </View>
        </TouchableOpacity>
      </View>

      {nearbyToilet && 
      <View style={{height: hp(45)}}>
        <View style={{height: hp(5), backgroundColor: "lightgray", flexDirection: "row"}}>
          <View style={{flex: 1}} />
          <View style={{justifyContent: "center", marginRight: wp(2)}}>
            <TouchableOpacity onPress={() => canceleverything()}>
              <View>
                <MaterialCommunityIcons name="close" color="white" size={wp(7)} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{padding: wp(1), flex: 1}}>
          <FlatList
            data={nearbyToilet}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.map_coordinate}
          />
        </View>
        {(Constants.isDevice) &&
          <View style={{alignItems: "center", justifyContent: 'center', width: wp(100)}}>
            <BannerAd
              unitId={AdMobID_Banner}
              size={BannerAdSize.FULL_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
            }
      </View>}
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'white',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
