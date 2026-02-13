# Known Issues - Video Clipper

## Critical Issues (Must Fix)

### 1. Hardcoded Segment Duration

**Severity:** 🔴 CRITICAL  
**Location:** [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js) (Line 27)  
**Description:** The segment download duration is hardcoded to `*00:00:00.00-00:00:00.00`, which downloads 0-second segments.  
**Current Code:**

```javascript
"--download-sections",
"*00:00:00.00-00:00:00.00",  // This is 0 seconds!
```

**Impact:** Videos cannot be downloaded with any meaningful content.  
**Expected Behavior:** Should accept start and end timestamps from user input.  
**Solution:**

- Extract timestamp parameters from request query (e.g., `?q=url&start=10&end=30`)
- Validate timestamp format and ranges
- Pass dynamic values to yt-dlp

---

### 2. Process Spawning Doesn't Wait for Completion

**Severity:** 🔴 CRITICAL  
**Location:** [server/src/utils/spawn-process.js](server/src/utils/spawn-process.js)  
**Description:** The spawned yt-dlp process is not properly awaited, causing response to return before processing completes.  
**Current Behavior:**

- Function returns immediately
- Download happens asynchronously in background
- Client gets HTML link before file exists
- No mechanism to track completion

**Impact:**

- Downloaded files don't exist when user clicks download link
- 404 errors for missing files
- No way to know when download is complete

**Solution:**

- Return Promise that resolves when process exits
- Implement callback-based completion tracking
- Add webhook or polling endpoint to check status
- Store job status in memory or database

---

### 3. Hardcoded Response Filename

**Severity:** 🔴 CRITICAL  
**Location:** [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js) (Line 42)  
**Description:** Response hardcodes filename "30 SECOND TIMER.webm" which doesn't match generated filename.  
**Current Code:**

```javascript
res
  .status(200)
  .send(
    `<a href=http://localhost:3000/public/${"30 SECOND TIMER.webm"} download>Click to download</a>`,
  );
