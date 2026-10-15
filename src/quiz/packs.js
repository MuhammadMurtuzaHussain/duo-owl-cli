// [phrase, english, romanization?]. Small, hand-picked, beginner-friendly.
export const PACKS = {
  zh: {
    title: 'Chinese (Simplified)',
    phrases: [
      ['你好', 'hello', 'nǐ hǎo'],
      ['谢谢', 'thank you', 'xièxie'],
      ['再见', 'goodbye', 'zàijiàn'],
      ['对不起', 'sorry', 'duìbuqǐ'],
      ['我是学生', 'I am a student', 'wǒ shì xuésheng'],
      ['你叫什么名字？', 'what is your name?', 'nǐ jiào shénme míngzi?'],
      ['我喜欢喝茶', 'I like drinking tea', 'wǒ xǐhuan hē chá'],
      ['猫头鹰', 'owl', 'māotóuyīng'],
      ['今天很热', 'it is hot today', 'jīntiān hěn rè'],
      ['多少钱？', 'how much is it?', 'duōshao qián?'],
      ['我饿了', 'I am hungry', 'wǒ è le'],
      ['水', 'water', 'shuǐ'],
      ['朋友', 'friend', 'péngyou'],
      ['我不知道', "I don't know", 'wǒ bù zhīdào'],
      ['明天见', 'see you tomorrow', 'míngtiān jiàn'],
      ['你会说中文吗？', 'can you speak Chinese?', 'nǐ huì shuō zhōngwén ma?'],
      ['我爱你', 'I love you', 'wǒ ài nǐ'],
      ['米饭', 'rice', 'mǐfàn'],
      ['火车站在哪里？', 'where is the train station?', 'huǒchēzhàn zài nǎlǐ?'],
      ['不要放弃', "don't give up", 'bùyào fàngqì'],
    ],
  },
  ar: {
    title: 'Arabic',
    phrases: [
      ['مرحبا', 'hello', 'marḥaban'],
      ['شكرا', 'thank you', 'shukran'],
      ['مع السلامة', 'goodbye', "ma'a as-salāma"],
      ['نعم', 'yes', "na'am"],
      ['لا', 'no', 'lā'],
      ['من فضلك', 'please', 'min faḍlik'],
      ['ماء', 'water', "mā'"],
      ['قهوة', 'coffee', 'qahwa'],
      ['كتاب', 'book', 'kitāb'],
      ['بيت', 'house', 'bayt'],
      ['أنا جائع', 'I am hungry', "anā jā'i'"],
      ['ما اسمك؟', 'what is your name?', 'mā ismuk?'],
      ['صديق', 'friend', 'ṣadīq'],
      ['بومة', 'owl', 'būma'],
      ['صباح الخير', 'good morning', 'ṣabāḥ al-khayr'],
    ],
  },
  es: {
    title: 'Spanish',
    phrases: [
      ['hola', 'hello'], ['gracias', 'thank you'], ['adiós', 'goodbye'], ['el búho', 'the owl'],
      ['tengo hambre', 'I am hungry'], ['¿cómo te llamas?', 'what is your name?'],
      ['me gusta el café', 'I like coffee'], ['¿dónde está el baño?', 'where is the bathroom?'],
      ['no lo sé', "I don't know"], ['hasta mañana', 'see you tomorrow'], ['la manzana', 'the apple'],
      ['el gato bebe leche', 'the cat drinks milk'], ['¿cuánto cuesta?', 'how much does it cost?'],
      ['estoy cansado', 'I am tired'], ['buenos días', 'good morning'], ['no te rindas', "don't give up"],
    ],
  },
  fr: {
    title: 'French',
    phrases: [
      ['bonjour', 'hello'], ['merci', 'thank you'], ['au revoir', 'goodbye'], ['le hibou', 'the owl'],
      ["j'ai faim", 'I am hungry'], ['comment tu t\'appelles ?', 'what is your name?'],
      ["j'aime le fromage", 'I like cheese'], ['où sont les toilettes ?', 'where is the bathroom?'],
      ['je ne sais pas', "I don't know"], ['à demain', 'see you tomorrow'], ['la pomme', 'the apple'],
      ['le chat boit du lait', 'the cat drinks milk'], ['combien ça coûte ?', 'how much does it cost?'],
      ['je suis fatigué', 'I am tired'], ['bonne nuit', 'good night'], ["n'abandonne pas", "don't give up"],
    ],
  },
  de: {
    title: 'German',
    phrases: [
      ['hallo', 'hello'], ['danke', 'thank you'], ['tschüss', 'bye'], ['die Eule', 'the owl'],
      ['ich habe Hunger', 'I am hungry'], ['wie heißt du?', 'what is your name?'],
      ['ich trinke gern Kaffee', 'I like drinking coffee'], ['wo ist die Toilette?', 'where is the toilet?'],
      ['ich weiß nicht', "I don't know"], ['bis morgen', 'see you tomorrow'], ['der Apfel', 'the apple'],
      ['die Katze trinkt Milch', 'the cat drinks milk'], ['wie viel kostet das?', 'how much does it cost?'],
      ['ich bin müde', 'I am tired'], ['guten Morgen', 'good morning'], ['gib nicht auf', "don't give up"],
    ],
  },
  ja: {
    title: 'Japanese',
    phrases: [
      ['こんにちは', 'hello', 'konnichiwa'], ['ありがとう', 'thank you', 'arigatō'],
      ['さようなら', 'goodbye', 'sayōnara'], ['フクロウ', 'owl', 'fukurō'],
      ['おなかがすいた', 'I am hungry', 'onaka ga suita'], ['お名前は？', 'what is your name?', 'onamae wa?'],
      ['水', 'water', 'mizu'], ['すみません', 'excuse me', 'sumimasen'],
      ['わかりません', "I don't understand", 'wakarimasen'], ['また明日', 'see you tomorrow', 'mata ashita'],
      ['猫', 'cat', 'neko'], ['駅はどこですか？', 'where is the station?', 'eki wa doko desu ka?'],
      ['いくらですか？', 'how much is it?', 'ikura desu ka?'], ['おはよう', 'good morning', 'ohayō'],
      ['がんばって', 'do your best', 'ganbatte'],
    ],
  },
  it: {
    title: 'Italian',
    phrases: [
      ['ciao', 'hello'], ['grazie', 'thank you'], ['arrivederci', 'goodbye'], ['il gufo', 'the owl'],
      ['ho fame', 'I am hungry'], ['come ti chiami?', 'what is your name?'],
      ['mi piace la pizza', 'I like pizza'], ['dov\'è il bagno?', 'where is the bathroom?'],
      ['non lo so', "I don't know"], ['a domani', 'see you tomorrow'], ['la mela', 'the apple'],
      ['quanto costa?', 'how much does it cost?'], ['sono stanco', 'I am tired'], ['buongiorno', 'good morning'],
    ],
  },
  pt: {
    title: 'Portuguese',
    phrases: [
      ['olá', 'hello'], ['obrigado', 'thank you'], ['tchau', 'bye'], ['a coruja', 'the owl'],
      ['estou com fome', 'I am hungry'], ['como você se chama?', 'what is your name?'],
      ['eu gosto de café', 'I like coffee'], ['onde fica o banheiro?', 'where is the bathroom?'],
      ['eu não sei', "I don't know"], ['até amanhã', 'see you tomorrow'], ['a maçã', 'the apple'],
      ['quanto custa?', 'how much does it cost?'], ['estou cansado', 'I am tired'], ['bom dia', 'good morning'],
    ],
  },
  ko: {
    title: 'Korean',
    phrases: [
      ['안녕하세요', 'hello', 'annyeonghaseyo'], ['감사합니다', 'thank you', 'gamsahamnida'],
      ['안녕히 가세요', 'goodbye', 'annyeonghi gaseyo'], ['부엉이', 'owl', 'bueong-i'],
      ['배고파요', 'I am hungry', 'baegopayo'], ['이름이 뭐예요?', 'what is your name?', 'ireumi mwoyeyo?'],
      ['물', 'water', 'mul'], ['죄송합니다', 'sorry', 'joesonghamnida'],
      ['몰라요', "I don't know", 'mollayo'], ['내일 봐요', 'see you tomorrow', 'naeil bwayo'],
      ['고양이', 'cat', 'goyang-i'], ['얼마예요?', 'how much is it?', 'eolmayeyo?'],
      ['화이팅', 'you can do it', 'hwaiting'],
    ],
  },
};

/** Duolingo course codes don't always match ours (zh-CN, zs, etc.). */
export function packFor(code) {
  if (!code) return null;
  const c = code.toLowerCase();
  if (PACKS[c]) return c;
  if (c.startsWith('zh') || c === 'zs') return 'zh';
  return null;
}
