# Wettikon - Bundesliga Betting Analysis App

Eine moderne Full-Stack-Web-App für Bundesliga-Wettanalysen mit datengetriebenen Prognosen, Value-Bet-Erkennung und Live-Tracking.

## Features

- **KI-Prognosen**: Ensemble-Modell aus 5 Algorithmen (Logistic Regression, Random Forest, Poisson, Elo, Form)
- **Value Bet Finder**: Automatische Erkennung von Wetten mit positivem Erwartungswert
- **Live Tracking**: Echtzeit-Spielstände und dynamische Wahrscheinlichkeiten
- **Bet Tracker**: PNL-Tracking, ROI, Yield und Performance-Analyse
- **Lokale SQL-Datenbank**: SQLite mit Prisma ORM
- **User-Authentifizierung**: Lokale Auth mit JWT

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite mit Prisma ORM
- **Auth**: JWT-basiert mit bcrypt
- **Charts**: Recharts

## Installation

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

Kopiere die `.env.example` Datei und passe sie an:

```bash
cp .env.example .env
```

Bearbeite die `.env` Datei und füge deine API-Keys hinzu:

```env
# Datenbank
DATABASE_URL="file:./dev.db"

# Authentifizierung
JWT_SECRET="dein-geheimer-jwt-schluessel"
JWT_EXPIRES_IN="7d"

# Football Data API (kostenloser Key auf https://www.football-data.org/)
FOOTBALL_DATA_API_KEY="dein-api-key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Datenbank initialisieren

```bash
# Prisma Client generieren
npx prisma generate

# Migration ausführen
npx prisma migrate dev

# Seed-Daten laden
npx prisma db seed
```

Oder alternativ:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Entwicklungserver starten

```bash
npm run dev
```

Die App ist dann unter http://localhost:3000 erreichbar.

## Demo-Account

Nach dem Seeding kannst du dich mit folgenden Zugangsdaten anmelden:

- **E-Mail**: demo@wettikon.de
- **Passwort**: demo123

## Projektstruktur

```
wttikon/
├── prisma/
│   ├── schema.prisma    # Datenbankschema
│   └── seed.ts         # Seed-Daten
├── src/
│   ├── app/
│   │   ├── (auth)/     # Auth-Seiten (Login, Register)
│   │   ├── (dashboard)/ # Geschützte Dashboard-Seiten
│   │   └── api/        # API-Routen
│   ├── components/     # UI-Komponenten
│   ├── lib/            # Utilities und Services
│   │   ├── db.ts       # Prisma Client
│   │   ├── auth.ts     # Auth-Funktionen
│   │   ├── utils.ts    # Hilfsfunktionen
│   │   ├── football-api.ts # Football Data API
│   │   └── predictions.ts   # Prediction Engine
│   └── types/          # TypeScript-Typen
├── public/             # Statische Assets
└── package.json
```

## Verfügbare Scripts

```bash
# Entwicklung
npm run dev          # Startet den Dev-Server
npm run build        # Erstellt die Produktions-Version
npm run start        # Startet die Produktions-Version

# Datenbank
npm run db:generate # Generiert Prisma Client
npm run db:migrate  # Führt Migrationen aus
npm run db:push    # Pusht Schema zur DB
npm run db:seed   # Lädt Seed-Daten
npm run db:studio # Öffnet Prisma Studio

# Prediction Updates
npm run update-predictions # Aktualisiert Prognosen
```

## Prognose-Modelle

Das Ensemble-Modell kombiniert 5 verschiedene Algorithmen:

1. **Logistic Regression** (15%): Klassische statistische Methode
2. **Random Forest** (20%): Ensemble aus Entscheidungsbäumen
3. **Poisson** (25%): Torerwartungs-Modell
4. **Elo Rating** (20%): Dynamische Teamstärke
5. **Form Model** (20%): Aktuelle Spielform

Die Modelle analysieren:
- Heim- und Auswärtsleistung
- Torerwartung (xG-basiert)
- Elo-Ratings
- Formkurve (letzte 5 Spiele)
- Head-to-Head Statistiken
- Verletzungen (falls verfügbar)

## API-Endpunkte

- `POST /api/auth/register` - Registrierung
- `POST /api/auth/login` - Anmeldung
- `POST /api/auth/logout` - Abmeldung
- `GET /api/matches` - Spiele abrufen
- `GET /api/bets` - Wetten abrufen
- `POST /api/bets` - Wette erstellen
- `PATCH /api/bets/[id]` - Wette aktualisieren
- `DELETE /api/bets/[id]` - Wette löschen

## Wartung

### Daten aktualisieren

Um neue Spieltage und Prognosen zu laden:

```bash
npm run update-predictions
```

### Datenbank zurücksetzen

```bash
npx prisma migrate reset
```

## Lizenz

MIT License - nutzung für private Projekte erlaubt.

## Hinweis

Diese App ist für Bildungs- und Analysezwecke gedacht. Wetten bergen Risiken - bitte verantwusst handeln. Die Prognosen basieren auf statistischen Modellen und geben keine Gewähr für korrekte Vorhersagen.
