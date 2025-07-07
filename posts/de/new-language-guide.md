---
title: 'Neue Sprache hinzufügen'
postId: 'How to add language support to a blog system'
date: '2025-07-06'
author: 'Full-stack Engineer'
description: 'Dieser Leitfaden beschreibt die vereinfachten Schritte zum Hinzufügen neuer Sprachunterstützung zu Ihrem Next.js-Blog-System.'
tags: ['Leitfaden', 'Mehrsprachig', 'Konfiguration', 'Entwicklung']
---

# So fügen Sie Ihrem Blog-System neue Sprachunterstützung hinzu

Dieser Leitfaden beschreibt detailliert, wie Sie Ihrem Next.js-Blog-System neue Sprachunterstützung hinzufügen können. Mit den von uns implementierten Optimierungen wurde der gesamte Prozess erheblich vereinfacht. Sie müssen sich nur auf die folgenden Kernschritte konzentrieren.

## 1. Die zentrale Konfigurationsdatei aktualisieren (`src/lib/config.ts`)

Dies ist der erste und wichtigste Schritt zum Hinzufügen einer neuen Sprache. Sie müssen die neue Sprache in dieser Datei deklarieren und Übersetzungen für einige Kerninhalte bereitstellen.

1. **Datei öffnen**: Navigieren Sie zu `src/lib/config.ts`.
2. **`language.locales` ändern**: Fügen Sie im Array `appConfig.language.locales` den Sprachcode für Ihre neue Sprache hinzu (z.B. `'de'`, wenn Sie Deutsch hinzufügen). Stellen Sie sicher, dass der Sprachcode klein geschrieben ist.

```javascript
   // Beispiel: Hinzufügen von Deutsch 'de'
   language: {
     locales: ['en', 'zh', 'ja', 'de'], // Hier den neuen Sprachcode hinzufügen
     defaultLocale: 'zh',
     // ...
   },
```

3. **`homePage.title` aktualisieren**: Fügen Sie den Haupttitel der Startseite für die neue Sprache hinzu.

```javascript
   // Beispiel: Hinzufügen eines deutschen Titels
   homePage: {
     title: {
       zh: '我的个人博客',
       en: 'My Personal Blog',
       ja: '私の個人ブログ',
       de: 'Mein Persönlicher Blog', // Neuen deutschen Titel hinzufügen
     },
     // ...
   },
```

4. **`homePage.subtitles` aktualisieren**: Fügen Sie das Array der Startseiten-Untertitel (Schreibmaschineneffekt) für die neue Sprache hinzu.

```javascript
   // Beispiel: Hinzufügen deutscher Untertitel
   homePage: {
     // ...
     subtitles: {
       zh: [/* ... */],
       en: [/* ... */],
       ja: [/* ... */],
       de: [ // Neues Array deutscher Untertitel hinzufügen
         'Meine Gedanken, Technologie und mein Leben teilen.',
         'Code verändert die Welt, Ideen erhellen die Zukunft.',
         'Bleiben Sie neugierig, lernen Sie weiter.',
       ],
     },
   },
```

5. **`language.languageLabels` aktualisieren**: Fügen Sie den Anzeigenamen für die neue Sprache im Sprachumschalter hinzu.

```javascript
   // Beispiel: Hinzufügen des deutschen Anzeigenamens
   language: {
     // ...
     languageLabels: {
       en: 'English',
       zh: '简体中文',
       ja: '日本語',
       de: 'Deutsch', // Neuen deutschen Anzeigenamen hinzufügen
     },
   },
```

## 2. Eine neue Sprachwörterbuchdatei erstellen (`src/locales/{neuer_sprachcode}.json`)

Diese Datei enthält Übersetzungen für alle Texte in der Benutzeroberfläche Ihres Blogs.

