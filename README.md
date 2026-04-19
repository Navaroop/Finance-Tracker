# 💰 FinTrack — Personal Finance & Expense Tracker

A full-stack personal finance tracker built with **React**, **Spring Boot**, and **MongoDB Atlas**.

---

## 📁 Project Structure

```
finance-tracker/
├── backend/                    ← Spring Boot (Java 17)
│   ├── src/main/java/com/financetracker/
│   │   ├── config/             SecurityConfig.java
│   │   ├── controller/         Auth, Transaction, Budget, Dashboard
│   │   ├── dto/                Request & Response objects
│   │   ├── model/              User, Transaction, Budget
│   │   ├── repository/         MongoDB repositories
│   │   ├── security/           JWT filter, provider, UserDetailsService
│   │   ├── service/            Business logic
│   │   └── FinanceTrackerApplication.java
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/                   ← React 18
    └── src/
        ├── api/                axios.js (JWT interceptor)
        ├── context/            AuthContext.jsx
        ├── components/         Sidebar, Navbar, ProtectedRoute
        ├── pages/              Login, Register, Dashboard, Transactions, Budget
        └── styles/             Per-page CSS files
```

---

## ⚙️ Backend Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- MongoDB Atlas account (free tier works)

### 1. Configure MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist your IP (or `0.0.0.0/0` for development)
4. Copy your connection string

### 2. Set environment variables (or edit `application.properties`)

```bash
export MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/financetracker?retryWrites=true&w=majority"
export JWT_SECRET="<base64-encoded-256-bit-secret>"
```

To generate a secure JWT secret (Base64, 32+ bytes):
```bash
openssl rand -base64 32
```

### 3. Run the backend
```bash
cd backend
mvn spring-boot:run
```
Server starts at **http://localhost:8080**

---

## 🖥️ Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Start the dev server
```bash
npm start
```
App opens at **http://localhost:3000**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | `/api/auth/register`  | Create account     |
| POST   | `/api/auth/login`     | Login → JWT token  |

### Transactions *(JWT required)*
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/transactions`       | List (with filters)      |
| POST   | `/api/transactions`       | Create transaction       |
| PUT    | `/api/transactions/{id}`  | Update transaction       |
| DELETE | `/api/transactions/{id}`  | Delete transaction       |

**Query params for GET:** `type`, `category`, `search`, `startDate`, `endDate`

### Budgets *(JWT required)*
| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | `/api/budgets`      | Get budgets with spending     |
| POST   | `/api/budgets`      | Create or update budget       |
| DELETE | `/api/budgets/{id}` | Delete budget                 |

**Query params for GET:** `month` (1–12), `year`

### Dashboard *(JWT required)*
| Method | Endpoint          | Description             |
|--------|-------------------|-------------------------|
| GET    | `/api/dashboard`  | Monthly summary + recent transactions |

---

## 🎨 Features

- ✅ **JWT Authentication** — Secure register/login, auto-logout on 401
- ✅ **Income & Expense Tracking** — Full CRUD with type toggle
- ✅ **Advanced Filters** — Search, type, category, date range
- ✅ **Budget Limits** — Per-category monthly budgets with real spent tracking
- ✅ **Dashboard** — Summary cards, spending trend chart, category breakdown
- ✅ **Light Theme** — Clean purple-accent UI inspired by Creditly dashboard
- ✅ **Responsive** — Works on desktop and tablet

---

## 🛠️ Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, React Router v6, Recharts, Axios, React Icons |
| Backend  | Spring Boot 3.2, Spring Security 6, JJWT 0.11.5        |
| Database | MongoDB Atlas (via Spring Data MongoDB)                 |
| Auth     | JWT (HS256), BCrypt password hashing                    |
| Fonts    | DM Sans + DM Mono (Google Fonts)                        |

---

## 🚀 Production Notes

1. Set `MONGODB_URI` and `JWT_SECRET` as real environment variables — never commit secrets.
2. Update CORS `allowedOrigins` in `SecurityConfig.java` to your frontend domain.
3. Run `npm run build` for the frontend and serve the `build/` folder via Nginx or serve.
4. Use `mvn package` to create a runnable JAR: `java -jar target/finance-tracker-0.0.1-SNAPSHOT.jar`
