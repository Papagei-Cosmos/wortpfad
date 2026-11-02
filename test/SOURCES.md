# 来源、选择与数据许可

## 2.6 主题词书（2026-10-24）

- 19 本主题词书是对现有词条的项目语义分类，不是新引入的外部词库。分类稿仍待人工校正；全部词条复用原 ID，原来源及许可不变。原词库字段、标准答案与媒体未覆盖。
- 德语明确词表、原有中文释义规则、歧义限制和逐词归属保存在 tools/theme_books.py 与 dist/data/theme-coverage.json；没有从例句中泛搜关键词来决定整词主题。37 个原文词条及其许可继续独立保留。
- 本次轮播使用浏览器 Web Animations API 执行 1000ms 的成对水平滑动，未新增外部依赖或音效。页面与答题原有 Motion / ZzFX / WAV 使用政策不变。

## 2.5 分级阅读原句首批（2026-10-24）

- 从 [Kultur und Sprache / OeAD](https://www.kulturundsprache.at/oer) 的 8 份教学材料中选取 11 条完整原句，匹配 37 个同等级词条（A1 15、A2 8、B1 9、B2 5、C1 0）。均按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 保留材料作者、出处与许可。逐条证据与词义绑定见 tools/article-excerpts.json，阅读说明见 [文章原句_2.5.md](文章原句_2.5.md)。
- 仅摘取可归于材料作者的完整正文；外部文章引用、判断题陈述、空缺句、课堂指令与明确声明 AI 辅助生成的相关内容均未作为本批原文。材料级别由发布方标注，不冒充逐句 CEFR 认证。中文翻译、填空改编由本项目完成，按同一许可提供并标记待人工核对。
- 新增 11 个本地 Microsoft Hedda Desktop 合成朗读，共 9,688 个保存 WAV，不冒充原文章录音。原例句、原媒体、词库身份及标准答案不覆盖，学习时不联网生成。文章主例句、旧课程选句与 AI 教学句的覆盖分别统计，不以 37 个匹配宣称全库已替换。

## 2.4 分级例句首批（2026-10-24）

- 目标等级参考 [欧洲委员会 CEFR 语言范围描述](https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use)，这是课程选句／AI 编写的教学目标，未经教师逐条审定，不称为官方认证。
- 新的主例句独立保存于 teachingExamples。A1/A2 以原素材选句及显式修订为主；B1 首批 300、B2 首批 200、C1 首批 100 条逐条保存，另有原拓展示例的分级句。复用原句时保留原来源，重新编写时标 AI 教学稿及待人工核对。词义冲突的明确修正随 B1 资产保存；原字段、原例句未覆盖。
- 本批分级覆盖共 2,584 词，其余 7,205 词仍用原句且不冒称已分级。批量编写因生成服务额度限制中断；准确覆盖与剩余 ID 在 dist/data/example-level-coverage.json，不用模板套句填充完成率。
- 新填空库 cloze-leveled-bank.json 使用主例句与明确的精确目标词形，旧题库继续保留。新增 578 段保存的 Microsoft Hedda Desktop 朗读，累计 9,677 个合成 WAV；仍需人工听审，音色不随应用分发。没有在学习时新增第三方调用。

## 2.3 多等级词库（2026-10-24）

- 新来源为用户提供的四个 Anki 压缩包，不执行原卡模板。包名、SHA-256、笔记数、卡片数和媒体数见 source-data/imports/manifest.json；逐包保留原数据库、原字段、GUID 和媒体映射。共 9,769 条原笔记、18,045 个原媒体文件。B2 中文包中原 Level=C1 的 2,324 条独立为 C1；另一 B2 包仅有 9 张卡，不扩称完整词库。
- A2/B1 中文为获得用户明确授权后，从词库德语文本生成并保存的 Google 翻译稿，标记待核对；原始记录、学习记录和个人信息不在该批翻译范围。少量 AI 语义修订与教学补句保存于 tools/import-curation.json、tools/import-teaching-sentences.json 及 tools/import-teaching-extra.txt，来源另行标注。混填记录的隔离与待译处理说明见多等级词库整合_2.3.md。
- B2/C1 原中文经 [OpenCC](https://github.com/BYVoid/OpenCC) 的 TSPhrases、TSCharacters 数据转换，固定版本 bcf847cf3fbd79c74779567f9a491ea8ab878183；文件 URL、哈希及 Apache-2.0 许可在 vendor/opencc。静态分发附 OpenCC-LICENSE.txt 与清单。繁简转换不等于语义审校，原繁体字段完整保留。
- 使用已保存在本机的 [spaCy 德语模型](https://spacy.io/models/de) 离线分析原德语例句，辅助词性及实际出现词形；未上传用户记录，模型及依赖不随应用分发。推断结果与明确词库字段分别保留，仍待人工核对。
- 保存的德语 Wiktionary Flexion 资料扩展至 1,775 个词典原形，逐页来源、版本、下载哈希和许可保留在 tools/conjugations-wiktionary.json。输出 2,305 个词条的主动语态表；反身与短语适配有标记，复合过去时使用对应助动词。不含被动语态，不声称所有动词均已收录。署名及衍生数据仍按下文 CC BY-SA 4.0 条款保留。
- 现有固定表达与词族教学稿继续使用，新增原字段中的 Feminine 和 Government 分别作为女性形式及配价结构，不把语法缩写播放为词组录音。原始示例与新增 AI 教学句分开标注；填空只对保存的句子标记精确空白，包含成对连接词，不在运行时抓取文章或调用 AI。
- 原 A1 音频及全部导入媒体按字节保留。A2/B2 使用明确的单词和句子字段绑定；B1 单一音频字段的用途不明，保存原文件与引用，不冒充已审听的单词音频。另保存 Microsoft Hedda Desktop 合成 WAV 补齐练习，当前共 9,099 个，来源、真实时长、SHA-256、非静音结果及待听审状态见 dist/data/saved-synthesis-audit.json。原音色不随应用分发。

下列早期章节中的覆盖数是对应历史版本的数据；当前数量以 dist/data/import-coverage.json 与 word-content-coverage.json 为准。

读取日期：2026-10-19。原文件 SHA-256：`83d5bdb52223d6fade3c3541cc193cb577f4ba8d3b50cd34aa007f17ae5c670c`。未改动原文件、`sources/` 和已有检查产物。

| 来源 | 实际用途 | 状态／许可 |
| --- | --- | --- |
| 用户提供的 Goethe_Institute_A1_Wordlist.apk.1g | 926 原记录、英文释义、813 原句、800 MP3 | 保留全部字段、原 ID、音频引用；原分发授权未附带，当前本地使用 |
| [VittorioCai/deutsch-woerter](https://github.com/VittorioCai/deutsch-woerter) | 评估离线学习方式；starter-deck 中文精确键匹配 214 个分组 | MIT，见 vendor/deutsch-woerter-LICENSE；未复制整套应用代码 |
| [winghofeng/german-vocab-app](https://github.com/winghofeng/german-vocab-app) | 评估静态 JSON 拼写流程 | MIT；仅参考，未复制源码与教材词库 |
| [gambolputty/german-nouns](https://github.com/gambolputty/german-nouns) | nouns.csv 精确词头与词性匹配，333 个名词词形 | 源于 WiktionaryDE，CC BY-SA 4.0；原许可保留于 vendor/nouns-LICENSE；dist/data/dictionary-subset.json 为筛选衍生数据，遵循相同条款 |
| [viorelsfetea/german-verbs-database](https://github.com/viorelsfetea/german-verbs-database) | verbs.csv，144 个动词主要形式、前三个人称现在时和复数命令式 | 项目说明来自 Wiktionary；仓库未声明单独许可证。字段级保留来源。未把十列主要形式当完整变位表 |
| [Wiktionary](https://de.wiktionary.org/) | 上述结构化数据的原词典来源 | 保留来源和衍生状态；部分复数人称通过规则展开，待核对 |
| [Microsoft InkRecognitionResult](https://learn.microsoft.com/en-us/windows/win32/api/msinkaut/nn-msinkaut-iinkrecognitionresult) | 本机 Windows 德语笔迹识别 | 调用系统已安装引擎；无词条提示，无云端请求 |
| Windows System.Speech / Microsoft Hedda Desktop | 10 个德语 WAV 试听样本；原录音独立听写核对 | 本机组件；音色未捆绑到应用；试听和真实设备听感待核对 |
| [Piper](https://github.com/OHF-Voice/piper1-gpl) | 评估离线生成方案 | 未采用；已有本机德语语音，避免引入模型与 GPL 引擎 |

没有采用 Wiktextract / Kaikki 的大规模整库和额外分级表：已有 A1 来源足够，避免扩大下载和匹配成本。没有把多个完整应用合并。所有界面及学习逻辑为本轮新写的静态实现。

本轮 AI 中文、搭配和补充短句均为自动稿，语言自然度和词义适配尚需人工核对。机器匹配与规则校验不会被标记为人工已核对。原始英文释义即使有误或不完整，也完整保存在原始记录中。

首页与答题页 1.1 版参考用户提供的三张界面图片：主题轮播、词书等级切换、四模式色块和纵向学习布局。未复制图片资源；天气、职业、购物插画由本地 CSS 绘制。

1.2 版增加语境猜义和本地 Web Audio 原创奖励音效，无外部录音素材。手写候选按 Microsoft IInkRecognitionAlternates 文档调用（https://learn.microsoft.com/en-us/windows/win32/api/msinkaut/nn-msinkaut-iinkrecognitionalternates），原始首选与单行候选均不使用当前标准答案提示。

## 1.7 交互与音效来源（2026-10-22）

- Motion 14.6.0：MIT，官方 npm 包，经 SHA-512 完整性核对；本地保存于 dist/vendor/motion-14.6.0.js，不依赖运行时 CDN。来源 https://github.com/motiondivision/motion 。
- ZzFX 1.4.0：MIT，https://github.com/KilledByAPixel/ZzFX 。保留许可证；仅将自动创建 AudioContext 改为由宿主管理，离线工具使用 buildSamples，不改音色算法。
- Random90／Random82：用户在本会话明确提供的参数，不是固定的公共预设编号。两个 WAV 由 tools/generate_feedback.mjs 生成，空参数沿用默认值；ZzFX 默认轻微随机音高在离线生成时固定一次，确保结果可重复。参数和哈希见 dist/audio/feedback/manifest.json。
- success.wav：来自用户提供的 pickupCoin (1).wav，按原字节复制，未修改音色。该用户文件不冒称适用代码库的 MIT 许可证。
- 库文件、版本、来源、哈希和修改情况见 dist/vendor/manifest.json；两份 MIT 许可证一起保留。

## 2.0 试学词库精修（2026-10-23）

- 30 词覆盖的原英文、47 个词义记录、47 条原句全部保留。中文由 AI 按原词义与原句逐项修订，新增／修订搭配是 AI 教学稿，不冒称词典例句或人工审核稿。
- 名词词形与动词主要形式优先复用已保存的 german-nouns 与 german-verbs-database 结构化数据。新增带冠词格表为词典词形＋冠词规则组合，仍待人工确认；没有声称完整动词变位表已完成。
- 本轮实际在线重点查阅 Wiktionary 的 Auto、Wasser、Arbeit、gern、gehen、antworten、treffen、fahren、bitte、gut、aufstehen、auf 条目，以及 Duden 的介词语法说明（https://www.duden.de/sprachwissen/fuer-lernende/wortarten-pr%C3%A4positionen）。每个试学词条保留对应的 Wiktionary 参考链接；不将未逐页在线读取的其他参考链接冒称本轮已在线审核。
- 重点修改：Auto 选择汽车义的 Autos 词形；Wasser 的日常水义与特殊复数分开；Arbeit 的一般工作义与复数用法区分；gehen 的例句按具体词义显示选项；auf 的原英文 until 仅保留在原字段，固定告别语不直译该标签。
- Wiktionary 词形衍生字段继续沿用 CC BY-SA 4.0 来源标记和许可文件；中文 AI 稿与原牌组内容分别标记，不将整个原牌组素材改标为 MIT。
- 新增 104 个 WAV（加上此前 10 个，共 114 个保存合成文件），引擎为 Windows System.Speech，音色 Microsoft Hedda Desktop，速率 -1。未下载、捆绑音色模型。实际文本、时长、采样率、SHA-256、音量与人工听审待确认状态见 dist/data/saved-synthesis-audit.json。
- 原 800 MP3 不变。本轮 5 段独立德语转写抽查仅比较音频内容，不算人工听审或母语发音验收，见 tests/audio-seed-spot-results.json。

## 2.1 全 A1 扩展（2026-10-24）

- 766 条缺失原例句中文、129 条缺失词义中文为 AI 根据保存的原德语和语境直接修订，非人工审核。所有原德语、英文、记录 ID、标准答案和音频引用完整保留。171 条新增语境用法是原句启发的教学稿，不冒称词典原句或已验证固定搭配。
- 本轮重点查阅 [Duden Milch](https://www.duden.de/rechtschreibung/Milch) 的普通物质义与专业复数区别、[Duden Stockwerk](https://www.duden.de/rechtschreibung/Stockwerk) 和 [Wiktionary Stock](https://de.wiktionary.org/wiki/Stock) 的楼层／棍棒义区别；[GfdS möchten 与 mögen](https://gfds.de/unterschied-zwischen-moechten-und-moegen/)、[Duden mögen](https://www.duden.de/rechtschreibung/moegen) 及 [LEO 的 möchten 语法](https://dict.leo.org/grammatik/deutsch/Wort/Verb/VollHilfModal/moegen.xml?lang=de) 用于第二虚拟式及过去愿望表达的说明。这里只概括用法，不复制词典长段文字。
- 新增名词含冠词格表由已保存的 Wiktionary 衍生词形与冠词规则组合；少量语境修正另标 AI 状态。原词典子集仍单独保留。新增显式比较形式为 AI 教学稿，待人工核对，不声称来自未读取的逐词在线词典。
- 开发期下载 [Helsinki-NLP/opus-mt-de-ZH](https://huggingface.co/Helsinki-NLP/opus-mt-de-ZH)（模型卡 Apache-2.0）进行离线翻译抽查，因语境质量不足而未导入其翻译输出；[spaCy 德语模型](https://spacy.io/models/de) 仅用于生成短语候选，导入候选另经 AI 筛选与改写。模型固定下载版本及文件校验记录在 D 盘 work/a1-enrichment/models 的清单中。模型和开发依赖不随网页／源码压缩包分发。
- 保存合成文件从 114 增至 1736，共新增 1622 个。原 800 MP3 不变；Windows 音色未打包。独立机器听写九段的实际结果见 tests/audio-a1-spot-results.json，包含数字转写差异与 Er／der 不确定项；全部仍待人工听审。

## 2.2 四标签、变位与语境填空（2026-10-24）

- 从德语 Wiktionary 的 Flexion 命名空间保存 138 个词典原形的主动语态变位资料，例如 [arbeiten](https://de.wiktionary.org/wiki/Flexion:arbeiten)、[aufstehen](https://de.wiktionary.org/wiki/Flexion:aufstehen)、[ausziehen](https://de.wiktionary.org/wiki/Flexion:ausziehen) 和 [mögen](https://de.wiktionary.org/wiki/Flexion:m%C3%B6gen)。逐页 URL、页面版本号、下载 HTML 的 SHA-256 和许可见 tools/conjugations-wiktionary.json；各词条 conjugation.source 保留对应署名链接与版本。Wiktionary 各条目贡献者为来源作者，链接页面的历史可追溯贡献者。
- 词典变位衍生数据按 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 提供，完整许可在 dist/data/CC-BY-SA-4.0.txt。处理包括 HTML 表格解析、去除人称前缀、显式排除部分标为过时的有限动词形式，以及反身代词、Rad fahren、weh tun 和 an sein 等短语适配。möchten 明确映射为 mögen 的第二虚拟式。输出 147 个词条的主动语态表，不含被动语态；自动解析与改编仍待人工核对。
- 固定词组及同词族关系是独立保存的 AI 教学稿，不冒称从词典逐句摘录或人工审核。重点核对 [Duden Bezug](https://www.duden.de/rechtschreibung/Bezug) 的 in Bezug auf、[kommunizieren](https://www.duden.de/rechtschreibung/kommunizieren) 与 [Kommunikation](https://www.duden.de/rechtschreibung/Kommunikation) 的词形关系；未复制词典长段定义。对应扩展规则保留在 tools/fixed-phrases.txt 与 tools/word-families.json，未新增当前 A1 词条或变动原答案。
- 885 道填空优先从已保存的原牌组例句／此前教学例句中标记精确空白，不改写原句；对应 noteId 和来源类别保存在 dist/data/cloze-bank.json。39 条填空专用补充句保存于 tools/cloze-supplements.txt，标记为 AI 教学稿。中文情境沿用现有译文或该补充句的保存译文。没有另外抓取商业文章，没有在学习时发送 AI 请求。
- 本次新增 220 个 Microsoft Hedda Desktop 合成 WAV，累计 1956 个。逐文本文件、时长、SHA-256、非静音检查与待人工听审状态更新在 dist/data/saved-synthesis-audit.json。Windows 音色及词典原网页缓存不随应用分发；原 800 MP3 和用户成功音效保持原字节。
