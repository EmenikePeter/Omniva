import { useRef, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import api from "../services/api";

export default function ChatScreen() {
  const [messages, setMessages] = useState([{from:"ai", text:"Welcome! Ask me anything."}]);
  const [text, setText] = useState("");
  const scrollRef = useRef();

  const sendMessage = async () => {
    if(!text) return;
    setMessages([...messages, {from:"user", text}]);
    const res = await api.post("/chat", { user_id:"alpha1", message:text, lang:"en" });
    setMessages(prev => [...prev, {from:"ai", text: res.data.text}]);
    setText("");
    scrollRef.current?.scrollToEnd({animated:true});
  };

  return (
    <View style={{flex:1, padding:16}}>
      <ScrollView ref={scrollRef}>
        {messages.map((m,i) => <Text key={i}><Text style={{fontWeight:"bold"}}>{m.from}: </Text>{m.text}</Text>)}
      </ScrollView>
      <TextInput value={text} onChangeText={setText} placeholder="Type message..." style={{borderWidth:1, padding:8, marginVertical:8}} />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
