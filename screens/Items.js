import { StyleSheet, Text, View, Button, FlatList, StatusBar, SafeAreaView, Modal, TouchableWithoutFeedback, Pressable, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from 'react';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Item = ({ title, barcode }) => {
  return (
    <MenuProvider>
        <View style={styles.item}>
        <View style={styles["item-icon-style"]}>
          <Ionicons name="ios-basket" size={40} color="black"/>
        </View>
        <View>
          <Text style={styles.barcode}>{title}</Text>
          <Text style={styles.title}>{barcode}</Text>
        </View>
        <View>
          <Text style={styles.daysLeft}>31</Text>
        </View>
          
              <Menu>
                <MenuTrigger>
                <Ionicons name="ellipsis-vertical-outline" size={40} color="black"/>
               </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => alert(`Save`)} text="Save" />
                <MenuOption onSelect={() => alert(`Delete`)}>
                  <Text style={{ color: 'red' }}>Delete</Text>
                </MenuOption>
                <MenuOption
                  onSelect={() => alert(`Not called`)}
                  disabled={true}
                  text="Disabled"
                />
                </MenuOptions>
              </Menu>
        </View>  
        </MenuProvider>
  )
}
    
const Items = (props) => {

  const [dataToRender, setDataToRender] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);



  useEffect(() => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        let dataToRender = [];
        stores.map(element => {
          console.log({id: element[0], ...JSON.parse(element[1])})
          dataToRender.push({id: element[0], ...JSON.parse(element[1])});
        });
        setDataToRender(dataToRender)
      })
    })
  }, [])


  const renderItem = ({ item }) => {
    return (
          <Item title={item.title} barcode={item.barcode}/>
        )
  }

    return (
      <SafeAreaView style={styles.container}>
        { dataToRender.length >= 1 && <FlatList
          data={dataToRender}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />}
      </SafeAreaView>
    );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  settingsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    backgroundColor: '#ecf0f1',
  },
  daysLeft: {
    fontSize: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'lightgray',
    borderRadius: 10,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  "item-icon-style": {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
  },
  barcode: {
    fontSize: 16,
  }
});

export default Items;