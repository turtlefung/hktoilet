import Constants from 'expo-constants';

const AdMobProductionid_Banner = Platform.OS === "ios" ? "ca-app-pub-9512123199708539/5494981941" : "ca-app-pub-9512123199708539/4623633847"
const AdMobTestid_Banner = Platform.OS === "ios" ? "ca-app-pub-3940256099942544/2934735716" : "ca-app-pub-3940256099942544/6300978111"

export const AdMobID_Banner = Constants.isDevice && !__DEV__ ? AdMobProductionid_Banner : AdMobTestid_Banner