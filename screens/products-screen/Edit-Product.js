import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, Image} from "react-native";
import { Picker } from '@react-native-picker/picker'
import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import RadioGroup from 'react-native-radio-buttons-group';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from "expo-image-picker";
import moment from "moment/moment";



const EditProduct = (props) => {

    // State's с свойствами продукта //
    const [ id, setId] = useState("");
    const [ image, setImage ] = useState(null);
    const [ text, onChangeText ] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");

    // State's с датами //
    const [ date, setDate ] = useState(new Date());
    const [ dateInMillis, setDateInMillis ] = useState("");
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('Выберите дату ->');

    // Выбор срока годности или срока хранения //
    const [ modeId, setModeId] = useState("1");

    // Если выбран срок хранения //
    const [ daysOrMonth, setDaysOrMonth] = useState("day")
    const [ bestBeforeDaysOrMonth, setBestBeforeDaysOrMonth ] = useState(null);

    // Ошибки //
    const [ anyErrors, setAnyErrors ] = useState(false);
    const [ errorsDescription, setErrorsDescription ] = useState(null);
    

    // Задаём радио кнопки // 
    const radioButtonsData = [{
        id: '1', // acts as primary key, should be unique and non-empty string //
        label: 'Срок годности (до)',
        value: 'option1',
        selected: modeId == "1"
    }, {
        id: '2',
        label: 'Срок хранения (мес, сут)',
        value: 'option2',
        selected: modeId == "2"
    }]
    
    // При фокусе экрана получаем необходимые данные из params, если они есть //
    useEffect(() => {
        props.navigation.addListener('focus', () => {

            setId(props.route.params === undefined ? "" : props.route.params?.item?.id);
            setImage(props.route.params === undefined ? "" : props.route.params?.item?.image)
            onChangeText(props.route.params === undefined ? "" : props.route.params?.item?.title);
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.item?.barcode);

            setDateInMillis(props.route.params === undefined ? "" : props.route.params?.item?.bestBeforeDate);

            const date = new Date(+props.route.params?.item?.bestBeforeDate)
            // console.log()
            setDateText(date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear())
        })
    })

    // Очищаем на всякий случай поля после потери фокуса экрана//
    useEffect(() => {
        props.navigation.addListener('blur', () => {
            onChangeText("");
            setDateText("");
        })
    })

    // Функция обработки нажатия по радио кнопкам //
    const onChangeDateMode = (event) => {
        // Получаем id режима выбора //
        const modeId = event.filter((element) => element.selected == true)[0].id;

        //* Стираём всё после перевыбора опций //
        setModeId(modeId);
        setDaysOrMonth("day");
        setBestBeforeDaysOrMonth(null);
        // setDateText('Выберите дату ->');
        // setDateInMillis("");
    }

    // Функция вызывающаяся при выборе даты в DatePicker //
    const onDatePickerChange = (e, selectedDate) => {
        setShowDatePicker(!showDatePicker);
        const currentDate = selectedDate || date;
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getFullYear();
        setDateText(fDate);
        setDateInMillis(tempDate.getTime())
    }
    

    // TODO: валидация
    // Название не пустое
    // Дата не пустая


    // Функция редактирования продукта // 
    const editProduct = (id, text, barcode, date, imageUri) => {

        // Сперва задаём, что ошибок нет //
        let anyErrors = false; 

        // Проверяем переданные переменные на наличие ошибок (Первичная проверка) //
        if(text.trim() == "" || date == "" || ((bestBeforeDaysOrMonth == null || !Number.isInteger(+bestBeforeDaysOrMonth) || bestBeforeDaysOrMonth.trim() == "") && modeId == "2")){
            // Если проверка прошла, следовательно, задаём в переменную что есть ошибки //
            anyErrors = true; 
            // Создаём массив описания ошибок //
            const errors = [];

            // Если поле названия продукта пустое, записываем ошибку //
            if(text.trim() == ""){
                errors.push("Не указано название продукта.\n");
            }

            // Если дата срока годности не выбрана и выбран первый режим выбора даты, записываем ошибку //
            if(bestBeforeDaysOrMonth == "" && modeId == "1"){
                errors.push("Не указана дата, до которой годен продукт.\n");
            }

            // Если срок хранения не задан или пустой, и выбран второй режим выбора даты, записываем ошибку //
            if((bestBeforeDaysOrMonth == null || bestBeforeDaysOrMonth.trim() == "") && modeId == "2"){
                errors.push("Не указан срок хранения.\n");
            }

            // Если в поле срока хранения введены символы отличные от чисел, записываем ошибку //
            if(!Number.isInteger(+bestBeforeDaysOrMonth)){
                errors.push("В поле срок хранения можно вводить только числа.\n")
            }

            // Устанавливаем в state статус ошибок true и их описание //
            setAnyErrors(true);
            setErrorsDescription(errors);
        } // Если ошибок нет, записываем в переменную что их нет и идём дальше, так же "обнуляем" anyErrors и errorsDescription state's соответственно //
        else{
            anyErrors = false;
            setAnyErrors(false);
            setErrorsDescription(null);
        }

        if(!anyErrors){
            AsyncStorage.setItem(id, JSON.stringify({barcode: barcode, bestBeforeDate: modeId == "1" ? date : daysOrMonth == "day" ? moment().add(bestBeforeDaysOrMonth, 'days').format('x') : moment().add(bestBeforeDaysOrMonth, 'months').format('x'), id: id, title: text, image: imageUri}), () => {
                Alert.alert("Успешно", "Изменения сохранены", [{text: "Вернуться к продуктам", onPress: () => props.navigation.goBack()}])
            })
        }
        else {
            Alert.alert("Ошибка", "Не удалось сохранить изменения. Вернитесь назад и убедитесь в правильности заполнения полей.", [{text: "Назад"}] )
        }

    }

    // Функция фото продукта
    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
    };
        
    return (
        <View style={styles.container}>
            {anyErrors ? <Text style={{color: "red"}}>{errorsDescription.map(el => el)}</Text> : null}
            <View style={styles.titleAndPhoto}>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeText}
                    placeholder="Item Name"
                    defaultValue={text}
                />
                {!image && <TouchableOpacity>
                    <Ionicons name="ios-camera-outline" size={50} onPress={pickImage}/>
                </TouchableOpacity>}
                {image && <TouchableOpacity onPress={pickImage}><Image source={{ uri: image }} style={{ width: 50, height: 50 }}/></TouchableOpacity>}
            </View>
            <RadioGroup
                radioButtons={radioButtonsData} 
                onPress={onChangeDateMode} 
                containerStyle={{flexDirection: "row", marginBottom: "2%"}}
            />
            {modeId == "1" 
            ? 
                <View style={[styles.titleAndPhoto, {borderColor: 'black', borderStyle: 'solid'}]}>
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
                <Picker style={{height: 40, width: "30%"}} mode="dialog" selectedValue={daysOrMonth} onValueChange={(value) => setDaysOrMonth(value)}>
                    <Picker.Item key="1" label="сут." value="day"></Picker.Item>
                    <Picker.Item key="2" label="мес." value="month"></Picker.Item>
                </Picker>
            </>
            }
            <View style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={() => editProduct(id, text, barcode, dateInMillis, image) }>
                    <Text style={styles.textInButton}>
                        Сохранить
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => {props.route.params.refresh; props.navigation.goBack()}}>
                    <Text style={styles.textInButton}>
                        Назад
                    </Text>
                </TouchableOpacity>
            </View>
            {showDatePicker && <DateTimePicker testId="dateTimePicker" value={date} mode="date" display='default' onChange={onDatePickerChange} />}
        </View>
    )
}

// Стили
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'white'
    },
    input: {
      height: 40,
      width: "70%",
      margin: 12,
      borderWidth: 0.9,
      borderRadius: 5,
      padding: 10,
    },
    button: {
        backgroundColor: "lightgray",
        width: 100,
        height: 40,
        margin: 10,
        padding: 10,
        borderRadius: 10,
    },
    textInButton: {
        textAlign: 'center',
        fontWeight: 'bold'
    },
    titleAndPhoto: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around"
    },
    controls: {
        flexDirection: 'row'
    }
  });


export default EditProduct;