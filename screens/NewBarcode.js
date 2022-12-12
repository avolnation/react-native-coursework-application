import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";

const NewBarcode = (props) => {

    const localhost_url = "192.168.0.100:3002";

    console.log(typeof props.route.params);


    const [isActive, setIsActive] = useState(false);
    const [barcode, onChangeBarcode] = useState("");
    const [title, onChangeTitle] = useState("");


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
        const barcodeObject = { 
            title: title, 
            barcode: barcode }

        fetch(`http://${localhost_url}/barcodes/save-barcode`, {
                method: "POST", 
                headers: {"Content-Type": "application/json"}, 
                body: JSON.stringify(barcodeObject),
            })
        .then(res => res.json())
        .then(res => {
            onChangeBarcode("");
            onChangeTitle("");
        })
    }
   
    const newBarcodeView = (
    <View>
    <TextInput
        style={styles.input}
        onChangeText={onChangeTitle}
        placeholder="Item Name"
        defaultValue={title}
    />
    <TextInput
        style={styles.input}
        onChangeText={onChangeBarcode}
        placeholder="Item barcode"
        defaultValue={barcode}
    />
    <TouchableOpacity style={styles.button}>
        <Text>
            Сканировать штрихкод
        </Text>
    </TouchableOpacity>
    <TouchableOpacity 
        style={styles.button}
        onPress={() => saveBarcode(title, barcode)}>
        <Text>Add New Product!</Text>
    </TouchableOpacity>
    </View> )


    return (
        <>
            { isActive ? newBarcodeView : null} 
        </> 
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
        width: 190,
        height: 40,
        margin: 5,
        padding: 10,
        borderRadius: 10
    }
  });

export default NewBarcode;