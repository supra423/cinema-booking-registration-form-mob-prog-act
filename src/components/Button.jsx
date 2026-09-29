import { Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { LoginScreenStyles } from '../Styles'

export default function Button(props) {
  return (
    <TouchableOpacity onPress={props.onPress} style={LoginScreenStyles.button_design}>
      <Text style={LoginScreenStyles.buttonText}>{props.title}</Text>
    </TouchableOpacity>
  )
};