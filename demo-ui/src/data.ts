/* Scripted demo content for the SAMVEDNA prototype UI.
 *
 * Nothing here comes from a model: every answer is written in advance so the
 * demo video and deck screenshots show the intended behaviour. Legal and
 * clinical facts are the ones verified for the deck (PoA Act s.15A, PoA Rules
 * 11 and 12(4), LSA Act s.12(a), Tele-MANAS 14416, C-SSRS). Callers, names
 * and numbers are synthetic.
 */
export type Lang = 'en' | 'hi'
export type Band = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
export type T = { en: string; hi: string }

export interface Bullet { text: T; cite?: string }
export interface BotReply { intro: T; bullets?: Bullet[]; outro?: T; quick?: T[]; system?: T; from?: 'bot' | 'counsellor' }
export interface Turn { user?: T; bot?: BotReply }
export interface Signal { key: Sign; quote: T }
export interface Action { label: string; basis: string; kind: 'legal' | 'clinical' | 'safety' | 'admin' }
export interface Script {
  id: string
  chip: T
  turns: Turn[]
  band: Band
  svi: number
  parts: { S: number; L: number; V: number; C: number }
  override?: string
  signals: Signal[]
  voice: string[]
  actions: Action[]
}

export type Sign = 'trauma' | 'fear' | 'depression' | 'suicidal' | 'intimidation' | 'isolation' | 'vulnerability'
export const SIGNS: { key: Sign; label: string }[] = [
  { key: 'trauma', label: 'Trauma' }, { key: 'fear', label: 'Fear' }, { key: 'depression', label: 'Depression' },
  { key: 'suicidal', label: 'Suicidal ideation' }, { key: 'intimidation', label: 'Intimidation' },
  { key: 'isolation', label: 'Social isolation' }, { key: 'vulnerability', label: 'Extreme vulnerability' },
]

export const BAND_COLOR: Record<Band, string> = { LOW: '#2e7d3a', MODERATE: '#d99612', HIGH: '#c2510f', CRITICAL: '#b3261e' }

export const CONSENT: BotReply = {
  intro: {
    en: 'Namaste. I am SAMVEDNA, the assistant of the National Helpline Against Atrocities (14566). May I use AI to understand how you are feeling, so that help reaches you faster? What you say stays on the helpline’s own server. You can say no and talk only to a person.',
    hi: 'नमस्ते। मैं संवेदना हूँ, अत्याचार के विरुद्ध राष्ट्रीय हेल्पलाइन (14566) की सहायक। क्या मैं आपकी बात समझने के लिए AI का उपयोग कर सकती हूँ, ताकि आपको जल्दी मदद मिले? आपकी बातें हेल्पलाइन के अपने सर्वर पर ही रहेंगी। आप मना करके सिर्फ़ किसी व्यक्ति से बात कर सकते हैं।',
  },
}
export const CONSENT_YES: T = { en: 'Yes, go ahead', hi: 'हाँ, ठीक है' }
export const CONSENT_NO: T = { en: 'No, I want to talk to a person', hi: 'नहीं, मुझे व्यक्ति से बात करनी है' }
export const AFTER_CONSENT: BotReply = {
  intro: { en: 'Thank you. Tell me what happened, in your own words — or pick a question below.', hi: 'धन्यवाद। अपने शब्दों में बताइए क्या हुआ — या नीचे से कोई सवाल चुनिए।' },
}

