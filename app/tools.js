import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../components/AuthContext';

// Set your backend API base URL here for development/production
const API_BASE = 'http://localhost:5000/api/b2b';

// Translation helper: function that also holds phrase maps so it can be used
// both as t('key', lang) and as t.key[lang] in existing code.
function t(key, lang) {
	if (typeof key === 'string' && lang) {
		return t[key] && t[key][lang] ? t[key][lang] : key;
	}
	return key;
}

// Phrase maps used as t.key[lang]
t.title = { en: 'Expense/Income Tracker', zh: '收支记录', ha: 'Mai Bibiyar Kudin Shiga/Fita' };
t.amount = { en: 'Amount', zh: '金额', ha: 'Adadin' };
t.category = { en: 'Category', zh: '类别', ha: 'Rukuni' };
t.note = { en: 'Note', zh: '备注', ha: 'Bayanan kula' };
t.addExpense = { en: 'Add Expense', zh: '添加支出', ha: 'Ƙara Kudin Fita' };
t.addIncome = { en: 'Add Income', zh: '添加收入', ha: 'Ƙara Kudin Shiga' };
t.switchToIncome = { en: 'Switch to Income', zh: '切换到收入', ha: 'Canza zuwa Kudin Shiga' };
t.switchToExpense = { en: 'Switch to Expense', zh: '切换到支出', ha: 'Canza zuwa Kudin Fita' };
t.subtitle = { en: 'Your Expenses/Income', zh: '你的收支', ha: 'Kudin shiga/fita naka' };
t.noRecords = { en: 'No records yet.', zh: '暂无记录。', ha: 'Babu bayanai tukuna.' };
t.businessTools = { en: 'Business Tools', zh: '商业工具', ha: 'Kayan Kasuwanci' };

// Add tab labels for segmented controls
t.toolsTab = { en: 'Tools', zh: '工具', ha: 'Kayan Aiki' };
t.businessTab = { en: 'Business', zh: '商业', ha: 'Kasuwanci' };
t.marketplaceTab = { en: 'Marketplace', zh: '市场', ha: 'Kasuwa' };
t.communityTab = { en: 'Community', zh: '社区', ha: "Al'umma" };

export { t };

