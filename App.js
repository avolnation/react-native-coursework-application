import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Scanner from './screens/Scanner';
import Items from './screens/Items';
import Add from './screens/Add';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NewBarcode from './screens/NewBarcode';
import Auth from './screens/Auth';

const Tab = createBottomTabNavigator();

export default function App() {

  const [ loggedIn, setLoggedIn ] = useState(false);
  const [ userToken, setUserToken ] = useState("");


  const logInHandler = () => {
    setLoggedIn(true);
  }

  
  return ( 
      <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size}) => {
            
            let iconName;

            switch(route.name){
              case "Scan":
              iconName = focused ? 'ios-barcode' : 'ios-barcode-outline';
              break;
              case "New":
              iconName = focused ? 'ios-add-circle' : 'ios-add-circle-outline';
              break;
              case "Products":
              iconName = focused ? 'ios-clipboard' : 'ios-clipboard-outline';
              break;
            }
            return <Ionicons name={iconName} size={size} color={color}/>
          }, 

          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerTitleAlign: "center"
          // headerShown: false
          
        })}>
        <Tab.Screen
          name="Scan"
          component={Scanner}
          options={{ title: 'Scan' }}
        />
        <Tab.Screen 
          name="New" 
          component={Add} 
        />
        <Tab.Screen 
          name="Barcodes"
          component={NewBarcode}/>
        <Tab.Screen 
          name="Products" 
          component={Items} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
        left: 20,
        right: 0,
        top: 0,
        bottom: 0
  },
});