export const SCRIPTS: Script[] = [
  {
    id: 'help',
    chip: { en: 'What help can I get after an atrocity?', hi: 'अत्याचार के बाद मुझे क्या मदद मिल सकती है?' },
    turns: [
      { user: { en: 'What help can I get after an atrocity?', hi: 'अत्याचार के बाद मुझे क्या मदद मिल सकती है?' } },
      { bot: {
        intro: { en: 'I’m sorry this happened to you. Under the SC/ST (Prevention of Atrocities) Act, you are entitled to:', hi: 'मुझे बहुत दुख है कि आपके साथ ऐसा हुआ। अनुसूचित जाति/जनजाति (अत्याचार निवारण) अधिनियम के तहत आपके ये अधिकार हैं:' },
        bullets: [
          { text: { en: 'Relief money from the District Magistrate within 7 days', hi: '7 दिनों के भीतर ज़िला मजिस्ट्रेट से राहत राशि' }, cite: 'Rule 12(4)' },
          { text: { en: 'Free legal aid — call NALSA on 15100', hi: 'मुफ़्त कानूनी सहायता — NALSA 15100 पर कॉल करें' }, cite: 'LSA Act s.12(a)' },
          { text: { en: 'Travel, food and a daily allowance for court dates', hi: 'अदालत की तारीख़ों पर आने-जाने, भोजन और दैनिक भत्ता' }, cite: 'Rule 11' },
          { text: { en: 'Protection from threats and intimidation', hi: 'धमकी और डराने-धमकाने से सुरक्षा' }, cite: 's.15A' },
        ],
        outro: { en: 'Shall I register this on NHAA so the district officer is informed?', hi: 'क्या मैं इसे NHAA पर दर्ज कर दूँ ताकि ज़िला अधिकारी को जानकारी मिले?' },
      } },
    ],
    band: 'LOW', svi: 18, parts: { S: 8, L: 6, V: 2, C: 2 },
    signals: [],
    voice: ['steady pace', 'normal pitch range'],
    actions: [
      { label: 'Register grievance on NHAA', basis: 'docket to district officer', kind: 'admin' },
      { label: 'Relief within 7 days', basis: 'PoA Rules 12(4), Annexure-I', kind: 'legal' },
      { label: 'Free legal aid', basis: 'LSA Act s.12(a) · NALSA 15100', kind: 'legal' },
    ],
  },
  {
    id: 'threat',
    chip: { en: 'They keep threatening me not to testify', hi: 'वो धमकी देते हैं कि गवाही मत देना' },
    turns: [
      { user: { en: 'They come every day and threaten me not to testify.', hi: 'वो रोज़ आकर धमकी देते हैं कि गवाही मत देना।' } },
      { bot: {
        intro: { en: 'Thank you for telling me — you did the right thing. Threatening a witness is taken seriously:', hi: 'मुझे बताने के लिए धन्यवाद — आपने सही किया। गवाह को धमकाना गंभीर मामला है:' },
        bullets: [
          { text: { en: 'Police must record your complaint about the threat, even if you tell it orally, and give you a free copy', hi: 'पुलिस को धमकी की आपकी शिकायत दर्ज करनी होगी, चाहे आप मौखिक रूप से बताएँ, और आपको मुफ़्त प्रति देनी होगी' }, cite: 's.15A(9)' },
          { text: { en: 'The State must protect victims and witnesses from intimidation', hi: 'राज्य को पीड़ितों और गवाहों को डराने-धमकाने से बचाना होगा' }, cite: 's.15A(1)' },
          { text: { en: 'The Special Court can order protection, even the same day', hi: 'विशेष न्यायालय उसी दिन भी सुरक्षा का आदेश दे सकता है' }, cite: 's.15A(6), (8)(c)' },
        ],
        outro: { en: 'If you are in danger right now, call 112. A counsellor will call you back today — is this number safe to call?', hi: 'अगर आप अभी ख़तरे में हैं, तो 112 पर कॉल करें। आज ही एक काउंसलर आपको वापस कॉल करेंगे — क्या इस नंबर पर कॉल करना सुरक्षित है?' },
      } },
    ],
    band: 'HIGH', svi: 58, parts: { S: 20, L: 24, V: 6, C: 8 },
    signals: [
      { key: 'intimidation', quote: { en: '“they threaten me not to testify”', hi: '“धमकी देते हैं कि गवाही मत देना”' } },
      { key: 'fear', quote: { en: '“they come every day”', hi: '“वो रोज़ आकर”' } },
    ],
    voice: ['raised pitch variation', 'faster speech rate'],
    actions: [
      { label: 'Police record the threat', basis: 'PoA s.15A(9)', kind: 'legal' },
      { label: 'Apply to Special Court for protection', basis: 's.15A(6), (8)(c)', kind: 'legal' },
      { label: 'Counsellor call-back today', basis: 'HIGH band', kind: 'clinical' },
      { label: '112 if in danger now', basis: 'imminent threat rule', kind: 'safety' },
    ],
  },
  {
    id: 'sleep',
    chip: { en: 'I can’t sleep, I’m scared all the time', hi: 'रात को नींद नहीं आती, हर समय डर लगता है' },
    turns: [
      { user: { en: 'I can’t sleep at night. I’m scared all the time.', hi: 'रात को नींद नहीं आती, हर समय डर लगता है।' } },
      { bot: {
        intro: { en: 'That sounds really hard, and it makes sense after what you have been through. May I ask two short questions? Over the last 2 weeks, how often have you felt down or hopeless?', hi: 'यह सच में बहुत कठिन है, और जो आपके साथ हुआ उसके बाद ऐसा लगना स्वाभाविक है। क्या मैं दो छोटे सवाल पूछ सकती हूँ? पिछले 2 हफ़्तों में कितनी बार आप उदास या निराश महसूस करते रहे?' },
        quick: [
          { en: 'Not at all', hi: 'बिल्कुल नहीं' }, { en: 'Several days', hi: 'कुछ दिन' },
          { en: 'More than half the days', hi: 'आधे से ज़्यादा दिन' }, { en: 'Nearly every day', hi: 'लगभग हर दिन' },
        ],
      } },
      { user: { en: 'More than half the days', hi: 'आधे से ज़्यादा दिन' } },
      { bot: {
        intro: { en: 'Thank you for answering. You don’t have to carry this alone.', hi: 'जवाब देने के लिए धन्यवाद। आपको यह अकेले नहीं सहना है।' },
        bullets: [
          { text: { en: 'Tele-MANAS (14416) gives free, confidential counselling, 24×7, in 20 languages', hi: 'टेली-मानस (14416) 20 भाषाओं में 24×7 मुफ़्त और गोपनीय परामर्श देता है' }, cite: 'Tele-MANAS' },
          { text: { en: 'A counsellor can call you back with a few more questions about sleep and fear', hi: 'एक काउंसलर नींद और डर के बारे में कुछ और सवालों के साथ आपको वापस कॉल कर सकते हैं' }, cite: 'PHQ-9 · PCL-5' },
        ],
        outro: { en: 'Shall I connect you now, or would you prefer a call-back?', hi: 'क्या मैं अभी आपको जोड़ दूँ, या आप वापस कॉल चाहेंगे?' },
      } },
    ],
    band: 'MODERATE', svi: 38, parts: { S: 16, L: 14, V: 4, C: 4 },
    signals: [
      { key: 'fear', quote: { en: '“I’m scared all the time”', hi: '“हर समय डर लगता है”' } },
      { key: 'depression', quote: { en: '“I can’t sleep at night”', hi: '“रात को नींद नहीं आती”' } },
      { key: 'trauma', quote: { en: 'distress since the incident', hi: 'घटना के बाद से परेशानी' } },
    ],
    voice: ['long pauses', 'low energy'],
    actions: [
      { label: 'Referral to Tele-MANAS 14416', basis: 'MODERATE band', kind: 'clinical' },
      { label: 'Full PHQ-9 and PCL-5 at call-back', basis: 'PHQ-2 item 1 = 2', kind: 'clinical' },
    ],
  },
  {
    id: 'travel',
    chip: { en: 'Who pays for my travel to court?', hi: 'कोर्ट जाने का खर्च कौन देगा?' },
    turns: [
      { user: { en: 'Who pays for my travel to court?', hi: 'कोर्ट जाने का खर्च कौन देगा?' } },
      { bot: {
        intro: { en: 'Under Rule 11 of the PoA Rules, for visits to the police, the District Magistrate or the court:', hi: 'PoA नियमों के नियम 11 के तहत, पुलिस, ज़िला मजिस्ट्रेट या अदालत जाने पर:' },
        bullets: [
          { text: { en: 'Your bus fare or second-class train fare is paid', hi: 'आपका बस किराया या द्वितीय श्रेणी रेल किराया दिया जाता है' }, cite: 'Rule 11(1)' },
          { text: { en: 'A daily allowance of at least the State’s minimum agricultural wage, plus food expenses', hi: 'कम से कम राज्य की न्यूनतम कृषि मज़दूरी के बराबर दैनिक भत्ता, साथ में भोजन का खर्च' }, cite: 'Rule 11(4), (5)' },
          { text: { en: 'An attendant can come with you if you are a woman, a child, over 60, or have a disability of 40% or more', hi: 'अगर आप महिला, बच्चे, 60 वर्ष से अधिक या 40% या अधिक विकलांगता वाले हैं, तो एक सहायक साथ आ सकता है' }, cite: 'Rule 11(3)' },
          { text: { en: 'Payment is made immediately or within 3 days', hi: 'भुगतान तुरंत या 3 दिनों के भीतर किया जाता है' }, cite: 'Rule 11(6)' },
        ],
        outro: { en: 'I’ll note this on your grievance so the district office arranges it.', hi: 'मैं इसे आपकी शिकायत में दर्ज कर दूँगी ताकि ज़िला कार्यालय इसकी व्यवस्था करे।' },
      } },
    ],
    band: 'LOW', svi: 12, parts: { S: 4, L: 4, V: 2, C: 2 },
    signals: [],
    voice: ['steady pace'],
    actions: [
      { label: 'Travel, diet, daily allowance', basis: 'PoA Rules, Rule 11', kind: 'legal' },
      { label: 'Note on grievance for district office', basis: 'action due, no clinical data', kind: 'admin' },
    ],
  },
  {
    id: 'privacy',
    chip: { en: 'Will my words be shared with the police?', hi: 'क्या मेरी बातें पुलिस को बताई जाएँगी?' },
    turns: [
      { user: { en: 'Will my words be shared with the police?', hi: 'क्या मेरी बातें पुलिस को बताई जाएँगी?' } },
      { bot: {
        intro: { en: 'No. Your conversation stays on the helpline’s own server.', hi: 'नहीं। आपकी बातचीत हेल्पलाइन के अपने सर्वर पर ही रहती है।' },
        bullets: [
          { text: { en: 'Police and district officers see only the action needed — never your words or your score', hi: 'पुलिस और ज़िला अधिकारी सिर्फ़ ज़रूरी कार्रवाई देखते हैं — आपकी बातें या स्कोर कभी नहीं' } },
          { text: { en: 'Only the counsellor assigned to you can read this conversation', hi: 'सिर्फ़ आपको सौंपा गया काउंसलर यह बातचीत पढ़ सकता है' } },
          { text: { en: 'You can switch the AI off at any time and talk only to a person', hi: 'आप कभी भी AI बंद करके सिर्फ़ किसी व्यक्ति से बात कर सकते हैं' } },
        ],
      } },
    ],
    band: 'LOW', svi: 15, parts: { S: 6, L: 5, V: 2, C: 2 },
    signals: [],
    voice: ['steady pace'],
    actions: [{ label: 'No clinical data leaves the console', basis: 'DPDP s.6 · MHCA s.23', kind: 'admin' }],
  },
  {
    id: 'crisis',
    chip: { en: 'I have decided — I don’t want to live any more', hi: 'मैंने तय कर लिया है, अब और नहीं जीना' },
    turns: [
      { user: { en: 'I have decided. I don’t want to live any more.', hi: 'मैंने तय कर लिया है, अब और नहीं जीना।' } },
      { bot: {
        system: { en: 'CRITICAL · duty counsellor alerted · Tele-MANAS 14416 transfer started', hi: 'गंभीर · ड्यूटी काउंसलर को सूचना · टेली-मानस 14416 से जोड़ा जा रहा है' },
        intro: { en: 'Thank you for telling me. I’m really glad you did, and I’m staying right here with you. A counsellor is joining this chat now, and I’m connecting you to Tele-MANAS (14416) — free and confidential. If you are in immediate danger, please call 112.', hi: 'मुझे बताने के लिए धन्यवाद। मुझे सच में ख़ुशी है कि आपने बताया, और मैं यहीं आपके साथ हूँ। एक काउंसलर अभी इस चैट में जुड़ रहे हैं, और मैं आपको टेली-मानस (14416) से जोड़ रही हूँ — मुफ़्त और गोपनीय। अगर आप अभी ख़तरे में हैं, तो कृपया 112 पर कॉल करें।' },
      } },
      { bot: {
        from: 'counsellor',
        intro: { en: 'Hello, I’m Meera, the duty counsellor. I’m here with you now. Are you somewhere safe at this moment?', hi: 'नमस्ते, मैं मीरा हूँ, ड्यूटी काउंसलर। मैं अभी आपके साथ हूँ। क्या आप इस समय किसी सुरक्षित जगह पर हैं?' },
      } },
    ],
    band: 'CRITICAL', svi: 91, parts: { S: 40, L: 31, V: 8, C: 12 },
    override: 'Crisis phrase matched (Hindi list) → CRITICAL, whatever the score',
    signals: [
      { key: 'suicidal', quote: { en: '“I have decided. I don’t want to live any more.”', hi: '“मैंने तय कर लिया है, अब और नहीं जीना”' } },
      { key: 'depression', quote: { en: 'hopelessness in the statement', hi: 'कथन में निराशा' } },
      { key: 'vulnerability', quote: { en: 'witness in an ongoing case', hi: 'चल रहे मामले में गवाह' } },
    ],
    voice: ['long pauses', 'flat pitch', 'low energy'],
    actions: [
      { label: 'Warm transfer to Tele-MANAS 14416 now', basis: 'C-SSRS protocol — clinical', kind: 'safety' },
      { label: 'Duty counsellor joins the chat', basis: 'CRITICAL band', kind: 'clinical' },
      { label: '112 only if danger is imminent', basis: 'imminent threat rule', kind: 'safety' },
      { label: 'Ask C-SSRS items 3–6', basis: 'Columbia screener skip logic', kind: 'clinical' },
    ],
  },
]