export default function ToolsScreen() {
	const { user } = useAuth();
	const router = useRouter();
	const [expenses, setExpenses] = useState([]);
	const [form, setForm] = useState({ amount: '', category: '', note: '', type: 'expense' });
	const [trackerLoading, setTrackerLoading] = useState(false);
	const [lang, setLang] = useState('en');
	const [selectedTool, setSelectedTool] = useState(null);
	const [voiceStatus, setVoiceStatus] = useState('');
	const [imageStatus, setImageStatus] = useState('');

	// Require authentication for actions
	const requireAuth = (action) => {
		if (!user || !user.id) {
			router.push('/login');
			return;
		}
		action && action();
	};

	// Load cached expenses and fetch from backend when user changes
	useEffect(() => {
		const loadExpenses = async () => {
			try {
				const cache = await AsyncStorage.getItem('expenses');
				if (cache) {
					setExpenses(JSON.parse(cache));
				}
			} catch (e) {
				// ignore cache read errors
			}

			if (user && user.id) {
				try {
					const res = await fetch(`${API_BASE}/tools?userId=${user.id}`);
					if (res.ok) {
						const data = await res.json();
						setExpenses(data);
						await AsyncStorage.setItem('expenses', JSON.stringify(data));
					}
				} catch (err) {
					// ignore fetch errors
				}
			}
		};
		loadExpenses();
	}, [user]);

	// Save expenses to cache on change
	useEffect(() => {
		AsyncStorage.setItem('expenses', JSON.stringify(expenses));
	}, [expenses]);

	const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

	// Offline/low-data add
	const handleAdd = async () => {
		if (!form.amount || !form.category) return;
		setTrackerLoading(true);
		const newExpense = { ...form, userId: user?.id || 'offline', date: Date.now() };
		setExpenses(prev => [newExpense, ...prev]);
		try {
			const res = await fetch('http://localhost:5000/api/tools', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newExpense)
			});
			const data = await res.json();
			// Replace local with backend-confirmed expense if online
			setExpenses(prev => [data, ...prev.filter(e => e.date !== newExpense.date)]);
		} catch (err) {
			// Remain in local cache if offline
		}
		setForm({ amount: '', category: '', note: '', type: 'expense' });
		setTrackerLoading(false);
	};

	const uploadVoice = async () => {
		setVoiceStatus('Uploading...');
		const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
		if (result.type === 'success') {
			const formData = new FormData();
			formData.append('voice', { uri: result.uri, name: result.name, type: result.mimeType || 'audio/mpeg' });
			try {
				const res = await fetch('/api/tools/voice', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
				const data = await res.json();
				setVoiceStatus(data.success ? `Uploaded: ${data.file.originalname}` : 'Upload failed');
			} catch (err) {
				setVoiceStatus('Upload error');
			}
		} else {
			setVoiceStatus('No file selected');
		}
	};

	const uploadImage = async () => {
		setImageStatus('Uploading...');
		const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
		if (!result.cancelled) {
			const formData = new FormData();
			formData.append('image', { uri: result.uri, name: 'image.jpg', type: 'image/jpeg' });
			try {
				const res = await fetch('/api/tools/image', { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
				const data = await res.json();
				setImageStatus(data.success ? `Uploaded: ${data.file.originalname}` : 'Upload failed');
			} catch (err) {
				setImageStatus('Upload error');
			}
		} else {
			setImageStatus('No image selected');
		}
	};

	const renderLangButton = (code, icon, label) => (
		<TouchableOpacity
			key={code}
			style={[styles.langBtn, lang === code && styles.langBtnActive]}
			onPress={() => setLang(code)}
		>
			<Icon name={icon} size={18} color={lang === code ? '#fff' : '#007AFF'} />
			<Text style={[styles.langBtnText, lang === code && styles.langBtnTextActive]}>{label}</Text>
		</TouchableOpacity>
	);

	const renderBusinessTools = () => (
		<View style={styles.cardContainer}>
			<View style={styles.iconHeader}>
				<Icon name="tools" size={36} color="#007AFF" />
			</View>
			<Text style={styles.sectionTitle}>{t.businessTools[lang]}</Text>
			<View style={styles.businessBtnRow}>
				<TouchableOpacity style={styles.businessBtn} onPress={() => setSelectedTool('finder')}>
					<Icon name="briefcase-search" size={20} color="#fff" />
					<Text style={styles.businessBtnText}>Supplier Finder</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.businessBtn} onPress={() => setSelectedTool('marketing')}>
					<Icon name="bullhorn" size={20} color="#fff" />
					<Text style={styles.businessBtnText}>Marketing AI</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.businessBtn} onPress={() => setSelectedTool('negotiation')}>
					<Icon name="handshake" size={20} color="#fff" />
					<Text style={styles.businessBtnText}>Deal Helper</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	const SupplierCustomerFinder = () => {
		const [businessType, setBusinessType] = useState('');
		const [results, setResults] = useState([]);
		const [finderLoading, setFinderLoading] = useState(false);
		const [error, setError] = useState('');

		const fetchSuggestions = async () => {
			if (!businessType) return;
			setFinderLoading(true);
			setError('');
			setResults([]);
			try {
				const res = await fetch('http://localhost:5000/api/ai/business-finder', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ businessType })
				});
				const data = await res.json();
				if (data?.suggestions?.length) {
					setResults(data.suggestions);
				} else {
					setError('No suggestions found.');
				}
			} catch (err) {
				setError('Error fetching suggestions.');
			}
			setFinderLoading(false);
		};

		return (
			<View style={styles.cardContainer}>
				<View style={styles.iconHeader}>
					<Icon name="briefcase-search" size={40} color="#007AFF" />
				</View>
				<Text style={styles.toolTitle}>Supplier/Customer Finder</Text>
				<Text style={styles.toolSubtitle}>Let Omniva suggest partners for your specific business niche.</Text>
				<View style={styles.inputRow}>
					<Icon name="domain" size={22} color="#007AFF" style={styles.inputIcon} />
					<TextInput
						style={styles.inputPro}
						placeholder="e.g. Restaurant, Retail, Farming"
						value={businessType}
						onChangeText={setBusinessType}
						editable={!finderLoading}
					/>
				</View>
				<TouchableOpacity style={styles.primaryBtn} onPress={fetchSuggestions} disabled={finderLoading}>
					<Icon name={finderLoading ? 'loading' : 'magnify'} size={22} color="#fff" />
					<Text style={styles.primaryBtnText}>{finderLoading ? 'Loading...' : 'Get Suggestions'}</Text>
				</TouchableOpacity>
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				{results.length > 0 && (
					<View style={styles.resultsContainer}>
						<Text style={styles.resultsTitle}>Suggestions</Text>
						{results.map((item, idx) => (
							<View key={idx} style={styles.resultItem}>
								<Icon name="account-group" size={18} color="#007AFF" style={styles.resultIcon} />
								<Text style={styles.resultText}>{item}</Text>
							</View>
						))}
					</View>
				)}
				<TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedTool(null)}>
					<Icon name="arrow-left" size={20} color="#007AFF" />
					<Text style={styles.secondaryBtnText}>Back to Business Tools</Text>
				</TouchableOpacity>
			</View>
		);
	};

	const MarketingSalesAutomation = () => (
		<View style={styles.cardContainer}>
			<View style={styles.iconHeader}>
				<Icon name="bullhorn" size={40} color="#f39c12" />
			</View>
			<Text style={styles.toolTitle}>Marketing & Sales Automation</Text>
			<Text style={styles.toolSubtitle}>Draft campaigns, social posts, and follow-ups in seconds.</Text>
			{/* TODO: Replace placeholder once AI workflow is connected */}
			<View style={styles.placeholderBox}>
				<Text style={styles.placeholderText}>Connect AI workflow to generate marketing assets here.</Text>
			</View>
			<TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedTool(null)}>
				<Icon name="arrow-left" size={20} color="#007AFF" />
				<Text style={styles.secondaryBtnText}>Back to Business Tools</Text>
			</TouchableOpacity>
		</View>
	);

	const DealNegotiationHelper = () => (
		<View style={styles.cardContainer}>
			<View style={styles.iconHeader}>
				<Icon name="handshake" size={40} color="#16a085" />
			</View>
			<Text style={styles.toolTitle}>Deal Negotiation Helper</Text>
			<Text style={styles.toolSubtitle}>Get tactical advice, draft emails, and analyze offers.</Text>
			<View style={styles.placeholderBox}>
				<Text style={styles.placeholderText}>Hook up your negotiation AI prompts to unlock this module.</Text>
			</View>
			<TouchableOpacity style={styles.secondaryBtn} onPress={() => setSelectedTool(null)}>
				<Icon name="arrow-left" size={20} color="#007AFF" />
				<Text style={styles.secondaryBtnText}>Back to Business Tools</Text>
			</TouchableOpacity>
		</View>
	);

	// Enterprise AI & B2B Intelligence Card
	const EnterpriseAIB2BCard = ({ lang, onConfigureAgent }) => {
		const [analytics, setAnalytics] = useState(null);
		const [marketInsights, setMarketInsights] = useState(null);
		const [reportStatus, setReportStatus] = useState('');
		const [supplierIntel, setSupplierIntel] = useState(null);
		const [customerIntel, setCustomerIntel] = useState(null);
		const [agentConfig, setAgentConfig] = useState('');
		const [agentResponse, setAgentResponse] = useState('');
		const [loading, setLoading] = useState(false);

		// Add new state for expanded endpoints
		const [competitorIntel, setCompetitorIntel] = useState(null);
		const [industryNews, setIndustryNews] = useState(null);
		const [aiOpportunities, setAIOpportunities] = useState(null);

		useEffect(() => {
			// Fetch analytics, market insights, supplier/customer intelligence from backend
			setLoading(true);
			Promise.all([
				fetch(`${API_BASE}/analytics`).then(r => r.json()),
				fetch(`${API_BASE}/market-insights`).then(r => r.json()),
				fetch(`${API_BASE}/supplier-intel`).then(r => r.json()),
				fetch(`${API_BASE}/customer-intel`).then(r => r.json()),
				fetch(`${API_BASE}/competitor-intel`).then(r => r.json()),
				fetch(`${API_BASE}/industry-news`).then(r => r.json()),
				fetch(`${API_BASE}/ai-opportunities`).then(r => r.json()),
			]).then(([
				analytics, market, supplier, customer, competitor, news, aiOpp
			]) => {
				setAnalytics(analytics);
				setMarketInsights(market);
				setSupplierIntel(supplier);
				setCustomerIntel(customer);
				setCompetitorIntel && setCompetitorIntel(competitor);
				setIndustryNews && setIndustryNews(news);
				setAIOpportunities && setAIOpportunities(aiOpp);
				setLoading(false);
			}).catch(() => setLoading(false));
		}, []);

		const handleReport = async () => {
			setReportStatus('Generating...');
			try {
				const res = await fetch(`${API_BASE}/report`, { method: 'POST' });
				const data = await res.json();
				setReportStatus(data.success ? 'Report generated!' : 'Failed to generate report');
			} catch {
				setReportStatus('Error generating report');
			}
		};

		const handleAgentConfig = async () => {
			setAgentResponse('Connecting...');
			try {
				const res = await fetch(`${API_BASE}/agent`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ config: agentConfig })
				});
				const data = await res.json();
				setAgentResponse(data.response || 'Agent configured.');
			} catch {
				setAgentResponse('Error connecting to agent backend.');
			}
		};

		return (
			<View style={styles.cardContainer}>
				<View style={styles.iconHeader}>
					<Icon name="robot-industrial" size={36} color="#6c63ff" />
				</View>
				<Text style={styles.sectionTitle}>Enterprise AI & B2B Intelligence</Text>
				<Text style={styles.toolSubtitle}>Business analytics, market insights, reporting, and agent-driven intelligence.</Text>
				{loading ? <Text>Loading...</Text> : (
					<>
						<Text style={styles.toolTitle}>Business Analytics</Text>
						<Text style={styles.toolSubtitle}>{analytics ? analytics.summary : 'No data.'}</Text>
						<Text style={styles.toolTitle}>Market Insights</Text>
						<Text style={styles.toolSubtitle}>{marketInsights ? marketInsights.trends : 'No data.'}</Text>
						<Text style={styles.toolTitle}>Supplier Intelligence</Text>
						<Text style={styles.toolSubtitle}>{supplierIntel ? supplierIntel.info : 'No data.'}</Text>
						<Text style={styles.toolTitle}>Customer Intelligence</Text>
						<Text style={styles.toolSubtitle}>{customerIntel ? customerIntel.info : 'No data.'}</Text>
						<Text style={styles.toolTitle}>Competitor Intelligence</Text>
						<Text style={styles.toolSubtitle}>{competitorIntel ? competitorIntel.info : 'No data.'}</Text>
						<Text style={styles.toolTitle}>Industry News</Text>
						<Text style={styles.toolSubtitle}>{industryNews ? industryNews.headlines : 'No data.'}</Text>
						<Text style={styles.toolTitle}>AI Opportunities</Text>
						<Text style={styles.toolSubtitle}>{aiOpportunities ? aiOpportunities.suggestions : 'No data.'}</Text>
					</>
				)}
				<TouchableOpacity style={styles.primaryBtn} onPress={handleReport}>
					<Icon name="file-chart" size={20} color="#fff" />
					<Text style={styles.primaryBtnText}>Generate Automated Report</Text>
				</TouchableOpacity>
				<Text style={styles.status}>{reportStatus}</Text>
				<View style={{marginTop:16}}>
					<Text style={styles.toolTitle}>AI Agent Configuration</Text>
					<TextInput
						style={styles.inputPro}
						placeholder="Describe your agent's goal..."
						value={agentConfig}
						onChangeText={setAgentConfig}
					/>
					<TouchableOpacity style={styles.secondaryBtn} onPress={handleAgentConfig}>
						<Icon name="robot" size={20} color="#6c63ff" />
						<Text style={styles.secondaryBtnText}>Configure Agent</Text>
					</TouchableOpacity>
					<Text style={styles.status}>{agentResponse}</Text>
				</View>
			</View>
		);
	};

	// Synergy Card: Business-Money-Health Automation
	const SynergyCard = ({ lang = 'en' }) => {
		const [synergy, setSynergy] = useState(null);
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState('');

		useEffect(() => {
			setLoading(true);
			fetch('http://localhost:5000/api/b2b/synergy-flow')
				.then(res => res.json())
				.then(data => {
					setSynergy(data.synergy);
					setLoading(false);
				})
				.catch(err => {
					setError(t('error', lang));
					setLoading(false);
				});
		}, [lang]);

		return (
			<View style={styles.cardContainer}>
				<View style={styles.iconHeader}>
					<Icon name="sync" size={36} color="#00b894" />
				</View>
				<Text style={styles.sectionTitle}>{t('synergyTitle', lang)}</Text>
				<Text style={styles.toolSubtitle}>{t('synergySubtitle', lang)}</Text>
				{loading ? <Text>{t('loading', lang)}</Text> : error ? <Text style={styles.errorText}>{error}</Text> : (
					synergy ? (
						<>
							<Text style={styles.toolTitle}>{t('recentBusinessUsers', lang)}</Text>
							<Text style={styles.toolSubtitle}>{Array.isArray(synergy.businessUsers) ? synergy.businessUsers.join(', ') : t('none', lang)}</Text>
							<Text style={styles.toolTitle}>{t('linkedHealthAppointments', lang)}</Text>
							{Array.isArray(synergy.healthAppointments) && synergy.healthAppointments.length > 0 ? (
								synergy.healthAppointments.map((appt, idx) => (
									<Text key={idx} style={styles.toolSubtitle}>{appt.patientName} with {appt.doctorName} on {new Date(appt.date).toLocaleDateString()}</Text>
								))
							) : <Text style={styles.toolSubtitle}>{t('none', lang)}</Text>}
						</>
					) : <Text>{t('noSynergy', lang)}</Text>
				)}
			</View>
		);
	};

	// Handler for agent configuration (stub)
	const handleConfigureAgent = (config) => {
		// Deprecated: now handled in EnterpriseAIB2BCard
	};

	const isExpense = form.type === 'expense';

	return (
		<ScrollView contentContainerStyle={styles.screen}>
			<View style={styles.langRow}>
				{renderLangButton('en', 'alphabet-latin', 'EN')}
				{renderLangButton('zh', 'alphabet-chinese', '中文')}
				{renderLangButton('ha', 'alphabetical', 'Hausa')}
			</View>

			{selectedTool === null ? (
				<>
					{renderBusinessTools()}
					<EnterpriseAIB2BCard lang={lang} onConfigureAgent={handleConfigureAgent} />
					<SynergyCard lang={lang} />
				</>
			) : selectedTool === 'finder' ? (
				<SupplierCustomerFinder />
			) : selectedTool === 'marketing' ? (
				<MarketingSalesAutomation />
			) : (
				<DealNegotiationHelper />
			)}

			<View style={styles.cardContainer}>
				<View style={styles.iconHeader}>
					<Icon name="cash-multiple" size={36} color="#27ae60" />
				</View>
				<Text style={styles.toolTitle}>{t.title[lang]}</Text>
				<Text style={styles.toolSubtitle}>{t.subtitle[lang]}</Text>
				<View style={styles.formGroup}>
					<View style={styles.inputRow}>
						<Icon name="currency-ngn" size={20} color="#27ae60" style={styles.inputIcon} />
						<TextInput
							style={styles.inputPro}
							placeholder={t.amount[lang]}
							keyboardType="numeric"
							value={form.amount}
							onChangeText={value => handleChange('amount', value)}
						/>
					</View>
					<View style={styles.inputRow}>
						<Icon name="shape" size={20} color="#27ae60" style={styles.inputIcon} />
						<TextInput
							style={styles.inputPro}
							placeholder={t.category[lang]}
							value={form.category}
							onChangeText={value => handleChange('category', value)}
						/>
					</View>
					<View style={styles.inputRow}>
						<Icon name="note-text" size={20} color="#27ae60" style={styles.inputIcon} />
						<TextInput
							style={styles.inputPro}
							placeholder={t.note[lang]}
							value={form.note}
							onChangeText={value => handleChange('note', value)}
						/>
					</View>
				</View>
				<View style={styles.actionsRow}>
					<TouchableOpacity style={styles.primaryBtn} onPress={handleAdd} disabled={trackerLoading}>
						<Icon name={isExpense ? 'minus-circle' : 'plus-circle'} size={20} color="#fff" />
						<Text style={styles.primaryBtnText}>{isExpense ? t.addExpense[lang] : t.addIncome[lang]}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.secondaryPill}
						onPress={() => handleChange('type', isExpense ? 'income' : 'expense')}
					>
						<Icon name="swap-horizontal" size={18} color="#007AFF" />
						<Text style={styles.secondaryPillText}>{isExpense ? t.switchToIncome[lang] : t.switchToExpense[lang]}</Text>
					</TouchableOpacity>
				</View>
				<FlatList
					data={expenses}
					keyExtractor={item => item._id}
					renderItem={({ item }) => (
						<View style={styles.listItem}>
							<Icon
								name={item.type === 'income' ? 'arrow-down-bold-circle' : 'arrow-up-bold-circle'}
								size={18}
								color={item.type === 'income' ? '#5cb85c' : '#d9534f'}
								style={styles.listIcon}
							/>
							<View style={styles.listCopy}>
								<Text style={[styles.amountText, item.type === 'income' ? styles.income : styles.expense]}>
									{item.type === 'income' ? '+' : '-'}₦{item.amount} · {item.category}
								</Text>
								{item.note ? <Text style={styles.noteText}>{item.note}</Text> : null}
							</View>
						</View>
					)}
					ListEmptyComponent={<Text style={styles.emptyText}>{t.noRecords[lang]}</Text>}
				/>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Voice Input</Text>
				<TouchableOpacity style={styles.button} onPress={uploadVoice}>
					<Icon name="microphone" size={24} color="#fff" />
					<Text style={styles.buttonText}>Upload Voice</Text>
				</TouchableOpacity>
				<Text style={styles.status}>{voiceStatus}</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Image Input</Text>
				<TouchableOpacity style={styles.button} onPress={uploadImage}>
					<Icon name="image" size={24} color="#fff" />
					<Text style={styles.buttonText}>Upload Image</Text>
				</TouchableOpacity>
				<Text style={styles.status}>{imageStatus}</Text>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: {
		padding: 20,
		backgroundColor: '#f4f6fb',
		alignItems: 'stretch'
	},
	langRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 12,
		gap: 12
	},
	langBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#007AFF',
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 6,
		backgroundColor: '#fff',
		gap: 6
	},
	langBtnActive: {
		backgroundColor: '#007AFF'
	},
	langBtnText: {
		color: '#007AFF',
		fontWeight: '600'
	},
	langBtnTextActive: {
		color: '#fff'
	},
	cardContainer: {
		backgroundColor: '#fff',
		borderRadius: 18,
		padding: 20,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
		overflow: 'hidden'
	},
	iconHeader: {
		alignItems: 'center',
		marginBottom: 10
	},
	sectionTitle: {
		fontSize: 22,
		fontWeight: '700',
		textAlign: 'center',
		marginBottom: 14,
		color: '#0f1c3f'
	},
	toolTitle: {
		fontSize: 20,
		fontWeight: '700',
		textAlign: 'center',
		color: '#0f1c3f',
		marginBottom: 6
	},
	toolSubtitle: {
		fontSize: 15,
		textAlign: 'center',
		color: '#596075',
		marginBottom: 16
	},
	businessBtnRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 12
	},
	businessBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#007AFF',
		borderRadius: 12,
		paddingVertical: 12,
		gap: 6
	},
	businessBtnText: {
		color: '#fff',
		fontWeight: '600'
	},
	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e1e5ef',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 6,
		marginBottom: 12,
		backgroundColor: '#fafbff'
	},
	inputIcon: {
		marginRight: 8
	},
	inputPro: {
		flex: 1,
		fontSize: 16,
		color: '#0f1c3f',
		paddingVertical: 6
	},
	primaryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#007AFF',
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
		gap: 8
	},
	primaryBtnText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 15
	},
	secondaryBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 18,
		gap: 6
	},
	secondaryBtnText: {
		color: '#007AFF',
		fontSize: 15,
		fontWeight: '600'
	},
	secondaryPill: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#007AFF',
		paddingHorizontal: 14,
		paddingVertical: 10,
		gap: 6,
		backgroundColor: '#fff'
	},
	secondaryPillText: {
		color: '#007AFF',
		fontWeight: '600'
	},
	errorText: {
		color: '#d9534f',
		marginTop: 8,
		textAlign: 'center'
	},
	resultsContainer: {
		marginTop: 14,
		backgroundColor: '#f4f6fb',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: '#e1e5ef'
	},
	resultsTitle: {
		fontWeight: '700',
		color: '#0f1c3f',
		marginBottom: 8,
		textAlign: 'center'
	},
	resultItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6
	},
	resultIcon: {
		marginRight: 8
	},
	resultText: {
		color: '#39415c',
		fontSize: 15
	},
	placeholderBox: {
		borderWidth: 1,
		borderColor: '#e1e5ef',
		borderRadius: 12,
		padding: 16,
		backgroundColor: '#fafbff'
	},
	placeholderText: {
		color: '#596075',
		textAlign: 'center',
		fontSize: 14
	},
	formGroup: {
		marginTop: 8
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
		marginBottom: 16
	},
	listItem: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 10
	},
	listIcon: {
		marginRight: 10,
		marginTop: 2
	},
	listCopy: {
		flex: 1,
		borderBottomWidth: 1,
		borderBottomColor: '#eef1f6',
		paddingBottom: 10
	},
	amountText: {
		fontSize: 16,
		fontWeight: '700'
	},
	income: {
		color: '#2ecc71'
	},
	expense: {
		color: '#e74c3c'
	},
	noteText: {
		color: '#596075',
		marginTop: 4
	},
	emptyText: {
		textAlign: 'center',
		color: '#9ba3be',
		marginTop: 10
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#007AFF',
		padding: 12,
		borderRadius: 8,
		marginVertical: 8
	},
	buttonText: {
		color: '#fff',
		marginLeft: 8,
		fontSize: 16
	},
	section: {
		marginVertical: 16
	},
	status: {
		marginTop: 8,
		fontSize: 14,
		color: '#555'
	}
});

