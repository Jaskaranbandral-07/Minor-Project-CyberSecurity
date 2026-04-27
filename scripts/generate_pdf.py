from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 15)
        self.cell(0, 10, "HashBreaker - Password Cracking with Hashcat", border=False, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("helvetica", "I", 12)
        self.cell(0, 10, "Project Explanation", border=False, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)

    def chapter_title(self, title):
        self.set_font("helvetica", "B", 14)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 8, title, border=False, align="L", fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def chapter_body(self, text):
        self.set_font("helvetica", "", 12)
        self.multi_cell(0, 6, text)
        self.ln(6)

pdf = PDF()
pdf.add_page()

# 1. Project Objective
pdf.chapter_title("1. Project Objective")
text1 = (
    "* Demonstrate real-world risks of weak password policies using Hashcat-style cracking techniques.\n"
    "* Educate on hash algorithms, password complexity, and the importance of salting."
)
pdf.chapter_body(text1)

# 2. Project Structure
pdf.chapter_title("2. Project Structure")
text2 = (
    "c:\\Project\\\n"
    "* index.html - Web dashboard (7 sections)\n"
    "* style.css - Dark theme UI styling\n"
    "* script.js - Core logic (hashing, attacks, data storage)\n"
    "* scripts/ \n"
    "   - generate_hashes.py - Python script to generate NTLM hashes\n"
    "   - analyze_results.py - Python script to analyze password stats\n"
    "* data/ \n"
    "   - ntlm_hashes.txt - Generated hashes (Hashcat input format)\n"
    "   - password_hash_mapping.csv - Hash-to-password mapping\n"
    "* docs/ \n"
    "   - PROJECT_REPORT.md - Full written project report"
)
pdf.set_font("courier", "", 10)
pdf.multi_cell(0, 5, text2)
pdf.ln(6)

# 3. How It Works (Step by Step)
pdf.chapter_title("3. How It Works (Step by Step)")
text3 = (
    "1. User generates password hashes\n"
    "   - Either types passwords manually OR auto-generates random ones (weak/medium/strong mix).\n"
    "   - Each password is hashed using NTLM (MD4 of UTF-16LE) - computed live in the browser using pure JavaScript.\n"
    "   - All hashes are stored in localStorage - no backend needed.\n\n"
    "2. User runs attacks against stored hashes\n"
    "   - Dictionary Attack - Compares hashes against a built-in wordlist of 50+ common passwords.\n"
    "   - Rule-Based Attack - Takes the same wordlist and applies 15 mutation rules: capitalize, append numbers, leet-speak.\n"
    "   - Brute Force Attack - Tries all lowercase letter combinations up to 4-5 characters long.\n\n"
    "3. Live cracking feed\n"
    "   - During each attack, a real-time progress bar and live feed shows each cracked hash as it's found.\n\n"
    "4. Dashboard auto-updates with real data\n"
    "   - Stats cards: Total hashes, cracked count, crack rate %, remaining.\n"
    "   - Charts: Crack rate by attack type, password strength distribution, length distribution, cumulative attack timeline.\n\n"
    "5. Results section\n"
    "   - Shows every cracked password with its hash, attack type, and strength badge."
)
pdf.chapter_body(text3)

# 4. Key Concepts Covered
pdf.chapter_title("4. Key Concepts Covered")
text4 = (
    "* Hash algorithms: Comparison of MD5, NTLM, SHA-256, bcrypt.\n"
    "* NTLM hashing: Live MD4-based computation.\n"
    "* Attack Types: Dictionary, Rule-based, and Brute force methodologies.\n"
    "* Password complexity: Evaluating strength based on length and character diversity.\n"
    "* Salting & Defense: Demonstrating why unique salts and slow hashing (like bcrypt) are critical for security."
)
pdf.chapter_body(text4)

# 5. Data Flow
pdf.chapter_title("5. Data Flow")
text5 = (
    "User Input -> NTLM Hash (JS MD4) -> localStorage -> Attack Engine -> Cracked Results -> Dashboard Charts\n\n"
    "* No fake/hardcoded data - dashboard starts empty.\n"
    "* All data is captured live from user actions.\n"
    "* Persists across page refreshes via localStorage.\n"
    "* Reset anytime with the 'Reset All Data' button."
)
pdf.chapter_body(text5)

pdf.output("c:\\Project\\Project_Explanation.pdf")
print("PDF successfully generated.")
