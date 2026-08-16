# 🐛 Bug Tracker & QA Log

> **Note for `@qa`**: Log all discovered syntax issues, missing configurations, runtime errors, unhandled promises, and logic bugs in `app_build/` below.

---

## 📊 Summary
| Severity | Open | In Progress | Resolved | Total |
| :--- | :---: | :---: | :---: | :---: |
| 🚨 Critical | 0 | 0 | 0 | 0 |
| 🔴 High | 0 | 0 | 0 | 0 |
| 🟡 Medium | 0 | 0 | 0 | 0 |
| 🟢 Low / Tweak | 0 | 0 | 0 | 0 |

---

## 🚨 Critical Bugs (Blocks Execution / Crash)
*No critical bugs reported.*

---

## 🔴 High Severity Issues (Functional Breakage / Logic Error)
*No high severity issues reported.*

---

## 🟡 Medium Severity Issues (UI Glitches / Edge Cases)
*No medium severity issues reported.*

---

## 🟢 Low Severity & Polish (Minor Improvements)
*No minor issues reported.*

---

## 🟡 Open Issues
- **Missing Database configuration**: The application crashes with `Environment variable not found: DATABASE_URL` because no `.env` file was set up and no local PostgreSQL database was initialized. Pending user configuration and `npx prisma db push`.

---

## ✅ Resolved Issues
*No issues resolved yet.*

---

## 📝 Bug Report Template (for `@qa`)
```markdown
### [BUG-XXX] Short Title Description
- **Severity**: Critical | High | Medium | Low
- **Component**: Frontend | Backend | API | Config
- **Discovered By**: @qa
- **Status**: Open | In Progress | Resolved
- **Description**: Detailed description of the flaw.
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
- **Proposed Fix / Applied Solution**: What needs to be (or was) modified in `app_build/`.
```
