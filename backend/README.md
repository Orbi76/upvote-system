# 🚀 Upvote System - Webes Szavazórendszer

Egy teljes körű webes upvote rendszer Spring Boot backend és React frontend alkalmazással, amely lehetővé teszi felhasználók számára ötletek beküldését és szavazást, admin jóváhagyással.

## 📋 Tartalomjegyzék

- [Funkcionalitás](#funkcionalitás)
- [Technológiai Stack](#technológiai-stack)
- [Előfeltételek](#előfeltételek)
- [Telepítés és Futtatás](#telepítés-és-futtatás)
    - [Docker Compose (Ajánlott)](#1-docker-compose-ajánlott)
    - [Helyi Fejlesztés](#2-helyi-fejlesztés)
- [API Dokumentáció](#api-dokumentáció)
- [Tesztelés](#tesztelés)
- [Projekt Struktúra](#projekt-struktúra)
- [Biztonsági Beállítások](#biztonsági-beállítások)

---

## 🎯 Funkcionalitás

### Szavazó (USER) szerepkör:
- ✅ Regisztráció és bejelentkezés
- ✅ Új ötlet beküldése (admin jóváhagyásra vár)
- ✅ Jóváhagyott ötletek megtekintése
- ✅ Szavazás ötletekre (session-önként egyszer)

### Adminisztrátor (ADMIN) szerepkör:
- ✅ Bejelentkezés előre definiált fiókkal
- ✅ Új ötletek megtekintése és kezelése
- ✅ Ötletek jóváhagyása vagy elutasítása
- ✅ Szavazatok állásának megtekintése
- ❌ Nem szavazhat (csak felügyel)

---

## 🛠️ Technológiai Stack

### Backend:
- **Java 17**
- **Spring Boot 3.2.0**
    - Spring Security (Basic Authentication)
    - Spring Data JPA
    - Spring Web
    - Spring Validation
- **PostgreSQL** (production)
- **H2** (development/testing)
- **Maven** (build tool)
- **Swagger/OpenAPI** (API dokumentáció)
- **JUnit 5 & Mockito** (tesztelés)

### Frontend:
- **React 18**
- **Axios** (HTTP kligens)
- **Tailwind CSS** (styling)
- **React Router** (routing - opcionális)

### DevOps:
- **Docker & Docker Compose**
- **Nginx** (production web szerver)

---

## 📦 Előfeltételek

### Docker Compose futtatáshoz:
- Docker Desktop (Windows/Mac) vagy Docker Engine + Docker Compose (Linux)

### Helyi fejlesztéshez:
- **Java 17** vagy újabb
- **Maven 3.8+**
- **Node.js 18+** és **npm**
- **PostgreSQL 15** (vagy Docker-ben futtatva)

---

## 🚀 Telepítés és Futtatás

### 1. Docker Compose (Ajánlott)

Ez a legegyszerűbb módszer az alkalmazás futtatására mindhárom szolgáltatással (PostgreSQL, Backend, Frontend):

```bash
# 1. Klónozd a projektet
git clone <repository-url>
cd upvote-system

# 2. Építsd és indítsd az összes szolgáltatást
docker-compose up --build

# 3. Várd meg, amíg az összes szolgáltatás elindul (1-2 perc)
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

**Szolgáltatások leállítása:**
```bash
docker-compose down

# Adatbázis adatok törlése is:
docker-compose down -v
```

---

### 2. Helyi Fejlesztés

#### A. PostgreSQL indítása Docker-ben:

```bash
docker run --name upvote-postgres \
  -e POSTGRES_DB=upvote_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

#### B. Backend futtatása:

```bash
cd backend

# Maven build
mvn clean install

# Alkalmazás indítása
mvn spring-boot:run

# VAGY közvetlenül a JAR futtatása
java -jar target/upvote-1.0.0.jar
```

A backend elérhető: `http://localhost:8080`

#### C. Frontend futtatása:

```bash
cd frontend

# Függőségek telepítése
npm install

# Development szerver indítása
npm start
```

A frontend elérhető: `http://localhost:3000`

---

## 📚 API Dokumentáció

### Swagger UI:
Az API teljes dokumentációja elérhető itt: **http://localhost:8080/swagger-ui.html**

### Főbb végpontok:

#### Autentikáció:
```
POST   /api/auth/register    - Új felhasználó regisztrációja
GET    /api/auth/me          - Aktuális felhasználó adatai (Basic Auth)
```

#### Ötletek (USER):
```
POST   /api/ideas            - Új ötlet beküldése
GET    /api/ideas            - Jóváhagyott ötletek listája
POST   /api/ideas/{id}/vote  - Szavazás ötletre
```

#### Admin funkciók (ADMIN):
```
GET    /api/ideas/pending      - Jóváhagyásra váró ötletek
POST   /api/ideas/{id}/approve - Ötlet jóváhagyása
DELETE /api/ideas/{id}         - Ötlet törlése
```

### Basic Authentication:

Az API minden védett végpontja Basic Authentication-t használ:
```
Authorization: Basic base64(username:password)
```

**Példa curl-lel:**
```bash
# Bejelentkezés admin-ként
curl -u admin:admin http://localhost:8080/api/ideas/pending

# Új ötlet beküldése user-ként
curl -u testuser:test123 -X POST http://localhost:8080/api/ideas \
  -H "Content-Type: application/json" \
  -d '{"title":"Új ötlet","description":"Leírás"}'
```

---

## 🧪 Tesztelés

### Backend tesztek futtatása:

```bash
cd backend

# Összes teszt futtatása
mvn test

# Csak unit tesztek
mvn test -Dtest=*ServiceTest

# Csak integrációs tesztek
mvn test -Dtest=*IntegrationTest

# Test coverage riport
mvn test jacoco:report
```

### Teszt lefedettség:
- ✅ Unit tesztek a Service réteghez
- ✅ Integrációs tesztek a Controller végpontokhoz
- ✅ Autentikációs és autorizációs tesztek
- ✅ Validációs tesztek

---

## 📂 Projekt Struktúra

```
upvote-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/gabor/upvote/
│   │   │   │   ├── config/           # Security, Swagger konfig
│   │   │   │   ├── controller/       # REST API végpontok
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── model/            # JPA entitások
│   │   │   │   ├── repository/       # Spring Data JPA
│   │   │   │   └── service/          # Üzleti logika
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/                     # Tesztek
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/               # React komponensek
│   │   ├── services/                 # API integrációk
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔒 Biztonsági Beállítások

### Alapértelmezett Felhasználók:

A rendszer indulásakor automatikusan létrejönnek:

| Username  | Password  | Szerepkör |
|-----------|-----------|-----------|
| admin     | admin     | ADMIN     |
| testuser  | test123   | USER      |

⚠️ **FONTOS:** Production környezetben változtasd meg ezeket!

### Session Management:
- Session timeout: 30 perc
- Session-alapú szavazás követés
- CSRF védelem REST API-hoz kikapcsolva (stateless)

### CORS Policy:
- Frontend origin: `http://localhost:3000`
- Allowed methods: `GET, POST, PUT, DELETE`

---

## 🐛 Gyakori Problémák

### "Connection refused" hiba:
```bash
# Ellenőrizd, hogy a PostgreSQL fut-e
docker ps | grep postgres

# Backend log-ok ellenőrzése
docker logs upvote-backend
```

### "Port already in use":
```bash
# 8080-as port foglalt (Backend)
lsof -i :8080
kill -9 <PID>

# 3000-as port foglalt (Frontend)
lsof -i :3000
kill -9 <PID>
```

### Frontend nem éri el a Backend-et:
Ellenőrizd az `api.js` fájlban az `API_BASE_URL` értékét:
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

---

## 📝 Fejlesztői Jegyzetek

### Hot Reload:
- **Backend:** Spring Boot DevTools automatikusan újratölti a változtatásokat
- **Frontend:** `npm start` figyelí a fájl változásokat

### Adatbázis séma változtatás:
```yaml
# application.yml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # development
      # ddl-auto: validate  # production
```

---

## 🤝 Közreműködés

1. Fork-old a projektet
2. Hozz létre egy feature branch-et (`git checkout -b feature/UjFunkció`)
3. Commit-old a változtatásokat (`git commit -m 'Új funkció hozzáadása'`)
4. Push-old a branch-et (`git push origin feature/UjFunkció`)
5. Nyiss egy Pull Request-et

---

## 📄 Licenc

Ez a projekt oktatási célokra készült.

---

## 👨‍💻 Készítő

**Gábor** - Upvote System Szintfelmérő Feladat

---

## 🙏 Köszönetnyilvánítás

- Spring Framework dokumentáció
- React dokumentáció
- PostgreSQL közösség
- Docker dokumentáció# upvote
