# A deliberately trivial suite. Its only job is to make `pytest -q` (the
# repository's declared TEST command) exit 0, which proves the container can run
# a real repository suite end to end and return a real exit code — the whole
# mechanism ADR-0041's Decision rests on ("Execution is real").
#
# It asserts NOTHING about the sandbox's safety. The probe scripts under probes/
# do that. This separation is deliberate: a green suite proves the machinery
# works, never that a patch is safe — a repository can always make its own tests
# pass, which is exactly why the independent reviewer caps a passing suite at
# "medium" confidence (ADR-0041).


def test_canary_runs():
    assert 1 + 3 == 4
