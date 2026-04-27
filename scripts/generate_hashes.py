"""
generate_hashes.py - Generate sample NTLM password hashes for Hashcat cracking project.

This script creates a dataset of 1,000 NTLM hashes from passwords of varying complexity.
Output: ../data/ntlm_hashes.txt and ../data/password_hash_mapping.csv

Usage:
    python generate_hashes.py
"""

import struct
import csv
import os
import random
import string

# Common weak passwords (from real breach datasets)
WEAK_PASSWORDS = [
    "password", "123456", "12345678", "qwerty", "abc123",
    "monkey", "1234567", "letmein", "trustno1", "dragon",
    "baseball", "master", "michael", "shadow", "ashley",
    "football", "passw0rd", "jessica", "superman", "qwerty123",
    "admin", "welcome", "hello", "charlie", "donald",
    "login", "princess", "solo", "password1", "sunshine",
    "flower", "hottie", "loveme", "zaq1zaq1", "iloveyou",
    "qazwsx", "654321", "ninja", "access", "summer",
    "batman", "cookie", "samsung", "test", "computer",
    "soccer", "lovely", "freedom", "whatever", "ginger",
]

# Moderate passwords (dictionary + simple mutations)
MODERATE_PATTERNS = [
    "Summer{}", "Winter{}", "Spring{}", "Password{}", "Welcome{}",
    "Company{}", "January{}", "Monday{}", "Football{}", "Baseball{}",
]

# --- Pure Python MD4 implementation (needed for NTLM) ---
def _left_rotate(n, b):
    return ((n << b) | (n >> (32 - b))) & 0xFFFFFFFF

def _md4(message: bytes) -> bytes:
    """Pure Python MD4 hash."""
    # Initial hash values
    h0, h1, h2, h3 = 0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476
    
    msg = bytearray(message)
    orig_len = len(msg) * 8
    msg.append(0x80)
    while len(msg) % 64 != 56:
        msg.append(0)
    msg += struct.pack('<Q', orig_len)
    
    for i in range(0, len(msg), 64):
        block = msg[i:i+64]
        X = list(struct.unpack('<16I', block))
        
        a, b, c, d = h0, h1, h2, h3
        
        # Round 1
        for k in range(16):
            if k % 4 == 0:   a = _left_rotate((a + ((b & c) | (~b & d)) + X[k]) & 0xFFFFFFFF, [3,7,11,19][k%4])
            elif k % 4 == 1: d = _left_rotate((d + ((a & b) | (~a & c)) + X[k]) & 0xFFFFFFFF, [3,7,11,19][k%4])
            elif k % 4 == 2: c = _left_rotate((c + ((d & a) | (~d & b)) + X[k]) & 0xFFFFFFFF, [3,7,11,19][k%4])
            else:            b = _left_rotate((b + ((c & d) | (~c & a)) + X[k]) & 0xFFFFFFFF, [3,7,11,19][k%4])
        
        # Round 2
        for k in [0,4,8,12,1,5,9,13,2,6,10,14,3,7,11,15]:
            f = ((a & b) | (a & c) | (b & c)) + 0x5A827999
            a, d, c, b = d, c, b, a
            if k in [0,4,8,12]:   a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 3)
            elif k in [1,5,9,13]: a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 5)
            elif k in [2,6,10,14]:a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 9)
            else:                 a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 13)
        
        # Round 3
        for k in [0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15]:
            f = (a ^ b ^ c) + 0x6ED9EBA1
            a, d, c, b = d, c, b, a
            if k in [0,8,4,12]:   a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 3)
            elif k in [2,10,6,14]:a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 9)
            elif k in [1,9,5,13]: a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 11)
            else:                 a = _left_rotate((a + f + X[k]) & 0xFFFFFFFF, 15)
        
        h0 = (h0 + a) & 0xFFFFFFFF
        h1 = (h1 + b) & 0xFFFFFFFF
        h2 = (h2 + c) & 0xFFFFFFFF
        h3 = (h3 + d) & 0xFFFFFFFF
    
    return struct.pack('<4I', h0, h1, h2, h3)

def ntlm_hash(password: str) -> str:
    """Generate NTLM hash of a password (MD4 of UTF-16LE encoded password)."""
    return _md4(password.encode('utf-16le')).hex()

def generate_moderate_password():
    """Generate a moderate-complexity password."""
    pattern = random.choice(MODERATE_PATTERNS)
    suffix = random.choice([
        str(random.randint(1, 99)),
        "!" + str(random.randint(1, 9)),
        "@" + str(random.randint(10, 99)),
        "#" + str(random.randint(100, 999)),
    ])
    return pattern.format(suffix)

def generate_strong_password(length=14):
    """Generate a strong random password."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(chars) for _ in range(length))

def categorize_strength(password: str) -> str:
    """Categorize password strength."""
    score = 0
    if len(password) >= 8: score += 1
    if len(password) >= 12: score += 1
    if any(c.isupper() for c in password): score += 1
    if any(c.islower() for c in password): score += 1
    if any(c.isdigit() for c in password): score += 1
    if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password): score += 1
    if score <= 2: return "weak"
    if score <= 4: return "medium"
    return "strong"

def main():
    os.makedirs("../data", exist_ok=True)
    
    passwords = []
    
    # 1. Add weak passwords (400 - duplicates simulating real-world reuse)
    for _ in range(400):
        passwords.append(random.choice(WEAK_PASSWORDS))
    
    # 2. Add moderate passwords (350)
    for _ in range(350):
        passwords.append(generate_moderate_password())
    
    # 3. Add strong passwords (250)
    for _ in range(250):
        passwords.append(generate_strong_password(random.randint(12, 20)))
    
    random.shuffle(passwords)
    
    # Generate hashes and write output
    hashes = []
    mapping = []
    
    for pw in passwords:
        h = ntlm_hash(pw)
        hashes.append(h)
        mapping.append({
            "hash": h,
            "password": pw,
            "length": len(pw),
            "strength": categorize_strength(pw),
        })
    
    # Write hashes only (for Hashcat input)
    with open("../data/ntlm_hashes.txt", "w") as f:
        for h in hashes:
            f.write(h + "\n")
    
    # Write full mapping (for analysis)
    with open("../data/password_hash_mapping.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["hash", "password", "length", "strength"])
        writer.writeheader()
        writer.writerows(mapping)
    
    # Print summary
    weak = sum(1 for m in mapping if m["strength"] == "weak")
    med = sum(1 for m in mapping if m["strength"] == "medium")
    strong = sum(1 for m in mapping if m["strength"] == "strong")
    
    print(f"[OK] Generated {len(hashes)} NTLM hashes")
    print(f"   Weak:   {weak} ({weak/len(hashes)*100:.1f}%)")
    print(f"   Medium: {med} ({med/len(hashes)*100:.1f}%)")
    print(f"   Strong: {strong} ({strong/len(hashes)*100:.1f}%)")
    print(f"\n[FILES] Saved:")
    print(f"   data/ntlm_hashes.txt         (Hashcat input)")
    print(f"   data/password_hash_mapping.csv (Full mapping)")

if __name__ == "__main__":
    main()
