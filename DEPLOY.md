# Wettikon Deployment Anleitung

## 🚀 Deploy auf Railway (Kostenlos)

### Schritt 1: Code auf GitHub pushen

Falls noch nicht geschehen:
```bash
# Repository erstellen und Code pushen
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN_USERNAME/wttikon.git
git push -u origin main
```

### Schritt 2: Railway Projekt erstellen

1. Gehe auf [railway.app](https://railway.app) und melde dich an
2. Klicke auf "New Project"
3. Wähle "Deploy from GitHub repo"
4. Wähle dein wttikon Repository aus
5. Klicke auf "Add Variables" und füge folgende Umgebungsvariablen hinzu:

```
DATABASE_URL=file:./data/wttikon.db
JWT_SECRET=ein-sicheres-zufaelliges-geheimnis
JWT_EXPIRES_IN=7d
FOOTBALL_DATA_API_KEY=1f72e6be9dc44ef18b5d69ef1de15884
NEXT_PUBLIC_APP_URL=https://dein-app-name.up.railway.app
```

**Wichtig:** Ersetze `dein-app-name` mit dem Namen den Railway dir gibt (nach dem Deployment).

### Schritt 3: Deployment starten

1. Klicke auf "Deploy"
2. Warte bis der Build abgeschlossen ist (kann 2-3 Minuten dauern)
3. Nach dem Deployment klickst du auf die URL (z.B. `https://dein-app-name.up.railway.app`)

### Schritt 4: Datenbank mit Bundesliga-Daten füllen

Nach dem ersten Deployment musst du die Datenbank mit den Bundesliga-Daten füllen:

1. Gehe im Railway Dashboard auf dein Projekt
2. Klicke auf "Runtime" → "Open Shell"
3. Führe folgenden Befehl aus:
```bash
npx tsx src/scripts/update-predictions.ts
```

Dies lädt alle Bundesliga-Mannschaften und -Spiele herunter und generiert Vorhersagen.

### Schritt 5: Automatische Updates einrichten (optional)

Damit die Vorhersagen täglich aktualisiert werden, kannst du einen Cron-Job einrichten:

1. Gehe im Railway Dashboard auf dein Projekt
2. Klicke auf "Triggers" → "New Trigger"
3. Wähle "Cron" und stelle ihn auf täglich um 18:00 Uhr
4. Füge den Befehl hinzu: `npx tsx src/scripts/update-predictions.ts`

---

## ⚠️ Wichtige Hinweise

1. **Kostenloses Tier**: Railway's kostenloses Tier hat begrenzte Ressourcen und die App "schläft" nach 5 Minuten Inaktivität. Beim ersten Aufruf kann es daher etwas dauern.

2. **Datenbank**: Die SQLite-Datenbank wird im `data/` Verzeichnis gespeichert und bleibt zwischen Deployments erhalten.

3. **Football Data API**: Dein kostenloser API-Key hat ein Limit von 100 Anfragen pro Tag. Das sollte für den täglichen Gebrauch ausreichen.

---

## 🆘 Problemlösung

**App startet nicht?**
- Prüfe die Logs im Railway Dashboard unter "Deployments" → "View Logs"

**Datenbankfehler?**
- Stelle sicher, dass DATABASE_URL korrekt gesetzt ist
- Führe `npx prisma db push` in der Railway Shell aus

**API-Fehler?**
- Prüfe, ob FOOTBALL_DATA_API_KEY korrekt ist
- Das kostenlose API-Limit könnte erreicht sein
