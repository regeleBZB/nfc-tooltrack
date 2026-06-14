# NFC Tooltracking with Kiosk

> **Prototype notice**
This is an early prototype, built primarily to test NFC tag reading and prove out the tool-borrowing concept from end to end. It runs as a complete, working flow, but it is not a finished product. The goal is to initiate integrations with other systems, and additional concepts are still being explored and will be added as the project develops.


This is a self-service kiosk for managing how tools are borrowed and returned in the AMT laboratory. It is about speeding up the process by utilizing QR-code generated IDs, NFC stickers and thermal printer. 

## What it does

**At the kiosk (students):**
- Identify yourself by scanning your student ID QR code, or by typing your details.
- Tap each tool's NFC tag on the reader — it appears on screen instantly and joins your borrow list.
- Receive a printed receipt of everything you borrowed.
- Submit a request for new tools to be purchased when something is missing or worn out.
**On the admin side (lab staff):**
- Add tools and link each one to its NFC tag.
- Register students.
- Watch a live dashboard: total tools, how many are out, overdue items, and the day's activity.
- Return tools on a student's behalf — a returned tool automatically becomes available again.
- See which tools are still unreturned and a ranking of the most-borrowed tools over time.
## How it works
 
Every tool carries a small NFC tag. A student begins at the kiosk, identifies themselves, and taps the tags of the tools they want; each one is checked against the inventory and added to their list. Confirming the borrow saves the record and prints a receipt on a thermal printer, and each tool's status switches to "borrowed" until it comes back. When the tools are returned, staff mark them returned from the admin screen and they flip back to "available." Because every borrow and return is recorded, the system can flag overdue items and show which tools see the most use.
 
## Hardware
 
- An Android tablet that runs the kiosk in a web browser.
- A USB NFC reader for tool tags.
- A USB QR scanner for student IDs.
- A USB thermal receipt printer.
## Built with
 
- **Frontend:** React + Vite — the kiosk and admin interface.
- **Backend:** Spring Boot (Java) with a MySQL database — the API and records.
The frontend and backend are packaged together as a single web application, so the kiosk tablet only needs a browser to use it.
 
## Project structure
 
```
nfc-tooltrack/
├── frontend/    # React kiosk + admin interface
├── backend/     # Spring Boot API and database access
└── Dockerfile   # builds and packages everything for deployment
```
 
## Running it locally
 
You'll need Node.js, Java 21, and a running MySQL instance.
 
**Frontend**
```
cd frontend
npm install
npm run dev
```
 
**Backend**
```
cd backend
./mvnw spring-boot:run
```
 
The kiosk is then available at the local address shown in the terminal.
 
## Deployment
 
ToolTrack is built into one application and hosted online over HTTPS. The kiosk tablet simply opens the web address in its browser — there's nothing to install on the tablet itself, and the NFC reader, QR scanner, and thermal printer connect to it directly over USB.