// Localization utility
const translations = {
  en: {
    synergyTitle: 'Business-Money-Health Synergy',
    synergySubtitle: 'Automated flows and cross-module intelligence.',
    recentBusinessUsers: 'Recent Business Users',
    linkedHealthAppointments: 'Linked Health Appointments',
    noSynergy: 'No synergy data available.',
    loading: 'Loading...',
    error: 'Failed to fetch synergy data',
    none: 'None',
    businessTools: 'Business Tools',
    expenseTracker: 'Expense/Income Tracker',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    switchToIncome: 'Switch to Income',
    switchToExpense: 'Switch to Expense',
    title: 'Expense/Income Tracker',
    amount: 'Amount',
    category: 'Category',
    note: 'Note',
    subtitle: 'Your Expenses/Income',
    noRecords: 'No records yet.',
  },
  zh: {
    synergyTitle: '商业-财务-健康协同',
    synergySubtitle: '自动化流程与跨模块智能。',
    recentBusinessUsers: '最近的商业用户',
    linkedHealthAppointments: '关联的健康预约',
    noSynergy: '暂无协同数据。',
    loading: '加载中...',
    error: '获取协同数据失败',
    none: '无',
    businessTools: '商业工具',
    expenseTracker: '收支记录',
    addExpense: '添加支出',
    addIncome: '添加收入',
    switchToIncome: '切换到收入',
    switchToExpense: '切换到支出',
    title: '收支记录',
    amount: '金额',
    category: '类别',
    note: '备注',
    subtitle: '你的收支',
    noRecords: '暂无记录。',
  },
  ha: {
    synergyTitle: 'Haɗin Kasuwanci-Kudi-Lafiya',
    synergySubtitle: 'Ayyuka ta atomatik da basira tsakanin sassa.',
    recentBusinessUsers: 'Masu Kasuwanci na Kwanan nan',
    linkedHealthAppointments: 'Haɗaɗɗun Ziyara na Lafiya',
    noSynergy: 'Babu bayanan haɗin kai.',
    loading: 'Ana lodawa...',
    error: 'An kasa samo bayanan haɗin kai',
    none: 'Babu',
    businessTools: 'Kayan Kasuwanci',
    expenseTracker: 'Mai Bibiyar Kudin Shiga/Fita',
    addExpense: 'Ƙara Kudin Fita',
    addIncome: 'Ƙara Kudin Shiga',
    switchToIncome: 'Canza zuwa Kudin Shiga',
    switchToExpense: 'Canza zuwa Kudin Fita',
    title: 'Mai Bibiyar Kudin Shiga/Fita',
    amount: 'Adadin',
    category: 'Rukuni',
    note: 'Bayanan kula',
    subtitle: 'Kudin shiga/fita naka',
    noRecords: 'Babu bayanai tukuna.',
  },
  hi: {
    synergyTitle: 'व्यापार-धन-स्वास्थ्य समन्वय',
    synergySubtitle: 'स्वचालित प्रवाह और क्रॉस-मॉड्यूल इंटेलिजेंस।',
    recentBusinessUsers: 'हाल के व्यापार उपयोगकर्ता',
    linkedHealthAppointments: 'लिंक किए गए स्वास्थ्य अपॉइंटमेंट्स',
    noSynergy: 'कोई समन्वय डेटा उपलब्ध नहीं है।',
    loading: 'लोड हो रहा है...',
    error: 'समन्वय डेटा प्राप्त करने में विफल',
    none: 'कोई नहीं',
    businessTools: 'व्यापार उपकरण',
    expenseTracker: 'खर्च/आय ट्रैकर',
    addExpense: 'खर्च जोड़ें',
    addIncome: 'आय जोड़ें',
    switchToIncome: 'आय में स्विच करें',
    switchToExpense: 'खर्च में स्विच करें',
    title: 'खर्च/आय ट्रैकर',
    amount: 'राशि',
    category: 'श्रेणी',
    note: 'नोट',
    subtitle: 'आपके खर्च/आय',
    noRecords: 'अभी तक कोई रिकॉर्ड नहीं।',
  },
  ur: {
    synergyTitle: 'کاروبار-پیسہ-صحت ہم آہنگی',
    synergySubtitle: 'خودکار بہاؤ اور کراس ماڈیول انٹیلی جنس۔',
    recentBusinessUsers: 'حالیہ کاروباری صارفین',
    linkedHealthAppointments: 'منسلک صحت کی اپائنٹمنٹس',
    noSynergy: 'کوئی ہم آہنگی ڈیٹا دستیاب نہیں۔',
    loading: 'لوڈ ہو رہا ہے...',
    error: 'ہم آہنگی ڈیٹا حاصل کرنے میں ناکام',
    none: 'کوئی نہیں',
    businessTools: 'کاروباری اوزار',
    expenseTracker: 'اخراجات/آمدنی ٹریکر',
    addExpense: 'اخراجات شامل کریں',
    addIncome: 'آمدنی شامل کریں',
    switchToIncome: 'آمدنی میں تبدیل کریں',
    switchToExpense: 'اخراجات میں تبدیل کریں',
    title: 'اخراجات/آمدنی ٹریکر',
    amount: 'رقم',
    category: 'زمرہ',
    note: 'نوٹ',
    subtitle: 'آپ کے اخراجات/آمدنی',
    noRecords: 'ابھی تک کوئی ریکارڈ نہیں۔',
  },
  yo: {
    synergyTitle: 'Isopọ Iṣowo-Owo-Ilera',
    synergySubtitle: 'Awọn ṣiṣan adaṣe ati oye laarin awọn apakan.',
    recentBusinessUsers: 'Awọn olumulo Iṣowo to ṣẹṣẹ',
    linkedHealthAppointments: 'Awọn ipinnu ilera ti o ni asopọ',
    noSynergy: 'Ko si data isopọ.',
    loading: 'Nṣiṣẹ...',
    error: 'Ko le gba data isopọ',
    none: 'Ko si',
    businessTools: 'Awọn irinṣẹ Iṣowo',
    expenseTracker: 'Olutọpa Inawo/Owo-wiwọle',
    addExpense: 'Fi inawo kun',
    addIncome: 'Fi owo-wiwọle kun',
    switchToIncome: 'Yipada si Owo-wiwọle',
    switchToExpense: 'Yipada si Inawo',
    title: 'Olutọpa Inawo/Owo-wiwọle',
    amount: 'Iye',
    category: 'Ẹka',
    note: 'Akọsilẹ',
    subtitle: 'Awọn inawo/Owo-wiwọle rẹ',
    noRecords: 'Ko si awọn igbasilẹ sibẹsibẹ.',
  },
  ig: {
	synergyTitle: "Njikọ Ahịa-Ego-Ahụike",
	synergySubtitle: "Usoro akpaghị aka na amamihe n'etiti ngalaba.",
	recentBusinessUsers: "Ndụmọdụ Ahịa ọhụrụ",
	linkedHealthAppointments: "Ndụmọdụ Ahụike jikọtara",
	noSynergy: "Enweghị data njikọ.",
	loading: "Na-ebubata...",
	error: "Enweghị ike inweta data njikọ",
	none: "Enweghị",
	businessTools: "Ngwaọrụ Ahịa",
	expenseTracker: "Ngwa nyocha ego/ego",
	addExpense: "Tinye ego",
	addIncome: "Tinye ego",
	switchToIncome: "Gbanwee na Ego",
	switchToExpense: "Gbanwee na Inweta",
	title: "Ngwa nyocha ego/ego",
	amount: "Nọmba",
	category: "Uru",
	note: "Nkwupụta",
	subtitle: "Nchịkọta ego gị",
	noRecords: "Enweghị ndekọ ọ bụla.",
  },
  zu: {
    synergyTitle: 'Ukuvumelanisa Kwebhizinisi-Imali-Impilo',
    synergySubtitle: 'Ukugeleza okuzenzakalelayo nobuhlakani phakathi kwezingxenye.',
    recentBusinessUsers: 'Abasebenzisi Bebhizinisi Bakamuva',
    linkedHealthAppointments: 'Ukuqokwa Kwezempilo Okuxhunyiwe',
    noSynergy: 'Ayikho idatha yokuvumelanisa.',
    loading: 'Kulayishwa...',
    error: 'Yehlulekile ukuthola idatha yokuvumelanisa',
    none: 'Ayikho',
    businessTools: 'Amathuluzi Ebhizinisi',
    expenseTracker: 'Umkhondo Wezindleko/Imali engenayo',
    addExpense: 'Engeza Izindleko',
    addIncome: 'Engeza Imali engenayo',
    switchToIncome: 'Shintsha uye ku-Imali engenayo',
    switchToExpense: 'Shintsha uye ku-Zindleko',
    title: 'Umkhondo Wezindleko/Imali engenayo',
    amount: 'Inani',
    category: 'Uhlaka',
    note: 'Iphuzu',
    subtitle: 'Izindleko zakho/Imali engenayo',
    noRecords: 'Ayikho amarekhodi okwamanje.',
  },
  xh: {
    synergyTitle: 'Umdibaniso weShishini-Imali-Impilo',
    synergySubtitle: 'Ukuhamba okuzenzekelayo kunye nobukrelekrele phakathi kwamacandelo.',
    recentBusinessUsers: 'Abasebenzisi beShishini bamva nje',
    linkedHealthAppointments: 'Izidibaniso zempilo ezinxulumeneyo',
    noSynergy: 'Akukho datha yomdibaniso ekhoyo.',
    loading: 'Iyalayisha...',
    error: 'Ayikwazanga ukufumana idatha yomdibaniso',
    none: 'Akukho',
    businessTools: 'Izixhobo zeshishini',
    expenseTracker: 'Umkhondo weendleko/ingeniso',
    addExpense: 'Yongeza iindleko',
    addIncome: 'Yongeza ingeniso',
    switchToIncome: 'Guqula uye ku-Ingeniso',
    switchToExpense: 'Guqula uye ku-Zindleko',
    title: 'Umkhondo weendleko/ingeniso',
    amount: 'Ubungakanani',
    category: 'Uhlanga',
    note: 'Inqaku',
    subtitle: 'Iindleko zakho/ingeniso',
    noRecords: 'Ayikho iirekhodi ngoku.',
  },
};