/* ---------------- console queue (synthetic) ---------------- */
export interface Case {
  id: string; band: Band; svi: number; lang: string; channel: string; wait: string; summary: string
  parts: { S: number; L: number; V: number; C: number }; override?: string
  cssrs: [string, string][]; quotes: { tag: Sign; text: string; gloss: string; t: string }[]
  actions: Action[]; status: string
}
export const QUEUE: Case[] = [
  {
    id: 'A-1042', band: 'CRITICAL', svi: 91, lang: 'Hindi', channel: 'IVRS 14566', wait: '0:42', status: 'Warm transfer to 14416 in progress',
    summary: 'Witness in an ongoing case; stated intent to end life', parts: { S: 40, L: 31, V: 8, C: 12 },
    override: 'C-SSRS item 4 (intent) = yes → CRITICAL, whatever the score',
    cssrs: [['1 · Wish to be dead', 'Yes'], ['2 · Suicidal thoughts', 'Yes'], ['3 · Thought of how', 'Yes'], ['4 · Intent', 'Yes'], ['5 · Plan', 'No'], ['6 · Behaviour, past 3 months', 'No']],
    quotes: [
      { tag: 'suicidal', text: 'मैंने तय कर लिया है, अब और नहीं जीना', gloss: 'I have decided, I don’t want to live any more', t: '06:12' },
      { tag: 'intimidation', text: 'वो रोज़ धमकी देते हैं, गवाही मत देना', gloss: 'they threaten me every day not to testify', t: '04:37' },
      { tag: 'isolation', text: 'गाँव में कोई बात नहीं करता', gloss: 'no one in the village talks to us', t: '03:05' },
    ],
    actions: [
      { label: 'Warm transfer to Tele-MANAS 14416', basis: 'C-SSRS protocol — clinical', kind: 'safety' },
      { label: 'Police record the threat', basis: 'PoA s.15A(9)', kind: 'legal' },
      { label: 'Apply to Special Court for protection', basis: 's.15A(6), (8)(c)', kind: 'legal' },
      { label: 'Relief within 7 days', basis: 'PoA Rules 12(4)', kind: 'legal' },
    ],
  },
  {
    id: 'A-1039', band: 'HIGH', svi: 63, lang: 'Bhojpuri', channel: 'Chatbot', wait: '3:10', status: 'Counsellor call-back due this shift',
    summary: 'Social boycott after complaint; not sleeping', parts: { S: 24, L: 23, V: 6, C: 10 },
    cssrs: [['1 · Wish to be dead', 'Yes'], ['2 · Suicidal thoughts', 'No'], ['6 · Behaviour, past 3 months', 'No']],
    quotes: [{ tag: 'isolation', text: 'केहू बात ना करेला, पानी भी ना भरे देत बा', gloss: 'nobody speaks to us, they won’t let us fetch water', t: '02:18' }],
    actions: [{ label: 'Counsellor call-back this shift', basis: 'HIGH band', kind: 'clinical' }, { label: 'District officer: social boycott', basis: 'PoA s.3 · action due', kind: 'legal' }],
  },
  {
    id: 'A-1045', band: 'HIGH', svi: 58, lang: 'English', channel: 'Portal', wait: '5:02', status: 'Police complaint drafted',
    summary: 'Repeated threats not to testify', parts: { S: 20, L: 24, V: 6, C: 8 },
    cssrs: [['1 · Wish to be dead', 'No'], ['2 · Suicidal thoughts', 'No'], ['6 · Behaviour, past 3 months', 'No']],
    quotes: [{ tag: 'intimidation', text: 'They come every day and threaten me not to testify', gloss: '', t: '01:40' }],
    actions: [{ label: 'Police record the threat', basis: 'PoA s.15A(9)', kind: 'legal' }, { label: 'Special Court protection', basis: 's.15A(6), (8)(c)', kind: 'legal' }],
  },
  {
    id: 'A-1037', band: 'MODERATE', svi: 38, lang: 'Tamil · translated', channel: 'Portal', wait: '9:44', status: 'Referred to Tele-MANAS',
    summary: 'Poor sleep and constant fear', parts: { S: 16, L: 14, V: 4, C: 4 },
    cssrs: [['1 · Wish to be dead', 'No'], ['2 · Suicidal thoughts', 'No'], ['6 · Behaviour, past 3 months', 'No']],
    quotes: [{ tag: 'fear', text: 'எப்போதும் பயமாக இருக்கிறது', gloss: 'I am scared all the time', t: '00:55' }],
    actions: [{ label: 'Referral to Tele-MANAS 14416', basis: 'MODERATE band', kind: 'clinical' }],
  },
  {
    id: 'A-1031', band: 'LOW', svi: 18, lang: 'Hindi', channel: 'Mobile app', wait: '14:20', status: 'Grievance registered',
    summary: 'Asked about relief and legal aid', parts: { S: 8, L: 6, V: 2, C: 2 },
    cssrs: [['1 · Wish to be dead', 'No'], ['2 · Suicidal thoughts', 'No'], ['6 · Behaviour, past 3 months', 'No']],
    quotes: [],
    actions: [{ label: 'Relief within 7 days', basis: 'PoA Rules 12(4)', kind: 'legal' }, { label: 'Free legal aid', basis: 'LSA Act s.12(a)', kind: 'legal' }],
  },
]
