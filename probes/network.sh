#!/bin/sh
# Phase: BUILD  —  the metadata identity is powerless.
#
# ADR-0041 Consequences, plainly: "A metadata token can still be minted. Nothing
# short of removing egress changes that; the deny policy governs what such a
# token can DO." So this probe does NOT treat minting a token as a failure — it
# mints one on purpose and then proves it is worthless against a real Google API.
# The isolation model is ADR-0028: the runtime account signoos-sandbox@ holds
# ZERO roles, kept true by an organization deny policy.
set -u
. "$(dirname "$0")/lib.sh"
fails=0

MDS='http://metadata.google.internal/computeMetadata/v1'
HDR='Metadata-Flavor: Google'

# ── PROBE:metadata-token — egress is open and a token can be minted ──────────
# INFO, not pass/fail: this is the documented, accepted reality. If NO token is
# minted, that is a STRONGER posture than ADR-0041 documents (egress closed) and
# worth noting, not a failure.
TOKEN_JSON="$(curl -s -m 10 -H "$HDR" "$MDS/instance/service-accounts/default/token" 2>&1)"
TOKEN="$(printf '%s' "$TOKEN_JSON" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')"
if [ -n "$TOKEN" ]; then
  probe_info metadata-token "a metadata token WAS minted (ADR-0041: expected — egress is open). token_len=${#TOKEN}"
else
  probe_info metadata-token "no token minted — egress to the metadata server appears CLOSED, a stronger posture than ADR-0041 documents. raw=$(printf '%s' "$TOKEN_JSON" | head -c 100)"
fi

# ── PROBE:gcs-list — a real token is powerless against GCS ───────────────────
# The security property: even WITH a freshly minted token, listing Cloud Storage
# buckets must be refused (401/403), because the runtime SA holds no storage role
# (ADR-0028). A 200 means the deny policy or IAM has drifted and the sandbox
# identity has real cloud reach — an incident.
PROJ="$(curl -s -m 10 -H "$HDR" "$MDS/project/numeric-project-id" 2>/dev/null)"
if [ -n "$TOKEN" ]; then
  CODE="$(curl -s -m 15 -o /dev/null -w '%{http_code}' \
    -H "Authorization: Bearer $TOKEN" \
    "https://storage.googleapis.com/storage/v1/b?project=${PROJ:-0}" 2>/dev/null)"
  printf 'PROBE:gcs-list http_status=%s project=%s\n' "$CODE" "${PROJ:-unknown}"
  case "$CODE" in
    401 | 403)
      probe_pass gcs-list "GCS bucket list DENIED ($CODE) with a real token — the identity is powerless (ADR-0028 deny policy holds)"
      ;;
    200)
      probe_fail gcs-list "GCS bucket list SUCCEEDED ($CODE) — the sandbox SA has storage access; the ADR-0028 deny policy / IAM has drifted. INCIDENT."
      fails=$((fails + 1))
      ;;
    *)
      probe_info gcs-list "unexpected status $CODE — not a clean allow or deny; investigate (could be a proxy or transient network error, not necessarily a security finding)"
      ;;
  esac
else
  probe_info gcs-list "skipped: no token was minted, so there was nothing to test the deny policy with"
fi

# Turn the BUILD step's verdict red iff a real cloud reach was observed.
[ "$fails" -gt 0 ] && exit 1
exit 0
