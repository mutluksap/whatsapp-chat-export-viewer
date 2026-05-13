export type Locale = "tr" | "en";

export const LOCALES: Locale[] = ["tr", "en"];

export type Dict = {
  appTitle: string;
  appDescription: string;
  privacyNote: string;
  modeText: string;
  modeZip: string;
  dropText: string;
  dropZip: string;
  processing: string;
  orClickToSelect: string;
  howToExport: string;
  howStep1: string;
  howStep2: string;
  howStep3: string;
  howStep4: string;
  chat: string;
  loadNewFile: string;
  newFile: string;
  searchChats: string;
  pickMe: string;
  noParticipants: string;
  pickMeHint: string;
  noMessages: string;
  footerHint: string;
  participantCount: string;
  mediaNotIncluded: string;
  errorWrongExtTxt: string;
  errorWrongExtZip: string;
  errorNoMessages: string;
  errorGeneric: string;
  errorNoTxtInZip: string;
  errorCantReadChat: string;
  today: string;
  yesterday: string;
  months: string[];
  weekdays: string[];
  photoPreview: string;
  videoPreview: string;
  audioPreview: string;
  stickerPreview: string;
  documentPreview: string;
  close: string;
  previous: string;
  next: string;
  language: string;
  menu: string;
  defaultChatTitle: string;
  gallery: string;
  openGallery: string;
  noMedia: string;
  messageDeleted: string;
  brand: string;
  navHome: string;
  navChats: string;
  navPrivacy: string;
  navAbout: string;
  navContact: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroCta: string;
  homeFeature1Title: string;
  homeFeature1Body: string;
  homeFeature2Title: string;
  homeFeature2Body: string;
  homeFeature3Title: string;
  homeFeature3Body: string;
  homeFeaturesHeading: string;
  homeImportSectionHeading: string;
  homeImportSectionLead: string;
  privacyTitle: string;
  privacyLead: string;
  privacySection1Title: string;
  privacySection1Body: string;
  privacySection2Title: string;
  privacySection2Body: string;
  privacySection3Title: string;
  privacySection3Body: string;
  aboutTitle: string;
  aboutLead: string;
  aboutBody1: string;
  aboutBody2: string;
  aboutTechHeading: string;
  contactTitle: string;
  contactLead: string;
  contactEmailLabel: string;
  contactGithubLabel: string;
  contactBody: string;
  footerCopyright: string;
  footerTagline: string;
  openMenu: string;
  closeMenu: string;
};

