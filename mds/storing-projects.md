# Storing Projects Review

## Scope of this review

This review covers only the architecture described in `mds/architecture-plan.md`, with focus on the save/import part. It does not review the current implementation.

The findings below describe the issues in the draft architecture that was under discussion. The architecture plan has since been updated to reflect the recommended v1 direction.

## Recommendation

The current plan is directionally correct, but it puts too much weight on direct file saving and not enough on loss prevention.

For this product, the most practical v1 architecture is:

1. Keep the active project autosaved inside the browser.
2. Let the user explicitly export/import a JSON file when they want a portable copy in their local directory.
3. Do not implement the File System Access API in this version of the application.

That is lighter than the current plan, works in all major browsers, and gives a better answer to the "what if internet blinks?" concern.

## Lightweight approaches

### Browser autosave + JSON export/import

This is the lightest architecture that still feels safe.

How it works:

- Every meaningful change is autosaved in browser storage.
- The user clicks `Export` to download a JSON file when they want a local copy.
- The user clicks `Import` to reopen a previously exported file.

Why this is good:

- simplest cross-browser behavior
- no filesystem permission complexity
- good protection against refresh/crash
- internet loss during editing does not matter after the page is loaded

Tradeoff:

- there is no true "overwrite the same file" workflow
- if the user clears browser storage, the local autosaved working copy is gone unless they exported a file

## Proposed decision

For v1, I would recommend this:

1. Use browser-local autosave as the main protection against data loss.
2. Use JSON export/import as the official persistence feature.
3. Do not implement File System Access API in this version of the application.

That gives the simplest architecture with the strongest answer to the user's actual concern: not losing a kitchen plan while working on it.
