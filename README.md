# TimeFlow - Student App

A hybrid Android application built with WebView + HTML/CSS/JS, designed to help students manage their academic life efficiently.

## Features

- 📅 **Timetable** – View and manage your weekly class schedule
- 📝 **Notes** – Create and save study notes with persistent storage
- 🎓 **GPA Calculator** – Calculate your semester and cumulative GPA
- 📋 **Assignments** – Track assignments and deadlines
- ✅ **Attendance Tracker** – Monitor your attendance percentage per subject

## Tech Stack

- **Platform:** Android (Kotlin)
- **UI:** HTML, CSS, JavaScript (WebView hybrid)
- **Storage:** localStorage (browser-based persistent storage)
- **Min SDK:** 26 (Android 8.0)
- **Target SDK:** 34 (Android 14)

## Project Structure

```
StudentApp/
├── app/src/main/
│   ├── assets/web/          # HTML/CSS/JS frontend
│   │   ├── dashboard.html
│   │   ├── timetable.html
│   │   ├── notes.html
│   │   ├── gpa.html
│   │   ├── assignments.html
│   │   ├── tracker.html
│   │   └── app.js
│   ├── java/.../MainActivity.kt   # WebView host activity
│   └── res/                       # Android resources
├── build.gradle.kts
└── settings.gradle.kts
```

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/Tejagunupuru18/Attendence-Log.git
   ```
2. Open in **Android Studio**
3. Let Gradle sync complete
4. Run on a physical device or emulator (API 26+)

## Requirements

- Android Studio Hedgehog or later
- JDK 17+
- Android device with API 26+

## License

MIT License — free to use and modify.
