import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  CheckBox,
  Linking,
  Alert,
} from "react-native";

const translations = {
  en: {
    navTitle: "CureVeda",
    navHome: "Home",
    navContact: "Contact",
    mainHeading: "INFORMED CONSENT TO TREAT",
    labelClient: "Client Name",
    labelDoctor: "Doctor Name",
    labelDate: "Date",
    mainPara1:
      "I hereby request and consent to the performance of Ayurvedic medicine treatments, acupuncture treatments (including Marmapuncture), and other procedures within the scope of the practice of Ayurvedic medicine, Chinese medicine, and acupuncture on me...",
    mainPara2:
      "I understand that methods of treatment may include, but are not limited to, Marma therapy, Snehana (Ayurvedic massage), Ayurvedic herbal medicine...",
    mainPara3:
      "I have been informed that acupuncture (including Marmapuncture) is a generally safe method of treatment, but that it may have some side effects...",
    mainPara4:
      "While I do not expect the clinical staff to be able to anticipate and explain all possible risks and complications of treatment...",
    mainPara5:
      "I understand that while this document describes the major risks of treatment, other side effects and risks may occur. The herbs and nutritional supplements (which are from plant, animal and mineral sources) that have been recommended are traditionally considered safe...",
    mainPara6:
      "I understand the clinical and administrative staff may review my patient records and lab reports, but all my records will be kept confidential and will not be released without my written consent.",
    mainPara7:
      "I understand that the CureVeda Health Counselor below is not a licensed medical practitioner or health care professional and is not trained in Western diagnosis or treatment and that I should consult my Medical Doctor for diagnosis, treatment, and advice of medical conditions...",
    mainPara8:
      "By voluntarily signing below, I show that I have read, or have had read to me, the above consent to treatment, have been told about the risks and benefits of acupuncture...",
    mainPara9:
      "I hereby consent to receive Ayurvedic consultation and treatment, including assessment of my health, dietary recommendations, dosha evaluation, and prescription of Ayurvedic medicines, provided by an authenticated and qualified Ayurvedic doctor or clinic...",
    counselorName: "CureVeda Health Counselor Name: Agustín Reyna",
    acupuncturistName: "Licensed Acupuncturist/Marmapuncturist Name: Dr. Sachin Bhor",
    labelAgree: "I have read, understood, and agree to the above consent and disclaimer.",
    submitBtn: "Submit",
    termsLink: "Terms & conditions",
    footerTitle: "CureVeda",
    footerDesc:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae aliquam voluptatem veniam, est atque cumque eum delectus sint!",
    footerContactTitle: "Contact Us",
    footerEmail: "Email: example@example.com",
    footerPhone: "Phone: +1234567890",
    footerCopyright: "© 2023 CureVeda",
  },
  hi: {
    navTitle: "आयुर हेल्थप्लिक्स",
    navHome: "होम",
    navContact: "संपर्क करें",
    mainHeading: "इलाज के लिए सूचित सहमति",
    labelClient: "रोगी का नाम",
    labelDoctor: "डॉक्टर का नाम",
    labelDate: "तारीख",
    mainPara1:
      "मैं यहां आयुर्वेद चिकित्सा, एक्यूपंक्चर (जिसमें मर्माकोष्टिक भी शामिल है) और अन्य प्रक्रियाओं के लिए अनुमति और सहमति देता/देती हूं, जिनका अभ्यास आयुर्वेद, चीनी चिकित्सा और एक्यूपंक्चर के दायरे में किया जाएगा...",
    mainPara2:
      "मैं समझता/समझती हूं कि उपचार की विधियों में मर्मा थेरेपी, स्नेहन (आयुर्वेदिक मालिश), आयुर्वेदिक हर्बल चिकित्सा...",
    mainPara3:
      "मुझे सूचित किया गया है कि एक्यूपंक्चर (मर्माकोष्टिक सहित) सामान्यतः एक सुरक्षित उपचार है, लेकिन इसमें कुछ दुष्प्रभाव हो सकते हैं...",
    mainPara4:
      "हालांकि मैं उम्मीद नहीं करता/करती कि क्लिनिक स्टाफ सभी संभावित जोखिमों और जटिलताओं की पूर्व सूचना/स्पष्टीकरण दें, मैं क्लिनिक स्टाफ के विवेक पर निर्भर रहना चाहता/चाहती हूं...",
    mainPara5:
      "मैं समझता/समझती हूं कि जबकि यह दस्तावेज उपचार के मुख्य जोखिमों का वर्णन करता है, अन्य दुष्प्रभाव और जोखिम भी हो सकते हैं...",
    mainPara6:
      "मैं समझता/समझती हूं कि क्लिनिकल और प्रशासनिक स्टाफ मेरे मरीज रिकॉर्ड और लैब रिपोर्ट की समीक्षा कर सकते हैं, लेकिन मेरी सभी फाइलें गोपनीय रहेंगी और बिना मेरी लिखित स्वीकृति के जारी नहीं की जाएंगी।",
    mainPara7:
      "मैं समझता/समझती हूं कि नीचे उल्लिखित आयुर्वेद सलाहकार कोई लाइसेंसी मेडिकल प्रैक्टिशनर या स्वास्थ्य पेशेवर नहीं हैं...",
    mainPara8:
      "नीचे स्वेच्छा से हस्ताक्षर करके, मैं बताता/बताती हूं कि मैंने ऊपर बताए गए उपचार के लिए सहमति को पढ़ा है या मेरे लिए पढ़ा गया है...",
    mainPara9:
      "मैं यहां आयुर्वेद परामर्श और उपचार जैसे मेरे स्वास्थ्य का आकलन, आहार संबंधी सिफारिशें, दोष मूल्यांकन, और आयुर्वेदिक दवाओं का निर्देश प्राप्त करने के लिए सहमति देता/देती हूं...",
    counselorName: "आयुर्वेद हेल्थ काउंसलर नाम: Agustín Reyna",
    acupuncturistName: "लाइसेंस प्राप्त एक्यूपंक्चरिस्ट/मर्मापंक्चरिस्ट नाम: Dr. Sachin Bhor",
    labelAgree: "मैंने उपरोक्त सहमति और अस्वीकरण पढ़ लिया है, समझ लिया है और उससे सहमत हूं।",
    submitBtn: "सबमिट करें",
    termsLink: "नियम एवं शर्तें",
    footerTitle: "आयुर हेल्थप्लिक्स",
    footerDesc:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae aliquam voluptatem veniam, est atque cumque eum delectus sint!",
    footerContactTitle: "संपर्क करें",
    footerEmail: "ईमेल: example@example.com",
    footerPhone: "फोन: +1234567890",
    footerCopyright: "© 2023 आयुर हेल्थप्लिक्स",
  },
};

