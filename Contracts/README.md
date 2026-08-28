# Contracts Index

This folder is the control center for building the project with AI agents.

## Files

- `Plan.md`: product scope, implementation contracts, acceptance checks, and token rules.
- `Agents.md`: mandatory agent workflow, resume logic, and working rules.
- `Progress.md`: persistent status ledger for interrupted or continued work.
- `RepoMap.md`: lightweight project map so agents can avoid reading the full repository.

## Agent Startup

Start here every time:

1. Read `Progress.md`.
2. Read `Agents.md`.
3. Read only the active or next contract section in `Plan.md`.
4. Read `RepoMap.md`.
5. Check `git status --short --branch`.
6. Continue from the active contract instead of restarting completed work.

## Human Workflow

Use the contract IDs from `Plan.md` when asking for work. Example:

```text
Continue C04 - Realtime Team Chat.
```

If no contract ID is given, the agent should use `Progress.md` to determine the next unfinished contract.
