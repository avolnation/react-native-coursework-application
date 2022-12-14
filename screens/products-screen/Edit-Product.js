import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
// import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProduct = (props) => {

    const [ text, onChangeText ] = useState("");
    const [ id, onChangeId] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");

    const [ isActive, setIsActive ] = useState(false);
    const [ date, setDate ] = useState(new Date());
    const [ dateInMillis, setDateInMillis ] = useState("");
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('No data yet');


    useEffect(() => {
        props.navigation.addListener('focus', () => {
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.item?.barcode);
            onChangeText(props.route.params === undefined ? "" : props.route.params?.item?.title);
            onChangeId(props.route.params === undefined ? "" : props.route.params?.item?.id);
            setDateInMillis(props.route.params === undefined ? "" : props.route.params?.item?.bestBeforeDate);
            // setIsActive(true)
        })
    })

    useEffect(() => {
        props.navigation.addListener('blur', () => {
            onChangeText("");
            setDateText("");
        })
    })

    const onDatePickerChange = (e, selectedDate) => {
        setShowDatePicker(!showDatePicker);
        const currentDate = selectedDate || date;
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getFullYear();
        setDateText(fDate);
        setDateInMillis(tempDate.getTime())
    }
    
    const editProduct = (id, text, barcode, date) => {
        AsyncStorage.setItem(id, JSON.stringify({barcode: barcode, bestBeforeDate: date, id: id, title: text}), () => {
            console.log("Saved");
        })
    }
        
    
    return (
        <View>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Item Name"
                defaultValue={text}
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

            <TouchableOpacity style={styles.button} onPress={() => editProduct(id, text, barcode, dateInMillis)}>
                <Text>
                    Save
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text>
                    Back to products
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


export default EditProduct;