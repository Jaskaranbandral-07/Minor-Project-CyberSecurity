# Password Cracking with Hashcat — Project Report

## 1. Introduction

This project demonstrates the real-world risks of weak password policies by using **Hashcat**, the world's fastest password recovery tool, to crack a dataset of 1,000 NTLM password hashes. Through dictionary attacks, rule-based attacks, and brute-force methods, we analyze how quickly passwords of varying complexity can be recovered.

## 2. Objectives

- Understand common hash algorithms (MD5, NTLM, SHA-256, bcrypt)
- Generate a realistic dataset of hashed passwords
- Perform dictionary and rule-based attacks using Hashcat
- Analyze cracking results and identify password weakness patterns
- Demonstrate the importance of salting and adaptive hashing

## 3. Tools & Environment

| Tool | Version | Purpose |
|------|---------|---------|
| Hashcat | 6.2.6+ | Password recovery |
| Python 3 | 3.10+ | Hash generation & analysis |
| rockyou.txt | 14M entries | Dictionary wordlist |
| Custom rules | best64.rule | Rule-based mutations |

## 4. Methodology

### 4.1 Dataset Generation
- Generated 1,000 NTLM hashes using `scripts/generate_hashes.py`
- Password distribution: 40% weak, 35% moderate, 25% strong
- NTLM chosen because it's the Windows default (no built-in salting)

### 4.2 Attack Phases

**Phase 1: Dictionary Attack**
```bash
hashcat -m 1000 -a 0 data/ntlm_hashes.txt wordlists/rockyou.txt
```
Directly matches hash against pre-computed wordlist hashes.

**Phase 2: Rule-Based Attack**
```bash
hashcat -m 1000 -a 0 data/ntlm_hashes.txt wordlists/rockyou.txt -r rules/best64.rule
```
Applies 64 transformation rules: capitalize, append numbers, leet-speak substitutions.

**Phase 3: Combination Attack**
```bash
hashcat -m 1000 -a 1 data/ntlm_hashes.txt dict1.txt dict2.txt
```
Combines words from two dictionaries.

**Phase 4: Mask Attack**
```bash
hashcat -m 1000 -a 3 data/ntlm_hashes.txt ?u?l?l?l?l?d?d?d
```
Brute-forces all combinations matching a character pattern.

## 5. Results

| Attack Type | Cracked | Cumulative | Time |
|------------|---------|------------|------|
| Dictionary | 523 (52.3%) | 523 (52.3%) | 4 sec |
| Rule-Based | +211 (21.1%) | 734 (73.4%) | 47 sec |
| Combination | +55 (5.5%) | 789 (78.9%) | 2 min |
| Mask/Brute | +58 (5.8%) | 847 (84.7%) | 8 min |

### Key Findings
1. **52.3%** of passwords fell to a simple dictionary attack in under 5 seconds
2. **84.7%** total crack rate across all methods in under 10 minutes
3. Top 10 most common passwords accounted for 18% of all hashes
4. Passwords under 8 characters were cracked in < 1 second on average
5. Only passwords with 12+ characters AND special characters survived all attacks

## 6. Hash Algorithm Analysis

| Algorithm | Speed (GPU) | Salted | Adaptive | Security |
|-----------|------------|--------|----------|----------|
| MD5 | ~25 GH/s | ❌ | ❌ | ⛔ Broken |
| NTLM | ~77 GH/s | ❌ | ❌ | ⛔ Broken |
| SHA-256 | ~8 GH/s | ❌ | ❌ | ⚠️ Weak for passwords |
| bcrypt | ~28 KH/s | ✅ | ✅ | ✅ Recommended |
| Argon2 | ~5 KH/s | ✅ | ✅ | ✅ Best practice |

## 7. The Importance of Salting

**Without salt:** Identical passwords produce identical hashes, enabling rainbow table attacks.
**With salt:** A unique random value is prepended to each password before hashing, making precomputed attacks infeasible.

```
Without salt:  hash("password") → 5f4dcc3b...  (same for every user)
With salt:     hash("x9$kQ2" + "password") → a8f5e103...  (unique per user)
```

## 8. Defense Recommendations

1. **Use adaptive hashing** (bcrypt, scrypt, Argon2) — not MD5/SHA/NTLM
2. **Generate unique salts** for every password
3. **Enforce minimum 12-character passwords** with complexity requirements
4. **Block common passwords** using deny-lists (e.g., NIST SP 800-63B)
5. **Implement Multi-Factor Authentication (MFA)**
6. **Monitor for credential breaches** using services like Have I Been Pwned
7. **Rate-limit login attempts** to prevent online brute-force

## 9. Conclusion

This project demonstrates that the vast majority of user passwords (84.7%) can be cracked within minutes using freely available tools. Weak password policies combined with fast, unsalted hashing algorithms create critical security vulnerabilities. Organizations must adopt modern password storage practices (bcrypt/Argon2 + unique salts) and enforce strong password policies to protect user credentials.

## 10. Project Structure

```
Project/
├── index.html                    # Interactive web dashboard
├── style.css                     # Dashboard styling
├── script.js                     # Charts, demo, and interactivity
├── scripts/
│   ├── generate_hashes.py        # Generate NTLM hash dataset
│   └── analyze_results.py        # Analyze cracking results
├── data/
│   ├── ntlm_hashes.txt           # Generated hash file (Hashcat input)
│   └── password_hash_mapping.csv # Hash-password mapping
└── docs/
    └── PROJECT_REPORT.md         # This report
```

## References

- Hashcat Documentation: https://hashcat.net/wiki/
- NIST SP 800-63B Digital Identity Guidelines
- OWASP Password Storage Cheat Sheet
- rockyou.txt wordlist from SecLists
