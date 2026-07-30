import {Platform} from 'react-native'

const daftarIos = "172.20.10.3"
const homeIos = "192.168.1.2"

const HOST = Platform.select({
    ios: daftarIos,
    android: daftarIos,
    default : "localhost"
})


export const API_BASE_URL = `http://${HOST}:3000`
export const WS_URL = `ws://${HOST}:3000`