export default function CureVeda() {
  const [language, setLanguage] = useState("en");
  const [clientName, setClientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [consentDate, setConsentDate] = useState("");
  const [agree, setAgree] = useState(false);

  const t = translations[language];

  const onSubmit = () => {
    if (!agree) {
      Alert.alert(
        language === "en"
          ? "Please agree to the consent and disclaimer."
          : "कृपया सहमति और अस्वीकरण से सहमत हों।"
      );
      return;
    }
    if (!clientName || !doctorName || !consentDate) {
      Alert.alert(
        language === "en"
          ? "Please fill all required fields."
          : "कृपया सभी आवश्यक फ़ील्ड भरें।"
      );
      return;
    }
    Alert.alert(
      language === "en"
        ? "Form submitted successfully!"
        : "फॉर्म सफलतापूर्वक सबमिट किया गया!"
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <Text style={styles.navBrand}>{t.navTitle}</Text>
        <View style={styles.navLinks}>
          <Text style={styles.navLink}>{t.navHome}</Text>
          <Text style={styles.navLink}>{t.navContact}</Text>
        </View>
      </View>

      {/* Language Buttons */}
      <View style={styles.langBtns}>
        <TouchableOpacity
          style={[
            styles.langBtn,
            language === "en" && styles.langBtnActive,
          ]}
          onPress={() => setLanguage("en")}
        >
          <Text
            style={[
              styles.langBtnText,
              language === "en" && styles.langBtnTextActive,
            ]}
          >
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.langBtn,
            language === "hi" && styles.langBtnActive,
          ]}
          onPress={() => setLanguage("hi")}
        >
          <Text
            style={[
              styles.langBtnText,
              language === "hi" && styles.langBtnTextActive,
            ]}
          >
            हिन्दी
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.heading}>{t.mainHeading}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.labelClient}</Text>
          <TextInput
            style={styles.input}
            value={clientName}
            onChangeText={setClientName}
            placeholder={t.labelClient}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.labelDoctor}</Text>
          <TextInput
            style={styles.input}
            value={doctorName}
            onChangeText={setDoctorName}
            placeholder={t.labelDoctor}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.labelDate}</Text>
          <TextInput
            style={styles.input}
            value={consentDate}
            onChangeText={setConsentDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <Text style={styles.paragraph}>{t.mainPara1}</Text>
        <Text style={styles.paragraph}>{t.mainPara2}</Text>
        <Text style={styles.paragraph}>{t.mainPara3}</Text>
        <Text style={styles.paragraph}>{t.mainPara4}</Text>
        <Text style={styles.paragraph}>{t.mainPara5}</Text>
        <Text style={styles.paragraph}>{t.mainPara6}</Text>
        <Text style={styles.paragraph}>{t.mainPara7}</Text>
        <Text style={[styles.paragraph, styles.strongText]}>
          {t.mainPara8.replace(/<strong>|<\/strong>/g, "")}
        </Text>
        <Text style={styles.paragraph}>{t.mainPara9}</Text>

        <Text style={styles.subHeading}>{t.counselorName}</Text>
        <Text style={styles.subHeading}>{t.acupuncturistName}</Text>

        <View style={styles.checkboxContainer}>
          <CheckBox value={agree} onValueChange={setAgree} />
          <Text style={styles.checkboxLabel}>{t.labelAgree}</Text>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>{t.submitBtn}</Text>
        </TouchableOpacity>

        <Text
          style={styles.termsLink}
          onPress={() => {
            // Replace with your Terms & Conditions URL or screen navigation
            Alert.alert("Terms & Conditions link pressed");
          }}
        >
          {t.termsLink}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.footerColLarge}>
            <Text style={styles.footerTitle}>{t.footerTitle}</Text>
            <Text style={styles.footerDesc}>{t.footerDesc}</Text>
          </View>
          <View style={styles.footerColSmall}>
            <Text style={styles.footerTitle}>{t.footerContactTitle}</Text>
            <Text style={styles.footerContact}>{t.footerEmail}</Text>
            <Text style={styles.footerContact}>{t.footerPhone}</Text>
          </View>
        </View>
        <Text style={styles.footerCopyright}>{t.footerCopyright}</Text>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: { flex: 1, backgroundColor: "#fff" },
  navbar: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navBrand: { fontSize: 20, fontWeight: "bold" },
  navLinks: { flexDirection: "row" },
  navLink: {
    marginLeft: 20,
    fontSize: 16,
    color: "#0d6efd",
    fontWeight: "600",
  },
  langBtns: {
    flexDirection: "row",
    marginVertical: 15,
    marginLeft: 20,
  },
  langBtn: {
    borderWidth: 1,
    borderColor: "#198754",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  langBtnActive: { backgroundColor: "#198754" },
  langBtnText: {
    color: "#198754",
    fontWeight: "500",
  },
  langBtnTextActive: { color: "#fff" },
  formContainer: {
    maxWidth: 800,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  paragraph: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  strongText: { fontWeight: "700" },
  subHeading: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 15,
    flexShrink: 1,
  },
  submitBtn: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  termsLink: {
    color: "#0d6efd",
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  footer: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  footerColLarge: {
    flexBasis: "60%",
    marginBottom: 15,
  },
  footerColSmall: {
    flexBasis: "35%",
    marginBottom: 15,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  footerDesc: {
    fontSize: 14,
    textAlign: "justify",
    lineHeight: 20,
  },
  footerContact: {
    fontSize: 14,
    marginBottom: 5,
  },
  footerCopyright: {
    fontSize: 13,
    textAlign: "center",
    color: "#555",
  },
};



// import React, { useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   CheckBox,
//   Linking,
//   Platform,
// } from "react-native";

// const translations = {
//   en: {
//     navTitle: "CureVeda",
//     navHome: "Home",
//     navContact: "Contact",
//     mainHeading: "INFORMED CONSENT TO TREAT",
//     labelClient: "Client Name",
//     labelDoctor: "Doctor Name",
//     labelDate: "Date",
//     mainPara1:
//       "I hereby request and consent to the performance of Ayurvedic medicine treatments, acupuncture treatments (including Marmapuncture), and other procedures within the scope of the practice of Ayurvedic medicine, Chinese medicine, and acupuncture on me...",
//     mainPara2:
//       "I understand that methods of treatment may include, but are not limited to, Marma therapy, Snehana (Ayurvedic massage), Ayurvedic herbal medicine...",
//     mainPara3:
//       "I have been informed that acupuncture (including Marmapuncture) is a generally safe method of treatment, but that it may have some side effects...",
//     mainPara4:
//       "While I do not expect the clinical staff to be able to anticipate and explain all possible risks and complications of treatment...",
//     mainPara5:
//       "I understand that while this document describes the major risks of treatment, other side effects and risks may occur. The herbs and nutritional supplements (which are from plant, animal and mineral sources) that have been recommended are traditionally considered safe...",
//     mainPara6:
//       "I understand the clinical and administrative staff may review my patient records and lab reports, but all my records will be kept confidential and will not be released without my written consent.",
//     mainPara7:
//       "I understand that the CureVeda Health Counselor below is not a licensed medical practitioner or health care professional and is not trained in Western diagnosis or treatment and that I should consult my Medical Doctor for diagnosis, treatment, and advice of medical conditions...",
//     mainPara8:
//       "By voluntarily signing below, I show that I have read, or have had read to me, the above consent to treatment, have been told about the risks and benefits of acupuncture...",
//     mainPara9:
//       "I hereby consent to receive Ayurvedic consultation and treatment, including assessment of my health, dietary recommendations, dosha evaluation, and prescription of Ayurvedic medicines, provided by an authenticated and qualified Ayurvedic doctor or clinic...",
//     counselorName: "CureVeda Health Counselor Name: Agustín Reyna",
//     acupuncturistName: "Licensed Acupuncturist/Marmapuncturist Name: Dr. Sachin Bhor",
//     labelAgree: "I have read, understood, and agree to the above consent and disclaimer.",
//     submitBtn: "Submit",
//     termsLink: "Terms & conditions",
//     footerTitle: "CureVeda",
//     footerDesc:
//       "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae aliquam voluptatem veniam, est atque cumque eum delectus sint!",
//     footerContactTitle: "Contact Us",
//     footerEmail: "Email: example@example.com",
//     footerPhone: "Phone: +1234567890",
//     footerCopyright: "© 2023 CureVeda",
//   },
//   hi: {
//     navTitle: "आयुर हेल्थप्लिक्स",
//     navHome: "होम",
//     navContact: "संपर्क करें",
//     mainHeading: "इलाज के लिए सूचित सहमति",
//     labelClient: "रोगी का नाम",
//     labelDoctor: "डॉक्टर का नाम",
//     labelDate: "तारीख",
//     mainPara1:
//       "मैं यहां आयुर्वेद चिकित्सा, एक्यूपंक्चर (जिसमें मर्माकोष्टिक भी शामिल है) और अन्य प्रक्रियाओं के लिए अनुमति और सहमति देता/देती हूं, जिनका अभ्यास आयुर्वेद, चीनी चिकित्सा और एक्यूपंक्चर के दायरे में किया जाएगा...",
//     mainPara2:
//       "मैं समझता/समझती हूं कि उपचार की विधियों में मर्मा थेरेपी, स्नेहन (आयुर्वेदिक मालिश), आयुर्वेदिक हर्बल चिकित्सा, पोषण संबंधी परामर्श, जीवनशैली सुझाव, ध्यान, योग, प्राणायाम, एक्यूपंक्चर (मर्माकोष्टिक सहित), चीनी हर्बल दवा, मोक्सीबस्टन, कपिंग, विद्युत उत्तेजना, तुई-ना (चीनी मालिश) आदि शामिल हो सकते हैं...",
//     mainPara3:
//       "मुझे सूचित किया गया है कि एक्यूपंक्चर (मर्माकोष्टिक सहित) सामान्यतः एक सुरक्षित उपचार है, लेकिन इसमें कुछ दुष्प्रभाव हो सकते हैं...",
//     mainPara4:
//       "हालांकि मैं उम्मीद नहीं करता/करती कि क्लिनिक स्टाफ सभी संभावित जोखिमों और जटिलताओं की पूर्व सूचना/स्पष्टीकरण दें, मैं क्लिनिक स्टाफ के विवेक पर निर्भर रहना चाहता/चाहती हूं...",
//     mainPara5:
//       "मैं समझता/समझती हूं कि जबकि यह दस्तावेज उपचार के मुख्य जोखिमों का वर्णन करता है, अन्य दुष्प्रभाव और जोखिम भी हो सकते हैं...",
//     mainPara6:
//       "मैं समझता/समझती हूं कि क्लिनिकल और प्रशासनिक स्टाफ मेरे मरीज रिकॉर्ड और लैब रिपोर्ट की समीक्षा कर सकते हैं, लेकिन मेरी सभी फाइलें गोपनीय रहेंगी और बिना मेरी लिखित स्वीकृति के जारी नहीं की जाएंगी।",
//     mainPara7:
//       "मैं समझता/समझती हूं कि नीचे उल्लिखित आयुर्वेद सलाहकार कोई लाइसेंसी मेडिकल प्रैक्टिशनर या स्वास्थ्य पेशेवर नहीं हैं...",
//     mainPara8:
//       "नीचे स्वेच्छा से हस्ताक्षर करके, मैं बताता/बताती हूं कि मैंने ऊपर बताए गए उपचार के लिए सहमति को पढ़ा है या मेरे लिए पढ़ा गया है...",
//     mainPara9:
//       "मैं यहां आयुर्वेद परामर्श और उपचार जैसे मेरे स्वास्थ्य का आकलन, आहार संबंधी सिफारिशें, दोष मूल्यांकन, और आयुर्वेदिक दवाओं का निर्देश प्राप्त करने के लिए सहमति देता/देती हूं...",
//     counselorName: "आयुर्वेद हेल्थ काउंसलर नाम: Agustín Reyna",
//     acupuncturistName: "लाइसेंस प्राप्त एक्यूपंक्चरिस्ट/मर्मापंक्चरिस्ट नाम: Dr. Sachin Bhor",
//     labelAgree: "मैंने उपरोक्त सहमति और अस्वीकरण पढ़ लिया है, समझ लिया है और उससे सहमत हूं।",
//     submitBtn: "सबमिट करें",
//     termsLink: "नियम एवं शर्तें",
//     footerTitle: "आयुर हेल्थप्लिक्स",
//     footerDesc:
//       "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste atque ea quis molestias. Fugiat pariatur maxime quis culpa corporis vitae repudiandae aliquam voluptatem veniam, est atque cumque eum delectus sint!",
//     footerContactTitle: "संपर्क करें",
//     footerEmail: "ईमेल: example@example.com",
//     footerPhone: "फोन: +1234567890",
//     footerCopyright: "© 2023 आयुर हेल्थप्लिक्स",
//   },
// };

// export default function ConsentForm() {
//   const [language, setLanguage] = useState("en");
//   const [clientName, setClientName] = useState("");
//   const [doctorName, setDoctorName] = useState("");
//   const [consentDate, setConsentDate] = useState("");
//   const [agreeChecked, setAgreeChecked] = useState(false);

//   const t = translations[language];

//   const openTerms = () => {
//     // This should open a terms & conditions page or external link
//     // For demo, just alert or do nothing
//     // You can replace with Linking.openURL('https://yourtermsurl.com') if you have one
//     alert("Terms & Conditions link clicked");
//   };

//   const onSubmit = () => {
//     if (!agreeChecked) {
//       alert(
//         language === "en"
//           ? "Please agree to the consent and disclaimer before submitting."
//           : "कृपया सबमिट करने से पहले सहमति और अस्वीकरण से सहमत हों।"
//       );
//       return;
//     }
//     if (!clientName || !doctorName || !consentDate) {
//       alert(
//         language === "en"
//           ? "Please fill all fields before submitting."
//           : "कृपया सबमिट करने से पहले सभी फ़ील्ड भरें।"
//       );
//       return;
//     }
//     alert(
//       language === "en"
//         ? "Form submitted successfully!"
//         : "फॉर्म सफलतापूर्वक सबमिट किया गया!"
//     );
//     // Implement actual submit logic here
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Navigation Bar */}
//       <View style={styles.navbar}>
//         <Text style={styles.navbarBrand}>{t.navTitle}</Text>
//         <View style={styles.navLinks}>
//           <Text style={[styles.navLink, styles.active]}>{t.navHome}</Text>
//           <Text style={styles.navLink}>{t.navContact}</Text>
//         </View>
//       </View>

//       {/* Language Buttons */}
//       <View style={styles.langBtns}>
//         <TouchableOpacity
//           style={[
//             styles.langBtn,
//             language === "en" && styles.langBtnActive,
//           ]}
//           onPress={() => setLanguage("en")}
//         >
//           <Text
//             style={[
//               styles.langBtnText,
//               language === "en" && styles.langBtnTextActive,
//             ]}
//           >
//             English
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.langBtn,
//             language === "hi" && styles.langBtnActive,
//           ]}
//           onPress={() => setLanguage("hi")}
//         >
//           <Text
//             style={[
//               styles.langBtnText,
//               language === "hi" && styles.langBtnTextActive,
//             ]}
//           >
//             हिन्दी
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Main Content Form */}
//       <View style={styles.formContainer}>
//         <Text style={styles.mainHeading}>{t.mainHeading}</Text>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>{t.labelClient}</Text>
//           <TextInput
//             style={styles.input}
//             value={clientName}
//             onChangeText={setClientName}
//             placeholder={t.labelClient}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>{t.labelDoctor}</Text>
//           <TextInput
//             style={styles.input}
//             value={doctorName}
//             onChangeText={setDoctorName}
//             placeholder={t.labelDoctor}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>{t.labelDate}</Text>
//           <TextInput
//             style={styles.input}
//             value={consentDate}
//             onChangeText={setConsentDate}
//             placeholder={language === "en" ? "YYYY-MM-DD" : "वर्ष-महीना-दिन"}
//             keyboardType={"numeric"}
//           />
//         </View>