const tr: Dict = {
  appTitle: "WhatsApp Sohbet Görüntüleyici",
  appDescription:
    "WhatsApp'tan dışa aktardığınız sohbeti sürükleyip bırakın, WhatsApp Web görünümünde gösterelim.",
  privacyNote:
    "Dosyalarınız sunucuya yüklenmez — tarayıcınızda işlenir.",
  modeText: "Medyasız (.txt)",
  modeZip: "Medyalı (.zip)",
  dropText: ".txt dosyasını buraya bırak",
  dropZip: ".zip dosyasını buraya bırak",
  processing: "İşleniyor…",
  orClickToSelect: "veya tıklayıp seç",
  howToExport: "Dışa aktarımı nasıl alırım?",
  howStep1: "WhatsApp'ta dışa aktarmak istediğin sohbeti aç.",
  howStep2:
    "Sohbet ismine veya üç noktaya dokun → Daha fazla → Sohbeti dışa aktar.",
  howStep3:
    "Medya Olmadan → .txt dosyası, Medyayı dahil et → .zip dosyası oluşturulur.",
  howStep4: "O dosyayı bu kutuya bırak.",
  chat: "Sohbet",
  loadNewFile: "Yeni dosya yükle",
  newFile: "Yeni dosya",
  searchChats: "Sohbetlerde ara",
  pickMe: "Beni seç",
  noParticipants: "Kimse tespit edilemedi",
  pickMeHint:
    "Seçtiğin kişinin mesajları sağda yeşil baloncukta gösterilir.",
  noMessages: "Bu sohbette mesaj bulunamadı.",
  footerHint:
    "Bu bir önizlemedir — mesaj göndermek için WhatsApp uygulamasını kullanın.",
  participantCount: "{n} katılımcı",
  mediaNotIncluded: "Medya bu dışa aktarımda yok",
  errorWrongExtTxt:
    "Medyasız modu için .txt dosyası bekleniyor. Medyalı için ZIP sekmesini seçin.",
  errorWrongExtZip:
    "Medyalı modu için .zip dosyası bekleniyor. Medyasız için TXT sekmesini seçin.",
  errorNoMessages:
    "Dosyada okunabilir mesaj bulunamadı. Geçerli bir WhatsApp dışa aktarımı mı?",
  errorGeneric: "Dosya işlenirken bir hata oluştu.",
  errorNoTxtInZip: "ZIP içinde sohbet .txt dosyası bulunamadı.",
  errorCantReadChat: "Sohbet dosyası okunamadı.",
  today: "Bugün",
  yesterday: "Dün",
  months: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  weekdays: [
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
  ],
  photoPreview: "📷 Fotoğraf",
  videoPreview: "🎥 Video",
  audioPreview: "🎤 Sesli mesaj",
  stickerPreview: "🏷️ Çıkartma",
  documentPreview: "📎 Belge",
  close: "Kapat",
  previous: "Önceki",
  next: "Sonraki",
  language: "Dil",
  menu: "Menü",
  defaultChatTitle: "Sohbet",
  gallery: "Galeri",
  openGallery: "Galeriyi aç",
  noMedia: "Bu sohbette medya yok",
  messageDeleted: "Bu mesaj silindi.",
  brand: "WA Görüntüleyici",
  navHome: "Anasayfa",
  navChats: "Sohbetler",
  navPrivacy: "Gizlilik",
  navAbout: "Hakkında",
  navContact: "İletişim",
  homeHeroTitle: "WhatsApp sohbetlerinizi göz alıcı şekilde inceleyin",
  homeHeroSubtitle:
    "Dışa aktardığınız .txt veya .zip dosyalarınızı sürükleyip bırakın; sohbeti tıpkı WhatsApp Web'deki gibi göz atılabilir bir arayüzde görün. Dosyalarınız hiçbir yere yüklenmez.",
  homeHeroCta: "Hemen başla",
  homeFeaturesHeading: "Neden bu görüntüleyici?",
  homeFeature1Title: "Gizli ve yerel",
  homeFeature1Body:
    "Tüm işleme tarayıcınızda olur. Dosyalarınız sunucuya yüklenmez, ağa gitmez.",
  homeFeature2Title: "Medyalı destek",
  homeFeature2Body:
    "Fotoğraf, video, sticker ve sesli mesajlar dahil .zip dışa aktarımları açabilir, galeride toplu görüntüleyebilirsiniz.",
  homeFeature3Title: "WhatsApp tarzı arayüz",
  homeFeature3Body:
    "Sohbetler, mavi okundu tikleri ve baloncuk arayüzü ile tam WhatsApp Web hissi.",
  homeImportSectionHeading: "Dosyanızı içe aktarın",
  homeImportSectionLead:
    "Dışa aktardığınız sohbeti aşağıya bırakın ve hemen görüntülemeye başlayın.",
  privacyTitle: "Gizlilik",
  privacyLead:
    "Veri minimizasyonu bu projenin temel değeri. Aşağıda nelerin nerede olduğunu görebilirsiniz.",
  privacySection1Title: "Dosyalarınız tarayıcınızda kalır",
  privacySection1Body:
    "Yüklediğiniz .txt veya .zip dosyaları herhangi bir sunucuya gönderilmez. Tüm ayrıştırma ve görüntüleme tamamen tarayıcınızda yapılır.",
  privacySection2Title: "Çerez yok, izleme yok",
  privacySection2Body:
    "Üçüncü taraf analitik araçları, reklam ağları veya kullanıcı izleme çerezleri kullanmıyoruz. Sadece tema ve dil tercihiniz yerel olarak saklanır.",
  privacySection3Title: "Üçüncü taraf içerikler",
  privacySection3Body:
    "FontAwesome ikonları için bir CDN bağlantısı kullanılır. Sayfayı yalnızca ikon dosyalarını yüklemek için bu CDN'e istek atar; başka veri paylaşılmaz.",
  aboutTitle: "Hakkında",
  aboutLead:
    "WhatsApp Sohbet Görüntüleyici, dışa aktarılmış sohbetleri tanıdık bir görsel arayüzde sunmak için açık kaynaklı bir araçtır.",
  aboutBody1:
    "Aile, arkadaş veya iş sohbetlerinizi yedekledikten sonra düz metin dosyasında okumanın ne kadar zahmetli olduğunu bildiğimiz için bu görüntüleyiciyi yaptık. Tarayıcıda, hızlı, gizli ve estetik.",
  aboutBody2:
    "Proje hala geliştirilmektedir; geri bildirimleriniz, fikirleriniz veya katkılarınız değerlidir.",
  aboutTechHeading: "Kullanılan teknolojiler",
  contactTitle: "İletişim",
  contactLead:
    "Sorular, geri bildirim veya katkı için bizimle iletişime geçin.",
  contactEmailLabel: "E-posta",
  contactGithubLabel: "GitHub",
  contactBody:
    "Yanıt süremiz genelde birkaç iş günüdür. Hata bildirimleri için GitHub Issues tercih edilir.",
  footerCopyright: "© 2026 WA Görüntüleyici",
  footerTagline:
    "Tarayıcınızda çalışan, gizliliğe saygılı WhatsApp sohbet görüntüleyici.",
  openMenu: "Menüyü aç",
  closeMenu: "Menüyü kapat",
};

