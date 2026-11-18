// Sura ma'lumotlari: [o'zbekcha nomi, arabcha nomi, oyatlar soni, nozil bo'lgan joy (M = Makka, D = Madina)]
window.SURAS = [
["Al-Fotiha","الفاتحة",7,"M"],["Al-Baqara","البقرة",286,"D"],["Oli Imron","آل عمران",200,"D"],["An-Niso","النساء",176,"D"],
["Al-Moida","المائدة",120,"D"],["Al-An'om","الأنعام",165,"M"],["Al-A'rof","الأعراف",206,"M"],["Al-Anfol","الأنفال",75,"D"],
["At-Tavba","التوبة",129,"D"],["Yunus","يونس",109,"M"],["Hud","هود",123,"M"],["Yusuf","يوسف",111,"M"],
["Ar-Ra'd","الرعد",43,"D"],["Ibrohim","إبراهيم",52,"M"],["Al-Hijr","الحجر",99,"M"],["An-Nahl","النحل",128,"M"],
["Al-Isro","الإسراء",111,"M"],["Al-Kahf","الكهف",110,"M"],["Maryam","مريم",98,"M"],["Toha","طه",135,"M"],
["Al-Anbiyo","الأنبياء",112,"M"],["Al-Haj","الحج",78,"D"],["Al-Mu'minun","المؤمنون",118,"M"],["An-Nur","النور",64,"D"],
["Al-Furqon","الفرقان",77,"M"],["Ash-Shuaro","الشعراء",227,"M"],["An-Naml","النمل",93,"M"],["Al-Qasas","القصص",88,"M"],
["Al-Ankabut","العنكبوت",69,"M"],["Ar-Rum","الروم",60,"M"],["Luqmon","لقمان",34,"M"],["As-Sajda","السجدة",30,"M"],
["Al-Ahzob","الأحزاب",73,"D"],["Saba'","سبأ",54,"M"],["Fotir","فاطر",45,"M"],["Yosin","يس",83,"M"],
["As-Soffot","الصافات",182,"M"],["Sod","ص",88,"M"],["Az-Zumar","الزمر",75,"M"],["G'ofir","غافر",85,"M"],
["Fussilat","فصلت",54,"M"],["Ash-Shuro","الشورى",53,"M"],["Az-Zuxruf","الزخرف",89,"M"],["Ad-Duxon","الدخان",59,"M"],
["Al-Josiya","الجاثية",37,"M"],["Al-Ahqof","الأحقاف",35,"M"],["Muhammad","محمد",38,"D"],["Al-Fath","الفتح",29,"D"],
["Al-Hujurot","الحجرات",18,"D"],["Qof","ق",45,"M"],["Az-Zoriyot","الذاريات",60,"M"],["At-Tur","الطور",49,"M"],
["An-Najm","النجم",62,"M"],["Al-Qamar","القمر",55,"M"],["Ar-Rahmon","الرحمن",78,"D"],["Al-Voqi'a","الواقعة",96,"M"],
["Al-Hadid","الحديد",29,"D"],["Al-Mujodala","المجادلة",22,"D"],["Al-Hashr","الحشر",24,"D"],["Al-Mumtahana","الممتحنة",13,"D"],
["As-Soff","الصف",14,"D"],["Al-Jum'a","الجمعة",11,"D"],["Al-Munofiqun","المنافقون",11,"D"],["At-Tag'obun","التغابن",18,"D"],
["At-Taloq","الطلاق",12,"D"],["At-Tahrim","التحريم",12,"D"],["Al-Mulk","الملك",30,"M"],["Al-Qalam","القلم",52,"M"],
["Al-Hoqqa","الحاقة",52,"M"],["Al-Ma'orij","المعارج",44,"M"],["Nuh","نوح",28,"M"],["Al-Jinn","الجن",28,"M"],
["Al-Muzzammil","المزمل",20,"M"],["Al-Muddassir","المدثر",56,"M"],["Al-Qiyoma","القيامة",40,"M"],["Al-Inson","الإنسان",31,"D"],
["Al-Mursalot","المرسلات",50,"M"],["An-Naba'","النبأ",40,"M"],["An-Nozi'ot","النازعات",46,"M"],["Abasa","عبس",42,"M"],
["At-Takvir","التكوير",29,"M"],["Al-Infitor","الانفطار",19,"M"],["Al-Mutaffifin","المطففين",36,"M"],["Al-Inshiqoq","الانشقاق",25,"M"],
["Al-Buruj","البروج",22,"M"],["At-Toriq","الطارق",17,"M"],["Al-A'lo","الأعلى",19,"M"],["Al-G'oshiya","الغاشية",26,"M"],
["Al-Fajr","الفجر",30,"M"],["Al-Balad","البلد",20,"M"],["Ash-Shams","الشمس",15,"M"],["Al-Layl","الليل",21,"M"],
["Az-Zuho","الضحى",11,"M"],["Ash-Sharh","الشرح",8,"M"],["At-Tin","التين",8,"M"],["Al-Alaq","العلق",19,"M"],
["Al-Qadr","القدر",5,"M"],["Al-Bayyina","البينة",8,"D"],["Az-Zalzala","الزلزلة",8,"D"],["Al-Odiyot","العاديات",11,"M"],
["Al-Qori'a","القارعة",11,"M"],["At-Takosur","التكاثر",8,"M"],["Al-Asr","العصر",3,"M"],["Al-Humaza","الهمزة",9,"M"],
["Al-Fil","الفيل",5,"M"],["Quraysh","قريش",4,"M"],["Al-Mo'un","الماعون",7,"M"],["Al-Kavsar","الكوثر",3,"M"],
["Al-Kofirun","الكافرون",6,"M"],["An-Nasr","النصر",3,"D"],["Al-Masad","المسد",5,"M"],["Al-Ixlos","الإخلاص",4,"M"],
["Al-Falaq","الفلق",5,"M"],["An-Nos","الناس",6,"M"]
];

