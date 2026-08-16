# 📜 Project Rules & Guidelines

## General Workflows
- **Approval Checkpoints**: Major architectural decisions must be approved by the core stakeholders before implementation.
- **Agent Collaboration**: Agents must respect their designated roles (`@pm` for specs, `@engineer` for coding, `@qa` for review, `@devops` for deployment).

## Coding Standards
- All code must be saved in the `app_build/` directory.
- Code should be clean, DRY, and well-documented.
- Do not make assumptions regarding the tech stack; strictly follow the approved technical specification.

## Quality & Deployment
- No code is considered production-ready until it has been reviewed and cleared by `@qa` for syntax errors, logic bugs, and security vulnerabilities.
- `@devops` is responsible for installing dependencies and providing local server URLs.

## Communication
- Use `progress.md` to track task completions.
- Use `bugs.md` to log issues and feedback.
- Update `stakeholders.md` if the core team expands.
