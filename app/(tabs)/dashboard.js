import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../components/AuthContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [recentTools, setRecentTools] = useState([]);
  const [profileModal, setProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({name: "", country: "", language: ""});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  // Multi-language selector
  const [lang, setLang] = useState('en');
  // Daily tips/reminders
  const dailyTips = {
    en: "Remember to review your expenses daily for better control.",
    zh: "每天检查你的支出，有助于更好地管理财务。",
    ha: "Ka duba kudaden fita kullum don samun kyakkyawan iko."
  };

  // Load stats and recent items when user changes
  const BACKEND_URL = "http://localhost:5000";
  useEffect(() => {
    if (user && user.id) {
      setLoadingStats(true);
      fetch(`${BACKEND_URL}/api/dashboard/stats?userId=${user.id}`)
        .then(async res => {
          const data = await res.json();
          if (!res.ok || data.error) {
            setStats(null);
            console.error('Stats API error:', data.error || res.statusText);
            setProfileMsg(`Stats error: ${data.error || res.statusText}`);
          } else {
            setStats(data);
          }
        })
        .catch(err => {
          setStats(null);
          console.error('Stats fetch failed:', err);
          setProfileMsg(`Stats fetch failed: ${err.message}`);
        })
        .finally(() => setLoadingStats(false));
      fetch(`${BACKEND_URL}/api/chat/recent?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setRecentChats(data))
        .catch(err => {
          setRecentChats([]);
          console.error('Recent chats fetch failed:', err);
        });
      fetch(`${BACKEND_URL}/api/tools/recent?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setRecentTools(data))
        .catch(err => {
          setRecentTools([]);
          console.error('Recent tools fetch failed:', err);
        });
      setProfileForm({
        name: user.name || "",
        country: user.country || "",
        language: user.language || "",
      });
    }
  }, [user]);

  function handleProfileSave() {
    setProfileLoading(true);
    setProfileMsg("");
    // Use backend URL if needed, here keeping relative path as in original
    fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          setProfileMsg(data?.error || "Failed to update profile.");
        } else {
          setProfileMsg("Profile updated!");
          setProfileModal(false);
        }
      })
      .catch(err => {
        console.error("Profile update failed:", err);
        setProfileMsg("Failed to update profile.");
      })
      .finally(() => setProfileLoading(false));
  }

  // Redirect unauthenticated users to login/register when clicking feature buttons
  const requireAuth = (action) => {
    if (!user || !user.id) {
      router.push('/login');
      return;
    }
    action && action();
  };

  // Main render hooks (always called)
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  // Conditional render for unauthenticated users
  if (!user || !user.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Welcome to Omniva</Text>
        <Text style={{ fontSize: 16, marginBottom: 24 }}>Please login or register to access your dashboard and features.</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginRight: 8 }} onPress={() => router.push('/login')}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#34C759', padding: 12, borderRadius: 8 }} onPress={() => router.push('/register')}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ...existing dashboard UI for authenticated users...
  // For all feature buttons, wrap with requireAuth(() => { ... })
  // Example:
  // <TouchableOpacity onPress={() => requireAuth(() => router.push('/some-feature'))}>...</TouchableOpacity>

  // ...existing code...

  return (
    <View style={{flex:1}}>
      {/* Collapsible Left Drawer */}
      {!showLeftDrawer ? (
        <TouchableOpacity style={styles.leftDot} onPress={() => setShowLeftDrawer(true)}>
          <Icon name="account-circle" size={28} color="#5cb85c" />
        </TouchableOpacity>
      ) : (
        <View style={styles.leftDrawerContainer}>
          <TouchableOpacity onPress={() => setProfileModal(true)} style={styles.drawerIcon}>
            <Icon name="account-edit" size={28} color="#0275d8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.drawerIcon}>
            <Icon name="logout" size={28} color="#d9534f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLeftDrawer(false)} style={styles.drawerIcon}>
            <Icon name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}
      {/* Collapsible Right Drawer */}
      {!showRightDrawer ? (
        <TouchableOpacity style={styles.rightDot} onPress={() => setShowRightDrawer(true)}>
          <Icon name="apps" size={28} color="#0275d8" />
        </TouchableOpacity>
      ) : (
        <View style={styles.drawerContainer}>
          <TouchableOpacity onPress={() => router.push("/chat") } style={styles.drawerIcon}>
            <Icon name="chat" size={28} color="#0275d8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/tools") } style={styles.drawerIcon}>
            <Icon name="tools" size={28} color="#0275d8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/dashboard") } style={styles.drawerIcon}>
            <Icon name="view-dashboard" size={28} color="#0275d8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowRightDrawer(false)} style={styles.drawerIcon}>
            <Icon name="close" size={24} color="#999" />
          </TouchableOpacity>
        </View>
      )}
      {/* Multi-language selector */}
      <View style={{flexDirection:'row', justifyContent:'center', marginTop:8}}>
        <Button title="EN" onPress={() => setLang('en')} color={lang==='en'?"#0275d8":"#ccc"} />
        <Button title="中文" onPress={() => setLang('zh')} color={lang==='zh'?"#0275d8":"#ccc"} />
        <Button title="Hausa" onPress={() => setLang('ha')} color={lang==='ha'?"#0275d8":"#ccc"} />
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{lang==='en'?"Dashboard":lang==='zh'?"仪表盘":"Allon Bayanai"}</Text>
        {/* Daily Tip/Reminder */}
        <View style={{marginTop:12, marginBottom:8, padding:12, backgroundColor:'#eaf4ff', borderRadius:8}}>
          <Text style={{fontSize:16, fontWeight:'bold', color:'#0275d8'}}>{lang==='en'?"Daily Tip":lang==='zh'?"每日提示":"Shawarwari na yau da kullum"}</Text>
          <Text style={{fontSize:15, marginTop:4}}>{dailyTips[lang]}</Text>
        </View>
        {user ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{lang==='en'?"Welcome":lang==='zh'?"欢迎":"Barka da zuwa"}, {user.name || user.email}!</Text>
            <Text style={styles.cardDetail}>{lang==='en'?"Email":lang==='zh'?"邮箱":"Imel"}: {user.email}</Text>
            <Text style={styles.cardDetail}>{lang==='en'?"Country":lang==='zh'?"国家":"Kasa"}: {user.country || "-"}</Text>
            <Text style={styles.cardDetail}>{lang==='en'?"Language":lang==='zh'?"语言":"Harshe"}: {user.language || lang}</Text>
            <Text style={styles.cardDetail}>{lang==='en'?"Joined":lang==='zh'?"注册时间":"Ranar shiga"}: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{lang==='en'?"You are not logged in.":lang==='zh'?"你还未登录。":"Ba a shiga ba."}</Text>
            <Button title={lang==='en'?"Register":lang==='zh'?"注册":"Yi rijista"} onPress={() => router.push("/register")} color="#0275d8" />
            <Button title={lang==='en'?"Login":lang==='zh'?"登录":"Shiga"} onPress={() => router.push("/login")} color="#5cb85c" style={{marginTop:8}} />
          </View>
        )}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>{lang==='en'?"Your Stats":lang==='zh'?"你的统计":"Kididdiga"}</Text>
          {loadingStats ? (
            <ActivityIndicator style={{marginVertical:16}}/>
          ) : stats ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.chatCount}</Text>
                  <Text style={styles.statLabel}>{lang==='en'?"Chats":lang==='zh'?"聊天":"Tattaunawa"}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.toolsUsed}</Text>
                  <Text style={styles.statLabel}>{lang==='en'?"Tools Used":lang==='zh'?"使用工具":"Kayan aiki da aka yi amfani da su"}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.businessActions}</Text>
                  <Text style={styles.statLabel}>{lang==='en'?"Business Actions":lang==='zh'?"商业操作":"Ayyukan kasuwanci"}</Text>
                </View>
              </View>
              {/* Cashflow/Profit Summary */}
              <View style={{marginTop:20, padding:16, backgroundColor:'#eaffea', borderRadius:12}}>
                <Text style={{fontSize:18, fontWeight:'bold', color:'#0275d8'}}>{lang==='en'?"Cashflow & Profit Summary":lang==='zh'?"现金流和利润总结":"Takaitaccen bayanin kudin shiga da riba"}</Text>
                <Text style={{fontSize:16, color:'#343a40', marginTop:8}}>
                  {lang==='en'?"Total Income":lang==='zh'?"总收入":"Jimillar kudin shiga"}: ₦{stats.totalIncome || 0}
                </Text>
                <Text style={{fontSize:16, color:'#d9534f', marginTop:4}}>
                  {lang==='en'?"Total Expenses":lang==='zh'?"总支出":"Jimillar kudaden fita"}: ₦{stats.totalExpenses || 0}
                </Text>
                <Text style={{fontSize:16, color:'#5cb85c', marginTop:4}}>
                  {lang==='en'?"Net Profit":lang==='zh'?"净利润":"Riba"}: ₦{(stats.totalIncome || 0) - (stats.totalExpenses || 0)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={{color:"#d9534f", marginVertical:16}}>
              {lang==='en'?"Unable to load stats.":lang==='zh'?"无法加载统计。":"Ba a iya ɗaukar kididdiga ba."}
              {profileMsg ? `\n${profileMsg}` : ""}
            </Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang==='en'?"Recent Chats":lang==='zh'?"最近聊天":"Tattaunawa na baya-bayan nan"}</Text>
          {recentChats.length === 0 ? (
            <Text style={styles.emptyText}>{lang==='en'?"No recent chats.":lang==='zh'?"暂无聊天记录。":"Babu tattaunawa kwanan nan."}</Text>
          ) : recentChats.map((chat, idx) => (
            <View key={idx} style={styles.previewBox}>
              <Text style={styles.previewText}>{chat.text}</Text>
              <Text style={styles.previewMeta}>{new Date(chat.createdAt).toLocaleString()}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang==='en'?"Recent Tools Used":lang==='zh'?"最近使用的工具":"Kayan aiki da aka yi amfani da su kwanan nan"}</Text>
          {recentTools.length === 0 ? (
            <Text style={styles.emptyText}>{lang==='en'?"No recent tools used.":lang==='zh'?"暂无工具使用记录。":"Babu kayan aiki da aka yi amfani da su kwanan nan."}</Text>
          ) : recentTools.map((tool, idx) => (
            <View key={idx} style={styles.previewBox}>
              <Text style={styles.previewText}>{tool.category || tool.note || (lang==='en'?"Tool":lang==='zh'?"工具":"Kayan aiki")}</Text>
              <Text style={styles.previewMeta}>{new Date(tool.createdAt).toLocaleString()}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang==='en'?"Account Health":lang==='zh'?"账户健康":"Lafiyar asusu"}</Text>
          <Text style={styles.healthText}>{lang==='en'?"Your account is active and healthy.":lang==='zh'?"你的账户处于活跃和健康状态。":"Asusunka yana aiki kuma yana da lafiya."}</Text>
          <Text style={styles.healthText}>{lang==='en'?"Usage trends and AI recommendations coming soon!":lang==='zh'?"使用趋势和AI推荐即将推出！":"Za a kawo bayanan amfani da shawarwari na AI nan ba da jimawa ba!"}</Text>
        </View>
      </ScrollView>
      {/* Profile Modal */}
      <Modal visible={profileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lang==='en'?"Edit Profile":lang==='zh'?"编辑个人信息":"Gyara bayanan asusu"}</Text>
            <TextInput placeholder={lang==='en'?"Name":lang==='zh'?"姓名":"Suna"} value={profileForm.name} onChangeText={v => setProfileForm(f => ({...f, name: v}))} style={styles.input}/>
            <TextInput placeholder={lang==='en'?"Country":lang==='zh'?"国家":"Kasa"} value={profileForm.country} onChangeText={v => setProfileForm(f => ({...f, country: v}))} style={styles.input}/>
            <TextInput placeholder={lang==='en'?"Language":lang==='zh'?"语言":"Harshe"} value={profileForm.language} onChangeText={v => setProfileForm(f => ({...f, language: v}))} style={styles.input}/>
            {profileMsg ? <Text style={styles.profileMsg}>{profileMsg}</Text> : null}
            <View style={{flexDirection:"row", justifyContent:"space-between", marginTop:16}}>
              <Button title={lang==='en'?"Save":lang==='zh'?"保存":"Ajiye"} onPress={handleProfileSave} disabled={profileLoading} color="#5cb85c" />
              <Button title={lang==='en'?"Cancel":lang==='zh'?"取消":"Soke"} onPress={() => setProfileModal(false)} color="#d9534f" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  leftDot: {
    position: "absolute",
    top: 24,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 4,
    elevation: 3,
  },
  rightDot: {
    position: "absolute",
    top: 24,
    right: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 4,
    elevation: 3,
  },
  leftDrawerContainer: {
    position: "absolute",
    top: 24,
    left: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "column",
    alignItems: "center",
  },
  drawerContainer: {
    position: "absolute",
    top: 24,
    right: 16,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "column",
    alignItems: "center",
  },
  drawerIcon: {
    padding: 8,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    columnGap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0275d8",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0275d8",
  },
  cardDetail: {
    fontSize: 16,
    color: "#343a40",
    marginBottom: 4,
  },
  statsSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0275d8",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0275d8",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#343a40",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0275d8",
    marginBottom: 12,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
  },
  previewBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewText: {
    fontSize: 15,
    color: "#343a40",
  },
  previewMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  healthText: {
    fontSize: 15,
    color: "#343a40",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0275d8",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  profileMsg: {
    color: "#5cb85c",
    marginBottom: 8,
    textAlign: "center",
  },
});