// Qorilar (everyayah.com papkalari)
window.RECITERS = [
  ["Husary_Muallim_128kbps", "Mahmud Xalil Husoriy — o'rgatuvchi (sekin)"],
  ["Minshawy_Teacher_128kbps", "Muhammad Siddiq Minshoviy — o'rgatuvchi"],
  ["Alafasy_128kbps", "Mishary Rashid Al-Afasiy"],
  ["Husary_128kbps", "Mahmud Xalil Husoriy"],
  ["Abdul_Basit_Murattal_192kbps", "Abdulbosit Abdussamad"],
  ["Ghamadi_40kbps", "Sa'd al-G'omidiy"],
  ["Maher_AlMuaiqly_64kbps", "Mohir al-Mu'ayqliy"]
];

// Tarjima / tafsir manbalari (QuranEnc.com — Islom ishlari vazirligi qoshidagi Ruvvod markazi)
window.TRANSLATIONS = [
  ["uzbek_sadiq", "Muhammad Sodiq Muhammad Yusuf"],
  ["uzbek_mansour", "Alouddin Mansur"],
  ["uzbek_rwwad", "Ruvvod tarjima markazi"]
];
window.TAFSIRS = [
  ["uzbek_mokhtasar", "Al-Muxtasar fi tafsir"],
  ["uzbek_sadiq", "Muhammad Sodiq izohlari"],
  ["uzbek_mansour", "Alouddin Mansur izohlari"]
];

