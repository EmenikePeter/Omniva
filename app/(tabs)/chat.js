
import { useRouter } from 'expo-router';
import { useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from '../../components/AuthContext';
import api from "../services/api";

export default function ChatScreen() {
	const [lang, setLang] = useState('en');
	const [messages, setMessages] = useState([{from:"ai", text:{en:"Welcome! Ask me anything about business or money.",zh:"欢迎！请随时提问有关商业或理财的问题。",ha:"Barka! Tambayi duk abin da kake so game da kasuwanci ko kudi."}}]);
	const [text, setText] = useState("");
	const scrollRef = useRef();
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { user } = useAuth();

	// Require authentication for actions
	const requireAuth = (action) => {
		if (!user || !user.id) {
			router.push('/login');
			return;
		}
		action && action();
	};

	const sendMessage = async (msg) => {
		if(!msg) return;
		setMessages(prev => [...prev, {from:"user", text: {[lang]: msg}}]);
		setLoading(true);
		try {
			const res = await api.post("/chat", { user_id:"alpha1", message:msg, lang });
			setMessages(prev => [...prev, {from:"ai", text: {[lang]: res.data.text} }]);
		} catch (err) {
			setMessages(prev => [...prev, {from:"ai", text: {[lang]: "AI error: " + (err.response?.data?.error || "Unable to respond.")} }]);
		}
		setText("");
		setLoading(false);
		scrollRef.current?.scrollToEnd({animated:true});
	};

	// AI prompt helpers
	const prompts = {
		business: {
			en: "Generate a business idea for me based on my location and skills.",
			zh: "请根据我的位置和技能生成一个商业创意。",
			ha: "Samun ra'ayin kasuwanci bisa wurina da kwarewa."
		},
		advice: {
			en: "Give me financial advice for my current situation.",
			zh: "请根据我的情况给我一些理财建议。",
			ha: "Ba ni shawara ta kudi bisa halin da nake ciki."
		}
	};
	const askBusinessIdea = () => sendMessage(prompts.business[lang]);
	const askFinancialAdvice = () => sendMessage(prompts.advice[lang]);

	return (
		<View style={{flex:1, padding:16}}>
			<Text style={styles.title}>AI Business & Money Chat</Text>
			<View style={{flexDirection:'row', justifyContent:'center', marginBottom:8}}>
				<Button title="EN" onPress={() => setLang('en')} color={lang==='en'?"#0275d8":"#ccc"} />
				<Button title="中文" onPress={() => setLang('zh')} color={lang==='zh'?"#0275d8":"#ccc"} />
				<Button title="Hausa" onPress={() => setLang('ha')} color={lang==='ha'?"#0275d8":"#ccc"} />
			</View>
			<View style={styles.buttonRow}>
				<Button title={lang==='en'?"Business Idea":"商业创意"} onPress={askBusinessIdea} color="#0275d8" />
				<Button title={lang==='en'?"Financial Advice":"理财建议"} onPress={askFinancialAdvice} color="#5cb85c" />
			</View>
			<ScrollView
				ref={scrollRef}
				style={{flex:1}}
				contentContainerStyle={{paddingBottom:16}}
				onContentSizeChange={() => scrollRef.current?.scrollToEnd({animated:true})}
				showsVerticalScrollIndicator={true}
			>
				{messages.map((m,i) => (
					<Text key={i} style={{marginBottom:8}}>
						<Text style={{fontWeight:"bold", color: m.from === "ai" ? "#0275d8" : "#343a40"}}>{m.from}: </Text>{m.text[lang]}
					</Text>
				))}
			</ScrollView>
			<View style={{flexDirection:"row", alignItems:"center"}}>
				<TextInput
					value={text}
					onChangeText={setText}
					placeholder={lang==='en'?"Type your question...":lang==='zh'?"请输入你的问题...":"Rubuta tambayarka..."}
					style={{flex:1, borderWidth:1, borderColor:'#ccc', borderRadius:6, padding:8, marginRight:8}}
				/>
				<Button title={loading ? "..." : (lang==='en'?"Send":lang==='zh'?"发送":"Aika")}
					onPress={() => sendMessage(text)} disabled={loading} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, color: "#0275d8", textAlign: "center" },
	buttonRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
});
