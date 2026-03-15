# GitHub Push Anleitung

## Schritt 1: Leeres Repository auf GitHub erstellen

1. Gehe auf https://github.com/new
2. Repository name: `wttikon` (oder wie du es nennen möchtest)
3. Wähle "Public" oder "Private"
4. Klicke "Create repository" (NICHT "Add a README")

## Schritt 2: Code pushen

Öffne ein neues Terminal im Projektverzeichnis und führe diese Befehle aus:

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Wettikon Bundesliga predictions app ready for deployment"

# Branch umbenennen
git branch -M main

# Repository verbinden (ERSETZE DEIN_USERNAME mit deinem GitHub Usernamen)
git remote add origin https://github.com/DEIN_USERNAME/wttikon.git

# Auf GitHub pushen
git push -u origin main
```

## Schritt 3: Railway Deployment

Nach dem Push:
1. Gehe auf https://railway.app
2. Klicke "New Project" → "Deploy from GitHub repo"
3. Wähle das "wttikon" Repository
4. Füge diese Umgebungsvariablen hinzu:
   ```
   DATABASE_URL=file:./data/wttikon.db
   JWT_SECRET=ein-sicheres-geheimnis
   JWT_EXPIRES_IN=7d
   FOOTBALL_DATA_API_KEY=1f72e6be9dc44ef18b5d69ef1de15884
   NEXT_PUBLIC_APP_URL=https://dein-app-name.up.railway.app
   ```
5. Klicke "Deploy"

## Wichtig!

Stelle sicher, dass du die `.env` Datei NICHT mit auf GitHub pushst - sie ist bereits in der `.gitignore` enthalten.
