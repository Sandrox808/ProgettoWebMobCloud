# Progetto Applicazioni Web Mobile   

## Overwiew   
Il progetto nasce come la trasposizione in webapp di un programma per il tracciamento della responsabilità di lavapiatti di un  gruppo di persone. 

## Architettura   
### Frontend  
[...] 

### Backend 

Il server è sviluppato in Node.js utilizzando il framework Express, seguendo un'architettura RESTful e modulare. Le principali caratteristiche implementative sono:

Struttura Modulare: Separazione netta tra logica di routing (routes/), middleware di protezione (middleware/) e accesso ai dati, per garantire manutenibilità e scalabilità.

Autenticazione Stateless: Sistema di login basato su Token salvati su DB, eliminando la necessità di sessioni server-side e garantendo compatibilità con client mobile.

Sicurezza: Le password non sono salvate in chiaro ma protette tramite hashing MD5 con Salt univoco per utente e Secret globale, prevenendo attacchi hacker.

Gamification: Calcolo in tempo reale delle statistiche mensili per identificare il "Campione" (più attività) e l'"Atleta" (più salti), incentivando la partecipazione.

Cronologia Operazioni: Sistema di logging immutabile che registra ogni azione (DONE o SKIP) con timestamp e note opzionali, consultabile tramite filtri mensili.

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

### Struttura Cartelle    
```
ProgettoWeb
├───Back
│   ├───database       # Logica di connessione e file .sqlite
│   ├───middleware     # Controllori di accesso (Auth Guard)
│   ├───routes         # Endpoint API (Auth, Queue Logic)
│   ├───utils          # Funzioni crittografiche (Hash, Salt)
│   ├───.env.example   # Variabili di ambiente di Default
│   └───index.js       # Entry point del server
├───Front
└───Insp
    └───LineTrack // Inspirazione o Base di partenza 
```

