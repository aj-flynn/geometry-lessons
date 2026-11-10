import hashlib, importlib.util, json, subprocess, sys, tempfile, unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

SCRIPT=Path(__file__).resolve().parents[1]/'scripts/homework-job.py'
spec=importlib.util.spec_from_file_location('homework_job', SCRIPT)
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)

class CoordinatorTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='homework-coordinator-test-')
        self.addCleanup(self.tmp.cleanup)
        self.path=Path(self.tmp.name); self.db=self.path/'state.sqlite3'
        evidence=self.path/'evidence.json'; evidence.write_text('{"synthetic":true}')
        self.receipt={'path':str(evidence),'sha256':hashlib.sha256(evidence.read_bytes()).hexdigest()}
        self.call('init',{'prior_state_reconciled':True,'receipt':self.receipt})
    def call(self,action,data=None,ok=True):
        p=subprocess.run([sys.executable,str(SCRIPT),action,'--db',str(self.db)],input=json.dumps(data or {}),text=True,capture_output=True)
        self.assertEqual(p.returncode,0 if ok else 1,p.stdout+p.stderr)
        return json.loads(p.stdout if ok else p.stderr)
    def enqueue(self,n='one'):
        return self.call('enqueue',{'mailbox':'synthetic','message_id':n,'sender':'synthetic','library':'opaque','site_root':'https://example.org/'})
    def claim(self,job):
        return self.call('claim',{'job':job['id'],'owner':'worker'})
    def event(self,job,action,**fields):
        return self.call(action,dict(job=job['id'],token=job['token'],generation=job['generation'],**fields))
    def evidence(self,stage):
        values={'receipt':self.receipt,'source_sha256':'a'*64,'attachment_count':2,'package_verified':True,
        'environment_id':'test','sources_opened':True,'browser_preflight_passed':True,'preview_recipe':'supported',
        'thread_id':'test-thread','repository_revision':'a'*40,'candidate_sha256':'b'*64,'contract_sha256':'c'*64,
        'independent_score':100,'unassessed':0,'browser_verified':True,'operation':'synthetic-op','base_commit':'a'*40,
        'commit':'d'*40,'remote_verified':True,'url':'https://example.org/lesson','library_url':'https://example.org/',
        'live_bytes_verified':True,'index_verified':True,'original_thread_verified':True,'sent_items_checked':True}
        return values
    def advance(self,job,target):
        start=m.STAGES.index(self.call('get',{'job':job['id']})['stage'])
        for stage in m.STAGES[start+1:m.STAGES.index(target)+1]:
            self.event(job,'checkpoint',stage=stage,evidence=self.evidence(stage))
        return job
    def test_idempotent_discovery_preserves_existing_work(self):
        job=self.enqueue(); claim=self.claim(job)
        self.advance(claim,'source_ready')
        self.assertEqual(self.enqueue()['stage'],'source_ready')
        self.call('enqueue',{'mailbox':'synthetic','message_id':'one','sender':'changed','library':'opaque','site_root':'https://example.org/'},ok=False)
    def test_concurrent_claims_have_one_winner(self):
        job=self.enqueue()
        def attempt(_):
            return subprocess.run([sys.executable,str(SCRIPT),'claim','--db',str(self.db)],input=json.dumps({'job':job['id'],'owner':'same'}),text=True,capture_output=True).returncode
        with ThreadPoolExecutor(max_workers=6) as ex: results=list(ex.map(attempt,range(6)))
        self.assertEqual(results.count(0),1)
    def test_stale_and_expired_tokens_fenced(self):
        job=self.claim(self.enqueue())
        db=m.connect(self.db); db.execute('UPDATE jobs SET lease_until=0'); db.close()
        self.call('claim',{'job':job['id'],'owner':'new'},ok=False)
        new=self.call('claim',{'job':job['id'],'owner':'new','previous_work_reconciled':True})
        self.assertGreater(new['generation'],job['generation'])
        self.call('renew',{'job':job['id'],'token':job['token'],'generation':job['generation']},ok=False)
    def test_no_skipping_or_changed_review(self):
        job=self.claim(self.enqueue())
        self.call('checkpoint',{'job':job['id'],'token':job['token'],'generation':job['generation'],'stage':'published','evidence':self.evidence('published')},ok=False)
        self.advance(job,'review_pending')
        evidence=self.evidence('review_passed'); evidence['independent_score']=99
        base={'job':job['id'],'token':job['token'],'generation':job['generation'],'stage':'review_passed'}
        self.call('checkpoint',{**base,'evidence':evidence},ok=False)
        evidence['independent_score']=100; evidence['unassessed']=1
        self.call('checkpoint',{**base,'evidence':evidence},ok=False)
        evidence['unassessed']=0; evidence['candidate_sha256']='e'*64
        self.call('checkpoint',{**base,'evidence':evidence},ok=False)
        self.event(job,'invalidate',reason='changed candidate')
        self.assertEqual(self.call('get',{'job':job['id']})['stage'],'drafting')
    def test_library_publication_reserved_across_jobs(self):
        a=self.claim(self.enqueue('a')); b=self.claim(self.enqueue('b'))
        self.advance(a,'publish_intent'); self.advance(b,'review_passed')
        self.call('checkpoint',{'job':b['id'],'token':b['token'],'generation':b['generation'],'stage':'publish_intent','evidence':self.evidence('publish_intent')},ok=False)
        self.event(a,'checkpoint',stage='published',evidence=self.evidence('published'))
        self.event(b,'checkpoint',stage='publish_intent',evidence=self.evidence('publish_intent'))
    def test_uncertain_send_never_reclaimed_or_replayed(self):
        job=self.claim(self.enqueue()); self.advance(job,'send_intent')
        db=m.connect(self.db); db.execute('UPDATE jobs SET lease_until=0'); db.close()
        self.call('claim',{'job':job['id'],'owner':'new','previous_work_reconciled':True},ok=False)
        self.call('send-result',{'job':job['id'],'operation':'synthetic-op','outcome':'uncertain','receipt':self.receipt})
        self.call('claim',{'job':job['id'],'owner':'new','previous_work_reconciled':True},ok=False)
        self.call('reconcile-block',{'job':job['id'],'new_evidence':'x','receipt':self.receipt},ok=False)
        self.call('send-result',{'job':job['id'],'operation':'synthetic-op','outcome':'confirmed','provider_confirmation':'synthetic-confirmation','receipt':self.receipt})
        self.assertEqual(self.call('get',{'job':job['id']})['stage'],'sent_confirmed')
    def test_bounded_retry_and_manual_evidence(self):
        job=self.enqueue()
        for n in range(4):
            owned=self.claim(job)
            result=self.event(owned,'block',reason='temporary read unavailable',retryable=True)
            db=m.connect(self.db); db.execute('UPDATE jobs SET next_attempt=0'); db.close()
        self.assertEqual(result['status'],'manual_block')
        self.call('claim',{'job':job['id'],'owner':'new'},ok=False)
        self.call('reconcile-block',{'job':job['id'],'new_evidence':'capability now verified','receipt':self.receipt})
        self.claim(job)
    def test_empty_database_not_initialized(self):
        self.db=self.path/'empty.sqlite3'; self.db.touch()
        self.call('enqueue',{'mailbox':'synthetic','message_id':'x','sender':'synthetic','library':'opaque','site_root':'https://example.org/'},ok=False)
        self.call('init',{'prior_state_reconciled':True,'receipt':self.receipt})
        self.enqueue()
    def test_rejected_push_can_release_lock_without_claiming_success(self):
        job=self.claim(self.enqueue()); self.advance(job,'publish_intent')
        self.event(job,'resolve-publish',operation='synthetic-op',outcome='definitely_not_executed',receipt=self.receipt)
        self.assertEqual(self.call('get',{'job':job['id']})['stage'],'drafting')
        other=self.claim(self.enqueue('other')); self.advance(other,'publish_intent')
    def test_preflight_and_live_evidence_bound(self):
        job=self.claim(self.enqueue()); self.advance(job,'environment_ready')
        bad=self.evidence('drafting'); bad['environment_id']='different'
        base={'job':job['id'],'token':job['token'],'generation':job['generation']}
        self.call('checkpoint',{**base,'stage':'drafting','evidence':bad},ok=False)
        self.advance(job,'published')
        for change in ({'candidate_sha256':'e'*64},{'commit':'f'*40},{'library_url':'https://elsewhere.example/'},{'url':'https://example.org/../other'},{'url':'https://example.org/\\..\\other/lesson.html'},{'url':'https://example.org/ lesson.html'}):
            self.call('checkpoint',{**base,'stage':'live_verified','evidence':{**self.evidence('live_verified'),**change}},ok=False)
    def test_environment_replacement_requires_reconciled_preflight(self):
        job=self.claim(self.enqueue()); self.advance(job,'review_pending')
        self.event(job,'repreflight',reason='new capable environment',previous_work_reconciled=True,receipt=self.receipt)
        self.assertEqual(self.call('get',{'job':job['id']})['stage'],'source_ready')
        evidence=self.evidence('environment_ready'); evidence['environment_id']='new'
        self.event(job,'checkpoint',stage='environment_ready',evidence=evidence)
        evidence=self.evidence('drafting'); evidence['environment_id']='new'
        self.event(job,'checkpoint',stage='drafting',evidence=evidence)
    def test_runtime_data_cannot_live_in_git(self):
        folder=self.path/'public'; folder.mkdir(); (folder/'.git').write_text('gitdir: synthetic')
        with self.assertRaises(ValueError): m.connect(folder/'state.db',create=True)
        external=self.path/'link'; external.symlink_to(folder,target_is_directory=True)
        with self.assertRaises(ValueError): m.connect(external/'state.db',create=True)
    def test_changed_receipt_rejected(self):
        job=self.claim(self.enqueue()); Path(self.receipt['path']).write_text('changed')
        self.call('checkpoint',{'job':job['id'],'token':job['token'],'generation':job['generation'],'stage':'source_ready','evidence':self.evidence('source_ready')},ok=False)
    def test_absent_ledger_fail_closed(self):
        self.db=self.path/'other.sqlite3'
        self.call('list',ok=False); self.call('enqueue',{'mailbox':'synthetic','message_id':'1','sender':'synthetic','library':'opaque','site_root':'https://example.org/'},ok=False)

if __name__=='__main__': unittest.main()
