import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
// import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { MenuContext } from "react-native-popup-menu";
const Add = (props) => {

    const [ text, onChangeText ] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");
    const [ isActive, setIsActive ] = useState(false);
    const [ date, setDate ] = useState(new Date());
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('No data yet');

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            console.log(props.route.params?.barcode);
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.barcode?.barcode);
            onChangeText(props.route.params === undefined ? "" : props.route.params?.barcode?.title);
            setIsActive(true)
        })
    })

    useEffect(() => {
        props.navigation.addListener('blur', () => {
            setIsActive(false);
            onChangeBarcode("");
        })
    })

    const radioButtonsData = [{
        id: '1',
        label: 'Expiration date',
        value: 'option1'
    }, 
    {
        id: '2',
        label: 'Best before date',
        value: 'option2'
    }]

    const newProduct = (title, barcode, bestBeforeDate) => {
        AsyncStorage.getAllKeys((err, keys) => {
            let keysLength = keys.length;
            AsyncStorage.setItem('product-' + keysLength, JSON.stringify({title: title, barcode: barcode, bestBeforeDate}), () => {
                AsyncStorage.getItem('product-' + keysLength, (err, result) => {
                    alert(result);
                })
            })
        })
        
    }


    const onDatePickerChange = (e, selectedDate) => {
        setShowDatePicker(!showDatePicker);
        const currentDate = selectedDate || date;
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getFullYear();
        setDateText(fDate);
    }

    
    return (
        <View>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Item Name"
                defaultValue={text}
            />
            <TextInput
                style={styles.input}
                onChangeText={onChangeBarcode}
                placeholder="Barcode"
                defaultValue={barcode}
            />
            <Text>{dateText}</Text>
            <TouchableOpacity style={styles.button}>
                <Text>
                    Сканировать штрихкод
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => onDatePickerChange()}>
                <Text>
                    DatePicker
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => newProduct(text, barcode, dateText)}>
                <Text>
                    Add New Product!
                </Text>
            </TouchableOpacity>
            
            {showDatePicker && <DateTimePicker testId="dateTimePicker" value={date} mode="date" display='default' onChange={onDatePickerChange} />}
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
    button: {
        backgroundColor: "lightgray",
        width: 180,
        height: 40,
        margin: 10,
        padding: 10,
        borderRadius: 10
    }
  });

export default Add;