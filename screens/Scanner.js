import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, Alert, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';


const Scanner = (props) => {

    const LOCALHOST_URL = "react-node-api.clefer.ru";

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [isActive, setIsActive] = useState(false);

    // alert());
    useEffect(() => {
        props.navigation.addListener('focus', () => {
            // alert("Focused");
            setIsActive(true);
        })
    })

    useEffect(() => {
        props.navigation.addListener('blur', () => {
            // alert("blured");
            setIsActive(false);
        })
    })
  
    useEffect(() => {
      const getBarCodeScannerPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      };
  
      getBarCodeScannerPermissions();
    }, []);

    const createAlert = (type, data) => {
      if(type == 128 || type == 64 || type == 32){
        fetch(`http://${LOCALHOST_URL}/barcodes/get-info-by-barcode/${data}`)
        .then(res => res.json())
        .then(res => {
          Alert.alert(res.message == "Info by barcode" ? "Штрихкод был найден на сервере" : "Такого штрихкода ещё нет на сервере", res.message == "Info by barcode" ? `Название продукта: ${res.body.title}, добавить это название к новому продукту?` : "На сервере нет информации о данном штрихкоде. Но, вы можете её добавить.", res.status == "found" ? [{text: "Добавить", onPress: () => props.navigation.navigate("Add", {barcode: res.body}), style: "cancel"}, {text: 'Вернуться', style: "default"}] : [{text: "Добавить", onPress: () => props.navigation.navigate("Barcodes", {barcode: data}), style: "cancel"}, {text: 'Вернуться', style: "default"}])
        })
        .catch(err => console.log(err))
      }
    }

  
    const handleBarCodeScanned = ({ type, data }) => {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      createAlert(type, data);
    };
  
    if (hasPermission === null) {
      return <>
        <Ionicons name="ios-build-outline" size={124}></Ionicons>
        <Text style={{fontWeight: 'bold'}}>Запрос на разрешение доступа к камере</Text>
        </>;
    }
    if (hasPermission === false) {
      return <>
        <Ionicons name="ios-close-outline" size={124}></Ionicons>
        <Text>Нет доступа к камере</Text>;
        </>
    }

    const scanAgain = (
        <>
            {scanned ? null : <BarCodeScanner
                onBarCodeScanned={scanned ?  undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />}  
            {scanned && 
              <TouchableOpacity title={'Tap to Scan Again'} onPress={() => setScanned(false)}>
                <Ionicons name="ios-refresh-outline" size={124}/>
                <Text style={{fontWeight: 'bold'}}>Сканировать опять</Text>
              </TouchableOpacity>}
        </>
    )
            
    return (
        <>
        <View style={styles.container}>
          { isActive ? scanAgain : <ActivityIndicator size="large"/> }
        </View>
        </>

    );
}

const styles = StyleSheet.create({
      container: {
      backgroundColor: 'white',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
  });

export default Scanner;



