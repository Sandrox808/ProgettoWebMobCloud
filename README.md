# Progetto Applicazioni Web Mobile   

## Overwiew   
Il progetto nasce come la trasposizione in webapp di un programma per il tracciamento della responsabilità di lavapiatti di un gruppo di persone.
Nella sua evoluzione Cloud-Native, l'applicativo è stato architettato a microservizi (Frontend e Backend) e containerizzato tramite Docker, garantendo scalabilità, portabilità e indipendenza dall'ambiente di esecuzione

## Funzionalità

La funzionalità principale della web app è la gestione di una lista di persone per coordinare la risoluzione di un problema comune (in questo caso, i turni per lavare i piatti).

Di seguito una panoramica delle pagine principali.

#### Landing
È la prima pagina mostrata all’utente. Contiene una card introduttiva con due azioni disponibili: **Login** e **Registrati**.

#### Registrati
Permette a un nuovo utente di creare un account e, successivamente, accedere all’app.

#### Login
Permette all’utente di autenticarsi in modo sicuro e accedere alla propria area personale.

#### NamePicker
La pagina `/namePicker` è il centro operativo dell’app: mostra il giorno corrente, la persona di turno, la lista degli utenti ed i seguenti pulsanti:

1. **Lava**  
   Usato dalla persona di turno per confermare di aver svolto il compito. Il suo nome viene spostato in fondo alla lista.

2. **Vacanza**  
   Usato dalla persona di turno per indicare la sospensione temporanea dalla rotazione. Il nome viene rimosso dalla lista attiva; premendo di nuovo il pulsante, viene reinserito.

3. **Salta**  
   Può essere usato da tutti. Passa il turno alla persona successiva quando quella corrente non può svolgere il compito; il nome della persona saltata viene rimesso in testa alla lista.


## Architettura   
### Frontend  
Il frontend è sviluppato con Angular e TailwindCSS. 
La UI è composta da una Landing page con accesso a login/registrazione; dopo il login l’utente entra nella pagina di gestione dei turni (NamePicker).

In ottica Cloud-Native, il deployment avviene tramite una Docker Multi-Stage Build:

- Stage 1: Node.js compila l'applicativo TypeScript in asset statici leggeri e ottimizzati.
- Stage 2: Gli asset vengono passati ad un server web Nginx.

Nginx come Reverse Proxy: Per risolvere i problemi di CORS e isolamento nel cloud, Nginx è configurato come reverse proxy. Intercetta le chiamate in uscita verso /api/ e le inoltra automaticamente al container del backend sfruttando il DNS interno di Docker.

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

La persistenza dei dati è affidata a SQLite. Sebbene un'architettura 12-Factor pura richieda un backing service esterno, per mantenere un'infrastruttura single-host a costo zero, è stato adottato il seguente compromesso progettuale:
Il database non risiede nel container effimero, ma in un Persistent Docker Volume. Questo garantisce l'isolamento dello stato (Stateful) dall'elaborazione (Stateless), rendendo il container Node.js totalmente disposable e resiliente ai riavvii.

Schema Relazionale: Il database è normalizzato in tre tabelle principali:

- users: Credenziali, salt e token di sessione.

- queue: Stato della coda, ordine di priorità (order_num) e tracciamento dei salti recenti (last_skipped).

- history: Registro storico delle azioni compiute, con riferimenti temporali e note utente.

Sicurezza Query: Interazioni col database gestite esclusivamente tramite Prepared Statements per prevenire SQL Injection.

Integrità: Utilizzo di Foreign Keys per collegare gli utenti alla loro posizione in coda e allo storico.


## Avvio
Il progetto utilizza **Docker Compose** per l'orchestrazione single-host, garantendo l'assoluta parità tra ambiente di sviluppo e di produzione.

### Prerequisiti
Docker Engine e Docker Compose installati e in esecuzione sulla macchina host.

### Setup e Avvio
1. Clonare la repository
```
git clone https://github.com/Sandrox808/ProgettoWebMobCloud
cd ProgettoWeb
```

2. (Opzionale) Per maggiore sicurezza modificare la variabile DB_SECRET all'interno del `docker-compose.yml` per maggiore sicurezza

3. Avviare l'infrastruttura in background costruendo le immagini:
```
docker-compose up --build -d
```

4. L'applicazione sarà disponibile all'indirizzo `http://localhost:8080`

### Gestione Dati
Per spegnere i container preservando i dati nel database:
```
docker-compose down
```

Per spegnere i container e cancellare il database (pulire i volumi)
```
docker-compose down -v
```



### Struttura Cartelle    
```
ProgettoWeb
├───Back
│   ├── Dockerfile     # Immagine Alpine Node.js per il backend
│   ├───database       # Logica di connessione e file .sqlite
│   ├───middleware     # Controllori di accesso (Auth Guard)
│   ├───routes         # Endpoint API (Auth, Queue, History, Stats, User, Participants)
│   ├───utils          # Funzioni crittografiche (Hash, Salt)
│   ├───.env.example   # Variabili di ambiente di Default
│   └───index.js       # Entry point del server
├───Front
│   └───Front-app
|       ├── Dockerfile     # Multi-stage build (Angular -> Nginx)
|       ├── nginx.conf     # Configurazione Reverse Proxy e routing SPA
│       └───src
│           ├───index.htlm         # Landing Page
│           ├───app
│           │   ├───app.routes.ts          # Routing principale dell'app
│           │   ├───api.service.ts         # Servizio HTTP per chiamate API
│           │   ├───auth.guard.ts          # Protezione rotte riservate
│           │   ├───landing                # Pagina iniziale (accesso a login/registrazione)
│           │   ├───login                  # Autenticazione utente
│           │   ├───register               # Registrazione nuovo utente
│           │   ├───namePicker             # Gestione turno corrente (Lava/Vacanza/Salta)
│           │   ├───stats                  # Statistiche mensili (Campione/Atleta)
│           │   └───history                # Cronologia azioni con filtro per mese
│           └───styles.css                 # Stili globali dell'app
└───Insp
    └───LineTrack // Inspirazione o Base di partenza 
```


> **Nota sullo sviluppo**: Gran parte del codice presente in questo repository è stato generato con il supporto di strumenti di Intelligenza Artificiale. Ogni modulo è stato successivamente revisionato, testato e rifinito manualmente per garantirne la coerenza e la qualità.