const en: Dict = {
  appTitle: "WhatsApp Chat Export Viewer",
  appDescription:
    "Drop a WhatsApp chat export to preview it in a WhatsApp Web–style view.",
  privacyNote: "Your files are processed in the browser — nothing is uploaded.",
  modeText: "Without media (.txt)",
  modeZip: "With media (.zip)",
  dropText: "Drop a .txt file here",
  dropZip: "Drop a .zip file here",
  processing: "Processing…",
  orClickToSelect: "or click to browse",
  howToExport: "How do I export a chat?",
  howStep1: "In WhatsApp, open the chat you want to export.",
  howStep2:
    "Tap the chat name or the three-dot menu → More → Export chat.",
  howStep3:
    "Without Media creates a .txt file. Include Media creates a .zip file.",
  howStep4: "Drop that file onto this area.",
  chat: "Chat",
  loadNewFile: "Load new file",
  newFile: "New file",
  searchChats: "Search chats",
  pickMe: "Pick «me»",
  noParticipants: "No participants detected",
  pickMeHint: "Messages from the selected person appear as green bubbles on the right.",
  noMessages: "No messages found in this chat.",
  footerHint:
    "This is a preview — use WhatsApp to send messages.",
  participantCount: "{n} participants",
  mediaNotIncluded: "Media not included in this export",
  errorWrongExtTxt:
    "Without-media mode expects a .txt file. Switch to the ZIP tab for media.",
  errorWrongExtZip:
    "With-media mode expects a .zip file. Switch to the TXT tab for plain text.",
  errorNoMessages:
    "No readable messages found in the file. Is this a valid WhatsApp export?",
  errorGeneric: "Something went wrong while processing the file.",
  errorNoTxtInZip: "No chat .txt file found inside the ZIP.",
  errorCantReadChat: "Could not read the chat file.",
  today: "Today",
  yesterday: "Yesterday",
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  weekdays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  photoPreview: "📷 Photo",
  videoPreview: "🎥 Video",
  audioPreview: "🎤 Voice message",
  stickerPreview: "🏷️ Sticker",
  documentPreview: "📎 Document",
  close: "Close",
  previous: "Previous",
  next: "Next",
  language: "Language",
  menu: "Menu",
  defaultChatTitle: "Chat",
  gallery: "Gallery",
  openGallery: "Open gallery",
  noMedia: "No media in this chat",
  messageDeleted: "This message was deleted.",
  brand: "WA Viewer",
  navHome: "Home",
  navChats: "Chats",
  navPrivacy: "Privacy",
  navAbout: "About",
  navContact: "Contact",
  homeHeroTitle: "Browse your WhatsApp chats in style",
  homeHeroSubtitle:
    "Drag and drop your exported .txt or .zip and view the conversation in a familiar WhatsApp Web–like interface. Your files never leave your browser.",
  homeHeroCta: "Get started",
  homeFeaturesHeading: "Why this viewer?",
  homeFeature1Title: "Private and local",
  homeFeature1Body:
    "All processing happens in your browser. Your files are never uploaded, never sent over the network.",
  homeFeature2Title: "Media-aware",
  homeFeature2Body:
    "Open .zip exports complete with photos, videos, stickers and voice notes — and browse them all in a built-in gallery.",
  homeFeature3Title: "WhatsApp-style UI",
  homeFeature3Body:
    "Authentic chat bubbles, blue read ticks and a familiar layout — it feels exactly like WhatsApp Web.",
  homeImportSectionHeading: "Import your chat",
  homeImportSectionLead:
    "Drop your exported chat below and start exploring it instantly.",
  privacyTitle: "Privacy",
  privacyLead:
    "Data minimization is a core value of this project. Here is exactly what stays where.",
  privacySection1Title: "Your files stay in your browser",
  privacySection1Body:
    "Uploaded .txt or .zip files are never sent to any server. All parsing and rendering happen entirely in your browser.",
  privacySection2Title: "No cookies, no tracking",
  privacySection2Body:
    "We do not use third-party analytics, ad networks or tracking cookies. Only your theme and language preferences are stored locally.",
  privacySection3Title: "Third-party assets",
  privacySection3Body:
    "FontAwesome icons are loaded from a public CDN. The page only requests icon files from that CDN; no other data is shared.",
  aboutTitle: "About",
  aboutLead:
    "WhatsApp Chat Viewer is an open-source tool that displays exported chats in a familiar visual interface.",
  aboutBody1:
    "Reading a backup of your conversations as a plain text file is tedious. We built this viewer so reviewing your family, friend or work chats feels natural again — in the browser, fast, private and clean.",
  aboutBody2:
    "The project is under active development; feedback, ideas and contributions are very welcome.",
  aboutTechHeading: "Built with",
  contactTitle: "Contact",
  contactLead:
    "Reach out for questions, feedback or contributions.",
  contactEmailLabel: "Email",
  contactGithubLabel: "GitHub",
  contactBody:
    "We usually reply within a few business days. For bug reports, please use GitHub Issues.",
  footerCopyright: "© 2026 WA Viewer",
  footerTagline:
    "A privacy-respecting WhatsApp chat viewer that runs entirely in your browser.",
  openMenu: "Open menu",
  closeMenu: "Close menu",
};

export const TRANSLATIONS: Record<Locale, Dict> = { tr, en };