//         <Text style={styles.paragraph}>{t.mainPara1}</Text>
//         <Text style={styles.paragraph}>{t.mainPara2}</Text>
//         <Text style={styles.paragraph}>{t.mainPara3}</Text>
//         <Text style={styles.paragraph}>{t.mainPara4}</Text>
//         <Text style={styles.paragraph}>{t.mainPara5}</Text>
//         <Text style={styles.paragraph}>{t.mainPara6}</Text>
//         <Text style={styles.paragraph}>{t.mainPara7}</Text>
//         <Text style={[styles.paragraph, styles.strongText]}>{t.mainPara8}</Text>
//         <Text style={styles.paragraph}>{t.mainPara9}</Text>

//         <Text style={styles.h6}>{t.counselorName}</Text>
//         <Text style={styles.h6}>{t.acupuncturistName}</Text>

//         <View style={styles.checkboxContainer}>
//           <CheckBox
//             value={agreeChecked}
//             onValueChange={setAgreeChecked}
//             boxType="square"
//             tintColors={{ true: "#198754", false: "#555" }}
//             style={styles.checkbox}
//           />
//           <Text style={styles.checkboxLabel}>{t.labelAgree}</Text>
//         </View>

//         <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
//           <Text style={styles.submitBtnText}>{t.submitBtn}</Text>
//         </TouchableOpacity>