// Arab alifbosi: [harf, nomi, talaffuz izohi, ulanadimi]
window.LETTERS = [
  ["ا","Alif","Cho'ziq «a» uchun tayanch. O'zi harakat olmaydi; harakat olsa hamza (ء) bo'ladi.",0],
  ["ب","Bo","O'zbekcha «b» kabi.",1],
  ["ت","To","Yumshoq «t».",1],
  ["ث","So","Tilning uchi tishlar orasida, «s» aytiladi (inglizcha «think»dagi th).",1],
  ["ج","Jim","«j» (dj) kabi.",1],
  ["ح","Ha","Bo'g'izning o'rtasidan chiqadigan kuchli, xirillamaydigan «h».",1],
  ["خ","Xo","O'zbekcha «x» kabi, bo'g'iz tepasidan.",1],
  ["د","Dol","«d» kabi.",0],
  ["ذ","Zol","Tilning uchi tishlar orasida, «z» aytiladi (inglizcha «this»dagi th).",0],
  ["ر","Ro","«r» kabi, bir marta titratiladi.",0],
  ["ز","Zay","«z» kabi.",0],
  ["س","Sin","«s» kabi.",1],
  ["ش","Shin","«sh» kabi.",1],
  ["ص","Sod","Qalin (yo'g'on) «s» — og'iz bo'shlig'i to'ldirib aytiladi.",1],
  ["ض","Zod","Qalin harf, tilning yon tomoni oziq tishlarga tegib aytiladi.",1],
  ["ط","To","Qalin «t».",1],
  ["ظ","Zo","Qalin, tilning uchi tishlar orasida aytiladigan «z».",1],
  ["ع","Ayn","Bo'g'izning o'rtasidan siqib chiqariladigan tovush. O'zbek tilida o'xshashi yo'q — ustozdan eshitib o'rganing.",1],
  ["غ","G'ayn","O'zbekcha «g'» kabi.",1],
  ["ف","Fa","«f» kabi.",1],
  ["ق","Qof","O'zbekcha «q» kabi, tilning eng orqasidan.",1],
  ["ك","Kof","Yumshoq «k».",1],
  ["ل","Lom","«l» kabi.",1],
  ["م","Mim","«m» kabi.",1],
  ["ن","Nun","«n» kabi.",1],
  ["ه","Ha","Yengil, nafas bilan aytiladigan «h» (ko'krakdan).",1],
  ["و","Vov","«v» (lab bilan) yoki cho'ziq «u».",0],
  ["ي","Yo","«y» yoki cho'ziq «i».",1],
  ["ء","Hamza","Bo'g'iz eng pastidan qisqa uzilish bilan chiqadigan tovush (ta'-at dagidek).",0]
];

window.HARAKAT = [
  ["َ","Fatha (zabar)","Harf ustidagi kichik chiziq. Harf «a» bilan o'qiladi.","بَ","ba"],
  ["ِ","Kasra (zer)","Harf ostidagi kichik chiziq. Harf «i» bilan o'qiladi.","بِ","bi"],
  ["ُ","Damma (pesh)","Harf ustidagi kichik vov. Harf «u» bilan o'qiladi.","بُ","bu"],
  ["ْ","Sukun (jazm)","Harf ustidagi kichik doira. Harf unlisiz, oldingi harfga qo'shib o'qiladi.","أَبْ","ab"],
  ["ً","Tanvin fatha","Ikkita zabar: «-an».","بًا","ban"],
  ["ٍ","Tanvin kasra","Ikkita zer: «-in».","بٍ","bin"],
  ["ٌ","Tanvin damma","Ikkita pesh: «-un».","بٌ","bun"],
  ["ّ","Shadda (tashdid)","Harf ikki marta — birinchisi sukunli, ikkinchisi harakatli o'qiladi.","رَبَّ","rabba"],
  ["ٰ","Tik zabar (alif xanjariya)","Harf ustidagi tik chiziq: «a» ikki harakat cho'ziladi.","هٰذَا","haazaa"],
  ["ٓ","Madda","Cho'zish belgisi: harf 4–6 harakat cho'zib o'qiladi.","آ","aa"]
];

window.MADD_EXAMPLES = [
  ["بَا","baa","Zabardan keyin alif — «a» cho'ziladi"],
  ["بِي","bii","Zerdan keyin yo — «i» cho'ziladi"],
  ["بُو","buu","Peshdan keyin vov — «u» cho'ziladi"]
];

