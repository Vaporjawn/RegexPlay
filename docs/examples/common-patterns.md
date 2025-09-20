# Common Regex Patterns

A curated collection of frequently used regular expression patterns with RegexPlay examples and explanations.

## 📧 Email Patterns

### Basic Email Validation
```regex
Pattern: [\w.-]+@[\w.-]+\.\w{2,}
Example: user@example.com, test.email@domain.org
Use Case: Simple email validation for forms
```

### RFC-Compliant Email (Simplified)
```regex
Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
Example: user.name+tag@example.co.uk
Use Case: More strict email validation
```

### Extract Email Domains
```regex
Pattern: @([\w.-]+\.\w+)
Example: @example.com, @subdomain.test.org
Use Case: Extract just the domain part
```

## 📞 Phone Number Patterns

### US Phone Numbers
```regex
Pattern: \(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
Examples:
  - (555) 123-4567
  - 555-123-4567
  - 555.123.4567
  - 5551234567
Use Case: Flexible US phone number matching
```

### International Format
```regex
Pattern: \+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
Examples:
  - +1 (555) 123-4567
  - +1-555-123-4567
  - 1.555.123.4567
Use Case: US numbers with country code
```

### Extract Area Code
```regex
Pattern: \(?(\d{3})\)?
Example: Extract "555" from "(555) 123-4567"
Use Case: Getting just the area code
```

## 🌐 URL Patterns

### Basic URLs
```regex
Pattern: https?://[\w.-]+\.\w+[\w/.-]*
Examples:
  - https://example.com
  - http://test.org/path
  - https://sub.domain.com/path/file.html
Use Case: Extract URLs from text
```

### URLs with Parameters
```regex
Pattern: https?://[\w.-]+\.\w+[\w/.?&=-]*
Examples:
  - https://example.com/search?q=regex
  - http://site.org/page?id=123&type=test
Use Case: URLs with query parameters
```

### Domain Extraction
```regex
Pattern: https?://([\w.-]+\.\w+)
Example: Extract "example.com" from "https://example.com/path"
Use Case: Get just the domain name
```

## 💰 Financial Patterns

### Currency Amounts
```regex
Pattern: \$\d{1,3}(,\d{3})*(\.\d{2})?
Examples:
  - $29.99
  - $1,234.56
  - $1,000,000
Use Case: Price extraction and validation
```

### Credit Card Numbers (Basic)
```regex
Pattern: \d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}
Examples:
  - 1234-5678-9012-3456
  - 1234 5678 9012 3456
  - 1234567890123456
Use Case: Credit card number formatting
```

### Invoice Numbers
```regex
Pattern: INV-\d{4,6}
Examples:
  - INV-001234
  - INV-123456
Use Case: Invoice reference tracking
```

## 📅 Date and Time Patterns

### US Date Format (MM/DD/YYYY)
```regex
Pattern: \d{1,2}/\d{1,2}/\d{4}
Examples:
  - 12/25/2023
  - 1/1/2024
  - 09/15/2023
Use Case: American date format validation
```

### International Date (DD/MM/YYYY)
```regex
Pattern: \d{1,2}/\d{1,2}/\d{4}
Examples:
  - 25/12/2023
  - 01/01/2024
Use Case: European date format
```

### ISO Date Format
```regex
Pattern: \d{4}-\d{2}-\d{2}
Examples:
  - 2023-12-25
  - 2024-01-01
Use Case: Database date format
```

### Time (12-hour)
```regex
Pattern: \d{1,2}:\d{2}\s?(AM|PM)
Examples:
  - 2:30 PM
  - 11:45AM
  - 12:00 PM
Use Case: 12-hour time format
```

### Time (24-hour)
```regex
Pattern: \d{1,2}:\d{2}(:\d{2})?
Examples:
  - 14:30
  - 23:59:59
  - 09:15
Use Case: 24-hour time format
```

## 🔤 Text and Word Patterns

### Extract Hashtags
```regex
Pattern: #\w+
Examples:
  - #regex
  - #programming
  - #tutorial
Use Case: Social media hashtag extraction
```

### Extract Mentions
```regex
Pattern: @\w+
Examples:
  - @username
  - @regexplay
Use Case: Social media mention extraction
```

### Words with Specific Length
```regex
Pattern: \b\w{5}\b
Examples: "quick", "brown", "jumps" from "The quick brown fox jumps"
Use Case: Find words of exact length
```

### Capitalized Words
```regex
Pattern: \b[A-Z][a-z]+\b
Examples:
  - "John" from "john doe"
  - "Apple" from "apple orange"
Use Case: Proper nouns and names
```

### All Caps Words
```regex
Pattern: \b[A-Z]{2,}\b
Examples:
  - "HTML" from "Learn HTML and CSS"
  - "API" from "REST API documentation"
Use Case: Acronyms and abbreviations
```

