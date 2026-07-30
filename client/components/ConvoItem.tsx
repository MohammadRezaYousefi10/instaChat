import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Conversation } from '@/types'
// import { styles } from '@/assets/styles/ConvoItem.styles';
import Avatar from './Avatar';
import { formatTime } from '@/utils/formatTime';
import { useTheme } from '@/context/ThemeContext';
import { getStyles } from '@/assets/styles/ConvoItem.styles';

interface ConvoItemProbs {
    convo : Conversation ,
    selected : boolean ,
    onPress : () => void ,
}

export default function ConvoItem({convo , selected , onPress } : ConvoItemProbs) {
  const { colors } = useTheme();
  const styles = getStyles(colors);


  const name = convo.participant?.name || "User";
  const avatar = convo.participant?.avatar;
  const online = convo.participant?.isOnline;
  const sub = `@${convo.participant?.handle}`;

  //console.log('convo online ' , online)

    const lastMsg =
    convo.lastMessage?.text ||
    (convo.lastMessage?.mediaType === "image"
      ? "📷 photo"
      : convo.lastMessage?.mediaUrl
        ? "🎥 video"
        : "Start a Conversation");

  

  return (
    
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <Avatar name={name} src={avatar} size={48} online={online} />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.nameCol}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              {sub}
            </Text>
          </View>
          {convo.updatedAt && <Text style={styles.lastMsg}>{formatTime(convo.updatedAt)}</Text>}
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {lastMsg}
        </Text>
       {/* <View style={styles.divider} /> */}
      </View>
    </TouchableOpacity>
  );
}