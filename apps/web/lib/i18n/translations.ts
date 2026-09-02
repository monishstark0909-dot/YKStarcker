/** @format */

export type Language = "en" | "tr";

export interface Translations {
	// Navigation
	nav_dashboard: string;
	nav_subjects: string;
	nav_focus_timer: string;
	nav_planner: string;
	nav_goals: string;
	nav_mock_exams: string;
	nav_analytics: string;
	nav_leaderboard: string;
	nav_members: string;
	nav_settings: string;
	nav_spotify: string;
	nav_friends: string;
	nav_profile: string;

	// AppShell Header & Common
	search_placeholder: string;
	language_label: string;
	student_role: string;
	logout: string;
	loading: string;
	error: string;
	success: string;

	// Focus Center / Pomodoro
	focus_title: string;
	focus_subtitle: string;
	focus_settings_button: string;
	focus_session: string;
	short_break: string;
	long_break: string;
	custom_preset: string;
	focus_minutes_label: string;
	break_minutes_label: string;
	start_button: string;
	pause_button: string;
	resume_button: string;
	reset_button: string;
	skip_break_button: string;
	running_status: string;
	paused_status: string;
	ready_status: string;
	current_session_target: string;
	subject_select_label: string;
	topic_select_label: string;
	subtopic_select_label: string;
	estimated_goal_label: string;
	questions_solved_label: string;
	todays_focus_summary: string;
	todays_study_time: string;
	completed_pomodoros: string;
	longest_session: string;
	current_streak: string;
	weekly_focus: string;
	monthly_focus: string;
	recent_focus_sessions: string;
	auto_tracked: string;
	no_recent_sessions: string;
	col_date: string;
	col_subject: string;
	col_topic_details: string;
	col_duration: string;
	col_questions: string;

	// Settings Drawer
	drawer_title: string;
	drawer_subtitle: string;
	timer_automation: string;
	auto_start_breaks: string;
	auto_start_breaks_desc: string;
	auto_start_next: string;
	auto_start_next_desc: string;
	sound_alerts: string;
	ring_chime: string;
	ring_chime_desc: string;
	alert_volume: string;
	ambient_sounds: string;
	ambient_volume: string;
	sound_off: string;
	sound_rain: string;
	sound_ocean: string;
	sound_forest: string;
	sound_cafe: string;
	sound_white_noise: string;
	done_button: string;

	// Dashboard
	dashboard_title: string;
	dashboard_subtitle: string;
	days_streak: string;
	daily_target: string;
	weekly_hours: string;
	solved_questions: string;
	accuracy_rate: string;
	ai_insights_title: string;
	ai_insights_desc: string;
	ai_refresh_button: string;
	recent_activity_title: string;
	countdown_title: string;

	// Subjects Workspace
	subjects_title: string;
	subjects_subtitle: string;
	search_subjects: string;
	all_subjects: string;
	syllabus_progress: string;
	topics_list: string;
	subtopics_list: string;
	start_study_timer: string;
	manual_log_session: string;
	questions_log: string;
	wrong_questions_log: string;
	confidence_rating: string;
	personal_notes: string;
	mark_completed: string;
	mark_in_progress: string;
}

