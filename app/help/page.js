import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const sections = [
  {
    icon: "⚙️",
    title: "पहली बार सेटअप",
    steps: [
      "Settings में जाएं — क्लिनिक का नाम, पता, फोन, डॉक्टर का नाम और qualification भरें।",
      "Receptionist, Pharmacy, Psychologist का 10 अंक का मोबाइल नंबर, PIN और email डालें — PIN अपने आप आखिरी 6 अंकों से बन जाएगी।",
      "स्टाफ बदलने पर Settings में जाकर पुराना नंबर, PIN और email हटा दें, नया डालें।",
    ],
  },
  {
    icon: "🏥",
    title: "Receptionist का काम",
    steps: [
      "Reception page पर जाएं — मरीज का नाम और फोन नंबर डालें।",
      "पुराने मरीज का नाम फोन से खोजते ही automatic आ जाएगा — दोबारा add करने की जरूरत नहीं।",
      "Weight और BP record करें — यह Doctor को दिखेगा।",
      "Register Patient करें — मरीज Doctor की queue में चला जाएगा।",
    ],
  },
  {
    icon: "🩺",
    title: "Doctor का काम",
    steps: [
      "Queue में Receptionist द्वारा add किया मरीज दिखेगा — नाम पर क्लिक करें।",
      "Chief Complaints भरें, Diagnosis डालें।",
      "⚡ Quick Add से अपनी सबसे ज़्यादा use होने वाली दवाइयां एक tap में add करें।",
      "Templates — किसी diagnosis के लिए दवाइयां एक बार save करें, अगली बार diagnosis टाइप करते ही auto-load होंगी।",
      "Follow-up date डालें और Save करें।",
      "अगर Psychological testing ज़रूरी हो तो '🧠 Send to Psychologist' button दबाएं।",
      "Print बटन से पर्ची print करें।",
    ],
  },
  {
    icon: "🧠",
    title: "Psychologist का काम",
    steps: [
      "Doctor द्वारा भेजे गए मरीज Psychologist queue में दिखेंगे।",
      "HAMD-17 (Hamilton Depression Rating Scale) से depression की severity measure करें।",
      "PHQ-9, GAD-7, DASS-21, MDQ जैसे अन्य rating scales भी भर सकते हैं।",
      "Patient History, Current Symptoms और Clinical Notes लिखें।",
      "Assessment पूरी होने पर 'Send to Doctor →' करें — Doctor को सारे results automatically दिखेंगे।",
    ],
  },
  {
    icon: "💊",
    title: "Pharmacy का काम",
    steps: [
      "Doctor की पर्ची Pharmacy queue में आएगी — दवाइयां दें।",
      "Dispensed mark करने के बाद queue से हट जाएगा।",
      "Walk-in sale के लिए Walk-in page use करें।",
      "Brands page पर generic दवा के brand और price map करें।",
    ],
  },
  {
    icon: "📋",
    title: "H1 Register",
    steps: [
      "Schedule H1 दवाइयां पर्ची में add होते ही automatically register में दर्ज हो जाती हैं।",
      "H1 Register page से list देख सकते हैं और print कर सकते हैं।",
      "Date filter से किसी भी period की list निकालें।",
    ],
  },
  {
    icon: "🔔",
    title: "Follow-up Reminders",
    steps: [
      "Reminders page से Today, Upcoming और Overdue follow-ups देखें।",
      "WhatsApp button से एक tap में मरीज को reminder message भेजें।",
    ],
  },
  {
    icon: "🔐",
    title: "Login और Security",
    steps: [
      "Doctor — Google account से login।",
      "Receptionist / Pharmacy / Psychologist — Mobile number + PIN + Email तीनों ज़रूरी।",
      "तीन factor authentication — बिना email के login नहीं होगा।",
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