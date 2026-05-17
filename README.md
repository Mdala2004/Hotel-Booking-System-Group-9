# Hotel Booking System — Group 9
This system is an illustration of how a database can interact with an entire system, creating something that benefits the people for whom the system has been developed for. Built using **Node.js**, **Express**, and **Oracle Database 21c XE**, it demonstrates a fully functional hotel management platform where guests can register, browse available rooms, make reservations, and process payments — all connected to a live Oracle database.

## Prerequisites
 
Make sure the following are installed before starting:
 
- [Node.js](https://nodejs.org/) v14 or higher
- [Oracle Database 21c XE](https://www.oracle.com/database/technologies/xe-downloads.html)
- [Oracle SQL Developer](https://www.oracle.com/tools/downloads/sqldev-downloads.html)
- We recommend using VS Code as the IDE with which to run the whole system

### Recommended VS Code Extensions
 
| Extension | ID | Purpose |
|---|---|---|
| Thunder Client | `rangav.vscode-thunder-client` | API testing inside VS Code |
| DotENV | `mikestead.dotenv` | `.env` syntax highlighting |
| ESLint | `dbaeumer.vscode-eslint` | Catch JS errors early |
| Live Server | `ritwickdey.LiveServer` | Serve frontend pages locally |

## Setup
### 1. Clone the Repository
 
```bash
git clone <https://github.com/Mdala2004/Hotel-Booking-System-Group-9>
```
 
---
 
### 2. Install Dependencies
 
```bash
npm install
```
 
Verify all packages installed correctly:
 
```bash
npm list --depth=0
```
 
You should see:
 
```
hotel-system-backend@1.0.0
├── bcrypt
├── cors
├── dotenv
├── express
├── express-validator
├── jsonwebtoken
└── oracledb
```
 
If any package is missing, install it manually:
 
```bash
npm install <package-name>
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
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=8h
```
 
#### Finding Your Correct IP Address
 
Oracle 21c XE binds to your **network IP**, not `localhost`. To find it:
 
1. Open Command Prompt and run:
```cmd
lsnrctl status
```
 
2. Look for the **Listening Endpoints Summary** section:
```
(DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=10.0.0.19)(PORT=1521)))
```
 
3. Use that IP in your `.env`:
```env
DB_CONNECTION_STRING=10.0.0.19:1521/XEPDB1
```
 
> **Important:** This IP may change if you restart your router. If the connection suddenly breaks, run `lsnrctl status` again and update `.env` with the new IP.
 
#### `.env` Formatting Rules
 
```env
#  Wrong — quotes not allowed
JWT_SECRET="my_secret"
 
#  Wrong — no spaces around =
JWT_SECRET = my_secret
 
#  Correct
JWT_SECRET=my_secret
```

### 4. Start Oracle XE Services
 
Before running the server, make sure Oracle is running.
 
1. Press `Windows + R`, type `services.msc`, press Enter
2. Find and start **both** of these services:
| Service Name | Status Required |
|---|---|
| `OracleServiceXE` | Running |
| `OracleOraDB21Home1TNSListener` | Running |
 
> **Tip:** To avoid starting these manually every time, right-click each service → Properties → set **Startup type** to **Automatic**.

### 5. Run the Server
 
```bash
# Development (auto-restarts on file changes)
npm run dev
 
# Production
npm start
```
 
Server starts at: `http://localhost:3000`

### 6. Verify the Server is Running
 
```bash
npm run health
```

## Troubleshooting
 
### Server Won't Start
 
| Error | Cause | Fix |
|---|---|---|
| `Cannot find module 'oracledb'` | Package not installed | Run `npm install oracledb` |
| `Cannot find module './routes/guests'` | File missing or misnamed | Check `routes/` — filenames must match exactly |
| `SyntaxError` in terminal | Typo in a route file | Check the file and line number shown in the error |
| `Error: listen EADDRINUSE :::3000` | Port 3000 already in use | Change `PORT=3001` in `.env` or close whichever process is using port 3000 |
| `secretOrPrivateKey must have a value` | `JWT_SECRET` missing in `.env` | Add `JWT_SECRET=any_long_random_string` to `.env` and restart |
 
---
 
### PowerShell Execution Policy Error
 
If `npm` commands are blocked in the VS Code terminal:
 
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
 
Type `Y` when prompted. Alternatively switch the terminal to **Command Prompt** using the dropdown arrow next to the `+` icon in the terminal panel.
 
---
 
### Database Connection Errors
 
| Error | Cause | Fix |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:1521` | Oracle doesn't listen on localhost | Run `lsnrctl status` and use the IP shown under Listening Endpoints |
| `NJS-518: Service not registered` | XEPDB1 pluggable database is not open | Open SQL Developer as SYS with SYSDBA role and run `ALTER PLUGGABLE DATABASE XEPDB1 OPEN; ALTER PLUGGABLE DATABASE XEPDB1 SAVE STATE;` |
| `ORA-12541: no listener` | Oracle listener not started | Open `services.msc` and start `OracleOraDB21Home1TNSListener` |
| `ORA-01017: invalid username/password` | Wrong credentials | Check `DB_USER` and `DB_PASSWORD` in `.env` — passwords are case sensitive |
| `ORA-12514: listener does not know of service` | Wrong service name | Run `lsnrctl status` and use the exact service name shown — either `XE` or `XEPDB1` |
| `NJS-503: connection could not be established` | IP address has changed | Run `lsnrctl status` and update `DB_CONNECTION_STRING` in `.env` |
 
> **If XEPDB1 consistently fails**, change your `.env` to use `XE` instead:
> ```env
> DB_CONNECTION_STRING=your_ip:1521/XE
> ```
 
---
 
### Login and Token Errors
 
| Error | Cause | Fix |
|---|---|---|
| `Invalid username or password` | Wrong credentials or passwords not hashed | Confirm passwords were hashed — run `node hashPasswords.js` if needed |
| `secretOrPrivateKey must have a value` | `JWT_SECRET` not set | Add `JWT_SECRET=any_long_random_string` to `.env` and restart |
| `Invalid or expired token` | Token copied incorrectly or session expired | Log in again for a fresh token; use the Auth tab in Thunder Client |
| `Access denied. Please log in.` | No token sent with the request | Add the Bearer token to the Auth tab or Authorization header |
| Login returns 500 error | Database not running or wrong connection string | Check Oracle services and verify `DB_CONNECTION_STRING` in `.env` |

### IP Address Changes After Router Restart
 
If the backend suddenly stops connecting:
 
1. Run `lsnrctl status` in Command Prompt
2. Find the new IP under Listening Endpoints Summary
3. Update `DB_CONNECTION_STRING` in `backend/.env`
4. Update `BASE_URL` in `frontend/assets/js/api.js`
5. Restart the backend with `npm run dev`

> **Permanent fix:** Assign a static IP to your PC in your router's admin settings.

### How to Read Errors Effectively
 
When something fails, always check these two places first:
 
**VS Code terminal** — the backend logs every request and error message in real time.
 
**Browser DevTools (F12) → Network tab** — shows every API call the frontend makes:
1. Open the Network tab before triggering the action
2. Look for requests highlighted in red
3. Click the failed request → **Response** tab to read the exact error from the backend
---
 
## Security Notes
 
- **Never commit `.env`** to Git — it is listed in `.gitignore` for this reason
- **Passwords are hashed** with bcrypt (10 salt rounds) before being stored — plain text passwords are never saved
- **JWT tokens expire** after 8 hours by default — configurable via `JWT_EXPIRES_IN` in `.env`
- **Bind variables** are used in all SQL queries to prevent SQL injection
- **Passwords are never returned** in any API response — `SELECT` statements explicitly exclude the password column
- **Vague login errors** are intentional — the API never reveals whether the username or the password was specifically wrong.
