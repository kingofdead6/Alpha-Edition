/* Sample catalogue for Éditions Alfa. Every author and book here is invented. */

export const authors = [
  {
    key: 'ferhat',
    name: { en: 'Nadia Ferhat', ar: 'نادية فرحات' },
    bio: {
      en: 'Nadia Ferhat was born in Ouargla in 1984 and teaches literature in Algiers. The Salt Road is her second novel.',
      ar: 'وُلدت نادية فرحات في ورقلة سنة 1984، وتدرّس الأدب في الجزائر العاصمة. «طريق الملح» روايتها الثانية.',
    },
    quote: {
      en: 'They spent a year with my sentences and never once asked me to make them shorter.',
      ar: 'قضوا عامًا كاملًا مع جُملي، ولم يطلبوا مني ولو مرة أن أجعلها أقصر.',
    },
    note: {
      en: 'Reading at the Algiers bookshop on 21 November',
      ar: 'قراءة في مكتبة الجزائر العاصمة يوم 21 نوفمبر',
    },
    featured: true,
  },
  {
    key: 'belaid',
    name: { en: 'Karim Belaïd', ar: 'كريم بلعيد' },
    bio: {
      en: 'Karim Belaïd is an essayist and radio producer who divides his time between Oran and Lyon.',
      ar: 'كريم بلعيد كاتب مقالات ومنتج إذاعي، يتنقّل بين وهران وليون.',
    },
  },
  {
    key: 'haddou',
    name: { en: 'Leïla Haddou', ar: 'ليلى حدّو' },
    bio: {
      en: 'Leïla Haddou is a poet and grammar teacher from Constantine. This is her first collection.',
      ar: 'ليلى حدّو شاعرة وأستاذة نحو من قسنطينة. هذا ديوانها الأول.',
    },
  },
  {
    key: 'rahal',
    name: { en: 'Yamina Rahal', ar: 'يمينة رحّال' },
    bio: {
      en: 'Yamina Rahal is a historian of Tlemcen and its craft guilds. Her novel first appeared in Arabic in 2022.',
      ar: 'يمينة رحّال مؤرّخة لتلمسان وحِرَفها. صدرت روايتها بالعربية أول مرة سنة 2022.',
    },
  },
  {
    key: 'morel',
    name: { en: 'Inès Morel', ar: 'إيناس مورال' },
    bio: {
      en: 'Inès Morel worked night shifts in a Marseille pharmacy for eleven years before writing this book.',
      ar: 'عملت إيناس مورال في المناوبات الليلية بصيدلية في مرسيليا أحد عشر عامًا قبل أن تكتب هذا الكتاب.',
    },
  },
  {
    key: 'taleb',
    name: { en: 'Omar Taleb', ar: 'عمر طالب' },
    bio: {
      en: 'Omar Taleb has worked as a forester in the Aurès and the Djurdjura for twenty-five years.',
      ar: 'يعمل عمر طالب حارسًا للغابات في الأوراس وجرجرة منذ خمسة وعشرين عامًا.',
    },
  },
  {
    key: 'amrani',
    name: { en: 'Sofia Amrani', ar: 'صوفيا عمراني' },
    bio: {
      en: 'Sofia Amrani grew up between Aïn Témouchent and the island of Rachgoun, where her grandfather kept the light.',
      ar: 'نشأت صوفيا عمراني بين عين تموشنت وجزيرة رشقون، حيث كان جدّها حارس المنارة.',
    },
  },
  {
    key: 'lambert',
    name: { en: 'Hugo Lambert', ar: 'هوغو لامبير' },
    bio: {
      en: 'Hugo Lambert is a Marseille novelist. The Ferry at Midnight won the Prix de la Méditerranée in 2024.',
      ar: 'هوغو لامبير روائي من مرسيليا. نالت «عبّارة منتصف الليل» جائزة المتوسط سنة 2024.',
    },
  },
];

