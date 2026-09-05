// @spec production-harness
// AC5 AC7
import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluate } from '../scripts/evaluate-harness.mjs'
function input() {
  const outcome = {success:true,invariants_preserved:true,false_positive:false,duration_ms:100,cost_units:20,evidence_ref:'fixture-output'}
  return {schema_version:'1.0',experiment_id:'e',baseline:'v1',candidate:'v2',executor:'fixture-runner',task_set:'frozen-fixtures',grader:'behavior-assertions',run_ref:'test-output',holdout_isolated:true,grader_calibrated:true,budgets:{max_duration_ms:200,max_cost_units:30,cost_unit:'tokens'},min_trials:1,cases:['motivating','regression','holdout'].map(suite=>({id:suite,suite,trials:[{id:'1',baseline:{...outcome,success:suite!=='motivating'},candidate:{...outcome}}]}))}
}
test('measured target improvement with controls permits only a canary',()=>{
  const result=evaluate(input()); assert.equal(result.verdict,'eligible-for-canary'); assert.match(result.next,/No automatic promotion/)
})
test('a held-out regression blocks improvement on authoring case',()=>{
  const i=input(); i.cases[2].trials[0].candidate.success=false; assert.equal(evaluate(i).verdict,'rejected')
})
test('false positives, invariant loss and budget overshoot cannot be averaged away',()=>{
  for(const delta of [{false_positive:true},{invariants_preserved:false},{duration_ms:201},{cost_units:31}]) {
    const i=input(); Object.assign(i.cases[1].trials[0].candidate,delta); assert.equal(evaluate(i).verdict,'rejected')
  }
})
test('missing suites, isolation, calibration, repeated trials or measurements stay not verified',()=>{
  const edits=[i=>i.cases.pop(),i=>i.holdout_isolated=false,i=>i.grader_calibrated=false,i=>i.min_trials=2,i=>delete i.cases[0].trials[0].candidate.evidence_ref,i=>i.baseline=i.candidate,i=>i.cases.push(i.cases[0])]
  for(const edit of edits){const i=input();edit(i);assert.equal(evaluate(i).verdict,'not-verified')}
})
test('no improvement retains baseline, not success by ceremony',()=>{
  const i=input();i.cases[0].trials[0].baseline.success=true; assert.equal(evaluate(i).verdict,'no-measured-improvement')
})
test('silencing findings while every desired outcome fails never qualifies',()=>{
  const i=input()
  for(const c of i.cases){c.trials[0].baseline.success=false;c.trials[0].candidate.success=false}
  i.cases[0].trials[0].baseline.false_positive=true
  assert.equal(evaluate(i).verdict,'rejected')
})
test('an unrelated improvement cannot substitute for the motivating outcome',()=>{
  const i=input();i.cases[0].trials[0].candidate.success=false;i.cases[1].trials[0].baseline.success=false
  assert.equal(evaluate(i).verdict,'no-measured-improvement')
})
