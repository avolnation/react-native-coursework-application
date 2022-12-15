import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker'
import { useState, useEffect } from "react";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RadioGroup from 'react-native-radio-buttons-group';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from "moment/moment";

const Add = (props) => {

    // Текст и штрихкод //
    const [ text, onChangeText ] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");

    // Всё связанное с датами //
    const [ date, setDate ] = useState(new Date());
    const [ dateInMillis, setDateInMillis ] = useState("");
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('Выберите дату ->');
    
    // Если выбран срок хранения //
    const [ daysOrMonth, setDaysOrMonth] = useState("day")
    const [ bestBeforeDaysOrMonth, setBestBeforeDaysOrMonth ] = useState(null);

    // Ошибки //
    const [ anyErrors, setAnyErrors ] = useState(false);
    const [ errorsDescription, setErrorsDescription ] = useState(null);

    // Выбор срока годности или срока хранения //
    const [ modeId, setModeId] = useState("1");

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
    
    // При фокусе экрана читаем данные из сканнера, если данные есть //
    useEffect(() => {
        props.navigation.addListener('focus', () => {
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.barcode?.barcode);
            onChangeText(props.route.params === undefined ? "" : props.route.params?.barcode?.title);
        })
    })

    // При потере фокуса экрана стираем всё что было записано в полях //
    useEffect(() => {
        props.navigation.addListener('blur', () => {
            // Очищаем поля и текст
            onChangeBarcode("");
            onChangeText("");

            // Очищаем ошибки и их описание //
            setAnyErrors(false);
            setErrorsDescription(false);
        })
    })

    const deleteAllInfo = () => {
        onChangeText("");
        onChangeBarcode("");
        props.navigation.reset({
            index: 0,
            routes: [{name: "New"}]
        });
    }

    // Функция обработки нажатия по радио кнопкам //
    const onChangeDateMode = (event) => {
        // Получаем id режима выбора //
        const modeId = event.filter((element) => element.selected == true)[0].id;

        //* Стираём всё после перевыбора опций //
        setModeId(modeId);
        setDaysOrMonth("day");
        setBestBeforeDaysOrMonth(null);
        setDateText('Выберите дату ->');
        setDateInMillis("");

    }

    // Функция создания нового продукта
    const newProduct = (title, barcode, bestBeforeDate) => {
        // TODO: Массив ошибок (аналог required)
        // Не указано имя продукта + // 
        // Не указана дата(если до), не указано количество суток, месяцев (если срок хранения) + //
        // Если не число в поле срок хранения + //

        // Сперва задаём, что ошибок нет //
        let anyErrors = false; 

        // Проверяем переданные переменные на наличие ошибок (Первичная проверка) //
        if(title.trim() == "" || bestBeforeDate == "" || ((bestBeforeDaysOrMonth == null || !Number.isInteger(+bestBeforeDaysOrMonth) || bestBeforeDaysOrMonth.trim() == "") && modeId == "2")){
            // Если проверка прошла, следовательно, задаём в переменную что есть ошибки //
            anyErrors = true; 
            // Создаём массив описания ошибок //
            const errors = [];

            // Если поле названия продукта пустое, записываем ошибку //
            if(title.trim() == ""){
                errors.push("Не указано название продукта.\n");
            }

            // Если дата срока годности не выбрана и выбран первый режим выбора даты, записываем ошибку //
            if(bestBeforeDate == "" && modeId == "1"){
                errors.push("Не указана дата, до которой годен продукт.\n");
            }

            // Если срок хранения не задан или пустой, и выбран первый режим выбора даты, записываем ошибку //
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

        // Если ошибок нет, то записываем в AsyncStorage продукт, а затем очищаем поля ввода и params из навигации, если они присутствуют // 
        if(!anyErrors){

            // Генерируем уникальный ключ // 
            let key = Date.now().toString(36) + Math.random().toString(36).substr(2);

            // Записываем по ключу все необходимые данные в AsyncStorage //
            AsyncStorage.setItem('product-' + key, JSON.stringify({title: title, barcode: barcode, bestBeforeDate}), () => {
                Alert.alert("Успешно", `Продукт был добавлен.`, [{text: "Посмотреть", onPress: () => props.navigation.navigate('Products')}, {text: "Назад"},] );})

            // Обнуляем state's и params //
            onChangeText("");
            onChangeBarcode("");
            props.navigation.reset({
                index: 0,
                routes: [{name: "New"}]
            });
        } // Если есть ошибки то выводим Alert //
        else {
            Alert.alert("Ошибка", "Не удалось добавить продукт. Вернитесь назад и заполните все поля", [{text: "Назад"}] )
        }
    }

    // Функция изменения даты при выборе даты в Date Picker // 
    const onDatePickerChange = (e, selectedDate) => {
        setShowDatePicker(!showDatePicker);

        const currentDate = selectedDate || date;
        setDate(currentDate);

        let tempDate = new Date(currentDate);
        let fDate = tempDate.getDate() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getFullYear();

        // Записываем в текстовом представлении а так же в виде секунд в соответствующие state //
        setDateText(fDate);
        setDateInMillis(tempDate.getTime())
    }

    return (
        <View style={styles.container}>
            {anyErrors ? <Text style={{color: "red"}}>{errorsDescription.map(el => el)}</Text> : null}
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Введите название продукта"
                defaultValue={text}
                />
            <Text style={{textAlign: 'center'}}>{barcode ? barcode : "Возможно, штрихкод для Вашего продукта есть в базе.\nПопробуйте отсканировать его."}</Text>
            <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('Scan')}>
                <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                    Сканировать штрихкод
                </Text>
            </TouchableOpacity>
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

            <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={[styles.button, {width: 100}]} onPress={() => newProduct(text, barcode, modeId == "1" ? dateInMillis : daysOrMonth == "day" ? moment().add(bestBeforeDaysOrMonth, 'days').format('x') : moment().add(bestBeforeDaysOrMonth, 'months').format('x'))}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        Сохранить
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, {width: 100}]} onPress={() => deleteAllInfo()}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        Сбросить
                    </Text>
                </TouchableOpacity>
            </View>
            
            {showDatePicker && <DateTimePicker testId="dateTimePicker" value={date} mode="date" display='default' onChange={onDatePickerChange} />}
        </View>
    )
}

// Стили //
const styles = StyleSheet.create({
    container: {
        fontFamily: 'Roboto',
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        width: "95%",
        margin: 12,
        borderWidth: 0.9,
        borderRadius: 5,
        padding: 10,
    },
    button: {
        // backgroundColor: "lightgray",
        shadowColor: 'black',
        shadowOpacity: 0.26,
        shadowOffset: { width: 0, height: 2},
        shadowRadius: 10,
        elevation: 5,
        backgroundColor: 'white',
        width: 180,
        height: 40,
        margin: 10,
        padding: 10,
        borderRadius: 5
    },
    titleAndPhoto: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
  });

export default Add;