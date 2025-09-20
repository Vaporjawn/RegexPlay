# Contributing to RegexPlay

Thank you for your interest in contributing to RegexPlay! 🎉 We welcome contributions from developers of all skill levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include:

- **Clear title** - Describe the issue in the title
- **Steps to reproduce** - Detailed steps to reproduce the behavior
- **Expected behavior** - What you expected to happen
- **Actual behavior** - What actually happened
- **Environment** - OS, Node.js version, RegexPlay version
- **Screenshots/logs** - If applicable

**Bug Report Template:**
```markdown
**Environment:**
- OS: [e.g., macOS 12.0, Ubuntu 20.04]
- Node.js: [e.g., 16.14.0]
- RegexPlay: [e.g., 1.0.0]

**Steps to Reproduce:**
1. Launch RegexPlay
2. Enter pattern: `...`
3. Enter text: `...`
4. See error

**Expected Behavior:**
Pattern should match...

**Actual Behavior:**
Error occurs...

**Additional Context:**
Any other context about the problem.
```

### ✨ Suggesting Features

Feature suggestions are welcome! Please:

- **Check existing requests** - Search issues for similar suggestions
- **Describe the feature** - Clear description of the enhancement
- **Explain the use case** - Why would this be useful?
- **Consider alternatives** - What other solutions have you considered?

### 🔧 Contributing Code

#### Types of Contributions Needed

- **Core Features** - New regex engines, improved parsing
- **UI/UX Improvements** - Better terminal interface, visual enhancements
- **Documentation** - Guides, tutorials, API documentation
- **Testing** - Unit tests, integration tests, edge cases
- **Bug Fixes** - Resolve existing issues
- **Performance** - Optimize existing functionality

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher
- **Git** for version control

### Setup Steps

1. **Fork the repository**
   ```bash
   # Visit https://github.com/Vaporjawn/RegexPlay and click "Fork"
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/RegexPlay.git
   cd RegexPlay
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run tests to verify setup**
   ```bash
   npm test
   ```

5. **Test the application**
   ```bash
   # Test CLI functionality
   node cli.js --regex "\d+" --text "test 123"

   # Test interactive mode
   node cli.js
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Run tests frequently**
   ```bash
   npm test
   npm run test:sessions
   npm run test:highlighting
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### Submitting the PR

1. **Create Pull Request** from your fork to `main` branch
2. **Fill out PR template** with detailed description
3. **Link related issues** using keywords (fixes #123)
4. **Request review** from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** - CI/CD pipeline runs tests
2. **Code review** - Maintainers review code quality
3. **Testing** - Manual testing of new features
4. **Feedback** - Address any requested changes
5. **Approval** - PR approved and merged

## 📝 Style Guidelines

### JavaScript Code Style

- **ES6+ Features** - Use modern JavaScript features
- **Semicolons** - Always use semicolons
- **Quotes** - Use single quotes for strings
- **Indentation** - 2 spaces, no tabs
- **Line Length** - Maximum 100 characters
- **Naming** - camelCase for variables and functions

```javascript
// Good
const regexEngine = new JavaScriptEngine();
const result = await regexEngine.test(pattern, text, flags);

// Bad
var regex_engine = new JavaScriptEngine()
const result = await regex_engine.test(pattern,text,flags)
```

### File Organization

- **Modules** - Use require/module.exports
- **File Names** - camelCase for modules, kebab-case for configs
- **Directory Structure** - Follow existing patterns

### Comments and Documentation

- **JSDoc** - Use JSDoc for function documentation
- **Inline Comments** - Explain complex logic
- **README Updates** - Update documentation for new features

```javascript
/**
 * Test a regex pattern against text
 * @param {string} pattern - The regex pattern to test
 * @param {string} text - The text to test against
 * @param {string} flags - Regex flags (optional)
 * @returns {Promise<Object>} Test result with matches
 */
async function testPattern(pattern, text, flags = '') {
  // Implementation here
}
```

## 🧪 Testing Guidelines

### Test Structure

```
test/
├── unit/           # Unit tests for individual modules
├── integration/    # Integration tests for workflows
├── fixtures/       # Test data and mock files
└── helpers/        # Test utility functions
```

### Writing Tests

- **Descriptive Names** - Clear test descriptions
- **Arrange-Act-Assert** - Structure tests clearly
- **Edge Cases** - Test boundary conditions
- **Error Cases** - Test error handling

```javascript
describe('RegexEngine', () => {
  describe('test method', () => {
    it('should find matches for valid pattern', async () => {
      // Arrange
      const engine = new JavaScriptEngine();
      const pattern = '\\d+';
      const text = 'Test 123 numbers';

      // Act
      const result = await engine.test(pattern, text, 'g');

      // Assert
      expect(result.success).toBe(true);
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].fullMatch).toBe('123');
    });
  });
});
```

### Running Tests

```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## 📚 Documentation Guidelines

### Documentation Types

- **API Documentation** - JSDoc comments in code
- **User Guides** - Step-by-step tutorials
- **Developer Docs** - Architecture and contribution guides
- **Examples** - Code samples and use cases

### Writing Style

- **Clear and Concise** - Easy to understand
- **Examples** - Include code examples
- **Structure** - Use headings and lists
- **Links** - Reference related documentation

### Documentation Updates

When making changes:

- [ ] Update relevant documentation files
- [ ] Add examples for new features
- [ ] Update CLI help text if needed
- [ ] Review documentation for accuracy

## 🌟 Recognition

### Contributors

All contributors are recognized in:

- **README.md** - Contributors section
- **CHANGELOG.md** - Version release notes
- **GitHub Contributors** - Automatic recognition

### Types of Recognition

- **Code Contributors** - Pull request authors
- **Bug Reporters** - Issue creators with valid bugs
- **Feature Requesters** - Valuable feature suggestions
- **Documentation** - Documentation improvements
- **Community Support** - Helping other users

## 📞 Community

### Communication Channels

- **GitHub Discussions** - General questions and ideas
- **GitHub Issues** - Bug reports and feature requests
- **Email** - Direct contact for sensitive matters

### Getting Help

If you need help with contribution:

1. **Check Documentation** - Read existing guides
2. **Search Issues** - Look for similar questions
3. **Ask in Discussions** - Community help
4. **Contact Maintainers** - For specific guidance

### Maintainer Response Times

- **Issues** - Within 48 hours
- **Pull Requests** - Within 72 hours
- **Discussions** - Within 24 hours
- **Security Issues** - Within 24 hours

## 🚀 Release Process

### Version Management

- **Semantic Versioning** - MAJOR.MINOR.PATCH
- **Changelog** - Detailed release notes
- **Migration Guides** - For breaking changes

### Release Schedule

- **Patch Releases** - Bug fixes (as needed)
- **Minor Releases** - New features (monthly)
- **Major Releases** - Breaking changes (quarterly)

## 📋 Contribution Checklist

Before submitting your contribution:

### Code Changes
- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No linting errors
- [ ] Performance impact considered

### Pull Request
- [ ] Descriptive title and description
- [ ] Linked to relevant issues
- [ ] Requested appropriate reviewers
- [ ] CI/CD checks passing

### Communication
- [ ] Followed Code of Conduct
- [ ] Responded to feedback promptly
- [ ] Asked questions when unclear

## 🎉 Thank You!

Thank you for contributing to RegexPlay! Your contributions help make regex learning and testing better for everyone.

---

*Happy contributing!* 🚀