export const dictionary: Record<Language, Translations> = {
	en: {
		// Navigation
		nav_dashboard: "Dashboard",
		nav_subjects: "Subjects",
		nav_focus_timer: "Focus Timer",
		nav_planner: "Planner",
		nav_goals: "Goals",
		nav_mock_exams: "Mock Exams",
		nav_analytics: "Analytics",
		nav_leaderboard: "Leaderboard",
		nav_members: "Members",
		nav_settings: "Settings",
		nav_spotify: "Spotify",
		nav_friends: "Friends",
		nav_profile: "Profile",

		// AppShell & Common
		search_placeholder: "Search subjects, topics, or features...",
		language_label: "Language",
		student_role: "YKS Candidate",
		logout: "Sign Out",
		loading: "Loading...",
		error: "An error occurred",
		success: "Operation successful",

		// Focus Center / Pomodoro
		focus_title: "Focus Timer",
		focus_subtitle: "Stay focused and automatically track your study sessions.",
		focus_settings_button: "Settings",
		focus_session: "Focus Session",
		short_break: "Short Break",
		long_break: "Long Break",
		custom_preset: "Custom",
		focus_minutes_label: "Focus (m)",
		break_minutes_label: "Break (m)",
		start_button: "Start",
		pause_button: "Pause",
		resume_button: "Resume",
		reset_button: "Reset",
		skip_break_button: "Skip Break",
		running_status: "Running",
		paused_status: "Paused",
		ready_status: "Ready",
		current_session_target: "Current Session Target",
		subject_select_label: "Subject",
		topic_select_label: "Topic",
		subtopic_select_label: "Subtopic",
		estimated_goal_label: "Estimated Goal",
		questions_solved_label: "Questions",
		todays_focus_summary: "Today's Focus Summary",
		todays_study_time: "Today's Study Time",
		completed_pomodoros: "Completed Pomodoros",
		longest_session: "Longest Session",
		current_streak: "Current Streak",
		weekly_focus: "Weekly Focus",
		monthly_focus: "Monthly Focus",
		recent_focus_sessions: "Recent Focus Sessions",
		auto_tracked: "Automatically tracked",
		no_recent_sessions: "No focus sessions logged yet today. Select a target and start your timer!",
		col_date: "Date",
		col_subject: "Subject",
		col_topic_details: "Topic / Details",
		col_duration: "Duration",
		col_questions: "Questions",

		// Settings Drawer
		drawer_title: "Focus Settings",
		drawer_subtitle: "Personalize your focus environment & timer automation.",
		timer_automation: "Timer Automation",
		auto_start_breaks: "Auto Start Breaks",
		auto_start_breaks_desc: "Automatically begin break when focus timer completes",
		auto_start_next: "Auto Start Next Session",
		auto_start_next_desc: "Automatically resume focus mode after break ends",
		sound_alerts: "Sound Alerts",
		ring_chime: "Completion Ring Chime",
		ring_chime_desc: "Play audible sound when focus block completes",
		alert_volume: "Alert Volume",
		ambient_sounds: "Background Sounds",
		ambient_volume: "Ambient Volume",
		sound_off: "Off",
		sound_rain: "Rain",
		sound_ocean: "Ocean Waves",
		sound_forest: "Forest Wind",
		sound_cafe: "Cafe Atmosphere",
		sound_white_noise: "White Noise",
		done_button: "Done",

		// Dashboard
		dashboard_title: "Dashboard",
		dashboard_subtitle: "Track your YKS preparation progress and daily study metrics.",
		days_streak: "Days Streak",
		daily_target: "Daily Goal",
		weekly_hours: "Weekly Study",
		solved_questions: "Questions Solved",
		accuracy_rate: "Accuracy Rate",
		ai_insights_title: "AI Coach Insights",
		ai_insights_desc: "Personalized study recommendations generated based on your accuracy and study patterns.",
		ai_refresh_button: "Refresh Recommendations",
		recent_activity_title: "Recent Activity",
		countdown_title: "Exam Countdown",

		// Subjects Workspace
		subjects_title: "Subjects Workspace",
		subjects_subtitle: "Explore syllabus coverage, topic mastery, and subtopic notes.",
		search_subjects: "Search subjects or topics...",
		all_subjects: "All Subjects",
		syllabus_progress: "Syllabus Progress",
		topics_list: "Topics",
		subtopics_list: "Subtopics",
		start_study_timer: "Start Focus Timer",
		manual_log_session: "Log Manual Session",
		questions_log: "Log Solved Questions",
		wrong_questions_log: "Report Wrong Question",
		confidence_rating: "Confidence Level",
		personal_notes: "Personal Notes & Hacks",
		mark_completed: "Mark as Completed",
		mark_in_progress: "Mark In Progress",
	},
	tr: {
		// Navigation
		nav_dashboard: "Kontrol Paneli",
		nav_subjects: "Dersler",
		nav_focus_timer: "Odak Zamanlayıcısı",
		nav_planner: "Planlayıcı",
		nav_goals: "Hedefler",
		nav_mock_exams: "Deneme Sınavları",
		nav_analytics: "Analizler",
		nav_leaderboard: "Liderlik Tablosu",
		nav_members: "Çalışma Grubu",
		nav_settings: "Ayarlar",
		nav_spotify: "Spotify",
		nav_friends: "Arkadaşlar",
		nav_profile: "Profil",

		// AppShell & Common
		search_placeholder: "Ders, konu veya özellik ara...",
		language_label: "Dil",
		student_role: "YKS Adayı",
		logout: "Çıkış Yap",
		loading: "Yükleniyor...",
		error: "Bir hata oluştu",
		success: "İşlem başarılı",

		// Focus Center / Pomodoro
		focus_title: "Odak Zamanlayıcısı",
		focus_subtitle: "Odaklanın ve çalışma oturumlarınızı otomatik olarak takip edin.",
		focus_settings_button: "Ayarlar",
		focus_session: "Odak Oturumu",
		short_break: "Kısa Mola",
		long_break: "Uzun Mola",
		custom_preset: "Özel",
		focus_minutes_label: "Odak (dk)",
		break_minutes_label: "Mola (dk)",
		start_button: "Başlat",
		pause_button: "Duraklat",
		resume_button: "Devam Et",
		reset_button: "Sıfırla",
		skip_break_button: "Molayı Atla",
		running_status: "Çalışıyor",
		paused_status: "Duraklatıldı",
		ready_status: "Hazır",
		current_session_target: "Mevcut Oturum Hedefi",
		subject_select_label: "Ders",
		topic_select_label: "Konu",
		subtopic_select_label: "Alt Konu",
		estimated_goal_label: "Tahmini Hedef",
		questions_solved_label: "Soru Sayısı",
		todays_focus_summary: "Bugünün Odak Özeti",
		todays_study_time: "Bugünkü Çalışma Süresi",
		completed_pomodoros: "Tamamlanan Pomodoro",
		longest_session: "En Uzun Oturum",
		current_streak: "Mevcut Seri",
		weekly_focus: "Haftalık Odak",
		monthly_focus: "Aylık Odak",
		recent_focus_sessions: "Son Odak Oturumları",
		auto_tracked: "Otomatik kaydedildi",
		no_recent_sessions: "Bugün henüz odak oturumu kaydedilmedi. Bir hedef seçin ve zamanlayıcıyı başlatın!",
		col_date: "Tarih",
		col_subject: "Ders",
		col_topic_details: "Konu / Detaylar",
		col_duration: "Süre",
		col_questions: "Sorular",

		// Settings Drawer
		drawer_title: "Odak Ayarları",
		drawer_subtitle: "Odaklanma ortamınızı ve zamanlayıcı otomasyonunu kişiselleştirin.",
		timer_automation: "Zamanlayıcı Otomasyonu",
		auto_start_breaks: "Molaları Otomatik Başlat",
		auto_start_breaks_desc: "Odak zamanlayıcısı bittiğinde molayı otomatik olarak başlatır",
		auto_start_next: "Sonraki Oturumu Otomatik Başlat",
		auto_start_next_desc: "Mola bittiğinde odak modunu otomatik olarak tekrar başlatır",
		sound_alerts: "Sesli Uyarılar",
		ring_chime: "Tamamlama Bitiş Zili",
		ring_chime_desc: "Odak bloğu tamamlandığında işitilebilir zil çalar",
		alert_volume: "Zil Sesi Seviyesi",
		ambient_sounds: "Arka Plan Sesleri",
		ambient_volume: "Arka Plan Ses Seviyesi",
		sound_off: "Kapalı",
		sound_rain: "Yağmur",
		sound_ocean: "Okyanus Dalgası",
		sound_forest: "Orman Rüzgarı",
		sound_cafe: "Kafeterya Sesi",
		sound_white_noise: "Beyaz Gürültü",
		done_button: "Tamam",

		// Dashboard
		dashboard_title: "Kontrol Paneli",
		dashboard_subtitle: "YKS hazırlık ilerlemenizi ve günlük çalışma istatistiklerinizi takip edin.",
		days_streak: "Günlük Seri",
		daily_target: "Günlük Hedef",
		weekly_hours: "Haftalık Çalışma",
		solved_questions: "Çözülen Soru",
		accuracy_rate: "Doğruluk Oranı",
		ai_insights_title: "Yapay Zeka Koç Önerileri",
		ai_insights_desc: "Doğruluk oranınıza ve çalışma alışkanlıklarınıza göre kişiselleştirilmiş ders tavsiyeleri.",
		ai_refresh_button: "Önerileri Yenile",
		recent_activity_title: "Son Aktiviteler",
		countdown_title: "Sınav Geri Sayımı",

		// Subjects Workspace
		subjects_title: "Dersler Çalışma Alanı",
		subjects_subtitle: "Müfredat kapsamını, konu hakimiyetini ve alt konu notlarını keşfedin.",
		search_subjects: "Ders veya konu ara...",
		all_subjects: "Tüm Dersler",
		syllabus_progress: "Müfredat İlerlemesi",
		topics_list: "Konular",
		subtopics_list: "Alt Konular",
		start_study_timer: "Odak Zamanlayıcısını Başlat",
		manual_log_session: "Manuel Oturum Ekle",
		questions_log: "Çözülen Soru Ekle",
		wrong_questions_log: "Yanlış Soru Bildir",
		confidence_rating: "Güven Seviyesi",
		personal_notes: "Kişisel Notlar ve İpuçları",
		mark_completed: "Tamamlandı Olarak İşaretle",
		mark_in_progress: "Devam Ediyor İşaretle",
	},
};
