import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const sections = [
  {
    icon: "⚙️",
    title: "पहली बार सेटअप (Doctor)",
    steps: [
      "Settings में जाएं — क्लिनिक का नाम, पता, फोन, डॉक्टर का नाम, qualification और registration number भरें।",
      "Doctor signature और clinic logo upload करें (दोनों 200KB से कम) — ये पर्ची पर छपेंगे।",
      "Receptionist और Pharmacy का 10 अंक का मोबाइल नंबर, PIN और email डालें — PIN अपने आप मोबाइल के आखिरी 6 अंकों से बन जाती है, चाहें तो बदल सकते हैं।",
      "अगर क्लिनिक में Psychologist है तो Psychologist toggle चालू करके उसका भी मोबाइल, PIN और email डालें।",
      "स्टाफ बदलने पर Settings में जाकर Remove दबाएं — मोबाइल, PIN और email तीनों हट जाएंगे, फिर नया डालें।",
    ],
  },
  {
    icon: "🏥",
    title: "Receptionist का काम",
    steps: [
      "Reception page पर मरीज का मोबाइल नंबर डालें — पुराना मरीज है तो नाम अपने आप आ जाएगा।",
      "नया मरीज है तो नाम भरें।",
      "Weight और BP record करें — यह Doctor को दिखेगा।",
      "Register Patient दबाएं — मरीज सीधे Doctor की queue में चला जाएगा।",
      "Login करते समय मोबाइल नंबर अपने आप याद रहता है — बार-बार भरना नहीं पड़ता।",
    ],
  },
  {
    icon: "🩺",
    title: "Doctor का काम",
    steps: [
      "Queue में मरीज का नाम दिखेगा — उस पर क्लिक करके खोलें।",
      "गलत entry हो तो queue में नाम के आगे 🗑️ दबाकर वो token हटा सकते हैं।",
      "पहला tab 'Case History' — यहाँ Diagnosis चुनें और मरीज की पूरी history (कब बीमारी शुरू हुई, पहला इलाज, family history आदि) लिखें। '📋 Use template structure' से तैयार ढांचा भी मिल जाता है।",
      "History लिखकर '💾 Save' करें — मरीज queue में ही रहेगा।",
      "Psychological testing जरूरी हो तो '🧠 Send to Psychologist' दबाएं (history भरने के बाद ही चालू होता है)।",
      "दूसरा tab 'Prescription' — Diagnosis के हिसाब से template अपने आप दवाइयां भर देता है। '⚡ Quick Add' से सबसे ज़्यादा इस्तेमाल होने वाली दवाइयां एक tap में जुड़ती हैं।",
      "किसी diagnosis के लिए दवाइयां एक बार जमाकर '📋 Save as template' करें — अगली बार वही diagnosis चुनते ही अपने आप आ जाएंगी।",
      "तीसरा tab 'Assessment' — Psychologist की भेजी findings (HAMD-17 आदि severity scores) यहाँ दिखती हैं।",
      "चौथा tab 'Visit History' — पुरानी visits, तारीख पर क्लिक करके पूरा परचा देख सकते हैं और '🔄 Repeat' से पुरानी दवाइयां दोबारा डाल सकते हैं।",
      "Follow-up date डालें, फिर Save या Save & Print करें।",
    ],
  },
  {
    icon: "🧠",
    title: "Psychologist का काम",
    steps: [
      "Doctor द्वारा भेजे गए मरीज Psychologist queue में दिखेंगे।",
      "HAMD-17 (Hamilton Depression Rating Scale) से depression की severity मापें।",
      "PHQ-9, GAD-7, DASS-21, MDQ जैसे अन्य scales भी भर सकते हैं।",
      "Mood, History, Symptoms और Notes लिखें।",
      "'Send to Doctor' दबाएं — सारी findings Doctor को Assessment tab में दिख जाएंगी।",
    ],
  },
  {
    icon: "💊",
    title: "Pharmacy का काम",
    steps: [
      "Doctor की पर्ची Pharmacy queue में आएगी — दवाइयां दें।",
      "Dispensed mark करने के बाद वो queue से हट जाती है।",
      "Walk-in बिक्री के लिए Walk-in page इस्तेमाल करें।",
      "Brands page पर generic दवा के साथ brand और कीमत map करें।",
    ],
  },
  {
    icon: "🔍",
    title: "मरीज खोजना, बदलना, हटाना",
    steps: [
      "Patient Search page पर नाम या मोबाइल नंबर से मरीज खोजें।",
      "मरीज पर क्लिक करके उसकी पूरी visit history देखें।",
      "'✏️ Edit Patient' से नाम या मोबाइल नंबर सुधारें।",
      "'🗑️ Delete Patient' से मरीज और उसकी सारी visits हमेशा के लिए हट जाती हैं।",
    ],
  },
  {
    icon: "📋",
    title: "H1 Register",
    steps: [
      "Schedule H1 दवाइयां पर्ची में जुड़ते ही register में अपने आप दर्ज हो जाती हैं।",
      "H1 Register page से list देखें और print करें।",
      "Date filter से किसी भी अवधि की list निकालें।",
    ],
  },
  {
    icon: "🔔",
    title: "Follow-up Reminders",
    steps: [
      "Reminders page पर Today, Upcoming और Overdue follow-ups दिखते हैं।",
      "WhatsApp button से एक tap में मरीज को reminder भेजें।",
    ],
  },
  {
    icon: "🔐",
    title: "Login और Security",
    steps: [
      "Doctor — Google account से login।",
      "Receptionist / Pharmacy / Psychologist — मोबाइल नंबर + PIN + Email तीनों जरूरी।",
      "बिना सही email के login नहीं होगा — यह तीन-स्तरीय सुरक्षा है।",
      "लॉगिन पर मोबाइल नंबर अपने आप याद रहता है।",
    ],
  },
];

export default async function HelpPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="pt-4 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">सहायता</h1>
        <p className="text-gray-500 text-sm mt-1">Psychiatrist Pro उपयोग गाइड</p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{sec.icon}</span>
              <h2 className="text-base font-bold text-gray-800">{sec.title}</h2>
            </div>
            <ol className="flex flex-col gap-2">
              {sec.steps.map((step, j) => (
                <li key={j} className="flex gap-3 text-sm text-gray-600">
                  <span className="bg-violet-100 text-violet-700 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {j + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}