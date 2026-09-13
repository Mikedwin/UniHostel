# C6 Security Enhancement Proposal: Expanded IDS Coverage

## Summary
As a logical progression from C5 (session cookie rotation on sensitive actions), this proposal outlines C6: **Expand the Intrusion Detection System (IDS) to detect additional attack vectors beyond SQL injection and XSS**.

## Current State (Post-C5)
- ✅ CSMITM)
- ✅ CSRF tokens with SameSite attributes
- ✅ Role-based access control with JWT authentication
- ✅ Password security with bcrypt hashing
- ✅ Input validation and sanitization
- ✅ Rate limiting with Redis storage
- ✅ Comprehensive logging and monitoring
- ✅ Security headers enhanced (via Helmet.js upgrade)
- ✅ Session cookie rotation implemented for sensitive operations:
  - Password change
  - TOTP enable/disable  
  - Password reset (all variants)
  - Security question updates

## C6 Proposal: Enhanced IDS Detection Capabilities

### Why Expand the IDS?
The existing IDS (C4 focus) detects SQL injection and XSS attacks using regex patterns. While these are critical threats, modern web applications face a broader attack surface. Expanding IDS coverage provides:
- **Defense in depth**: Multiple layers of protection
- **Early threat detection**: Catch attacks before they reach application logic
- **Comprehensive monitoring**: Better visibility into attack attempts
- **Automated response**: Integrated blocking and alerting

### New Detection Capabilities to Add

#### 1. Path Traversal Detection
**Threat**: Attempts to access files outside the intended directory (e.g., `../../../etc/passwd`)
**Patterns to detect**:
- Basic traversal: `..\/`, `..\\`, `..%2F`, `..%5C`
- Encoded variations: `%2E%2E%2F`, `.%2e%2f`, etc.
- Double encoding: `%252E%252E%252F`
- Specific sensitive paths: `/etc/passwd`, `/boot/grub/grub.cfg`, `\\windows\\system32\\`
- Windows administrative shares: `C:\$, ADMIN$`

#### 2. Command Injection Detection
**Threat**: Attempts to execute arbitrary system commands (e.g., `; ls | cat /etc/passwd`)
**Patterns to detect**:
- Command separators: `;`, `&`, `|`, `&&`, `||`
- Command substitution: `$()`, `` ` ``
- Common malicious commands: `wget`, `curl`, `nc`, `bash`, `sh`, `cmd`, `powershell`
- Environment variable access: `${VAR}`, `%VAR%`
- Reconnaissance commands: `ifconfig`, `ipconfig`, `netstat`, `ss`, `route`, `arp`
- Destructive commands: `rm`, `del`, `format`, `mkfs`, `dd`

#### 3. SSRF (Server-Side Request Forgery) Detection
**Threat**: Attempts to make the server perform unintended requests (e.g., to internal services)
**Patterns to detect**:
- Internal IP ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`
- Localhost variants: `localhost`, `127.0.0.1`, `[::1]`
- Cloud metadata endpoints: `169.254.169.254` (AWS/Azure/GCP)
- Internal ports commonly used by services: `8080`, `8443`, `3306`, `5432`, `6379`, `9200`, `27017`
- Suspicious domains: `.local`, `.internal`, `.corp`, `.lan`
- Dangerous protocols: `file://`, `data://`, `gopher://`

#### 4. Authentication Bypass Detection
**Threat**: Attempts to circumvent authentication mechanisms
**Patterns to detect**:
- SQL tautologies in auth contexts: `' OR '1'='1`, `" OR "="="`
- Common bypass strings: `admin'--`, `administrator/*`
- JSON injection attempts targeting auth fields
- XML entity expansion (Billion laughs) attempts

### Implementation Approach
Enhance the existing `/backend/middleware/intrusionDetection.js` middleware by:
1. Adding new regex pattern arrays for each attack category
2. Creating detection functions for each threat type
3. Expanding the `scanRequest()` function to check for all threat types
4. Maintaining the existing alerting, logging, and auto-ban functionality
5. Ensuring all patterns are ReDoS-safe (using simple string matching where regex is risky)

### Security Benefits
- **Prevents file disclosure** via path traversal attacks
- **Stops command execution** attempts that could lead to full system compromise
- **Blocks SSRF attempts** that could access internal services or cloud metadata
- **Detects credential theft attempts** through authentication bypass techniques
- **Provides comprehensive threat visibility** through enhanced logging
- **Enables automated response** via existing blocking and alerting systems

### Integration Points
- Uses existing `BannedIp` and `SecurityLog` models
- Leverages existing alerting functions (`sendSecurityAlert`, `sendTelegramAlert`, `sendDiscordAlert`)
- Works with current rate limiting and auto-block configuration (`SECURITY_AUTO_BLOCK`)
- Maintains fail-open behavior to prevent accidental service disruption
- No changes required to routes or controllers - pure middleware enhancement

### ReDoS Safety Considerations
All new patterns will be designed to prevent ReDoS (Regular Expression Denial of Service):
- Prefer simple string matching (`includes()`, `startsWith()`, `endsWith()`) over complex regex when possible
- For necessary regex patterns:
  - Avoid nested quantifiers and backtracking-heavy patterns
  - Use character classes instead of alternation where appropriate
  - Test patterns against potential attack strings to ensure reasonable performance
  - Consider timeouts for regex execution in high-risk scenarios

### Next Steps After C6
Following this enhancement, logical future security improvements (C7, C8, etc.) might include:
- Implementing request/response signing for sensitive APIs
- Adding behavioral analysis for anomaly detection
- Integrating with external threat intelligence feeds
- Implementing API abuse detection (rate limiting by user/API key)
- Adding runtime application self-protection (RASP) capabilities
- Enhancing API security with formal validation (OpenAPI/Swagger enforcement)