# Quick Start Guide

Get up and running with RegexPlay in just a few minutes! This guide will walk you through your first regex tests and introduce key features.

## 🚀 First Steps

### 1. Launch RegexPlay

After [installation](installation.md), start RegexPlay:

```bash
regexplay
```

You'll see the interactive interface with two main areas:
- **Pattern**: Where you enter your regex pattern
- **Text**: Where you enter text to test against

### 2. Your First Pattern

Let's test a simple pattern to find numbers:

1. **Enter pattern**: Type `\d+` in the pattern field
2. **Enter text**: Type `I have 42 apples and 7 oranges`
3. **See results**: Matches are highlighted instantly!

**Result**: You'll see `42` and `7` highlighted as matches.

### 3. Understanding the Interface

The interface shows:
- **✅ 2 matches found** - Number of matches
- **Highlighted text** - Visual feedback of matches
- **Match details** - Position and captured groups (if any)

## 🎯 Essential Patterns

Try these common patterns to get familiar with RegexPlay:

### Email Detection
```
Pattern: [\w\.-]+@[\w\.-]+\.\w+
Text: Contact us at support@example.com or help@test.org
```

### Phone Numbers
```
Pattern: \(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
Text: Call (555) 123-4567 or 555.987.6543
```

### URLs
```
Pattern: https?://[\w\.-]+\.\w+
Text: Visit https://example.com or http://test.org
```

### Words with Specific Length
```
Pattern: \b\w{5}\b
Text: The quick brown fox jumps over lazy dogs
```

## ⌨️ Keyboard Shortcuts

Master these shortcuts for efficient testing:

| Key | Action |
|-----|--------|
| `Tab` | Switch between pattern and text |
| `Ctrl+S` | Save current session |
| `Ctrl+L` | Load saved session |
| `Ctrl+E` | Switch regex engine |
| `Ctrl+C` | Exit RegexPlay |
| `F1` | Show help |

## 💾 Save Your Work

### Quick Save
1. Press `Ctrl+S`
2. Enter filename: `email-validation`
3. Session saved to `.regexplay-sessions/email-validation.json`

### Quick Load
1. Press `Ctrl+L`
2. Select from saved sessions
3. Pattern and text restored instantly

## 🚀 Command Line Usage

For quick tests without the interactive interface:

### Basic Test
```bash
regexplay --regex "\d+" --text "Find 123 numbers"
```

### Load Saved Session
```bash
regexplay --load email-validation.json
```

### Test with Flags
```bash
regexplay --regex "hello" --text "Hello World" --flags "i"
```

## 🔄 Workflow Examples

### Example 1: Validating Input

**Goal**: Create a pattern for usernames (letters, numbers, underscore, 3-20 chars)

1. **Start with basic pattern**: `\w+`
2. **Add length constraint**: `\w{3,20}`
3. **Anchor to full string**: `^\w{3,20}$`
4. **Test with various inputs**:
   - `john_doe123` ✅
   - `a` ❌ (too short)
   - `user@name` ❌ (invalid character)

### Example 2: Extracting Data

**Goal**: Extract prices from product descriptions

1. **Pattern**: `\$\d+\.\d{2}`
2. **Test text**: `Product A costs $29.99 and Product B is $15.50`
3. **Results**: `$29.99` and `$15.50` highlighted
4. **Save session** for future use

### Example 3: Log File Analysis

**Goal**: Find error messages in logs

1. **Pattern**: `ERROR.*`
2. **Test with log entries**:
   ```
   2023-09-20 10:30:15 INFO User logged in
   2023-09-20 10:31:22 ERROR Database connection failed
   2023-09-20 10:32:01 WARNING Low disk space
   2023-09-20 10:33:45 ERROR Authentication timeout
   ```
3. **Results**: Error lines highlighted

## 🎨 Visual Feedback

RegexPlay provides rich visual feedback:

- **🟢 Green highlights**: Successful matches
- **🔴 Red indicators**: Syntax errors
- **📊 Match counter**: Real-time match count
- **📍 Position info**: Character positions of matches

## 🔧 Engine Switching

RegexPlay supports multiple regex engines:

1. **Press `Ctrl+E`** to switch engines
2. **JavaScript** (default): ES2018+ features
3. **PCRE** (if available): Perl-compatible regex

Different engines may produce different results for the same pattern!

## 📚 Learning Resources

### Built-in Help
- Press `F1` for quick help
- View examples and shortcuts

### External Resources
- [RegexOne Tutorial](https://regexone.com/) - Interactive regex lessons
- [Regex101](https://regex101.com/) - Online regex tester
- [MDN Regex Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

## 🚨 Common Gotchas

### Escaping Special Characters
- Use `\.` for literal dots, not `.`
- Use `\\` for literal backslashes

### Case Sensitivity
- Use `i` flag for case-insensitive matching
- `hello` won't match `Hello` without the `i` flag

### Global Matching
- Use `g` flag to find all matches
- Without `g`, only first match is found

## ⏭️ Next Steps

Now that you're familiar with the basics:

1. **Try the [Beginner Tutorial](beginner-tutorial.md)** - Structured learning path
2. **Explore [Common Patterns](../examples/common-patterns.md)** - Real-world examples
3. **Read the [User Guide](user-guide.md)** - Comprehensive documentation
4. **Check [Advanced Tutorial](advanced-tutorial.md)** - Complex patterns and techniques

## 🆘 Need Help?

- **In-app help**: Press `F1`
- **FAQ**: [Frequently Asked Questions](faq.md)
- **Issues**: [GitHub Issues](https://github.com/Vaporjawn/RegexPlay/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Vaporjawn/RegexPlay/discussions)

---

*Ready to dive deeper? Continue with the [Beginner Tutorial](beginner-tutorial.md)!*