#!/bin/sh
# Phase: TEST  —  the positive controls plus the consolidated tally.
#
# The lint/build probes prove refusals; this phase proves the sandbox can still
# do the legitimate work ADR-0041 requires — install a dependency and run a
# repository's declared test suite — and then reports whether any earlier probe
# recorded a falsification. It runs LAST because install->lint->build->test is
# the container's fixed order (sandbox/index.js), so by now every other phase has
# had its say in $ANOMALY_FILE.
set -u
. "$(dirname "$0")/lib.sh"
fails=0

# ── PROBE:venv-import — the installed dependency survives into a later phase ──
# ADR-0041's venv correction: /opt/venv is first on PATH and owned by `runner`,
# so a package installed by the install phase is importable by the test phase.
# This is the positive half of the Q28 probe (install.sh proved the install; this
# proves the result is usable across commands).
VER="$(python -c 'import requests,sys; sys.stdout.write(requests.__version__)' 2>&1)"; rc=$?
if [ "$rc" -eq 0 ]; then
  probe_pass venv-import "requests $VER imports from the venv — the install phase's dependency is usable in a later command"
else
  probe_fail venv-import "could not import requests ($VER) — the venv did not carry across phases; check PATH/VIRTUAL_ENV in sandbox/Dockerfile"
  fails=$((fails + 1))
fi

# ── PROBE:pytest — a real suite runs and returns a real exit code ────────────
# ADR-0041: "Execution is real." A green suite proves the mechanism end to end;
# it proves NOTHING about patch safety (a repo can make its own tests pass — the
# reviewer caps a passing suite at medium confidence).
PYTEST_OUT="$(pytest -q 2>&1)"; rc=$?
printf 'PROBE:pytest exit=%s\n%s\n' "$rc" "$PYTEST_OUT"
if [ "$rc" -eq 0 ]; then
  probe_pass pytest "the declared pytest suite ran and passed (exit 0) — the container executes the repo's own test command"
else
  probe_fail pytest "pytest exited $rc — the canary suite did not pass; the run harness itself may be broken (not a security property)"
  fails=$((fails + 1))
fi

# ── PROBE:summary — one consolidated tally across every phase ────────────────
# Each FAIL was appended to $ANOMALY_FILE by whichever phase saw it (phases are
# separate shells but share /workspace). Read THIS line first.
if [ -s "$ANOMALY_FILE" ]; then
  N="$(wc -l < "$ANOMALY_FILE" | tr -d ' ')"
  printf 'PROBE:summary RESULT:ANOMALIES count=%s\n' "$N"
  cat "$ANOMALY_FILE"
else
  printf 'PROBE:summary RESULT:ALL-CLEAR every ADR-0041 property this kit tests held\n'
fi

# HOW THE VERDICT IS SURFACED.
# By default this phase exits non-zero only for its OWN failures (venv-import,
# pytest), so each phase's task-thread verdict attributes a red step to the phase
# that saw the problem — lint reds for an identity leak, build reds for cloud
# reach, test reds for a broken harness.
#
# Set CANARY_STRICT=1 (a stored/console command env, or edit signoos.yml to
# `test: CANARY_STRICT=1 sh probes/verify.sh`) to ALSO fail the test phase when
# ANY probe anywhere recorded an anomaly — useful if you only glance at the last
# step's verdict rather than reading the stored PROBE output.
if [ "${CANARY_STRICT:-0}" != "0" ] && [ -s "$ANOMALY_FILE" ]; then
  fails=$((fails + 1))
fi

[ "$fails" -gt 0 ] && exit 1
exit 0
