import { StyleSheet, Text, View, FlatList, Image, Pressable, Alert, PermissionsAndroid, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EditProduct from './products-screen/Edit-Product';

// TODO: Если 0 элементов то рендерится кнопка добавить новый, ведущая на New страничку (Сделано)

const Item = ({ title, barcode, itemId, bestBeforeDate, image, rerenderItems, navigateToEditPage }) => {

  const deleteItem = (id) => {
    AsyncStorage.removeItem(id, (err) => {
      console.log("Deleted");
    })
  }

  const itemMenuHandler = () => {
    Alert
    .alert("Выберите действие", 
            `Выберите действие с продуктом ${title}:`, 
            [{text: "Отмена", onPress: () => console.log("pressed cancel")}, 
             {text: "Удалить", onPress: () => {deleteItem(itemId); rerenderItems();}, style: "cancel"},
             {text: "Редактировать", onPress: () => navigateToEditPage()}
             ])
  }

  const dateToDays = (date) => {
    return Math.ceil((date - new Date().getTime()) / (1000 * 3600 * 24))
  } 

  return (
    <Pressable onPress={() => itemMenuHandler()}>
      <View style={styles.item}>
        <View style={styles["item-icon-style"]}>
          <>
          {image 
          ? <Image 
              source={{uri: image, width: 40, height: 40}} 
              style={{borderRadius: 5}}/> 
          : <Ionicons name="ios-basket" size={40} color="#404040"/>}
          </>
        </View>
        <View style={{justifyContent: 'center', width: '70%'}}>
          {
            barcode != "" 
            ?
            <>
              <Text style={[styles.title, {width: '40%'}]} numberOfLines={1}>{title}</Text>
              <Text style={[styles.barcode, {width: '40%'}]}>{barcode}</Text>
            </>
            :
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          }

        </View>
        <View style={styles.daysLeft}>
          <Text style={[styles.daysLeft, 
            dateToDays(bestBeforeDate) < 7 
            ? styles.textRed 
            : styles.textGreen]}>{dateToDays(bestBeforeDate) < 0 ? "!!!" : dateToDays(bestBeforeDate)}</Text>
        </View>
      </View> 
      </Pressable> 
  )
}
    
const Items = (props) => {

  const [hasPermission, setHasPermission] = useState(null);
  const [dataToRender, setDataToRender] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [render, setRender] = useState(false);


  const fetchDataFromAsyncStorage = () => {
        AsyncStorage.getAllKeys((err, keys) => {
          AsyncStorage.multiGet(keys, (err, stores) => {
            let dataToRender = [];
            stores.map(element => {
              dataToRender.push({id: element[0], ...JSON.parse(element[1])});
            });
            setDataToRender(dataToRender)
          })
        })
  }

  useEffect(() => {
    props.navigation.addListener('focus', () => {
      fetchDataFromAsyncStorage()
      // console.log(dataToRender)
  })
}, [])

  useEffect(() => {
    const requestStoragePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the EXTERNAL_STORAGE");
        } else {
          console.log("EXTERNAL_STORAGE permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestStoragePermission();
  }, [])

  const renderDefaultScreen = (props) => {
    return (
    <View style={styles.container}>
      { dataToRender.length >= 1 
      ? 
      <FlatList
        data={dataToRender}
        renderItem={({item}) => <Item 
                                  title={item.title} 
                                  barcode={item.barcode} 
                                  itemId={item.id} 
                                  bestBeforeDate={item.bestBeforeDate} 
                                  image={item.image} 
                                  rerenderItems={() => fetchDataFromAsyncStorage()} 
                                  navigateToEditPage={() => props.navigation.navigate('edit_product', {item: {...item}})}/>}
        keyExtractor={item => item.id}
      /> 
      : 
      <View style={styles.centered}>
        <Pressable style={{alignItems: 'center'}} onPress={() => props.navigation.navigate("Add")}>
          <Ionicons name="ios-add-circle-outline" size={125}/>
          <Text style={{fontWeight: 'bold'}}>Продуктов пока нет, добавьте новые.</Text>
        </Pressable>
      </View>}
    </View>)
  }

  const NavigationStack = createNativeStackNavigator();
    return (
      <NavigationStack.Navigator screenOptions={{headerShown: false}}>
        <NavigationStack.Screen name="default">{renderDefaultScreen}</NavigationStack.Screen>
        <NavigationStack.Screen name="edit_product" component={EditProduct} initialParams={{refresh: fetchDataFromAsyncStorage()}}/>
      </NavigationStack.Navigator>  
    );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    backgroundColor: 'white'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  daysLeft: {
    flex: 1,
    alignItems: 'flex-end',
    textAlignVertical: 'center',
    fontSize: 21,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: { width: 0, height: 2},
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  "item-icon-style": {
    marginRight: 10,
  },
  title: {
    fontSize: 17,
    color: '#606060',
    width: "99%",
    fontWeight: 'bold',
  },
  barcode: {
    fontSize: 10,
    color: '#808080'
  },
  textRed: {
    color: 'red'
  },
  textGreen: {
    color: 'green'
  }
});

export default Items;