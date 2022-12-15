import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";

const NewBarcode = (props) => {

    const localhost_url = "react-node-api.clefer.ru";

    console.log(typeof props.route.params);


    const [isActive, setIsActive] = useState(false);
    const [barcode, onChangeBarcode] = useState("");
    const [title, onChangeTitle] = useState("");

    // Ошибки //
    const [ anyErrors, setAnyErrors ] = useState(false);
    const [ errorsDescription, setErrorsDescription ] = useState(null);


    useEffect(() => {
        props.navigation.addListener('focus', () => {
            // console.log(props.route.params.barcode)
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.barcode);
            setIsActive(true)
        })
    })

    useEffect(() => {
        props.navigation.addListener('blur', () => {
            setIsActive(false);
            onChangeBarcode("");
        })
    })

    const saveBarcode = ( title, barcode ) => {

        let anyErrors = false;

        let errorsDescription = [];

        if(title.trim() == "" || (barcode.trim() == "" || !Number.isInteger(+barcode) || (barcode.length < 13 || barcode.length > 13))){
            
            anyErrors = true;

            if(title.trim() == ""){
                errorsDescription.push('Название продукта не может быть пустым.\n')
            }
            if(barcode.trim() == "" || !Number.isInteger(+barcode)){
                errorsDescription.push('Штрихкод не может быть пустым или включать в себя какие-то символы кроме цифр.\n')
            }
            if(barcode.length < 13 || barcode.length > 13){
                errorsDescription.push('Штрихкод состоит из 13 символов.\n')
            }
            setAnyErrors(true);
            setErrorsDescription(errorsDescription);
        }
        else{
            anyErrors = false;
            setAnyErrors(false);
            setErrorsDescription(null);
        }

        if(!anyErrors){
            const barcodeObject = { 
                title: title, 
                barcode: barcode }
    
            fetch(`https://${localhost_url}/barcodes/save-barcode`, {
                    method: "POST", 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify(barcodeObject),
                })
            .then(res => res.json())
            .then(res => {
                Alert.alert("Успешно", "Штрихкод был сохранён на сервере. Теперь при сканировании вы сможете получить название продукта автоматически.", [{text: "Вернуться"}] )
                onChangeBarcode("");
                onChangeTitle("");
            })
            .catch(err => Alert.alert("Ошибка", "Что-то пошло не так.\nПроверьте подключение к интернету.\nВозможно, сервер недоступен.", [{text: "Вернуться"}] ))
        }
        else{
            Alert.alert("Ошибка", "Не удалось добавить штрихкод на сервер.\nВернитесь назад и заполните все поля", [{text: "Назад"}] )
        }

    }
   
    const newBarcodeView = (
    <View style={styles.container}>
        {anyErrors ? <Text style={{color: "red"}}>{errorsDescription.map(el => el)}</Text> : null}
    <TextInput
        style={styles.input}
        onChangeText={onChangeTitle}
        placeholder="Введите название продукта"
        defaultValue={title}
    />
    <TextInput
        style={styles.input}
        onChangeText={onChangeBarcode}
        placeholder="Введите штрихкод продукта или отсканируйте его"
        defaultValue={barcode}
    />
    <View style={{flexDirection: 'row'}}>
        <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("Scan")}>
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                Сканировать штрихкод
            </Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.button, {width: '25%'}]}
            onPress={() => saveBarcode(title, barcode)}>
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>Добавить</Text>
        </TouchableOpacity>
    </View>
    
    </View> )


    return (
        <>
            { isActive ? newBarcodeView : null} 
        </> 
    )
}

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
  });

export default NewBarcode;