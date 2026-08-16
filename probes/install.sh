#!/bin/sh
# Phase: INSTALL  —  the Q28 probe, made executable.
#
# `services/projectCommands.js` emits a bare `pip install -r requirements.txt`
# for any repository carrying that file, and ADR-0041's Decision says the
# container "runs only commands the repository declared". ADR-0041's second
# 2026-08-15 correction records that, on the pinned bookworm base, THIS EXACT
# command failed twice over:
#   1. PEP 668 — /usr/lib/python3.*/EXTERNALLY-MANAGED makes pip refuse with
#      `error: externally-managed-environment` before resolving a dependency.
#   2. Permissions — repository commands run as uid 1001 and
#      /usr/lib/python3/dist-packages is root-owned, so the install would fail
#      anyway.
# The fix put a virtualenv at /opt/venv, FIRST on PATH, owned by `runner`, so the
# bare `pip`/`python` resolve to it. This phase proves that fix is actually in
# the DEPLOYED image — not just in the Dockerfile — because the sandbox-job.yaml
# digest was stale as of 2026-08-15 and deploying it re-ships the broken image.
#
# This phase runs FIRST and a failed install STOPS the whole run
# (sandbox/index.js:512), so if it fails the later probes will not have run. That
# is correct and faithful: a real Python repo with a broken install cannot be
# tested either, and the install failure is itself the finding.
set -u
. "$(dirname "$0")/lib.sh"

printf 'PROBE:pip-venv-install pip=%s python=%s VIRTUAL_ENV=%s\n' \
  "$(command -v pip || echo none)" \
  "$(command -v python || echo none)" \
  "${VIRTUAL_ENV:-unset}"

if pip install -r requirements.txt; then
  probe_pass pip-venv-install "install into the venv succeeded — Q28 verified: a declared pip install works under uid 1001"
  exit 0
fi

probe_fail pip-venv-install "pip install FAILED — the DEPLOYED image likely predates the /opt/venv fix (Q28: PEP 668 or dist-packages permissions). Rebuild sandbox/Dockerfile, push, re-pin infra/sandbox-job.yaml, redeploy, re-run."
exit 1
