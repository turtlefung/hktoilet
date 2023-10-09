import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import SavedlistScreen from './SavedlistScreen';
import RouteScreen from './RouteScreen';
import { createStackNavigator } from '@react-navigation/stack';
import RouteStopScreen from './RouteStopScreen';


const RouteStack = createStackNavigator();

function RouteNavigator() {

  return (
      <RouteStack.Navigator>
        <RouteStack.Screen name="RouteScreen" component={RouteScreen} options={{ headerShown: false }} />
        <RouteStack.Screen name="RouteStopScreen" component={RouteStopScreen} options={{ headerShown: false }} />
      </RouteStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function BottomTabNav() {
  return (
      <Tab.Navigator
      screenOptions={{
        "tabBarActiveTintColor": "white",
        "tabBarInactiveTintColor": "darkgray",
        "tabBarActiveBackgroundColor": "#11254A",
        "tabBarInactiveBackgroundColor": "#11254A",
        "tabBarLabelStyle": [{fontSize: widthPercentageToDP(3)}],
        "tabBarStyle": [
          {
            "display": "flex",
            "backgroundColor": "#11254A",
            "borderTopColor": "#11254A",
          },
          null
        ],
      }}
      >
        <Tab.Screen 
          name="SavedRoutes"
          component={SavedlistScreen} 
          options={{
              tabBarLabel: '已收藏車站',
              tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="content-save" color={color} size={size} />
              ),
              headerShown: false,
              tabBarHideOnKeyboard : Platform.OS === "ios" ? false : true,
          }}/>
        <Tab.Screen 
            name="Home"
            component={HomeScreen} 
            options={{
                tabBarLabel: '全部車站',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="clock-time-eight" color={color} size={size} />
                ),
                headerShown: false,
                tabBarHideOnKeyboard : Platform.OS === "ios" ? false : true,
            }}/>
        <Tab.Screen 
            name="Route"
            component={RouteNavigator} 
            options={{
                tabBarLabel: '全部路線',
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="format-list-checkbox" color={color} size={size} />
                ),
                headerShown: false,
                tabBarHideOnKeyboard : Platform.OS === "ios" ? false : true,
            }}/>
      </Tab.Navigator>
  );
}