export const books = [
  {
    author: 'ferhat',
    title: { en: 'The Salt Road', ar: 'طريق الملح' },
    category: 'fiction',
    pages: 312,
    price: { dzd: 2400, eur: 22 },
    publishedAt: '2026-11-14',
    newRelease: true,
    featured: true,
    cover: { motif: 'dunes', bg: '#1D3A5F', fg: '#F2E6CC', accent: '#E1A24A' },
    synopsis: {
      en: "A salt merchant's daughter retraces her father's last caravan from Ouargla to the coast, and finds that the road remembers more than he ever told her.",
      ar: 'تقتفي ابنة تاجر ملح أثر القافلة الأخيرة لأبيها من ورقلة إلى الساحل، فتكتشف أن الطريق يتذكّر أكثر مما رواه لها يومًا.',
    },
    excerpt: {
      en: 'Every road out of the desert is paved with salt.',
      ar: 'كلّ طريقٍ يخرج من الصحراء مرصوفٌ بالملح.',
    },
    sample: {
      en: `My father measured distance in sacks of salt. Ten sacks to Ghardaïa, forty to the sea. When I asked him how far it was to Algiers he laughed and said that nobody had ever carried that much.

He kept his accounts in a green notebook with a broken spine. I found it in the spring after he died, wrapped in a shirt at the bottom of the trunk, and for a week I did not open it.

When I did, I found no prices. Only names of wells, and beside each well a number, and beside some numbers a small drawing: a palm, a dog, once a woman with her hands raised.

My mother said the drawings meant nothing. My aunt said they meant everything, and that I should burn the notebook before it found its way into my sleep.

I did not burn it. In October I bought a used Toyota from a cousin in Touggourt, filled the back with water and dates, and drove south to the first well on the list.

The man at the well was younger than I expected. He looked at the notebook for a long time and then asked me whose daughter I was, though I could see that he already knew.

He drew a map in the dust with his finger: the well, the dune behind it, the road that was not a road. "Your father came this way eleven times," he said. "The twelfth time he came alone."

I asked him what that meant. He poured the tea three times, as is the custom, and only after the third glass did he answer. "It means there was someone with him the other eleven."

That night I slept in the car with the notebook under my head, and I dreamed of the woman with her hands raised. In the dream she was not surrendering. She was waving.`,
      ar: `كان أبي يقيس المسافات بأكياس الملح. عشرة أكياس إلى غرداية، وأربعون إلى البحر. وحين سألته كم تبعد العاصمة ضحك وقال إن أحدًا لم يحمل يومًا كلّ ذلك الملح.

كان يدوّن حساباته في دفتر أخضر مكسور الظهر. وجدته في الربيع الذي تلا موته، ملفوفًا في قميص في قاع الصندوق، ولم أفتحه أسبوعًا كاملًا.

وحين فتحته لم أجد أسعارًا. وجدت أسماء آبار فقط، وبجانب كلّ بئر رقمًا، وبجانب بعض الأرقام رسمًا صغيرًا: نخلة، كلبًا، ومرة امرأة رفعت يديها.

قالت أمي إن الرسوم لا تعني شيئًا. وقالت عمّتي إنها تعني كلّ شيء، وإن عليّ أن أحرق الدفتر قبل أن يتسلّل إلى نومي.

لم أحرقه. في أكتوبر اشتريت سيارة تويوتا مستعملة من ابن عمّ في تقرت، وملأت صندوقها بالماء والتمر، واتجهت جنوبًا إلى البئر الأولى في القائمة.

كان الرجل عند البئر أصغر مما توقّعت. نظر إلى الدفتر طويلًا ثم سألني ابنة من أكون، مع أنني رأيت في عينيه أنه يعرف.

رسم خريطة في الغبار بإصبعه: البئر، والكثيب خلفها، والطريق الذي ليس طريقًا. قال: «جاء أبوك من هنا إحدى عشرة مرة. وفي المرة الثانية عشرة جاء وحده.»

سألته ماذا يعني ذلك. صبّ الشاي ثلاث مرات كما تقتضي العادة، ولم يجب إلا بعد الكأس الثالثة: «يعني أن أحدًا كان معه في المرات الإحدى عشرة الأخرى.»

في تلك الليلة نمت في السيارة والدفتر تحت رأسي، وحلمت بالمرأة التي رفعت يديها. في الحلم لم تكن تستسلم. كانت تلوّح.`,
    },
  },
  {
    author: 'belaid',
    title: { en: 'Notes on Distance', ar: 'ملاحظات عن المسافة' },
    category: 'essays',
    pages: 184,
    price: { dzd: 1900, eur: 18 },
    publishedAt: '2026-10-03',
    cover: { motif: 'grid', bg: '#E8E2D3', fg: '#1E1E1E', accent: '#C2321C' },
    synopsis: {
      en: 'Twelve essays on emigration, long-distance phone calls and the particular silence of a family group chat.',
      ar: 'اثنتا عشرة مقالة عن الهجرة، والمكالمات البعيدة، والصمت الخاص بمجموعات العائلة على الهاتف.',
    },
    excerpt: {
      en: 'The first thing you lose when you leave is not the language. It is the weather inside it.',
      ar: 'أوّل ما تفقده حين ترحل ليس اللغة، بل الطقس الذي في داخلها.',
    },
    sample: {
      en: `The first thing you lose when you leave is not the language. It is the weather inside it: the way a word for rain in Oran carries the smell of the port, and the same word in Lyon carries nothing at all.

My mother calls every Friday at nine. She does not ask how I am. She tells me the price of tomatoes, who has died, and whether the neighbour's son has finally found work. This is how she tells me she loves me.

I have learned to answer in the same currency. I tell her the price of bread, the name of my doctor, the colour of the leaves outside my window. Neither of us has ever said the word distance.`,
      ar: `أوّل ما تفقده حين ترحل ليس اللغة، بل الطقس الذي في داخلها: الطريقة التي تحمل بها كلمة المطر في وهران رائحة الميناء، بينما لا تحمل الكلمة نفسها في ليون شيئًا على الإطلاق.

تتصل أمي كلّ جمعة في التاسعة. لا تسألني عن حالي. تخبرني بسعر الطماطم، ومن مات، وهل وجد ابن الجيران عملًا أخيرًا. هكذا تقول لي إنها تحبّني.

تعلّمت أن أجيبها بالعملة نفسها. أخبرها بسعر الخبز، واسم طبيبي، ولون الأوراق خارج نافذتي. لم يقل أيّ منا كلمة المسافة قط.`,
    },
  },
  {
    author: 'haddou',
    title: { en: 'A Grammar of Rain', ar: 'نحوُ المطر' },
    category: 'poetry',
    pages: 96,
    price: { dzd: 1500, eur: 15 },
    publishedAt: '2026-09-19',
    cover: { motif: 'rain', bg: '#2F4F46', fg: '#EAF0E6', accent: '#9CC5B0' },
    synopsis: {
      en: 'Poems written over one wet winter in Constantine, each one titled after a rule of Arabic grammar.',
      ar: 'قصائد كُتبت خلال شتاء ماطر واحد في قسنطينة، تحمل كلّ واحدة منها اسم قاعدة من قواعد النحو العربي.',
    },
    excerpt: { en: 'Rain is a verb / that refuses its subject.', ar: 'المطرُ فعلٌ / يرفضُ فاعلَه.' },
    sample: {
      en: `The Verb Before Its Subject

Rain is a verb
that refuses its subject.
It falls on the bridge,
on the gorge, on my father's hat,
and never says who sent it.

The Absolute Object

I waited a waiting.
The city slept a sleep.
Somewhere a door
closed a closing
and I knew it was yours.`,
      ar: `الفعلُ قبل فاعله

المطرُ فعلٌ
يرفضُ فاعلَه.
يسقطُ على الجسر،
على الوادي، على قبّعة أبي،
ولا يقولُ أبدًا من أرسله.

المفعولُ المطلق

انتظرتُ انتظارًا.
ونامت المدينةُ نومًا.
وفي مكانٍ ما
أُغلق بابٌ إغلاقًا
فعرفتُ أنه بابُك.`,
    },
  },
  {
    author: 'rahal',
    title: { en: "The Weaver's Ledger", ar: 'دفتر النسّاجة' },
    translator: { en: 'Samir Oukaci', ar: 'سمير أوقاسي' },
    translatedFrom: 'ar',
    category: 'translation',
    pages: 268,
    price: { dzd: 2300, eur: 21 },
    publishedAt: '2026-10-24',
    cover: { motif: 'tiles', bg: '#7A2E2A', fg: '#F6E7D8', accent: '#D9925B' },
    synopsis: {
      en: 'In 1920s Tlemcen, a carpet workshop keeps two sets of accounts: one for the tax office, one for the women who actually own it.',
      ar: 'في تلمسان العشرينيات، تمسك ورشة سجّاد دفترين للحسابات: واحد لمصلحة الضرائب، وآخر للنساء اللواتي يملكنها فعلًا.',
    },
    excerpt: {
      en: 'Every knot was entered twice, once in ink and once in memory.',
      ar: 'كلّ عقدة كانت تُقيَّد مرتين: مرة بالحبر، ومرة في الذاكرة.',
    },
    sample: {
      en: `Every knot was entered twice, once in ink and once in memory. The ink went to the French inspector who came on the first Monday of each month. The memory stayed with Lalla Zoubida, who could recite the year's accounts with her eyes closed.

The inspector was a polite man with a cough. He admired the carpets, drank the tea, and signed the ledger without reading it. He believed the workshop belonged to Si Ahmed, Zoubida's husband, who had not touched a loom in his life.`,
      ar: `كلّ عقدة كانت تُقيَّد مرتين: مرة بالحبر، ومرة في الذاكرة. يذهب الحبر إلى المفتّش الفرنسي الذي يأتي أوّل اثنين من كلّ شهر، وتبقى الذاكرة عند لالة زبيدة، التي كانت تستطيع أن تتلو حسابات العام مغمضة العينين.

كان المفتّش رجلًا مهذّبًا يسعل كثيرًا. يُعجب بالسجّاد، ويشرب الشاي، ويوقّع الدفتر دون أن يقرأه. كان يظنّ أن الورشة ملك لسي أحمد، زوج زبيدة، الذي لم يلمس نولًا في حياته.`,
    },
  },
  {
    author: 'morel',
    title: { en: 'Small Hours', ar: 'آخر الليل' },
    category: 'fiction',
    pages: 224,
    price: { dzd: 2100, eur: 20 },
    publishedAt: '2026-11-28',
    newRelease: true,
    cover: { motif: 'moon', bg: '#14171F', fg: '#F0EDE5', accent: '#F2C14E' },
    synopsis: {
      en: 'A night-shift pharmacist in Marseille and the regulars who come in after midnight for things that are not on any prescription.',
      ar: 'صيدلانية المناوبة الليلية في مرسيليا، وزبائنها الدائمون الذين يأتون بعد منتصف الليل بحثًا عن أشياء لا تُكتب في أيّ وصفة.',
    },
    excerpt: {
      en: 'At three in the morning, everyone is honest about their headaches.',
      ar: 'في الثالثة فجرًا، يصدق الجميع في الحديث عن صداعهم.',
    },
    sample: {
      en: `At three in the morning, everyone is honest about their headaches. They do not say it is the weather or the screens. They say it is my husband, my rent, my son who has not called since August.

I sell them paracetamol and listen. The pharmacy is the only lit window on the street, and people come to it the way moths do, without deciding to.`,
      ar: `في الثالثة فجرًا، يصدق الجميع في الحديث عن صداعهم. لا يقولون إنه الطقس أو الشاشات. يقولون: إنه زوجي، إنه الإيجار، إنه ابني الذي لم يتصل منذ أوت.

أبيعهم الباراسيتامول وأستمع. الصيدلية هي النافذة المضاءة الوحيدة في الشارع، والناس يأتون إليها كما تأتي الفراشات، دون أن يقرّروا ذلك.`,
    },
  },
  {
    author: 'taleb',
    title: { en: 'What the Cedars Keep', ar: 'ما يحفظه الأرز' },
    category: 'essays',
    pages: 240,
    price: { dzd: 2000, eur: 19 },
    publishedAt: '2026-10-10',
    cover: { motif: 'rings', bg: '#3C5A3A', fg: '#F3EBD7', accent: '#C9B27C' },
    synopsis: {
      en: "A forester's essays on the Atlas cedar, a tree that can live a thousand years and is running out of time.",
      ar: 'مقالات حارس غابات عن أرز الأطلس، الشجرة التي قد تعيش ألف عام، ويضيق عليها الوقت الآن.',
    },
    excerpt: {
      en: 'A cedar records drought the way we record debt: a narrow ring, then another.',
      ar: 'تسجّل الأرزة الجفاف كما نسجّل الديون: حلقة ضيّقة، ثم أخرى.',
    },
    sample: {
      en: `A cedar records drought the way we record debt: a narrow ring, then another. In the trees I measured last spring on the slopes of Chélia, the narrow rings begin in 1999 and they have not stopped.

I have spent twenty-five years walking among these trees. I know some of them better than I know my brothers. I am writing this book because I would like someone to remember them the way I do.`,
      ar: `تسجّل الأرزة الجفاف كما نسجّل الديون: حلقة ضيّقة، ثم أخرى. في الأشجار التي قستها الربيع الماضي على سفوح شيليا، تبدأ الحلقات الضيّقة سنة 1999، ولم تتوقف منذ ذلك الحين.

قضيت خمسة وعشرين عامًا أمشي بين هذه الأشجار. أعرف بعضها أكثر مما أعرف إخوتي. أكتب هذا الكتاب لأنني أريد أن يتذكّرها أحدٌ كما أتذكّرها.`,
    },
  },
  {
    author: 'amrani',
    title: { en: 'Lighthouse Alphabet', ar: 'أبجدية المنارة' },
    category: 'poetry',
    pages: 112,
    price: { dzd: 1600, eur: 16 },
    publishedAt: '2026-11-07',
    cover: { motif: 'sun', bg: '#F2C14E', fg: '#1B2A3A', accent: '#D2462F' },
    synopsis: {
      en: "Twenty-six short poems, one for each letter, written by a lighthouse keeper's granddaughter on the island of Rachgoun.",
      ar: 'قصائد قصيرة، واحدة لكلّ حرف، كتبتها حفيدة حارس منارة جزيرة رشقون.',
    },
    excerpt: { en: 'A is for after the lamp goes out.', ar: 'الألفُ لما بعد انطفاء القنديل.' },
    sample: {
      en: `A

A is for after the lamp goes out,
when the sea forgets which way is home
and my grandfather climbs the stairs again
to tell it.

B

B is for the bread he baked on Thursdays,
the only day the boat came,
the only day the island
smelled like somewhere else.`,
      ar: `الألف

الألفُ لما بعد انطفاء القنديل،
حين ينسى البحرُ أين بيته
فيصعد جدّي الدرج من جديد
ليذكّره.

الباء

الباءُ للخبز الذي كان يخبزه أيام الخميس،
اليوم الوحيد الذي يأتي فيه القارب،
اليوم الوحيد الذي تفوح فيه الجزيرة
برائحة مكانٍ آخر.`,
    },
  },
  {
    author: 'lambert',
    title: { en: 'The Ferry at Midnight', ar: 'عبّارة منتصف الليل' },
    translator: { en: 'Amel Saïdi', ar: 'أمال سعيدي' },
    translatedFrom: 'fr',
    category: 'translation',
    pages: 204,
    price: { dzd: 2100, eur: 20 },
    publishedAt: '2026-12-12',
    newRelease: true,
    cover: { motif: 'stripes', bg: '#D9E3E8', fg: '#1A2C3A', accent: '#2E6F95' },
    synopsis: {
      en: 'Two strangers share a cabin on the overnight crossing from Marseille to Algiers and tell each other the truth, because neither expects to meet again.',
      ar: 'غريبان يتقاسمان مقصورة في رحلة الليل من مرسيليا إلى الجزائر، ويصارح كلّ منهما الآخر بالحقيقة، لأن أيًّا منهما لا يتوقّع أن يلتقيا ثانية.',
    },
    excerpt: {
      en: 'On a boat, he said, nobody owes anyone their real name.',
      ar: 'قال: على متن قارب، لا يدين أحدٌ لأحد باسمه الحقيقي.',
    },
    sample: {
      en: `On a boat, he said, nobody owes anyone their real name. She agreed, and told him hers anyway. It was past midnight and the lights of Marseille had gone under the horizon an hour ago.

They sat on the floor of the cabin because the bunks were too narrow to share and too lonely to use. He had a bottle of orange juice and two plastic cups. She had a bag of almonds from her mother.`,
      ar: `قال: على متن قارب، لا يدين أحدٌ لأحد باسمه الحقيقي. وافقته، ثم أخبرته باسمها مع ذلك. كان الوقت قد تجاوز منتصف الليل، وأضواء مرسيليا قد غابت خلف الأفق منذ ساعة.

جلسا على أرضية المقصورة، لأن الأسرّة كانت أضيق من أن يتقاسماها وأكثر وحشة من أن ينام فيها أحدهما وحده. كان معه قارورة عصير برتقال وكوبان من البلاستيك، وكان معها كيس لوز من أمها.`,
    },
  },
];