// Add more phrases for localization
Object.keys(translations).forEach(lang => {
  translations[lang] = {
    ...translations[lang],
    businessTools: {
      en: 'Business Tools', zh: '商业工具', ha: 'Kayan Kasuwanci', hi: 'व्यापार उपकरण', ur: 'کاروباری اوزار', yo: 'Awọn irinṣẹ Iṣowo', ig: 'Ngwaọrụ Ahịa', zu: 'Amathuluzi Ebhizinisi', xh: 'Izixhobo zeshishini',
    }[lang] || translations[lang].businessTools,
    expenseTracker: {
      en: 'Expense/Income Tracker', zh: '收支记录', ha: 'Mai Bibiyar Kudin Shiga/Fita', hi: 'खर्च/आय ट्रैकर', ur: 'اخراجات/آمدنی ٹریکر', yo: 'Olutọpa Inawo/Owo-wiwọle', ig: 'Ngwa nyocha ego/ego', zu: 'Umkhondo Wezindleko/Imali engenayo', xh: 'Umkhondo weendleko/ingeniso',
    }[lang] || translations[lang].expenseTracker,
    addExpense: {
      en: 'Add Expense', zh: '添加支出', ha: 'Ƙara Kudin Fita', hi: 'खर्च जोड़ें', ur: 'اخراجات شامل کریں', yo: 'Fi inawo kun', ig: 'Tinye ego', zu: 'Engeza Izindleko', xh: 'Yongeza iindleko',
    }[lang] || translations[lang].addExpense,
    addIncome: {
      en: 'Add Income', zh: '添加收入', ha: 'Ƙara Kudin Shiga', hi: 'आय जोड़ें', ur: 'آمدنی شامل کریں', yo: 'Fi owo-wiwọle kun', ig: 'Tinye ego', zu: 'Engeza Imali engenayo', xh: 'Yongeza ingeniso',
    }[lang] || translations[lang].addIncome,
    // Add more phrases as needed...
  };
});

// Dynamic language switching utility
// Usage: setLang('hi') or setLang('zh') etc.
// Already supported in ToolsScreen via lang state

// Example: Update other modules to use t(key, lang)
// In any module, replace hardcoded text with t('phraseKey', lang)
