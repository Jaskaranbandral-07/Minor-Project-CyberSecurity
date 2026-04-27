# 🔓 HashBreaker \u2014 Password Cracking Simulation Dashboard

**HashBreaker** is an interactive, fully data-driven web application designed to demonstrate the real-world vulnerabilities of weak password policies and the critical importance of secure hashing algorithms (like salting and slow hashes). 

This project simulates the behavior of professional password cracking tools (like Hashcat) entirely within the browser, using a pure JavaScript implementation of the NTLM (MD4) hash algorithm.

---

## 🌟 Key Features

*   **Live NTLM Hashing:** Type or auto-generate passwords and watch them instantly convert into NTLM hashes via a pure JavaScript MD4 implementation. No backend required!
*   **Real-time Attack Simulations:**
    *   **Dictionary Attack:** Rapidly compares target hashes against a built-in dictionary of common passwords.
    *   **Rule-Based Attack:** Supercharged with over 60 dynamic mutation rules (leet-speak substitutions, appending years, capitalization, and symbols).
    *   **Brute Force Attack:** Exhaustively tests up to 500,000 combinations of alphanumeric characters (`a-z`, `0-9`) to crack short, simple passwords.
*   **Instant Auto-Crack:** Paste your own NTLM hashes directly into the app; if they match the dictionary or rules, they are cracked and revealed in milliseconds.
*   **Dynamic Data Dashboard:** 
    *   Visualizes your live session data using **Chart.js**.
    *   Tracks overall crack rate, password strength distribution, length distribution, and a cumulative attack timeline.
    *   All data persists locally in the browser (`localStorage`).
*   **Educational Resources:** Includes detailed explanations of hashing algorithms, the mechanics of salting, and actual Hashcat command references.

---

## 🚀 How to Use

1.  **Open the App:** Simply open `index.html` in any modern web browser.
2.  **Generate Data:** Navigate to **Generate Hashes**. You can manually enter passwords or use the random generator to create a mix of Weak, Medium, and Strong passwords.
3.  **Run Attacks:** Go to the **Run Attack** section. Click the attack buttons to simulate Hashcat-style cracking. A live feed will show passwords being recovered in real-time.
4.  **Analyze Results:** Check the **Dashboard** and **Results** sections to see analytics on crack rates and identify the most vulnerable password structures.
5.  **Export:** Export your hashes as a `.txt` file (ready for real Hashcat) or export your successful cracks as a `.csv` file.

---

## 📁 Project Structure

```text
\u251c\u2500\u2500 index.html                 # The main web dashboard
\u251c\u2500\u2500 style.css                  # Premium, responsive dark-mode styling
\u251c\u2500\u2500 script.js                  # Core engine: pure JS NTLM hashing, attack logic, and UI updates
\u251c\u2500\u2500 Project_Explanation.pdf    # Comprehensive project overview document
\u251c\u2500\u2500 docs/
\u2502   \u2514\u2500\u2500 PROJECT_REPORT.md      # Detailed academic/technical report
\u2514\u2500\u2500 scripts/
    \u251c\u2500\u2500 generate_hashes.py     # Python utility for bulk offline hash generation
    \u2514\u2500\u2500 analyze_results.py     # Python script for statistical offline analysis
```

---

## 🛠️ Technologies Used
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Visualization:** Chart.js (via CDN)
*   **Cryptography:** Pure JavaScript implementation of MD4 (used in NTLM)
*   **Storage:** Browser `localStorage`

---

## ⚠️ Disclaimer

This project was built strictly for **educational and defensive cybersecurity purposes**. It is designed to teach users, developers, and organizations about the dangers of weak passwords and outdated hashing algorithms. Do not use the concepts or tools demonstrated here against systems you do not own or have explicit permission to test.
