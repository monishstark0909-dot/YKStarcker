export type SeedTopic = {
	name: string;
	subtopics: string[];
};

export type SeedSubject = {
	examType: "tyt" | "ayt" | "ydt";
	code: string;
	name: string;
	sortOrder: number;
	topics: SeedTopic[];
};

export const officialSyllabus: SeedSubject[] = [
	{
		examType: "tyt",
		code: "TURKISH",
		name: "Turkish",
		sortOrder: 1,
		topics: [
			{
				name: "Grammar",
				subtopics: [
					"Parts of speech",
					"Sentence elements",
					"Word types",
					"Spelling and punctuation",
				],
			},
			{
				name: "Reading comprehension",
				subtopics: [
					"Main idea",
					"Supporting idea",
					"Paragraph structure",
					"Inference questions",
				],
			},
			{
				name: "Meaning relations",
				subtopics: [
					"Synonyms and antonyms",
					"Word meaning",
					"Context clues",
					"Sentence meaning",
				],
			},
			{
				name: "Sentence structure",
				subtopics: [
					"Sentence types",
					"Active and passive voice",
					"Causality and purpose",
					"Narration and emphasis",
				],
			},
		],
	},
	{
		examType: "tyt",
		code: "MATHEMATICS",
		name: "Basic Mathematics",
		sortOrder: 2,
		topics: [
			{
				name: "Numbers and operations",
				subtopics: [
					"Natural numbers",
					"Rational numbers",
					"Factors and multiples",
					"Ratio and proportion",
				],
			},
			{
				name: "Fractions and percentages",
				subtopics: [
					"Fraction operations",
					"Percent calculations",
					"Discount and markup",
					"Ratio problems",
				],
			},
			{
				name: "Equations and inequalities",
				subtopics: [
					"Linear equations",
					"Absolute value",
					"Inequalities",
					"Equation systems",
				],
			},
			{
				name: "Sets and logic",
				subtopics: [
					"Set operations",
					"Logic propositions",
					"Truth tables",
					"Number patterns",
				],
			},
			{
				name: "Probability and counting",
				subtopics: [
					"Permutation",
					"Combination",
					"Probability basics",
					"Data interpretation",
				],
			},
			{
				name: "Geometry basics",
				subtopics: [
					"Angles",
					"Triangles",
					"Quadrilaterals",
					"Circles",
				],
			},
		],
	},
	{
		examType: "tyt",
		code: "SOCIAL_STUDIES",
		name: "Social Studies",
		sortOrder: 3,
		topics: [
			{
				name: "History",
				subtopics: [
					"Historical method",
					"Ancient civilizations",
					"Turkish history overview",
					"Republic era basics",
				],
			},
			{
				name: "Geography",
				subtopics: [
					"Maps and coordinates",
					"Climate",
					"Population",
					"Economic activities",
				],
			},
			{
				name: "Philosophy",
				subtopics: [
					"Knowledge",
					"Existence",
					"Ethics",
					"Logic basics",
				],
			},
			{
				name: "Religion and ethics",
				subtopics: [
					"Belief concepts",
					"Worship",
					"Moral values",
					"Religion and society",
				],
			},
		],
	},
	{
		examType: "tyt",
		code: "SCIENCE",
		name: "Science",
		sortOrder: 4,
		topics: [
			{
				name: "Physics",
				subtopics: [
					"Motion",
					"Force and energy",
					"Heat and temperature",
					"Electricity",
				],
			},
			{
				name: "Chemistry",
				subtopics: [
					"Matter and its states",
					"Atomic structure",
					"Chemical reactions",
					"Mixtures and solutions",
				],
			},
			{
				name: "Biology",
				subtopics: [
					"Cell structure",
					"Cell division",
					"Genetics basics",
					"Human body systems",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "LITERATURE",
		name: "Turkish Language and Literature",
		sortOrder: 1,
		topics: [
			{
				name: "Literary terms",
				subtopics: [
					"Genres",
					"Figures of speech",
					"Meter and rhyme",
					"Narrative techniques",
				],
			},
			{
				name: "Pre-Islamic and early Turkish literature",
				subtopics: [
					"Oral tradition",
					"Divan literature overview",
					"Folk literature",
					"Poetry forms",
				],
			},
			{
				name: "Reform and republican literature",
				subtopics: [
					"Tanzimat",
					"Servet-i Funun",
					"National literature",
					"Republic era authors",
				],
			},
			{
				name: "Prose and poetry analysis",
				subtopics: [
					"Theme and tone",
					"Character and setting",
					"Poetic meaning",
					"Text interpretation",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "MATH2",
		name: "Advanced Mathematics",
		sortOrder: 2,
		topics: [
			{
				name: "Functions",
				subtopics: [
					"Domain and range",
					"Function graphs",
					"Inverse functions",
					"Composite functions",
				],
			},
			{
				name: "Polynomials and rational expressions",
				subtopics: [
					"Polynomial operations",
					"Factor theorem",
					"Rational equations",
					"Remainder theorem",
				],
			},
			{
				name: "Trigonometry",
				subtopics: [
					"Trigonometric ratios",
					"Unit circle",
					"Trigonometric identities",
					"Graphs and equations",
				],
			},
			{
				name: "Exponential and logarithmic functions",
				subtopics: [
					"Exponential growth",
					"Logarithm laws",
					"Equation solving",
					"Applications",
				],
			},
			{
				name: "Calculus",
				subtopics: [
					"Limits",
					"Continuity",
					"Derivatives",
					"Integrals",
				],
			},
			{
				name: "Sequences and probability",
				subtopics: [
					"Sequences",
					"Series",
					"Probability rules",
					"Statistics",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "PHYSICS2",
		name: "Advanced Physics",
		sortOrder: 3,
		topics: [
			{
				name: "Mechanics",
				subtopics: [
					"Kinematics",
					"Dynamics",
					"Work and energy",
					"Momentum",
				],
			},
			{
				name: "Electricity and magnetism",
				subtopics: [
					"Electric field",
					"Circuits",
					"Magnetic field",
					"Induction",
				],
			},
			{
				name: "Waves and optics",
				subtopics: [
					"Wave basics",
					"Sound",
					"Light",
					"Optical instruments",
				],
			},
			{
				name: "Modern physics",
				subtopics: [
					"Quantum basics",
					"Atomic models",
					"Nuclear physics",
					"Relativity overview",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "CHEMISTRY2",
		name: "Advanced Chemistry",
		sortOrder: 4,
		topics: [
			{
				name: "Atomic structure and periodic table",
				subtopics: [
					"Atomic models",
					"Electron configuration",
					"Periodic trends",
					"Element groups",
				],
			},
			{
				name: "Chemical bonding",
				subtopics: [
					"Ionic bonding",
					"Covalent bonding",
					"Hybridization",
					"Intermolecular forces",
				],
			},
			{
				name: "Solutions and equilibrium",
				subtopics: [
					"Solubility",
					"Colligative properties",
					"Chemical equilibrium",
					"Le Chatelier principle",
				],
			},
			{
				name: "Acids, bases and electrochemistry",
				subtopics: [
					"pH and pOH",
					"Acid-base reactions",
					"Redox reactions",
					"Electrochemical cells",
				],
			},
			{
				name: "Organic chemistry",
				subtopics: [
					"Hydrocarbons",
					"Functional groups",
					"Polymer chemistry",
					"Reaction mechanisms",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "BIOLOGY2",
		name: "Advanced Biology",
		sortOrder: 5,
		topics: [
			{
				name: "Cell biology",
				subtopics: [
					"Cell structure",
					"Membrane transport",
					"Cell division",
					"Enzymes",
				],
			},
			{
				name: "Metabolism",
				subtopics: [
					"Photosynthesis",
					"Respiration",
					"Energy transfer",
					"Metabolic pathways",
				],
			},
			{
				name: "Genetics",
				subtopics: [
					"Mendelian inheritance",
					"DNA and RNA",
					"Protein synthesis",
					"Genetic engineering",
				],
			},
			{
				name: "Human systems",
				subtopics: [
					"Digestive system",
					"Nervous system",
					"Circulatory system",
					"Endocrine system",
				],
			},
			{
				name: "Ecology and evolution",
				subtopics: [
					"Ecosystems",
					"Population dynamics",
					"Natural selection",
					"Biological diversity",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "HISTORY1",
		name: "History I",
		sortOrder: 6,
		topics: [
			{
				name: "Historical method",
				subtopics: [
					"Sources",
					"Chronology",
					"Cause and effect",
					"Historical interpretation",
				],
			},
			{
				name: "Ancient civilizations",
				subtopics: [
					"Mesopotamia",
					"Egypt",
					"Greek civilization",
					"Rome",
				],
			},
			{
				name: "Early Turkish states",
				subtopics: [
					"Central Asian states",
					"Islamic expansion",
					"Seljuks",
					"Principalities",
				],
			},
			{
				name: "Ottoman Empire",
				subtopics: [
					"Rise period",
					"Classical age",
					"Reform era",
					"Decline period",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "GEOGRAPHY1",
		name: "Geography I",
		sortOrder: 7,
		topics: [
			{
				name: "Maps and orientation",
				subtopics: [
					"Coordinates",
					"Scale",
					"Map types",
					"Location analysis",
				],
			},
			{
				name: "Climate and weather",
				subtopics: [
					"Temperature",
					"Precipitation",
					"Climate types",
					"Weather systems",
				],
			},
			{
				name: "Landforms and geology",
				subtopics: [
					"Internal forces",
					"External forces",
					"Rocks and minerals",
					"Surface forms",
				],
			},
			{
				name: "Population and economy",
				subtopics: [
					"Population distribution",
					"Migration",
					"Agriculture",
					"Industry and services",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "HISTORY2",
		name: "History II",
		sortOrder: 8,
		topics: [
			{
				name: "20th century world history",
				subtopics: [
					"World War I",
					"World War II",
					"Interwar period",
					"Cold War",
				],
			},
			{
				name: "Republic era reforms",
				subtopics: [
					"Political reforms",
					"Educational reforms",
					"Social reforms",
					"Economic reforms",
				],
			},
			{
				name: "Modern Turkish foreign policy",
				subtopics: [
					"Treaty period",
					"Regional diplomacy",
					"Alliance systems",
					"Contemporary relations",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "GEOGRAPHY2",
		name: "Geography II",
		sortOrder: 9,
		topics: [
			{
				name: "Natural systems",
				subtopics: [
					"Climate systems",
					"Water resources",
					"Soils",
					"Biomes",
				],
			},
			{
				name: "Human geography",
				subtopics: [
					"Population",
					"Urbanization",
					"Migration",
					"Settlement",
				],
			},
			{
				name: "Economic geography",
				subtopics: [
					"Agriculture",
					"Energy",
					"Transportation",
					"Trade",
				],
			},
			{
				name: "Turkey geography",
				subtopics: [
					"Regions",
					"Climate of Turkey",
					"Natural resources",
					"Regional development",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "PHILOSOPHY_GROUP",
		name: "Philosophy Group",
		sortOrder: 10,
		topics: [
			{
				name: "Philosophy",
				subtopics: [
					"Knowledge",
					"Reality",
					"Morality",
					"Politics",
				],
			},
			{
				name: "Psychology",
				subtopics: [
					"Sensation and perception",
					"Learning",
					"Memory",
					"Personality",
				],
			},
			{
				name: "Sociology",
				subtopics: [
					"Society and culture",
					"Social institutions",
					"Social change",
					"Family structure",
				],
			},
			{
				name: "Logic",
				subtopics: [
					"Propositions",
					"Arguments",
					"Fallacies",
					"Deduction and induction",
				],
			},
		],
	},
	{
		examType: "ayt",
		code: "RELIGION",
		name: "Religion and Ethics",
		sortOrder: 11,
		topics: [
			{
				name: "Belief principles",
				subtopics: [
					"Faith concepts",
					"Prophethood",
					"Afterlife",
					"Worship",
				],
			},
			{
				name: "Ethics",
				subtopics: [
					"Moral responsibility",
					"Social ethics",
					"Justice",
					"Character formation",
				],
			},
			{
				name: "Islam and civilization",
				subtopics: [
					"History of Islam",
					"Muslim scholarship",
					"Culture and society",
					"Contemporary issues",
				],
			},
		],
	},
	{
		examType: "ydt",
		code: "ENGLISH",
		name: "English",
		sortOrder: 1,
		topics: [
			{
				name: "Grammar",
				subtopics: [
					"Tenses",
					"Modals",
					"Conditionals",
					"Passive voice",
				],
			},
			{
				name: "Vocabulary",
				subtopics: [
					"Word families",
					"Collocations",
					"Synonyms",
					"Context vocabulary",
				],
			},
			{
				name: "Reading comprehension",
				subtopics: [
					"Main idea",
					"Inference",
					"Detail questions",
					"Reference questions",
				],
			},
			{
				name: "Test techniques",
				subtopics: [
					"Cloze tests",
					"Sentence completion",
					"Paragraph completion",
					"Dialogue completion",
				],
			},
			{
				name: "Translation and paraphrase",
				subtopics: [
					"Sentence translation",
					"Paragraph translation",
					"Meaning equivalence",
					"Error recognition",
				],
			},
		],
	},
];

export const demoStudentSeed = {
	email: "demo@yks.app",
	username: "demo_student",
	displayName: "Demo Student",
	password: "Password123!",
	profile: {
		examType: "ayt" as const,
		studyTrack: "sayisal",
		targetUniversity: "Bogazici University",
		targetDepartment: "Computer Engineering",
		targetRanking: 1200,
		dailyStudyGoalMinutes: 180,
		dailyQuestionGoal: 160,
		preferredStudyTime: "morning",
		timezone: "Europe/Istanbul",
		locale: "tr-TR",
	},
};

export const demoActivitySeed = {
	studySession: {
		examType: "ayt" as const,
		subjectCode: "MATH2",
		topicName: "Functions",
		subtopicName: "Function graphs",
		durationMinutes: 90,
		notes: "Focused on graph transformations and inverse functions.",
	},
	questionLog: {
		examType: "tyt" as const,
		subjectCode: "MATHEMATICS",
		topicName: "Fractions and percentages",
		subtopicName: "Percent calculations",
		questionsSolved: 40,
		correct: 34,
		wrong: 6,
		difficulty: "medium" as const,
		notes: "Mixed drill set from past papers.",
	},
	wrongQuestion: {
		examType: "tyt" as const,
		subjectCode: "TURKISH",
		topicName: "Reading comprehension",
		subtopicName: "Inference questions",
		reason: "Rushed the final paragraph and missed the author's intent.",
		difficulty: "hard" as const,
		reviewDate: "2026-07-29T09:00:00.000Z",
		status: "pending" as const,
	},
	mockExam: {
		examType: "tyt" as const,
		name: "TYT Baseline Mock",
		takenAt: "2026-07-25T14:00:00.000Z",
		overallCorrect: 88,
		overallWrong: 19,
		overallBlank: 13,
		results: [
			{
				subjectCode: "TURKISH",
				correct: 30,
				wrong: 5,
				blank: 0,
				net: "28.75",
			},
			{
				subjectCode: "MATHEMATICS",
				correct: 25,
				wrong: 8,
				blank: 7,
				net: "23.00",
			},
			{
				subjectCode: "SCIENCE",
				correct: 16,
				wrong: 3,
				blank: 5,
				net: "15.25",
			},
			{
				subjectCode: "SOCIAL_STUDIES",
				correct: 17,
				wrong: 3,
				blank: 1,
				net: "16.25",
			},
		],
	},
	plannerItem: {
		title: "Functions revision block",
		description: "Review inverse functions and graph shifts before the next mock.",
		type: "revision" as const,
		status: "planned" as const,
		scheduledFor: "2026-07-27T18:00:00.000Z",
	},
	aiInsight: {
		type: "recommendation" as const,
		title: "Push AYT Math first",
		content:
			"Recent performance suggests the next 2 study blocks should target functions and polynomial practice before expanding to calculus.",
		generatedAt: "2026-07-27T06:00:00.000Z",
	},
};
