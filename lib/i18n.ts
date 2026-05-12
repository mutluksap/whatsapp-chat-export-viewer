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
};

export const TRANSLATIONS: Record<Locale, Dict> = { tr, en };