## 📊 Data Validation Patterns

### IP Addresses (Simple)
```regex
Pattern: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
Examples:
  - 192.168.1.1
  - 10.0.0.1
  - 127.0.0.1
Use Case: Basic IP address matching
```

### MAC Addresses
```regex
Pattern: [0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}
Examples:
  - 00:1B:44:11:3A:B7
  - AA:BB:CC:DD:EE:FF
Use Case: Network hardware identification
```

### Hex Colors
```regex
Pattern: #[0-9A-Fa-f]{6}
Examples:
  - #FF5733
  - #00AAFF
  - #123456
Use Case: CSS color code validation
```

### ZIP Codes (US)
```regex
Pattern: \d{5}(-\d{4})?
Examples:
  - 12345
  - 12345-6789
Use Case: US postal code validation
```

## 🔐 Password Patterns

### Basic Password Requirements
```regex
Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$
Requirements:
  - At least 8 characters
  - One lowercase letter
  - One uppercase letter
  - One digit
Use Case: Basic password validation
```

### Strong Password
```regex
Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$
Requirements:
  - At least 8 characters
  - One lowercase letter
  - One uppercase letter
  - One digit
  - One special character
Use Case: Strong password validation
```

## 📝 File and Path Patterns

### File Extensions
```regex
Pattern: \.\w{1,4}$
Examples:
  - .txt
  - .html
  - .json
  - .jpeg
Use Case: Extract file extensions
```

### Image Files
```regex
Pattern: \.(jpg|jpeg|png|gif|bmp|svg)$
Examples:
  - image.jpg
  - photo.png
  - icon.svg
Use Case: Image file filtering (case-sensitive)
```

### Unix Path
```regex
Pattern: \/[\w.-]+(?:\/[\w.-]+)*
Examples:
  - /home/user/documents
  - /var/log/app.log
Use Case: Unix file system paths
```

### Windows Path
```regex
Pattern: [A-Za-z]:\\[\w\s.-\\]+
Examples:
  - C:\Program Files\App
  - D:\Documents\file.txt
Use Case: Windows file system paths
```

## 🏷️ HTML and Markup Patterns

### HTML Tags
```regex
Pattern: <[^>]+>
Examples:
  - <p>
  - <div class="container">
  - </html>
Use Case: Remove or extract HTML tags
```

### Extract Tag Content
```regex
Pattern: <(\w+)[^>]*>(.*?)<\/\1>
Examples:
  - Extract "content" from "<p>content</p>"
  - Extract "title" from "<h1>title</h1>"
Use Case: Get content inside HTML tags
```

### Extract Attributes
```regex
Pattern: (\w+)="([^"]*)"
Examples:
  - class="container" → class, container
  - id="main" → id, main
Use Case: Parse HTML attributes
```

## 📄 Log File Patterns

### Common Log Format
```regex
Pattern: \[(.*?)\]\s+(\w+)\s+(.*)
Examples:
  - [2023-09-20 14:30:15] INFO User logged in
  - [2023-09-20 14:31:22] ERROR Database connection failed
Use Case: Parse structured log entries
```

### Error Messages
```regex
Pattern: (ERROR|FATAL|CRITICAL).*
Examples:
  - ERROR: Database connection timeout
  - FATAL: System crash detected
Use Case: Filter error-level log entries
```

### Extract Timestamps
```regex
Pattern: \d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}
Examples:
  - 2023-09-20 14:30:15
  - 2024-01-01 00:00:00
Use Case: Extract timestamps from logs
```

## 🎯 How to Use These Patterns

### In RegexPlay

1. **Copy the pattern** from above
2. **Start RegexPlay**: `regexplay`
3. **Paste pattern** in the pattern field
4. **Add test text** based on examples
5. **Test and modify** as needed
6. **Save useful patterns**: Press `Ctrl+S`

### Testing Tips

1. **Start simple**: Begin with basic versions
2. **Add complexity gradually**: Build up the pattern
3. **Test edge cases**: Try invalid inputs
4. **Use global flag**: Add `g` to find all matches
5. **Consider case sensitivity**: Add `i` flag if needed

### Customization

These patterns are starting points. Modify them for your specific needs:

- **Make more restrictive**: Add specific constraints
- **Make more flexible**: Use optional groups `(...)?`
- **Add boundaries**: Use `\b` for word boundaries
- **Anchor patterns**: Use `^` and `$` for full string matches

## 🚀 Contributing Patterns

Have a useful pattern to share?

1. Test it thoroughly in RegexPlay
2. Document examples and use cases
3. Submit a pull request to add it here
4. Help others learn regex!

---

*Need help with these patterns? Check the [User Guide](../guides/user-guide.md) or ask in [GitHub Discussions](https://github.com/Vaporjawn/RegexPlay/discussions).*