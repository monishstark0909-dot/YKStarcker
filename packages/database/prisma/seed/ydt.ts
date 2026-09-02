/** @format */

export const ydtSubjects = [
	{
		code: "ENGLISH",
		name: "İngilizce (YDT)",
		slug: "ydt-english",
		color: "#14b8a6",
		icon: "Languages",
		sortOrder: 1,
		topics: [
			{
				name: "Grammar & Vocabulary",
				slug: "ydt-eng-basics",
				sortOrder: 1,
				estimatedHours: 40,
				subtopics: [
					{ name: "Kelime Bilgisi (Vocabulary)", slug: "ydt-eng-bas-vocabulary", sortOrder: 1, importance: "high", estimatedQuestionWeight: 0.15 },
					{ name: "Dilbilgisi (Tenses, Modals, Passive, Conjunctions)", slug: "ydt-eng-bas-grammar", sortOrder: 2, importance: "high", estimatedQuestionWeight: 0.20 },
					{ name: "Cloze Test", slug: "ydt-eng-bas-cloze", sortOrder: 3, importance: "high", estimatedQuestionWeight: 0.15 },
				],
			},
			{
				name: "Reading & Translation",
				slug: "ydt-eng-reading",
				sortOrder: 2,
				estimatedHours: 50,
				subtopics: [
					{ name: "Cümleyi Tamamlama (Sentence Completion)", slug: "ydt-eng-read-sentences", sortOrder: 1, importance: "high", estimatedQuestionWeight: 0.15 },
					{ name: "İngilizce-Türkçe / Türkçe-İngilizce Çeviri", slug: "ydt-eng-read-translation", sortOrder: 2, importance: "high", estimatedQuestionWeight: 0.15 },
					{ name: "Paragraf Okuma ve Anlama (Reading Passages)", slug: "ydt-eng-read-passages", sortOrder: 3, importance: "high", estimatedQuestionWeight: 0.25 },
				],
			},
			{
				name: "Dialogues & Cohesion",
				slug: "ydt-eng-skills",
				sortOrder: 3,
				estimatedHours: 40,
				subtopics: [
					{ name: "Karşılıklı Konuşma (Dialogue Completion)", slug: "ydt-eng-skl-dialogues", sortOrder: 1, importance: "medium", estimatedQuestionWeight: 0.08 },
					{ name: "Yakın Anlamlı Cümleyi Bulma (Restatement)", slug: "ydt-eng-skl-restatement", sortOrder: 2, importance: "high", estimatedQuestionWeight: 0.10 },
					{ name: "Paragraf Tamamlama (Paragraph Insertion)", slug: "ydt-eng-skl-paragraphs", sortOrder: 3, importance: "medium", estimatedQuestionWeight: 0.08 },
					{ name: "Anlam Bütünlüğünü Bozan Cümle (Irrelevant Sentence)", slug: "ydt-eng-skl-cohesion", sortOrder: 4, importance: "high", estimatedQuestionWeight: 0.10 },
				],
			},
		],
	},
];
