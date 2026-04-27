"""
analyze_results.py - Analyze Hashcat cracking results and generate statistics.

Usage:
    python analyze_results.py
"""

import csv
import os
from collections import Counter

def load_mapping(filepath="../data/password_hash_mapping.csv"):
    if not os.path.exists(filepath):
        print("[ERROR] Mapping file not found. Run generate_hashes.py first.")
        return []
    with open(filepath, "r") as f:
        return list(csv.DictReader(f))

def print_stats(mapping):
    total = len(mapping)
    
    print("=" * 60)
    print("   PASSWORD CRACKING ANALYSIS REPORT")
    print("=" * 60)
    
    strength_counts = Counter(m["strength"] for m in mapping)
    print(f"\n[STRENGTH] Password Strength Distribution (n={total}):")
    for strength in ["weak", "medium", "strong"]:
        count = strength_counts.get(strength, 0)
        bar = "#" * int(count / total * 40)
        print(f"   {strength:>8}: {count:>4} ({count/total*100:5.1f}%) {bar}")
    
    lengths = [int(m["length"]) for m in mapping]
    print(f"\n[LENGTH] Password Length Stats:")
    print(f"   Min: {min(lengths)}, Max: {max(lengths)}, Avg: {sum(lengths)/len(lengths):.1f}")
    
    length_buckets = {"<6": 0, "6-8": 0, "8-12": 0, "12+": 0}
    for l in lengths:
        if l < 6: length_buckets["<6"] += 1
        elif l <= 8: length_buckets["6-8"] += 1
        elif l <= 12: length_buckets["8-12"] += 1
        else: length_buckets["12+"] += 1
    
    print(f"\n[DIST] Length Distribution:")
    for bucket, count in length_buckets.items():
        bar = "#" * int(count / total * 40)
        print(f"   {bucket:>5}: {count:>4} ({count/total*100:5.1f}%) {bar}")
    
    pw_counts = Counter(m["password"] for m in mapping)
    print(f"\n[TOP10] Most Common Passwords:")
    for i, (pw, count) in enumerate(pw_counts.most_common(10), 1):
        print(f"   {i:>2}. {pw:<20} (appears {count}x)")
    
    has_upper = sum(1 for m in mapping if any(c.isupper() for c in m["password"]))
    has_lower = sum(1 for m in mapping if any(c.islower() for c in m["password"]))
    has_digit = sum(1 for m in mapping if any(c.isdigit() for c in m["password"]))
    has_special = sum(1 for m in mapping if any(not c.isalnum() for c in m["password"]))
    
    print(f"\n[CHARS] Character Composition:")
    print(f"   Has uppercase:  {has_upper:>4} ({has_upper/total*100:5.1f}%)")
    print(f"   Has lowercase:  {has_lower:>4} ({has_lower/total*100:5.1f}%)")
    print(f"   Has digits:     {has_digit:>4} ({has_digit/total*100:5.1f}%)")
    print(f"   Has special:    {has_special:>4} ({has_special/total*100:5.1f}%)")
    
    print("\n" + "=" * 60)
    print("   KEY FINDINGS")
    print("=" * 60)
    weak_pct = strength_counts.get("weak", 0) / total * 100
    print(f"""
    1. {weak_pct:.0f}% of passwords are categorized as WEAK
    2. Top 10 passwords account for {sum(c for _, c in pw_counts.most_common(10))/total*100:.0f}% of all entries
    3. Only {has_special/total*100:.0f}% of passwords contain special characters
    4. Average password length is {sum(lengths)/len(lengths):.1f} characters
    5. {length_buckets['<6']+length_buckets['6-8']} passwords ({(length_buckets['<6']+length_buckets['6-8'])/total*100:.0f}%) are 8 chars or shorter
    
    RECOMMENDATION: Enforce minimum 12-character passwords with
    mandatory uppercase, lowercase, digit, and special character.
    Use bcrypt/Argon2 for hashing. Implement MFA.
    """)

def main():
    mapping = load_mapping()
    if not mapping:
        return
    print_stats(mapping)

if __name__ == "__main__":
    main()
