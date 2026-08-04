import { Colors } from "@/constants/Colors";
import { MessageStatus } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator } from "react-native";

interface Props {

    status?:MessageStatus;
    read?: boolean

}

export default function MessageStatus2({

    status,
    read

}:Props){

    if (read){
        return <Ionicons name="checkmark-done-outline" color={Colors.online}/>
    }
    if (!read && !status){
        return <Ionicons name="checkmark-outline" color={`${Colors.onPrimary}88`}  />
    }

    switch(status){
        case "pending":

        return <Ionicons name="time-outline" color={`${Colors.onPrimary}88` }/>;

        case"queued":

            return <Ionicons name="time-outline" color={`${Colors.onPrimary}88` }/>;

        case"sending":

            return <ActivityIndicator color={`${Colors.onPrimary}88`}  />;

        case"sent":

            return <Ionicons name="checkmark-outline" color={`${Colors.onPrimary}88`}  />

        case"delivered":

            return <Ionicons name="checkmark-done-outline" color={`${Colors.online}`}  />

        case"read":

            return <Ionicons name="checkmark-done-outline" color={Colors.online}/>

        case"failed":

            return <Ionicons name="alert-circle-outline"  color={Colors.error}/>

        default:

            return null;

    }
    

}