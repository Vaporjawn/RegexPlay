# Beginner Tutorial: Learn Regex with RegexPlay

Welcome to the complete beginner's guide to regular expressions using RegexPlay! This tutorial will take you from zero regex knowledge to confidently writing your own patterns.

## 📚 What You'll Learn

By the end of this tutorial, you'll be able to:
- Understand regex syntax and concepts
- Write patterns for common text matching tasks
- Use quantifiers, character classes, and groups effectively
- Apply regex flags for different matching behaviors
- Save and organize your regex patterns

## 🎯 Prerequisites

- RegexPlay installed ([Installation Guide](installation.md))
- Basic command line knowledge
- Text editor familiarity

**Estimated time**: 30-45 minutes

## 📖 Chapter 1: Regex Basics

### What is a Regular Expression?

A regular expression (regex) is a pattern that describes text. Think of it as a sophisticated "find" function that can:
- Find specific text patterns
- Validate input formats
- Extract data from text
- Replace text based on patterns

### Your First Pattern

Let's start RegexPlay:

```bash
regexplay
```

**Exercise 1.1: Literal Matching**

1. **Pattern**: `cat`
2. **Text**: `The cat sat on the mat`
3. **Result**: The word "cat" is highlighted

✏️ **Try this**: Change the text to `Cat` (capital C). Notice it doesn't match? Regex is case-sensitive by default.

**Exercise 1.2: Case-Insensitive Matching**

1. **Pattern**: `cat`
2. **Text**: `The Cat sat on the mat`
3. **Flags**: `i` (for case-insensitive)
4. **Result**: Now "Cat" matches!

### Understanding Special Characters

Regex has special characters with unique meanings:

| Character | Meaning | Example |
|-----------|---------|---------|
| `.` | Any character | `c.t` matches `cat`, `cut`, `c@t` |
| `*` | Zero or more | `ca*t` matches `ct`, `cat`, `caat` |
| `+` | One or more | `ca+t` matches `cat`, `caat` (not `ct`) |
| `?` | Zero or one | `ca?t` matches `ct`, `cat` (not `caat`) |
| `^` | Start of string | `^cat` matches only if "cat" is at start |
| `$` | End of string | `cat$` matches only if "cat" is at end |

**Exercise 1.3: The Dot Character**

1. **Pattern**: `c.t`
2. **Text**: `cat cut cot c@t c123t`
3. **Result**: All words match except `c123t` (`.` matches one character)

**Exercise 1.4: Escaping Special Characters**

1. **Pattern**: `3.14`
2. **Text**: `Pi is 3.14 or 3214`
3. **Result**: Both "3.14" and "3214" match (`.` means any character)

To match a literal dot:
1. **Pattern**: `3\.14`
2. **Text**: `Pi is 3.14 or 3214`
3. **Result**: Only "3.14" matches

## 📖 Chapter 2: Character Classes

Character classes let you match any character from a set.

### Basic Character Classes

| Pattern | Meaning | Example |
|---------|---------|---------|
| `[abc]` | a, b, or c | `[aeiou]` matches any vowel |
| `[a-z]` | Any lowercase letter | `[a-z]+` matches words |
| `[A-Z]` | Any uppercase letter | `[A-Z][a-z]+` matches capitalized words |
| `[0-9]` | Any digit | `[0-9]+` matches numbers |
| `[^abc]` | NOT a, b, or c | `[^0-9]` matches non-digits |

**Exercise 2.1: Vowel Finder**

1. **Pattern**: `[aeiou]`
2. **Text**: `Hello World`
3. **Flags**: `g` (global - find all matches)
4. **Result**: All vowels highlighted: `e`, `o`, `o`

**Exercise 2.2: Digit Extractor**

1. **Pattern**: `[0-9]+`
2. **Text**: `I have 42 apples and 7 oranges, cost $29.99`
3. **Flags**: `g`
4. **Result**: `42`, `7`, `29`, `99` highlighted

### Predefined Character Classes

Regex provides shortcuts for common character classes:

| Shortcut | Equivalent | Meaning |
|----------|------------|---------|
| `\d` | `[0-9]` | Any digit |
| `\w` | `[a-zA-Z0-9_]` | Word characters |
| `\s` | `[ \t\n\r]` | Whitespace |
| `\D` | `[^0-9]` | Non-digits |
| `\W` | `[^a-zA-Z0-9_]` | Non-word characters |
| `\S` | `[^ \t\n\r]` | Non-whitespace |

**Exercise 2.3: Using Shortcuts**

1. **Pattern**: `\d+`
2. **Text**: `Order #12345 costs $67.89`
3. **Flags**: `g`
4. **Result**: `12345`, `67`, `89` highlighted

