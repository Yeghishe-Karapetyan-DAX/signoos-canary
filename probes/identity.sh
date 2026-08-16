#!/bin/sh
# Phase: LINT  —  "who am I, and what can I see?"
#
# These probes observe the identity repository code was handed. They exercise the
# two-account control that ADR-0041's Decision rests on ("Inside the container
# there are two accounts, and the split is the control") and the process/file
# ceilings from its "bounds" paragraph. None of them run repository build logic;
# an expected refusal here is a PASS and must not abort the run, which is why
# this file sets -u but not -e (see lib.sh).
set -u
. "$(dirname "$0")/lib.sh"
fails=0

# ── PROBE:id — the uid split, and the setgroups(2) gap ───────────────────────
# ADR-0041: repository commands are spawned as `runner` (uid 1001, via
# `untrustedSpawnIdentity` in sandbox/index.js), never as root. The subtlety this
# probe exists to catch: Node's child_process.spawn sets uid and gid but does NOT
# call setgroups(2), so the child can KEEP root's supplementary groups even while
# its uid is 1001. A `groups=` list containing `0(root)` means group-0-readable
# resources are reachable by repository code — at which point ADR-0041 needs
# amendment and sandbox/index.js must drop supplementary groups explicitly.
ID_OUT="$(id 2>&1)"
printf 'PROBE:id %s\n' "$ID_OUT"
if printf '%s' "$ID_OUT" | grep -q 'uid=0('; then
  probe_fail id "running as ROOT (uid=0) — repository code was not dropped to the runner account; the uid split is not in effect"
  fails=$((fails + 1))
elif printf '%s' "$ID_OUT" | grep -q '(root)'; then
  probe_fail id "uid is non-root but a group is 0(root) — Node spawn set uid/gid but not setgroups(2); ADR-0041 needs amendment (handle setgroups explicitly)"
  fails=$((fails + 1))
else
  probe_pass id "unprivileged (runner, uid 1001) with no root group leak"
fi

# ── PROBE:proc1-environ — the session token cannot be read from PID 1 ─────────
# ADR-0041: PID 1 stays root precisely so /proc/1/environ is root-owned and mode
# 0400, which is what stops repository code (uid 1001) reading SIGNOOS_SESSION_TOKEN
# out of it and POSTing a fabricated /result (first-writer-wins locks the honest
# runner out with a 401). Expected: permission denied.
ENV1="$(cat /proc/1/environ 2>&1)"; rc=$?
if [ "$rc" -ne 0 ]; then
  probe_pass proc1-environ "cat /proc/1/environ refused (exit $rc) — PID 1's environment is unreachable to repository code"
elif printf '%s' "$ENV1" | grep -q 'SIGNOOS_SESSION_TOKEN'; then
  probe_fail proc1-environ "READABLE and contains SIGNOOS_SESSION_TOKEN — repository code can steal the session token and forge a result. CRITICAL."
  fails=$((fails + 1))
else
  probe_fail proc1-environ "/proc/1/environ is readable by uid 1001 — the uid split is not protecting PID 1's environment"
  fails=$((fails + 1))
fi

# ── PROBE:env-signoos — the token is removed from the child environment ──────
# ADR-0041 / sandbox/index.js: SESSION_TOKEN is read once and `delete process.env`d
# before repository code runs, so children do NOT inherit it.
#
# NOTE THE REAL BEHAVIOUR, not the imagined one: SIGNOOS_API_BASE and
# SIGNOOS_SESSION_ID ARE still inherited (runRaw spawns with env: process.env and
# only the TOKEN is deleted). Neither is a secret — the API base is public and the
# session id is useless without the token. So the property tested here is narrow
# and exact: SIGNOOS_SESSION_TOKEN must be ABSENT.
#
# Anchored to the variable NAME (`^SIGNOOS`), not a bare value match: index.js
# only ever sets SIGNOOS_* variables, and an unanchored `grep -i signoos` would
# also fire on any variable whose VALUE happened to contain the string (e.g. a
# PWD under a directory named "Signoos"), which is noise, not a token leak.
SIG="$(env | grep -i '^SIGNOOS' || true)"
printf 'PROBE:env-signoos vars=[%s]\n' "$(printf '%s' "$SIG" | cut -d= -f1 | tr '\n' ',' )"
if printf '%s' "$SIG" | grep -q 'SIGNOOS_SESSION_TOKEN'; then
  probe_fail env-signoos "SIGNOOS_SESSION_TOKEN is present in the environment — it was not deleted before repository code ran. CRITICAL."
  fails=$((fails + 1))
elif [ -z "$SIG" ]; then
  probe_pass env-signoos "SAFE: no SIGNOOS_* variables in the environment at all"
else
  probe_pass env-signoos "token absent; only the non-secret SIGNOOS_API_BASE/SIGNOOS_SESSION_ID remain (expected)"
fi

# ── PROBE:ulimit — the fork-bomb / disk-fill ceilings are applied ────────────
# ADR-0041 bounds: repository commands run under `ulimit -u 512` and a 1 GiB
# per-file ceiling (`ulimit -f 2097152`, in 512-byte blocks), applied in the SAME
# shell (sandbox/index.js LIMITS_PREFIX) so everything they spawn inherits them.
# Expected: finite. Unlimited means a repo's own command can DoS the runner and
# hold a deployment-wide slot.
UPROC="$(ulimit -u 2>/dev/null || echo unknown)"
UFILE="$(ulimit -f 2>/dev/null || echo unknown)"
printf 'PROBE:ulimit nproc=%s fsize=%s\n' "$UPROC" "$UFILE"
if [ "$UPROC" = unlimited ] || [ "$UFILE" = unlimited ]; then
  probe_fail ulimit "a ceiling is unlimited (nproc=$UPROC fsize=$UFILE) — the LIMITS_PREFIX did not apply; a repo command can starve the runner"
  fails=$((fails + 1))
else
  probe_pass ulimit "finite process/file ceilings (nproc=$UPROC fsize=$UFILE)"
fi

# Turn the LINT step's verdict red in the task thread iff a property was
# falsified here. Expected refusals kept fails at 0, so a healthy sandbox exits 0.
[ "$fails" -gt 0 ] && exit 1
exit 0