1. **Vorhandenes Wörterbuch kopieren**: Navigieren Sie zum Verzeichnis `src/locales/`. Kopieren Sie eine vorhandene Sprachdatei (z.B. `en.json`) und benennen Sie sie in Ihren neuen Sprachcode um (z.B. `de.json`).
2. **Inhalt übersetzen**: Öffnen Sie die neu erstellte Datei `de.json` und übersetzen Sie alle Textwerte ins Deutsche.
   - **Wichtiger Hinweis**: Sie werden feststellen, dass der Abschnitt `language_switcher` jetzt nur noch den Schlüssel `label` benötigt. Dies liegt daran, dass spezifische Sprachnamen (wie "English", "简体中文") jetzt direkt aus `languageLabels` in `src/lib/config.ts` abgerufen werden, wodurch die Notwendigkeit entfällt, sie in jeder Wörterbuchdatei neu zu definieren.

```json
// src/locales/de.json Beispielstruktur
{
  "header": {
    "tags": "Tags",
    "source_code": "Quellcode",
    "toggle_theme": "Thema wechseln",
    "language_switcher_label": "Sprache"
  },
  "footer": {
    "copyright": "© {year} Mein Next.js Blog. Alle Rechte vorbehalten."
  },
  // ... Weitere übersetzte Inhalte
  "language_switcher": {
    "label": "Sprache" // Nur dies wird benötigt; spezifische Sprachnamen werden aus config.ts abgerufen
  }
  // ...
}
```

## 3. Ein neues Artikel-Sprachverzeichnis erstellen (`posts/{neuer_sprachcode}/`)

Dieses Verzeichnis speichert alle Ihre Artikel in der neuen Sprache.

1. **Verzeichnis erstellen**: Navigieren Sie zum Verzeichnis `posts/`.
2. **Neuen Ordner hinzufügen**: Erstellen Sie einen neuen Ordner mit demselben Namen wie Ihr neuer Sprachcode (z.B. `de/`).

## 4. Blog-Beiträge in der neuen Sprache hinzufügen (`posts/{neuer_sprachcode}/{ihr_artikel}.md`)

Jetzt können Sie mit dem Schreiben Ihrer Blog-Beiträge in der neuen Sprache beginnen!

1. **Artikel schreiben**: Erstellen Sie im Verzeichnis `posts/de/` Ihre Markdown-formatierte Blog-Beitragsdatei (z.B. `mein-erster-deutscher-beitrag.md`).
2. **Frontmatter**: Stellen Sie sicher, dass Ihr Artikel das korrekte `frontmatter` enthält, insbesondere das Feld `lang`, das auf den neuen Sprachcode eingestellt sein sollte. **Am wichtigsten ist, dass das Feld `postId` vorhanden und konsistent mit anderen übersetzten Versionen desselben Artikels sein muss, damit das System Übersetzungen korrekt verknüpfen kann.**

```markdown
---
title: 'Mein erster deutscher Artikel'
postId: 'my-first-post' # 👈 Wichtig: Stellen Sie sicher, dass hier postId vorhanden ist und mit anderen übersetzten Versionen desselben Artikels übereinstimmt!
date: '2025-07-06'
author: 'Ihr Name'
description: 'Dies ist ein Testartikel zum Hinzufügen von Deutsch zum Blog.'
tags: ['Deutsch', 'Test']
lang: 'de' # Stellen Sie sicher, dass dies der neue Sprachcode ist
---

# Dies ist mein erster deutscher Artikel!

Artikeltextinhalt...
```

## 5. Projekt ausführen oder neu erstellen

Nachdem Sie alle Dateiänderungen und -erstellungen abgeschlossen haben, müssen Sie den Entwicklungsserver neu starten oder Ihr Projekt neu erstellen, damit Next.js die neuen Sprachdateien und Konfigurationen erkennen und verarbeiten kann.

- **Entwicklungsmodus**: `pnpm dev` oder `npm run dev`
- **Produktions-Build**: `pnpm build` oder `npm run build`

Sobald diese Schritte abgeschlossen sind, wurde Ihr Blog-System erfolgreich um neue Sprachunterstützung erweitert, und Benutzer können die neue Sprache im Sprachumschalter auswählen und die entsprechende Benutzeroberfläche und Artikel durchsuchen!
