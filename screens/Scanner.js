import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';    
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
          Alert.alert(res.message, 'Действие с штрихкодом?', res.status == "found" ? [{text: "Добавить к продукту", onPress: () => props.navigation.navigate("New", {barcode: res.body}), style: "cancel"}, {text: 'Вернуться', style: "default"}] : [{text: "Добавить новый", onPress: () => props.navigation.navigate("Barcodes", {barcode: data}), style: "cancel"}, {text: 'Вернуться', style: "default"}])
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
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    const scanAgain = (
        <>
            {scanned ? null : <BarCodeScanner
                onBarCodeScanned={scanned ?  undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />}  
            {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
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
      position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
  });

export default Scanner;



