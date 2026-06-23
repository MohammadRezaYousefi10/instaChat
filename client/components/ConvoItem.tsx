import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Conversation } from '@/types'
import { styles } from '@/assets/styles/ConvoItem.styles';
import Avatar from './Avatar';
import { formatTime } from '@/utils/formatTime';

interface ConvoItemProbs {
    convo : Conversation ,
    selected : boolean ,
    onPress : () => void
}

export default function ConvoItem({convo , selected , onPress} : ConvoItemProbs) {
  const name = convo.participant?.name || "User";
  const avatar = convo.participant?.avatar;
  const online = convo.participant?.isOnline;
  const sub = `@${convo.participant?.handle}`;

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
          {convo.updatedAt && <Text>{formatTime(convo.updatedAt)}</Text>}
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {lastMsg}
        </Text>
      </View>
    </TouchableOpacity>
  );
}