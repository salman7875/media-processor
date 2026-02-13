# Pull Request Guidelines - Video Clipper

## Overview

This document outlines the standards and procedures for contributing code to the Video Clipper project through pull requests (PRs).

## Before You Start

### 1. Check Existing Issues

- Review [ISSUES.md](ISSUES.md) to understand known problems
- Check existing PRs to avoid duplicate work
- Comment on an issue to indicate you're working on it

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-name
# or
git checkout -b docs/update-description
```

### 3. Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring without changing functionality
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

## Code Standards

### JavaScript/Node.js Standards

#### Module System

- Use ES Modules (`import`/`export`) consistently
- Path imports: Use relative paths with explicit extensions (`.js`)
- Example:

```javascript
import { MediaController } from "./media.controller.js";
import path from "path";
```

#### Naming Conventions

- **Functions:** camelCase - `fetchVideo()`, `getESMDirname()`
- **Classes:** PascalCase - `MediaController`, `VideoProcessor`
- **Constants:** UPPER_SNAKE_CASE - `MAX_RETRIES`, `DEFAULT_PORT`
- **Private methods:** Prefix with `_` - `_validateUrl()`
- **Files:** kebab-case - `media.controller.js`, `auth-check.middleware.js`

#### Code Style

- Use 2-space indentation
- Maximum line length: 100 characters (soft limit 120)
- Use semicolons
- Use const/let, avoid var
- Use arrow functions for callbacks
- Use template literals for string interpolation

```javascript
// ✅ Good
const message = `User ${id} downloaded video`;
const handler = (data) => console.log(data);

// ❌ Avoid
var message = "User " + id + " downloaded video";
const handler = function (data) {
  console.log(data);
};
```

#### Error Handling

- Use try-catch for async operations
- Return error responses with appropriate HTTP status codes
- Always log errors with context

```javascript
// ✅ Good
try {
  const data = await fetchVideo(url);
  return res.status(200).json(data);
} catch (error) {
  console.error("Video fetch failed:", error.message);
  return res.status(500).json({ error: error.message });
}

// ❌ Avoid
const data = await fetchVideo(url);
return res.status(200).json(data);
```

#### No Hardcoded Values

- Use configuration files or environment variables
- Exception: Test constants
- All API URLs, ports, credentials, paths should be configurable

### File Organization

```
modules/
  featureName/
    index.js              # Exports main class/functions
    feature.controller.js # Business logic
    feature.route.js      # Route definitions
    feature.model.js      # Data structures (if needed)
    feature.test.js       # Tests (if large)

utils/
  utility-name.js        # Named by function purpose

middleware/
  middleware-name.js     # Named by purpose
```

### Comments and Documentation

#### Required Comments

- **Complex logic:** Explain why, not what

```javascript
// ✅ Good - Explains purpose and context
// Use random filename to avoid collisions in concurrent downloads
// UUID would be better but this is legacy code
const filename = `segment_${Date.now()}_${Math.random().toString(36)}`;

// ❌ Avoid - Obvious from code
// Generates random filename
const filename = Math.random();
```

- **Workarounds:** Always explain technical debt

```javascript
// TODO(ISSUE-#23): Replace with proper queue system when implemented
// Currently using synchronous processing due to architecture limitations
```

#### JSDoc for Public Functions

```javascript
/**
 * Fetches and processes video segment from YouTube URL
 * @param {string} youtubeUrl - Valid YouTube video URL
 * @param {number} startTime - Start time in seconds
 * @param {number} endTime - End time in seconds
 * @returns {Promise<Object>} { filename, size, duration }
 * @throws {Error} If URL invalid or download fails
 */
export async function fetchVideo(youtubeUrl, startTime, endTime) {
  // implementation
}
```

## Commit Message Convention

Follow Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Format Rules

- **Type:** feat, fix, docs, style, refactor, test, chore
- **Scope:** Module or component affected (optional but recommended)
- **Subject:** Imperative, lowercase, no period, max 50 chars
- **Body:** Explain what and why, wrap at 72 chars (optional but recommended for non-trivial changes)
- **Footer:** Reference issues - `Fixes #123`, `Related #456`

