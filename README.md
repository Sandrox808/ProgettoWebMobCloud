# Progetto Applicazioni Web Mobile   

## Overwiew   
Il progetto nasce come la trasposizione in webapp di un programma per il tracciamento della responsabilità di lavapiatti di un  gruppo di persone. 

## Architettura   
### Frontend  
Il frontend è sviluppato con Angular e TailwindCSS e comunica con il backend tramite API REST (proxy `/api` in sviluppo).  
La UI è composta da una Landing page con accesso a login/registrazione; dopo il login l’utente entra nella pagina di gestione dei turni (NamePicker).

Dettagli tecnici:
- Componenti **standalone** con file separati (`.ts`, `.html`, `.css`) per ogni pagina.
- Routing centralizzato in `app.routes.ts` con `router-outlet` in `app.html`.
- Chiamate HTTP centralizzate in `ApiService` (auth, queue, actions, vacation).
- Token persistito in `localStorage` e passato nell’header `Authorization`.
- Stili UI gestiti con classi utility di Tailwind.

### Backend 

Il server è sviluppato in Node.js utilizzando il framework Express, seguendo un'architettura RESTful e modulare. Le principali caratteristiche implementative sono:

Struttura Modulare: Separazione netta tra logica di routing (routes/), middleware di protezione (middleware/) e accesso ai dati, per garantire manutenibilità e scalabilità.

Autenticazione Stateless: Sistema di login basato su Token salvati su DB, eliminando la necessità di sessioni server-side e garantendo compatibilità con client mobile.

Sicurezza: Le password non sono salvate in chiaro ma protette tramite hashing MD5 con Salt univoco per utente e Secret globale, prevenendo attacchi hacker.

Gamification: Calcolo in tempo reale delle statistiche mensili per identificare il "Campione" (più attività) e l'"Atleta" (più salti), incentivando la partecipazione.

Cronologia Operazioni: Sistema di logging immutabile che registra ogni azione (DONE o SKIP) con timestamp e note opzionali, consultabile tramite filtri mensili.

Modalità Vacanza: Sistema di gestione stato utente (`is_on_vacation`). Gli utenti in vacanza mantengono la loro posizione in classifica ma vengono "scavalcati" automaticamente dalla logica dei turni senza perdere la priorità al rientro.

Logica di Coda Avanzata:

- Skip Intelligente: Algoritmo di "salto turno" con cooldown temporale (30 min) per evitare loop infiniti di scambi tra utenti assenti.

- Queue Normalization: Ricalcolo automatico degli indici d'ordine (1, 2, 3...) ad ogni completamento per mantenere la consistenza numerica della lista.

Limitazioni: 

- Performance: La rinumerazione automatica della coda avviene ad ogni azione, ottimizzata per gruppi medio-piccoli, con l'aumento di utenti le performance rallentano.

- Blocco Preventivo: Lo skip del turno di TUTTI i partecipanti (assenza totale) non modifica la lista per evitare loop infiniti.

### Database   

La persistenza dei dati è affidata a SQLite, scelto per la sua portabilità (file-based) e affidabilità.

Schema Relazionale: Il database è normalizzato in due tabelle principali:

- users: Credenziali, salt e token di sessione.

- queue: Stato della coda, ordine di priorità (order_num) e tracciamento dei salti recenti (last_skipped).

- history: Registro storico delle azioni compiute, con riferimenti temporali e note utente.

Sicurezza Query: Interazioni col database gestite esclusivamente tramite Prepared Statements per prevenire SQL Injection.

Integrità: Utilizzo di Foreign Keys per collegare gli utenti alla loro posizione in coda e allo storico.


### Configurazione e Setup Backend

Dopo aver clonato il progetto, rinominare il file '.env.example' in '.env'.
(Opzionale) Modificare DB_SECRET con una stringa a piacere per maggiore sicurezza.

Per installare le dipendenze eseguire nel terminale (Windows):

    cd Back
    npm install

Per avviare il backend:

    npm start

### Avvio Frontend (Angular)

Per installare le dipendenze:

    cd Front\Front-app
    npm install

Per avviare il frontend con proxy (necessario per evitare CORS):

    ng serve --proxy-config proxy.config.json


### Struttura Cartelle    
```
ProgettoWeb
├───Back
│   ├───database       # Logica di connessione e file .sqlite
│   ├───middleware     # Controllori di accesso (Auth Guard)
│   ├───routes         # Endpoint API (Auth, Queue, History, Stats, User, Participants)
│   ├───utils          # Funzioni crittografiche (Hash, Salt)
│   ├───.env.example   # Variabili di ambiente di Default
│   └───index.js       # Entry point del server
├───Front
│   └───Front-app
│       ├───proxy.config.json   # Proxy Angular per evitare CORS
│       └───src
│           ├───app
│           │   ├───app.routes.ts          # Routing principale
│           │   ├───api.service.ts         # Chiamate API centralizzate
│           │   ├───landing                # Pagina iniziale
│           │   ├───login                  # Login + token
│           │   ├───register               # Registrazione
│           │   └───namePicker             # Turno corrente + azioni Salta/Lavato
│           └───styles.css                 # Tailwind import
└───Insp
    └───LineTrack // Inspirazione o Base di partenza 
```
