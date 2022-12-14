import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Image} from "react-native";
import { useState, useEffect } from "react";
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker"

const EditProduct = (props) => {

    const [image, setImage] = useState(null);
    const [ text, onChangeText ] = useState("");
    const [ id, onChangeId] = useState("");
    const [ barcode, onChangeBarcode ] = useState("");

    const [ isActive, setIsActive ] = useState(false);
    const [ date, setDate ] = useState(new Date());
    const [ dateInMillis, setDateInMillis ] = useState("");
    const [ showDatePicker, setShowDatePicker ] = useState(false);
    const [ dateText, setDateText ] = useState('Выберите дату ->');


    useEffect(() => {
        props.navigation.addListener('focus', () => {
            onChangeBarcode(props.route.params === undefined ? "" : props.route.params?.item?.barcode);
            onChangeText(props.route.params === undefined ? "" : props.route.params?.item?.title);
            onChangeId(props.route.params === undefined ? "" : props.route.params?.item?.id);
            setDateInMillis(props.route.params === undefined ? "" : props.route.params?.item?.bestBeforeDate);
            setImage(props.route.params === undefined ? "" : props.route.params?.item?.image)
            const date = new Date(props.route.params?.item?.bestBeforeDate)
            setDateText(date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear())
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
    
    const editProduct = (id, text, barcode, date, imageUri) => {
        AsyncStorage.setItem(id, JSON.stringify({barcode: barcode, bestBeforeDate: date, id: id, title: text, image: imageUri}), () => {
            console.log("Saved");
        })
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
        console.log(result.assets[0].uri);

    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };
        
    
    return (
        <View style={styles.container}>
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
            <View style={[styles.titleAndPhoto,]}>
                <Text style={{marginRight: 10}}> Срок годности (до): {dateText}</Text>
                <TouchableOpacity onPress={() => onDatePickerChange()}>
                    <Ionicons name="ios-calendar-sharp" size={50}/>   
                </TouchableOpacity>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.button} onPress={() => editProduct(id, text, barcode, dateInMillis, image)}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
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
        textAlign: 'center'
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