**Exercise 2.4: Word Boundaries**

1. **Pattern**: `\b\w{4}\b`
2. **Text**: `The quick brown fox jumps over the lazy dog`
3. **Flags**: `g`
4. **Result**: All 4-letter words: `jumps`, `over`, `lazy`

## 📖 Chapter 3: Quantifiers

Quantifiers specify how many times a character or group should appear.

### Basic Quantifiers

| Quantifier | Meaning | Example |
|------------|---------|---------|
| `{n}` | Exactly n times | `\d{3}` matches exactly 3 digits |
| `{n,}` | n or more times | `\d{3,}` matches 3+ digits |
| `{n,m}` | Between n and m | `\d{3,5}` matches 3-5 digits |
| `*` | Zero or more | `\d*` matches 0+ digits |
| `+` | One or more | `\d+` matches 1+ digits |
| `?` | Zero or one | `\d?` matches 0-1 digits |

**Exercise 3.1: Phone Number Pattern**

1. **Pattern**: `\d{3}-\d{3}-\d{4}`
2. **Text**: `Call 555-123-4567 or 555-987-6543`
3. **Flags**: `g`
4. **Result**: Both phone numbers highlighted

**Exercise 3.2: Flexible Phone Numbers**

1. **Pattern**: `\d{3}[.-]?\d{3}[.-]?\d{4}`
2. **Text**: `Call 555-123-4567, 555.987.6543, or 5551234567`
3. **Flags**: `g`
4. **Result**: All three formats match

### Greedy vs. Non-Greedy

By default, quantifiers are "greedy" - they match as much as possible.

**Exercise 3.3: Greedy Matching**

1. **Pattern**: `".+"`
2. **Text**: `He said "hello" and "goodbye"`
3. **Result**: Matches entire `"hello" and "goodbye"` (greedy)

**Exercise 3.4: Non-Greedy Matching**

1. **Pattern**: `".+?"`
2. **Text**: `He said "hello" and "goodbye"`
3. **Result**: Matches `"hello"` and `"goodbye"` separately

## 📖 Chapter 4: Groups and Capturing

Groups allow you to treat multiple characters as a unit and capture matched text.

### Basic Groups

| Pattern | Meaning | Example |
|---------|---------|---------|
| `(abc)` | Group abc | `(cat\|dog)` matches "cat" or "dog" |
| `(?:abc)` | Non-capturing group | Groups without saving match |
| `\1, \2` | Backreference | Refers to captured groups |

**Exercise 4.1: Simple Grouping**

1. **Pattern**: `(cat\|dog)`
2. **Text**: `I have a cat and a dog`
3. **Flags**: `g`
4. **Result**: Both "cat" and "dog" highlighted

**Exercise 4.2: Email Parts**

1. **Pattern**: `(\w+)@(\w+\.\w+)`
2. **Text**: `Email me at john@example.com or jane@test.org`
3. **Flags**: `g`
4. **Result**: Full emails match, with username and domain captured

### Named Groups

Modern regex supports named groups for better readability:

**Exercise 4.3: Named Groups**

1. **Pattern**: `(?<username>\w+)@(?<domain>\w+\.\w+)`
2. **Text**: `Contact: admin@company.com`
3. **Result**: Captures "admin" as username, "company.com" as domain

## 📖 Chapter 5: Anchors and Boundaries

Anchors don't match characters - they match positions.

| Anchor | Meaning | Example |
|--------|---------|---------|
| `^` | Start of string | `^Hello` matches only at beginning |
| `$` | End of string | `World$` matches only at end |
| `\b` | Word boundary | `\bcat\b` matches whole word "cat" |
| `\B` | Non-word boundary | `\Bcat\B` matches "cat" inside words |

**Exercise 5.1: Start and End**

1. **Pattern**: `^Hello.*World$`
2. **Text**: `Hello beautiful World`
3. **Result**: Entire string matches

**Exercise 5.2: Word Boundaries**

1. **Pattern**: `\bcat\b`
2. **Text**: `The cat in the concatenate`
3. **Result**: Only the standalone "cat" matches, not in "concatenate"

## 📖 Chapter 6: Real-World Examples

Let's apply what we've learned to practical problems.

### Example 1: Email Validation

**Goal**: Match valid email addresses

**Step-by-step building**:

1. **Start simple**: `\w+@\w+`
2. **Add dots in username**: `[\w.]+@\w+`
3. **Add domain structure**: `[\w.]+@\w+\.\w+`
4. **Handle subdomains**: `[\w.]+@[\w.]+\.\w+`
5. **Final pattern**: `[\w.-]+@[\w.-]+\.\w{2,}`