// Tajvid qoidalari
window.TAJWEED = [
  {t:"Nun sokin va tanvin qoidalari", p:[
    "Nun sokin (نْ) yoki tanvindan keyin keladigan harfga qarab 4 xil o'qiladi:",
    "<b>1. Izhor</b> (aniq o'qish) — keyingi harf bo'g'iz harflaridan biri bo'lsa: ء ه ع ح غ خ. Nun g'unnasiz, aniq o'qiladi. Misol: <span class='arx'>مَنْ آمَنَ</span>, <span class='arx'>عَلِيمٌ حَكِيمٌ</span>",
    "<b>2. Idg'om</b> (qo'shib o'qish) — keyingi harf ي ر م ل و ن (\"yarmalun\") bo'lsa. ي ن م و harflarida g'unna bilan, ل ر harflarida g'unnasiz qo'shiladi. Misol: <span class='arx'>مَنْ يَعْمَلْ</span>, <span class='arx'>مِنْ رَبِّهِمْ</span>. Diqqat: bitta so'z ichida bo'lsa (masalan, <span class='arx'>دُنْيَا</span>) idg'om qilinmaydi.",
    "<b>3. Iqlob</b> (almashtirish) — keyingi harf ب bo'lsa, nun «m»ga aylanib, g'unna bilan o'qiladi. Mushafda kichik م bilan belgilanadi. Misol: <span class='arx'>مِنْ بَعْدِ</span>, <span class='arx'>سَمِيعٌ بَصِيرٌ</span>",
    "<b>4. Ixfo</b> (yashirish) — qolgan 15 harf: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك. Nun izhor bilan idg'om o'rtasida, burundan g'unna bilan 2 harakat o'qiladi. Misol: <span class='arx'>أَنْتُمْ</span>, <span class='arx'>مِنْ قَبْلِ</span>"
  ]},
  {t:"Mim sokin qoidalari", p:[
    "<b>1. Ixfo shafaviy</b> — mim sokindan keyin ب kelsa, mim lab bilan yashirib, g'unna bilan o'qiladi: <span class='arx'>تَرْمِيهِمْ بِحِجَارَةٍ</span>",
    "<b>2. Idg'om mislayn</b> — mim sokindan keyin م kelsa, ikkala mim qo'shilib, g'unna bilan o'qiladi: <span class='arx'>لَهُمْ مَا</span>",
    "<b>3. Izhor shafaviy</b> — qolgan barcha harflarda mim aniq o'qiladi. Ayniqsa و va ف oldidan aniq aytishga e'tibor bering: <span class='arx'>عَلَيْهِمْ وَلَا</span>"
  ]},
  {t:"G'unna (burun tovushi)", p:[
    "Shaddali nun (نّ) va shaddali mim (مّ) har doim g'unna bilan, taxminan 2 harakat (ikki barmoq bukish vaqti) ushlab o'qiladi.",
    "Misol: <span class='arx'>إِنَّ</span>, <span class='arx'>ثُمَّ</span>, <span class='arx'>مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ</span>"
  ]},
  {t:"Qalqala (silkitib o'qish)", p:[
    "Qalqala harflari 5 ta: ق ط ب ج د (\"qutbu jadin\" — قُطْبُ جَدٍّ).",
    "Bu harflar sukunli bo'lganda (yoki ularda to'xtalganda) tovush biroz silkinib, aks-sado bilan chiqariladi.",
    "Misol: <span class='arx'>يَقْطَعُونَ</span>, <span class='arx'>قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ</span> (oxirida to'xtalganda «q» silkinadi)"
  ]},
  {t:"Madd (cho'zish)", p:[
    "<b>Tabiiy madd</b> — zabardan keyin alif, peshdan keyin vov, zerdan keyin yo kelsa: 2 harakat cho'ziladi. <span class='arx'>قَالَ</span>, <span class='arx'>يَقُولُ</span>, <span class='arx'>قِيلَ</span>",
    "<b>Muttasil (vojib) madd</b> — madd harfidan keyin shu so'zning o'zida hamza kelsa: 4–5 harakat. <span class='arx'>جَاءَ</span>, <span class='arx'>ٱلسَّمَاءِ</span>",
    "<b>Munfasil (joiz) madd</b> — madd harfi bir so'zning oxirida, hamza keyingi so'z boshida bo'lsa: 2, 4 yoki 5 harakat. <span class='arx'>يَا أَيُّهَا</span>, <span class='arx'>إِنَّا أَعْطَيْنَاكَ</span>",
    "<b>Lozim madd</b> — madd harfidan keyin shaddali yoki sukunli harf kelsa: 6 harakat. <span class='arx'>ٱلضَّآلِّينَ</span>, <span class='arx'>الٓمٓ</span>",
    "<b>Oriziy madd</b> — oyat oxirida to'xtalganda, madd harfidan keyingi harf sukunli bo'lib qolsa: 2, 4 yoki 6 harakat. <span class='arx'>ٱلْعَالَمِينَ</span>, <span class='arx'>نَسْتَعِينُ</span>"
  ]},
  {t:"Shamsiy va qamariy harflar", p:[
    "So'z boshidagi «ال» (al-) ning lomi keyingi harfga qarab ikki xil o'qiladi.",
    "<b>Qamariy harflar</b> — lom aniq o'qiladi (ustida sukun bo'ladi): ا ب غ ح ج ك و خ ف ع ق ي م ه. Misol: <span class='arx'>ٱلْقَمَرُ</span> (al-qamar), <span class='arx'>ٱلْحَمْدُ</span>",
    "<b>Shamsiy harflar</b> — lom o'qilmaydi, keyingi harf shadda bilan ikkilanadi: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. Misol: <span class='arx'>ٱلشَّمْسُ</span> (ash-shams), <span class='arx'>ٱلرَّحْمَٰنِ</span>"
  ]},
  {t:"«Alloh» so'zidagi lom", p:[
    "<b>Qalin (tafxim)</b> — «Alloh» so'zidan oldingi harf zabar yoki pesh bo'lsa, lom qalin o'qiladi: <span class='arx'>قَالَ ٱللَّهُ</span>, <span class='arx'>عَبْدُ ٱللَّهِ</span>",
    "<b>Ingichka (tarqiq)</b> — oldingi harf zer bo'lsa, lom ingichka o'qiladi: <span class='arx'>بِسْمِ ٱللَّهِ</span>"
  ]},
  {t:"Qalin va ingichka harflar", p:[
    "Doim qalin o'qiladigan 7 harf: خ ص ض غ ط ق ظ (\"xussa zog'tin qiz\" — خُصَّ ضَغْطٍ قِظْ).",
    "ر (ro) — zabar yoki pesh bilan qalin, zer bilan ingichka o'qiladi: <span class='arx'>رَبِّ</span> (qalin), <span class='arx'>رِجَالٌ</span> (ingichka)."
  ]},
  {t:"To'xtash (vaqf) belgilari", p:[
    "<b>م</b> — to'xtash lozim (aks holda ma'no buziladi).",
    "<b>لا</b> — bu yerda to'xtamang.",
    "<b>ج</b> — to'xtash ham, davom ettirish ham mumkin.",
    "<b>صلى</b> — davom ettirish afzal.",
    "<b>قلى</b> — to'xtash afzal.",
    "<b>∴ ∴</b> (uch nuqta, ikki joyda) — ikkalasidan faqat bittasida to'xtaladi.",
    "To'xtalganda so'z oxiridagi harakat sukun bilan o'qiladi, tanvin fatha esa «a» cho'ziq bo'ladi."
  ]}
];

// O'rganish uchun tavsiya qilingan qisqa suralar
window.SHORT_SURAS = [1,114,113,112,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78];
