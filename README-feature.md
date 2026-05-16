## Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure the Oracle Connection

Copy `.env.example` to `.env` and fill in the credentials  
(ask the team for the credentials).

```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
PORT=3000
```

---

### 4. Run the Server

```bash
# Production
npm start

# Development 
npm run dev
```

Server starts at: `http://localhost:3000`  