```

**Current Generated Pattern:** `segment_part[0-9].%(ext)s`  
**Impact:** Download link points to non-existent file.  
**Solution:**

- Track actual generated filename
- Validate file exists before sending response
- Return filename in response or implement file lookup

---

## High Priority Issues (Should Fix)

### 4. No Input Validation

**Severity:** 🟠 HIGH  
**Location:** [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js) (Lines 16-22)  
**Description:** YouTube URL validation is minimal - only checks if query parameter exists.  
**Current Code:**

```javascript
if (!q) {
  return res
    .status(400)
    .json({ success: false, message: "Please provide youtube link!" });
}
// No validation of actual URL format
```

**Issues:**

- Invalid URLs passed to yt-dlp without validation
- No check for YouTube domain
- No URL encoding verification

**Solution:**

- Implement URL validation regex for YouTube URLs
- Whitelist supported YouTube formats (videos, shorts, playlists)
- Sanitize URL before passing to system process

---

### 5. Race Condition in Filename Generation

**Severity:** 🟠 HIGH  
**Location:** [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js) (Line 24)  
**Description:** Random filename generation without collision detection.  
**Current Code:**

```javascript
const file1 = path.join(
  outputDir,
  `segment_part${Math.floor(Math.random() * 10)}.%(ext)s`,
);
```

**Issues:**

- Only 10 possible filenames (0-9) creates collision risk
- Multiple simultaneous requests can generate same filename
- Later request overwrites earlier request's file

**Solution:**

- Use UUID or timestamp-based unique identifiers
- Implement file locking mechanism
- Add job queue to sequence downloads

---

### 6. No Error Handling for yt-dlp Failures

**Severity:** 🟠 HIGH  
**Location:** [server/src/modules/media/media.controller.js](server/src/modules/media/media.controller.js) (Lines 35-40)  
**Description:** Process errors aren't caught or communicated to client.  
**Current Code:**

```javascript
segment.on("exit", (code) => console.log(`Segment 1 done (code ${code})`));
// Exit code not checked, client doesn't receive error
```

**Issues:**

- Non-zero exit codes ignored
- stderr printed to console but not returned to client
- No distinction between success and failure
- Client has no way to know if download failed

**Solution:**

- Check exit code and reject promise on failure
- Send error response to client with exit code
- Log error details for debugging
- Implement timeout protection

---

### 7. Missing Process Cleanup and Timeouts

**Severity:** 🟠 HIGH  
**Location:** [server/src/utils/spawn-process.js](server/src/utils/spawn-process.js)  
**Description:** No mechanism to terminate long-running processes or handle timeouts.  
**Issues:**

- Hung processes consume resources indefinitely
- Large videos can spawn processes that never complete
- No CPU or memory limits enforced
- Zombie processes possible

**Solution:**

- Implement timeout (e.g., 10 minutes max per download)
- Add process termination on timeout
- Monitor and log resource usage
- Implement process pool with limits

---

## Medium Priority Issues (Nice to Have)

### 8. No Structured Logging

**Severity:** 🟡 MEDIUM  
**Location:** Throughout codebase  
**Description:** Only basic console.log statements, no structured logging system.  
**Issues:**

- Hard to parse logs in production
- No log levels or filtering
- No correlation IDs for tracking requests
- Difficult to debug issues

**Solution:**

- Integrate Winston or Bunyan for structured logging
- Add request IDs for tracking
- Implement log levels (debug, info, warn, error)
- Add context/metadata to logs

---

### 9. Unused Dependencies

**Severity:** 🟡 MEDIUM  
**Location:** [server/package.json](server/package.json)  
**Description:** Redis dependency installed but never used.  
**Current:** `"redis": "5.10.0"`  
**Impact:**

- Adds to bundle size unnecessarily
- Maintenance burden
- Confusing for developers

**Solution:**

- Remove if not needed
- Or implement caching layer for downloaded segments
- Or implement session management

---

### 10. Empty Middleware and Modules

**Severity:** 🟡 MEDIUM  
**Location:**

- [server/src/middleware/auth-check.middleware.js](server/src/middleware/auth-check.middleware.js)
- [server/src/modules/user/](server/src/modules/user/)
- [server/src/config/db.js](server/src/config/db.js)
- [server/src/config/env.js](server/src/config/env.js)

**Description:** Scaffolded but not implemented.  
**Impact:** Creates confusion about project scope and implementation status.  
**Solution:**

- Either implement these modules
- Or remove if not needed
- Or clearly mark as "to be implemented"

---

### 11. No API Documentation

**Severity:** 🟡 MEDIUM  
**Location:** No Swagger/OpenAPI docs  
**Description:** No documentation of API endpoints, request/response formats.  
**Impact:**

- Difficult for clients to use API
- No clear contract between frontend and backend
- Hard to onboard new developers

**Solution:**

- Create Swagger/OpenAPI specification
- Use swagger-ui Express middleware
- Document all endpoints with examples

---

### 12. Hardcoded Server Configuration

**Severity:** 🟡 MEDIUM  
**Location:** [server/src/server.js](server/src/server.js)  
**Description:** Port (3000) and other config hardcoded.  
**Issues:**

- Cannot change port via environment variable
- No configuration file support
- Difficult for different deployment environments

**Solution:**

- Use dotenv for environment variables
- Implement configuration module
- Set defaults for all values

---

## Low Priority Issues (Enhancement)

### 13. No Unit Tests

**Severity:** 🟢 LOW  
**Location:** [server/test/unit/](server/test/unit/)  
**Description:** Unit test directory exists but is empty.  
**Impact:** No automated testing of individual components.  
**Solution:**

- Add Jest or Mocha test framework
- Write tests for MediaController methods
- Write tests for utility functions
- Aim for 80%+ coverage

---

### 14. Incomplete Load Testing

**Severity:** 🟢 LOW  
**Location:** [server/test/load/media-download.js](server/test/load/media-download.js)  
**Description:** Load test exists but can be enhanced.  
**Solution:**

- Add more realistic test scenarios
- Test with varying URL types
- Add performance benchmarks
- Create CI/CD integration

---

### 15. PM2 Ecosystem Not Configured

**Severity:** 🟢 LOW  
**Location:** [server/ecosystem.config.js](server/ecosystem.config.js)  
**Description:** PM2 configuration file exists but is empty.  
**Solution:**

- Configure for production deployment
- Set up log rotation
- Configure restart strategies
- Add monitoring

---

### 16. No Security Headers

**Severity:** 🟢 LOW  
**Location:** [server/src/app.js](server/src/app.js)  
**Description:** No security middleware implemented.  
**Issues:**

- Missing CORS configuration
- No rate limiting
- No helmet security headers
- Vulnerable to certain attacks

**Solution:**

- Add helmet middleware
- Implement rate limiting
- Configure CORS properly
- Add input sanitization

---

## Issue Tracking Convention

### Severity Levels

- 🔴 **CRITICAL:** System non-functional, data loss possible, security breach
- 🟠 **HIGH:** Major feature broken or significant degradation
- 🟡 **MEDIUM:** Feature not working as expected or missing functionality
- 🟢 **LOW:** Nice to have, polish, optimization

### Status Labels (for tracking)

- `bug` - Confirmed defect
- `enhancement` - Feature improvement
- `documentation` - Documentation needed
- `chore` - Maintenance, refactoring
- `blocked` - Waiting on external dependency
- `ready` - Ready for implementation
- `in-progress` - Currently being worked on
- `review` - Pending code review
- `done` - Completed and merged

---

**Last Updated:** January 29, 2026  
**Total Open Issues:** 16  
**Critical Issues:** 3  
**High Priority:** 4  
**Medium Priority:** 5  
**Low Priority:** 4
