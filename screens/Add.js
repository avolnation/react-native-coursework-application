import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RadioGroup from 'react-native-radio-buttons-group';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { Picker } from '@react-native-picker/picker'



const Add = (props) => {

    // Текст и штрихкод
    const [ text, onChangeText ] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");

    // Всё связанное с датами
    const [ date, setDate ] = useState(new Date());
    const [ dateInMillis, setDateInMillis ] = useState("");
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('Выберите дату ->');
    
    // Если выбран срок хранения
    const [ daysOrMonth, setDaysOrMonth] = useState("day")
    const [ bestBeforeDaysOrMonth, setBestBeforeDaysOrMonth ] = useState(null);

    // Ошибки
    const [ anyErrors, setAnyErrors ] = useState(false);
    const [ errorsDescription, setErrorsDescription ] = useState(null);

    const [ modeId, setModeId] = useState("1");

    useEffect(() => {
        props.navigation.addListener('focus', () => {
            // console.log(props.route.params?.barcode);
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.barcode?.barcode);
            onChangeText(props.route.params === undefined ? "" : props.route.params?.barcode?.title);
        })
    })

    useEffect(() => {
        props.navigation.addListener('blur', () => {
            onChangeBarcode("");
            onChangeText("");
        })
    })

    const radioButtonsData = [{
        id: '1', // acts as primary key, should be unique and non-empty string
        label: 'Срок годности (до)',
        value: 'option1',
        selected: modeId == "1"
    }, {
        id: '2',
        label: 'Срок хранения (мес, сут)',
        value: 'option2',
        selected: modeId == "2"
    }]

    const onChangeDateMode = (event) => {

        const modeId = event.filter((element) => element.selected == true)[0].id;

        //* Стираём всё после перевыбора опций
        setModeId(modeId);
        setDaysOrMonth("day");
        setBestBeforeDaysOrMonth(null);
        setDateText('Выберите дату ->');
        setDateInMillis("");

    }

    const newProduct = (title, barcode, bestBeforeDate) => {
        // TODO: Массив ошибок
        // Не указано имя продукта
        // Не указана дата(если до), не указано количество суток, месяцев (если срок хранения)
        if(title.trim() == "" || bestBeforeDate == ""){
            setAnyErrors(true);
            const errors = [];

            if(title.trim() == ""){
                errors.push("Не указано название продукта.\n");
            }
            if(bestBeforeDate == "" && modeId == "1"){
                errors.push("Не указана дата.\n");
            }
            if(bestBeforeDate == "" && modeId == "2"){
                errors.push("Не указан срок хранения.\n");
            }

            setErrorsDescription(errors);
        }


        // if(anyErrors){
        //     AsyncStorage.getAllKeys((err, keys) => {
        //         let keysLength = keys.length;
        //         AsyncStorage.setItem('product-' + keysLength, JSON.stringify({title: title, barcode: barcode, bestBeforeDate}), () => {
        //             AsyncStorage.getItem('product-' + keysLength, (err, result) => {
        //                 alert(result);
        //             })
        //         })
        //     })
        // }
        // else {
        //     Alert.alert("Ошибка", "Вернитесь назад и исправьте ошибки", [{text: "Отмена", onPress: () => console.log("pressed cancel")},] )
        // }
        
        // onChangeText("");
        // onChangeBarcode("");
        // props.navigation.reset({
        //     index: 0,
        //     routes: [{name: "New"}]
        // });
    }

    const onDatePickerChange = (e, selectedDate) => {
        setShowDatePicker(!showDatePicker);
        const currentDate = selectedDate || date;
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getFullYear();
        setDateText(fDate);
        setDateInMillis(tempDate.getTime())
    }

    
    return (
        <View style={styles.container}>
            {anyErrors ? <Text style={{color: "red"}}>{errorsDescription.map(el => el)}</Text> : null}
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Item Name"
                defaultValue={text}
                />
            <Text>{barcode ? barcode : "No barcode for this item"}</Text>
            <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('Scan')}>
                <Text>
                    Сканировать штрихкод
                </Text>
            </TouchableOpacity>
            <RadioGroup 
            radioButtons={radioButtonsData} 
            onPress={onChangeDateMode} 
            containerStyle={{flexDirection: "row"}}
            />
            {modeId == "1" 
            ? 
                <View style={[styles.titleAndPhoto,]}>
                <Text style={{ marginRight: 10}}> Срок годности (до): {dateText}</Text>
                <TouchableOpacity onPress={() => onDatePickerChange()}>
                    <Ionicons name="ios-calendar-sharp" size={30}/>   
                </TouchableOpacity>
                </View>
            : 
                <>
                <TextInput 
                    style={styles.input}
                    onChangeText={setBestBeforeDaysOrMonth}
                    placeholder="Срок хранения"
                    defaultValue={bestBeforeDaysOrMonth}/> 
                <Picker style={{height: 40, width: "50%"}} mode="dialog" selectedValue={daysOrMonth} onValueChange={(value) => setDaysOrMonth(value)}>
                    <Picker.Item key="1" label="сут." value="day"></Picker.Item>
                    <Picker.Item key="2" label="мес." value="month"></Picker.Item>
                </Picker>
            </>
            }

            <TouchableOpacity style={styles.button} onPress={() => newProduct(text, barcode, dateInMillis)}>
                <Text>
                    Сохранить
                </Text>
            </TouchableOpacity>
            
            {showDatePicker && <DateTimePicker testId="dateTimePicker" value={date} mode="date" display='default' onChange={onDatePickerChange} />}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
      height: 40,
      width: "80%",
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
    },
    titleAndPhoto: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
        // justifyContent: "space-around"
    },
  });

export default Add;