**Exercise 6.1: Test Email Pattern**

1. **Pattern**: `[\w.-]+@[\w.-]+\.\w{2,}`
2. **Text**:
   ```
   Valid: user@example.com, test.email@sub.domain.org
   Invalid: invalid.email, @domain.com, user@
   ```
3. **Result**: Only valid emails should match

### Example 2: URL Extraction

**Goal**: Extract URLs from text

1. **Pattern**: `https?://[\w.-]+\.\w+[\w/.-]*`
2. **Text**:
   ```
   Visit https://example.com or http://test.org/path
   Also check https://sub.domain.com/deep/path/file.html
   ```

### Example 3: Data Validation

**Goal**: Validate different data formats

**Credit Card (simple)**:
```
Pattern: \d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}
Text: 1234-5678-9012-3456 or 1234 5678 9012 3456
```

**Date (MM/DD/YYYY)**:
```
Pattern: \d{1,2}/\d{1,2}/\d{4}
Text: 12/25/2023 or 1/1/2024
```

**US Phone**:
```
Pattern: \(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
Text: (555) 123-4567 or 555.123.4567
```

## 📖 Chapter 7: Session Management

RegexPlay lets you save your work for later use.

### Saving Sessions

**Exercise 7.1: Save Your Work**

1. Create a useful pattern (like the email validator)
2. Press `Ctrl+S`
3. Name it: `email-validator`
4. Session saved to `.regexplay-sessions/email-validator.json`

### Loading Sessions

**Exercise 7.2: Load Saved Session**

1. Press `Ctrl+L`
2. Select `email-validator.json`
3. Pattern and text restored

### Session File Format

Sessions are saved as JSON:

```json
{
  "pattern": "[\\w.-]+@[\\w.-]+\\.\\w{2,}",
  "flags": "g",
  "text": "test@example.com and user@domain.org",
  "engine": "javascript",
  "timestamp": "2025-09-20T20:43:10.799Z",
  "version": "1.0.0"
}
```

## 🎯 Practice Exercises

Test your knowledge with these challenges:

### Challenge 1: Password Validation
Create a pattern for passwords that:
- Are 8-20 characters long
- Contain at least one uppercase letter
- Contain at least one digit
- May contain special characters

**Hint**: Use positive lookaheads: `(?=.*[A-Z])(?=.*\d)`

### Challenge 2: Log Parser
Extract timestamps from log entries:
```
2023-09-20 14:30:15 INFO User logged in
2023-09-20 14:31:22 ERROR Database failed
```

### Challenge 3: CSV Parser
Extract quoted fields from CSV:
```
"John Doe","30","Engineer","New York"
"Jane Smith","25","Designer","Los Angeles"
```

### Challenge 4: HTML Tag Stripper
Remove HTML tags from text:
```
<p>This is <strong>bold</strong> text</p>
```

## 🎓 Next Steps

Congratulations! You've completed the beginner tutorial. Here's what to do next:

### Immediate Practice
1. **Try the [Advanced Tutorial](advanced-tutorial.md)** - Complex patterns and techniques
2. **Explore [Common Patterns](../examples/common-patterns.md)** - Real-world examples
3. **Read the [User Guide](user-guide.md)** - Complete reference

### Build Your Skills
1. Practice daily with different text sources
2. Join regex communities and forums
3. Contribute patterns to the RegexPlay repository

### External Resources
- [RegexOne](https://regexone.com/) - Interactive lessons
- [Regex101](https://regex101.com/) - Online testing
- [RegexLearn](https://regexlearn.com/) - Step-by-step tutorials
- [RegexCrossword](https://regexcrossword.com/) - Puzzle games

## 📚 Review Quiz

Test your understanding:

1. What does `\d{3,5}` match?
2. How do you make a pattern case-insensitive?
3. What's the difference between `*` and `+`?
4. How do you match a literal dot?
5. What does `\b` represent?

**Answers**:
1. 3 to 5 digits
2. Add the `i` flag
3. `*` matches 0 or more, `+` matches 1 or more
4. Use `\.` (backslash escapes the dot)
5. Word boundary

## 🆘 Getting Help

If you get stuck:

1. **In-app help**: Press `F1` in RegexPlay
2. **FAQ**: [Frequently Asked Questions](faq.md)
3. **Community**: [GitHub Discussions](https://github.com/Vaporjawn/RegexPlay/discussions)
4. **Issues**: [GitHub Issues](https://github.com/Vaporjawn/RegexPlay/issues)

---

*Excellent work completing the tutorial! Continue your regex journey with the [Advanced Tutorial](advanced-tutorial.md).*