//         <Text
//           style={styles.termsLink}
//           onPress={openTerms}
//           accessibilityRole="link"
//         >
//           {t.termsLink}
//         </Text>
//       </View>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <View style={styles.footerRow}>
//           <View style={styles.footerColLarge}>
//             <Text style={styles.footerTitle}>{t.footerTitle}</Text>
//             <Text style={styles.footerDesc}>{t.footerDesc}</Text>
//           </View>
//           <View style={styles.footerColSmall}>
//             <Text style={styles.footerTitle}>{t.footerContactTitle}</Text>
//             <Text style={styles.footerContact}>{t.footerEmail}</Text>
//             <Text style={styles.footerContact}>{t.footerPhone}</Text>
//           </View>
//         </View>
//         <View style={styles.footerCopyrightContainer}>
//           <Text style={styles.footerCopyright}>{t.footerCopyright}</Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "#fff",
//     flex: 1,
//   },
//   navbar: {
//     backgroundColor: "#f8f9fa",
//     paddingVertical: 15,
//     paddingHorizontal: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomColor: "#ddd",
//     borderBottomWidth: 1,
//   },
//   navbarBrand: {
//     fontWeight: "bold",
//     fontSize: 20,
//   },
//   navLinks: {
//     flexDirection: "row",
//   },
//   navLink: {
//     marginLeft: 20,
//     fontSize: 16,
//     color: "#0d6efd",
//   },
//   active: {
//     fontWeight: "bold",
//     textDecorationLine: "underline",
//   },
//   langBtns: {
//     flexDirection: "row",
//     marginVertical: 15,
//     marginLeft: 20,
//   },
//   langBtn: {
//     borderWidth: 1,
//     borderColor: "#198754",
//     borderRadius: 20,
//     paddingVertical: 6,
//     paddingHorizontal: 15,
//     marginRight: 10,
//   },
//   langBtnActive: {
//     backgroundColor: "#198754",
//   },
//   langBtnText: {
//     color: "#198754",
//     fontWeight: "500",
//   },
//   langBtnTextActive: {
//     color: "#fff",
//   },
//   formContainer: {
//     maxWidth: 800,
//     alignSelf: "center",
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   mainHeading: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 15,
//   },
//   inputGroup: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 6,
//     fontWeight: "600",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ced4da",
//     borderRadius: 5,
//     paddingVertical: Platform.OS === "ios" ? 12 : 8,
//     paddingHorizontal: 10,
//     fontSize: 16,
//   },
//   paragraph: {
//     fontSize: 15,
//     marginBottom: 12,
//     lineHeight: 22,
//   },
//   strongText: {
//     fontWeight: "700",
//   },
//   h6: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   checkbox: {
//     marginRight: 10,
//   },
//   checkboxLabel: {
//     flex: 1,
//     fontSize: 15,
//   },
//   submitBtn: {
//     backgroundColor: "#198754",
//     paddingVertical: 12,
//     borderRadius: 20,
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   submitBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   termsLink: {
//     color: "#0d6efd",
//     textAlign: "center",
//     fontSize: 16,
//     textDecorationLine: "underline",
//   },
//   footer: {
//     backgroundColor: "#f8f9fa",
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//   },
//   footerRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   footerColLarge: {
//     flexBasis: "60%",
//     marginBottom: 15,
//   },
//   footerColSmall: {
//     flexBasis: "35%",
//     marginBottom: 15,
//   },
//   footerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 10,
//   },
//   footerDesc: {
//     fontSize: 14,
//     textAlign: "justify",
//     lineHeight: 20,
//   },
//   footerContact: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   footerCopyrightContainer: {
//     borderTopColor: "rgba(0,0,0,0.2)",
//     borderTopWidth: 1,
//     paddingTop: 10,
//   },
//   footerCopyright: {
//     fontSize: 13,
//     textAlign: "center",
//     color: "#555",
//   },
// });