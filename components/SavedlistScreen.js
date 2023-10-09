import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import React from 'react' 
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Button, AsyncStorage } from 'react-native';
import { gettime } from '../services/Api';
import { ButtonGroup } from 'react-native-elements'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as StoreReview from 'expo-store-review';
import {AdMobBanner, requestPermissionsAsync, getPermissionsAsync} from 'expo-ads-admob';
import { AdMobID_Banner } from './AdMobIDs';
import route_list from './routelist';

export default function SavedlistScreen({navigation}) {

  const [savedlist, setSavedlist] = useState([])
  const [expandlist, setExpandlist] = useState([])
  const [timelist, setTimelist] = useState({})

  const bannerAdId = AdMobID_Banner


  async function getsavedlist(){
    const response = await AsyncStorage.getItem("savedlist")
    if (response!=null){
      const parsedresponse = JSON.parse(response)
      setSavedlist(parsedresponse)
      return parsedresponse
    }
    return false
  }

  async function savetosavedlist(item){
    if (savedlist.findIndex(itemy => ((itemy.name_cn == item.name_cn) && (itemy.name_en == item.name_en) && (itemy.station_id == item.station_id))) != -1) {
      const newsavelist = savedlist.filter(items => items!=savedlist[savedlist.findIndex(itemy => ((itemy.name_cn == item.name_cn) && (itemy.name_en == item.name_en) && (itemy.station_id == item.station_id)))])
      setSavedlist(newsavelist)
      AsyncStorage.setItem("savedlist", JSON.stringify(newsavelist))
    } 
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

   

  async function expand(station_id){
    if (expandlist.includes(station_id)){
      setExpandlist(expandlist.filter(item => item != station_id))
      return
    } else {
      setExpandlist(expandlist.concat(station_id))
      const response = await gettime(station_id)
      const temptimelist = timelist
      temptimelist[station_id] = response
      setTimelist({...temptimelist})
    }
  }

  
  async function updatetime(){
    const listofstopseqtoupdate = Object.keys(timelist)
    console.log(listofstopseqtoupdate)
    const temparrivaltimedict = {}
    for (let i =0 ; i < listofstopseqtoupdate.length; i++){
      const arrivaltime = await gettime(listofstopseqtoupdate[i])
      temparrivaltimedict[listofstopseqtoupdate[i]] = arrivaltime
    }
    //console.log(temparrivaltimedict)
    setTimelist(temparrivaltimedict)
  }

  const MINUTE_MS = 60000;

  useEffect(() => {
    if(timelist) {
      let interval = setInterval(() => {
        console.log("here")
        updatetime()
      }, MINUTE_MS);
      return () => clearInterval(interval)
    } 
  }, [timelist])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getsavedlist()
    });
    return unsubscribe;
  }, [navigation]);

  function renderitem(item) {
    return(
        <TouchableOpacity onPress={() => expand(item.station_id)}>
          <View style={{marginHorizontal: wp(5), marginVertical: hp(1), borderBottomWidth: 0.5, borderBottomColor: "darkgray", paddingBottom: hp(1), }}>
          <View style={{flexDirection:"row" }}>
            <View style={{flex: 1}}>
                <Text style={{fontSize: wp(8)}}>{item.name_cn}</Text>
                <Text style={{fontSize: wp(4)}}>{item.name_en}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => savetosavedlist(item)}>
                {(savedlist.findIndex(itemy => ((itemy.name_cn == item.name_cn) && (itemy.name_en == item.name_en) && (itemy.station_id == item.station_id)))!=-1)
                ?
                <MaterialCommunityIcons name="star" color={"orange"} size={wp(10)} />
                :
                <MaterialCommunityIcons name="star" color={"white"} size={wp(10)} />
                }
              </TouchableOpacity>
              
              <View>
                <MaterialCommunityIcons name={expandlist.includes(item.station_id) ? "chevron-up" : "chevron-down"} color={"darkgrey"} size={wp(10)} />
              </View>
            </View>
            </View>
            {expandlist.includes(item.station_id) && 
            <View style={{marginTop: hp(2)}}>
            <FlatList 
            data={(item.station_id in timelist) && timelist[item.station_id]["platform_list"]}
            renderItem={({item, index}) => renderplatformitem(item)}
            keyExtractor={(item, index) => index.toString()}
            />
            </View>
            }
            </View>
        </TouchableOpacity>
    )
  }

  function renderplatformitem(item) {
    return(
      <View>
        <View style={{borderBottomColor: "darkgray", borderBottomWidth: 0.5}}>
          <Text style={{fontSize: wp(4)}}>{item.platform_id}號月台</Text>
        </View>
        <FlatList 
          data={item.route_list}
          renderItem={({item, index}) => renderlrtitem(item)}
          keyExtractor={(item, index) => index.toString()}
          />
      </View>
  )}

  function renderlrtitem(item) {
    return(
      <View style={{flexDirection: "row", marginVertical: hp(0.5)}}>
        <View style={{flex: 1, borderWidth: wp(0.5), borderColor: "black", borderRadius: wp(5)}}>
          <View style={{flex: 1, borderWidth: wp(1), borderColor: route_list[item.route_no]["color"], borderRadius: wp(5)}}>
            <Text style={{textAlign: "center", alignSelf: "center", fontSize: wp(3)}}>{item.route_no}</Text>
            {/*<Text>{item.train_length == 1 ? "單卡" : "雙卡"}</Text>*/}
          </View>
        </View>
        <View style={{flex: 2, justifyContent: "center"}}>
          <Text style={{fontSize: wp(4), marginLeft: wp(3)}}>往: {item.dest_ch}</Text>
          {/*<Text>To: {item.dest_en}</Text>*/}
        </View>
        <View style={{flex: 1, alignItems: "flex-end", justifyContent: "center"}}>
          <Text style={{fontSize: wp(4)}}>{item.time_ch}</Text>
          {/*<Text>{item.time_en}</Text>*/}
        </View>
      </View>
  )}

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




  useEffect (() => {
    checkusagetime()
  },[])

  
  return (
    <View style={styles.container}>
        <View style={{flex: 1, width: wp(100)}}>
            <View style={{backgroundColor: "#11254A", paddingTop: hp(5)}}>
              <Text style={{color: "white", textAlign: "center", fontSize: wp(5)}}>已收藏車站</Text>
            </View>
            <View style={{backgroundColor: "lightgray", flex: 1}}>
              <FlatList 
                  data={savedlist}
                  renderItem={({item, index}) => renderitem(item)}
                  keyExtractor={(item, index) => index.toString()}
              />
            </View>
            <View style={{alignItems: "center", backgroundColor: "#11254A", padding: wp(1)}}> 
              <AdMobBanner
                      bannerSize='largeBanner'
                      adUnitID= {bannerAdId}
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