### Examples

```bash
# ✅ Good
git commit -m "fix(media): resolve hardcoded segment duration

Replace hardcoded 0-second segment with user input parameters.
Validates timestamp format and ranges before passing to yt-dlp.

Fixes #1"

# ✅ Good - Simple fix
git commit -m "docs: update README with setup instructions"

# ❌ Avoid
git commit -m "fixed stuff"
git commit -m "WIP: trying something"
git commit -m "asdf"
```

## Pull Request Process

### 1. Pre-PR Checklist

Before submitting, ensure:

- [ ] Code follows style guide above
- [ ] No hardcoded values (except tests)
- [ ] Error handling implemented
- [ ] Functions documented with JSDoc
- [ ] No console.log left in production code (use proper logging)
- [ ] Tests added for new functionality
- [ ] Tests pass locally
- [ ] No merge conflicts with main branch
- [ ] Related issues linked
- [ ] Changelog entry added (if applicable)

### 2. Create PR with Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #(issue number)

## Testing

How were these changes tested?

## Screenshots (if applicable)

Visual proof of functionality

## Checklist

- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing locally
```

### 3. PR Title Convention

```
<type>: <description>

fix: resolve hardcoded segment duration in media controller
feat: add timestamp validation for video segments
docs: update API documentation
refactor: simplify spawn-process utility
test: add unit tests for input validation
```

### 4. Ensure CI/CD Passes

- All tests must pass
- No linting errors
- Code coverage maintained (target: 80%+)
- No security vulnerabilities

### 5. Request Code Review

- Request review from at least 1 maintainer
- Address feedback promptly
- Push updates to same branch (auto-updates PR)

### 6. Approval and Merge

- Require 1 approval before merge
- Keep commits clean (squash if needed)
- Delete branch after merge
- Reference PR in commit message if not already done

## Review Checklist for Reviewers

When reviewing code:

- [ ] Functionality is correct and complete
- [ ] Code follows project conventions
- [ ] Error handling is comprehensive
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable
- [ ] Tests cover new functionality
- [ ] Documentation is accurate and complete
- [ ] No hardcoded values
- [ ] Backward compatibility maintained (or breaking change documented)
- [ ] Commit messages are clear

### Review Comments

- Be constructive and respectful
- Distinguish between blocking (must fix) and non-blocking (nice to have)
- Use suggestion feature when possible
- Praise good practices

## Testing Requirements

### Unit Tests

- All new functions must have unit tests
- Test both success and failure paths
- Use meaningful test names

### Integration Tests

- Test API endpoints end-to-end
- Mock external dependencies (yt-dlp, ffmpeg)
- Test with real-world data

### Load Tests

- Run existing load test before pushing
- Benchmark for performance regressions
- Document baseline metrics

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run load test
npm run test:media
```

## Troubleshooting Common Issues

### Large PR, difficulty reviewing

- Split into smaller focused PRs
- Each PR should do one thing well

### Merge conflicts

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts
git push --force-with-lease
```

### CI failing

- Check error logs in GitHub Actions
- Run tests locally with same Node version
- Ensure all dependencies installed

### Feedback feels harsh

- Remember we're improving code, not criticizing people
- Ask clarifying questions
- Assume good intent

## Common Mistakes to Avoid

| ❌ Mistake                 | ✅ Solution                              |
| -------------------------- | ---------------------------------------- |
| Hardcoded paths/URLs       | Use environment variables                |
| No error handling          | Add try-catch and proper error responses |
| Long methods (>50 lines)   | Break into smaller functions             |
| No tests                   | Write tests alongside code               |
| Poor commit messages       | Use Conventional Commits format          |
| Multiple unrelated changes | One PR = one feature/fix                 |
| No documentation           | Add JSDoc and comments                   |
| Ignoring CI failures       | Fix all before merging                   |

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/javascriptguide.html)
- [Project Architecture](ARCHITECTURE.md)
- [Known Issues](ISSUES.md)

---

**Last Updated:** January 29, 2026  
**Questions?** Open a discussion or comment on issues
