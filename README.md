# 🚀 Upvote System

Egy teljes körű webes upvote rendszer Spring Boot backend és React frontend alkalmazással.

## 📋 Követelmények

- Docker & Docker Compose (ajánlott)
- VAGY: Java 17, Maven, Node.js 18+, PostgreSQL 15

## 🚀 Gyors Indítás (Docker)
```bash
# Indítsd az alkalmazást
docker-compose up --build

# Elérés:
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

## 🔧 Helyi Fejlesztés

### Backend:
```bash
cd backend
mvn spring-boot:run
```

### Frontend:
```bash
cd frontend
npm install
npm start
```

## 👤 Teszt Fiók

- **Admin:** admin / admin
- **User:** testuser / test123

## 📚 Dokumentáció

Részletes dokumentáció: [QUICKSTART.md](QUICKSTART.md)