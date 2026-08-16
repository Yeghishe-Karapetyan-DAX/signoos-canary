# Shared helpers for the Signoos sandbox canary probes.
#
# WHY THIS FILE EXISTS. Every probe answers one yes/no question about a property
# ADR-0041 claims, and every probe must answer it the SAME way: print one
# greppable `PROBE:<name>` line, decide PASS (the property holds) or FAIL (the
# property is falsified), and record a falsification somewhere the final tally
# can find it — all WITHOUT aborting, so the next probe still runs. These three
# helpers are that contract.
#
# THE SHELL DISCIPLINE, AND WHY.
#   `set -u` is on in every probe: an unset variable is a bug in the probe, not
#   an observation about the sandbox, so it should fail loudly.
#   `set -e` is deliberately OFF. A probe SUCCEEDS by provoking a refusal, and a
#   refusal is a non-zero exit from `cat`/`curl`/`pip`. Under `set -e` the first
#   HEALTHY denial would abort the script and hide every probe after it — the
#   exact opposite of "one anomaly visible per line, without aborting the run".
#
# WHERE FAILURES ARE RECORDED. Each declared phase runs in its OWN `/bin/sh -c`
# (install, lint, build, test are separate spawns — sandbox/index.js), so there
# is no shared shell state between them. They DO share the /workspace filesystem,
# so a falsification is appended to $ANOMALY_FILE and the last phase (test)
# reads it back for one consolidated tally.

ANOMALY_FILE="${ANOMALY_FILE:-/workspace/.canary_anomalies}"

# The property held. Print evidence; leave the tally untouched.
probe_pass() { # <name> <detail>
  printf 'PROBE:%s RESULT:PASS %s\n' "$1" "$2"
}

# The property was falsified. Print it AND record it, so (a) the line is visible
# in the stored output and (b) the phase can exit non-zero and the tally can
# count it. The append never aborts the probe even if the write is refused.
probe_fail() { # <name> <detail>
  printf 'PROBE:%s RESULT:FAIL %s\n' "$1" "$2"
  printf '%s: %s\n' "$1" "$2" >> "$ANOMALY_FILE" 2>/dev/null || true
}

# An observation that is neither pass nor fail — e.g. the metadata token WAS
# minted, which ADR-0041 says is expected; the security question is what such a
# token can DO, which a separate probe answers.
probe_info() { # <name> <detail>
  printf 'PROBE:%s RESULT:INFO %s\n' "$1" "$2"
}
