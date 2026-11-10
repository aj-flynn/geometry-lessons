#!/usr/bin/env python3
"""Private, transactional coordination for the homework orchestrator.

This program never reads email, launches workers, publishes, or sends messages.
All runtime data must stay outside Git checkouts. Use JSON stdin to avoid placing
message IDs, addresses, or private paths in process arguments. See the runbook.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
import sys
import time
from urllib.parse import urlparse

STAGES = ('discovered', 'source_ready', 'environment_ready', 'drafting',
          'review_pending', 'review_passed', 'publish_intent', 'published',
          'live_verified', 'send_intent', 'sent_confirmed')
IN_FLIGHT = ('publish_intent', 'send_intent')

def private_path(value):
    path = Path(value).expanduser().resolve()
    for parent in (path, *path.parents):
        marker = parent / '.git'
        if (marker.is_dir() and (marker / 'HEAD').is_file()) or (marker.is_file() and marker.read_text(errors='replace').startswith('gitdir:')):
            raise ValueError('Runtime data must be outside every Git checkout')
    return path

def canonical_url(value):
    if not isinstance(value,str) or any(ord(c)<=32 or c=='\\' for c in value):
        raise ValueError('Use a canonical HTTPS URL')
    parts=urlparse(value)
    if parts.scheme!='https' or not parts.hostname or parts.username or parts.query or parts.fragment or '%' in parts.path or any(p in ('.','..') for p in parts.path.split('/')):
        raise ValueError('Use a canonical HTTPS URL')
    return parts

def default_db():
    return Path(os.environ.get('HOMEWORK_STATE_DIR', '/workspace/shared/homework-automation')) / 'state.sqlite3'

def connect(path, create=False):
    path = private_path(path)
    if not path.exists() and not create:
        raise ValueError('Authoritative ledger is absent; reconcile prior history before init')
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        os.close(fd)
    db = sqlite3.connect(path, timeout=10, isolation_level=None)
    db.row_factory = sqlite3.Row
    if not create:
        try:
            initialized = db.execute("SELECT value FROM metadata WHERE key='initialized'").fetchone()
        except sqlite3.Error:
            db.close(); raise ValueError('Ledger has no committed initialization; reconcile before init')
        if not initialized or initialized[0] != '1':
            db.close(); raise ValueError('Ledger initialization is incomplete')
    db.execute('PRAGMA foreign_keys=ON')
    db.execute('PRAGMA journal_mode=WAL')
    db.executescript('''
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, mailbox TEXT NOT NULL, message_id TEXT NOT NULL,
      library TEXT NOT NULL, sender TEXT NOT NULL, stage TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready', generation INTEGER NOT NULL DEFAULT 0,
      owner TEXT, token TEXT, lease_until REAL, next_attempt REAL,
      attempts INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL,
      UNIQUE(mailbox,message_id));
    CREATE TABLE IF NOT EXISTS events (
      seq INTEGER PRIMARY KEY, job TEXT NOT NULL, time REAL NOT NULL,
      action TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS publications (
      library TEXT PRIMARY KEY, job TEXT NOT NULL, operation TEXT NOT NULL);
    ''')
    return db

def need(data, *keys):
    for key in keys:
        if key not in data or data[key] is None or data[key] == '':
            raise ValueError('Missing required field: ' + key)

def event(db, job, action, data):
    db.execute('INSERT INTO events(job,time,action,payload) VALUES(?,?,?,?)',
               (job, time.time(), action, json.dumps(data, sort_keys=True)))

def row(db, job):
    found = db.execute('SELECT * FROM jobs WHERE id=?', (job,)).fetchone()
    if not found:
        raise ValueError('Unknown job')
    result = dict(found)
    result['data'] = json.loads(result['data'])
    return result

def public_row(result):
    # Still PRIVATE output, never an artifact suitable for a public repository.
    result = dict(result)
    result.pop('token', None)
    return result

def own(job, data):
    need(data, 'token', 'generation')
    if (job['status'] != 'active' or job['token'] != data['token'] or
        job['generation'] != data['generation'] or (job['lease_until'] or 0) <= time.time()):
        raise ValueError('Stale, expired, or missing ownership; reconcile before continuing')

def save(db, job):
    db.execute('''UPDATE jobs SET stage=?,status=?,generation=?,owner=?,token=?,
    lease_until=?,next_attempt=?,attempts=?,data=? WHERE id=?''',
    (job['stage'],job['status'],job['generation'],job['owner'],job['token'],
     job['lease_until'],job['next_attempt'],job['attempts'],json.dumps(job['data']),job['id']))

def receipt(value):
    need(value, 'path', 'sha256')
    path = private_path(value['path'])
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != value['sha256']:
        raise ValueError('Private evidence file is absent or changed')

def validate_evidence(stage, evidence):
    if not isinstance(evidence, dict):
        raise ValueError('Evidence must be an object')
    receipt(evidence['receipt'])
    required = {
      'source_ready': ('source_sha256', 'attachment_count', 'package_verified'),
      'environment_ready': ('environment_id', 'sources_opened', 'browser_preflight_passed', 'preview_recipe'),
      'drafting': ('thread_id', 'environment_id', 'repository_revision'),
      'review_pending': ('candidate_sha256', 'contract_sha256'),
      'review_passed': ('candidate_sha256', 'contract_sha256', 'independent_score', 'unassessed', 'browser_verified'),
      'publish_intent': ('operation', 'base_commit', 'candidate_sha256', 'contract_sha256'),
      'published': ('operation', 'commit', 'candidate_sha256', 'contract_sha256', 'remote_verified'),
      'live_verified': ('url', 'library_url', 'commit', 'candidate_sha256', 'contract_sha256', 'live_bytes_verified', 'index_verified'),
      'send_intent': ('operation', 'original_thread_verified', 'sent_items_checked'),
    }
    need(evidence, *required.get(stage, ()))
    for key in ('package_verified','sources_opened','browser_preflight_passed','browser_verified',
                'remote_verified','live_bytes_verified','index_verified','original_thread_verified','sent_items_checked'):
        if key in evidence and evidence[key] is not True:
            raise ValueError('Required verification is not true: ' + key)
    if stage == 'review_passed' and (evidence['independent_score'] != 100 or evidence['unassessed'] != 0):
        raise ValueError('A complete independent 100/100 review is required')

def execute(db, action, data):
    now = time.time()
    if action == 'init':
        need(data, 'prior_state_reconciled', 'receipt')
        if data['prior_state_reconciled'] is not True:
            raise ValueError('Prior processing history must be reconciled first')
        receipt(data['receipt'])
        if db.execute("SELECT value FROM metadata WHERE key='initialized'").fetchone():
            raise ValueError('Ledger already initialized')
        db.execute("INSERT INTO metadata VALUES('initialized','1')")
        event(db, 'ledger', action, data)
        return {'initialized': True}
    if action == 'list':
        return [public_row(row(db, r[0])) for r in db.execute('SELECT id FROM jobs ORDER BY rowid')]
    if action == 'import-handled':
        need(data,'mailbox','message_id','sender','library','site_root','disposition','receipt')
        if data['disposition'] not in ('sent_confirmed','duplicate','excluded'):
            raise ValueError('Historical disposition must be verified, never assumed')
        receipt(data['receipt'])
        created=execute(db,'enqueue',data)
        job=row(db,created['id'])
        if job['stage']!='discovered' or job['status']!='ready':
            raise ValueError('Do not replace existing processing state during import')
        job.update(stage='historical_handled',status='done')
        job['data']['historical']=data
        save(db,job); event(db,job['id'],action,data)
        return public_row(job)
    if action == 'enqueue':
        need(data, 'mailbox', 'message_id', 'sender', 'library', 'site_root')
        site=canonical_url(data['site_root'])
        if not data['site_root'].endswith('/'):
            raise ValueError('Canonical library site root must be an HTTPS directory URL')
        job_id = hashlib.sha256((data['mailbox']+'\0'+data['message_id']).encode()).hexdigest()
        existing = db.execute('SELECT id FROM jobs WHERE id=?', (job_id,)).fetchone()
        if existing:
            job = row(db, job_id)
            if (job['sender'],job['library'],job['data']['input']['site_root']) != (data['sender'],data['library'],data['site_root']):
                raise ValueError('Existing job route mismatch; explicit reconciliation required')
            return public_row(job)
        db.execute('INSERT INTO jobs(id,mailbox,message_id,library,sender,stage,data) VALUES(?,?,?,?,?,?,?)',
                   (job_id,data['mailbox'],data['message_id'],data['library'],data['sender'],'discovered',json.dumps({'input':data})))
        event(db, job_id, action, data)
        return public_row(row(db, job_id))
    need(data, 'job')
    job = row(db, data['job'])
    if action == 'get':
        return public_row(job)
    if action == 'claim':
        need(data, 'owner')
        if job['stage'] == 'send_intent' or job['status'] in ('uncertain_send','done','manual_block'):
            raise ValueError('Job is not automatically claimable')
        if job['status'] == 'active' and (job['lease_until'] or 0) > now:
            raise ValueError('Job is already owned')
        if job['next_attempt'] and job['next_attempt'] > now:
            raise ValueError('Retry is not due')
        recovery = job['status'] == 'active' or job['stage'] in IN_FLIGHT
        if recovery and data.get('previous_work_reconciled') is not True:
            raise ValueError('Inspect prior thread/external outcome before reclaiming')
        ttl = data.get('ttl', 1800)
        if not isinstance(ttl, (int,float)) or not 30 <= ttl <= 7200:
            raise ValueError('Lease TTL must be between 30 and 7200 seconds')
        job.update(status='active',owner=data['owner'],token=secrets.token_urlsafe(24),
                   generation=job['generation']+1,lease_until=now+ttl,next_attempt=None)
    elif action == 'send-result':
        need(data, 'operation', 'outcome', 'receipt')
        if job['stage'] != 'send_intent' or job['data']['send_intent']['operation'] != data['operation']:
            raise ValueError('No matching send intent')
        receipt(data['receipt'])
        if data['outcome'] == 'confirmed':
            need(data, 'provider_confirmation')
            job.update(stage='sent_confirmed',status='done',owner=None,token=None,lease_until=None)
        elif data['outcome'] == 'uncertain':
            job.update(status='uncertain_send',owner=None,token=None,lease_until=None)
        else:
            raise ValueError('Unknown/failed sends remain uncertain; never automatically replay')
        job['data']['send_result'] = data
    else:
        own(job, data)
        if action == 'renew':
            ttl = data.get('ttl',1800)
            if not isinstance(ttl,(int,float)) or not 30 <= ttl <= 7200:
                raise ValueError('Invalid lease TTL')
            job['lease_until'] = now+ttl
        elif action == 'checkpoint':
            need(data, 'stage', 'evidence')
            stage = data['stage']
            if stage not in STAGES or STAGES.index(stage) != STAGES.index(job['stage'])+1 or stage == 'sent_confirmed':
                raise ValueError('Cannot skip or rewind a stage')
            validate_evidence(stage, data['evidence'])
            evidence = data['evidence']
            if stage=='drafting' and evidence['environment_id'] != job['data']['environment_ready']['environment_id']:
                raise ValueError('Drafting environment lacks this source/browser preflight')
            if stage in ('review_passed','publish_intent','published','live_verified'):
                previous = job['data']['review_pending' if stage=='review_passed' else 'review_passed']
                if any(evidence[k] != previous[k] for k in ('candidate_sha256','contract_sha256')):
                    raise ValueError('Candidate or contract changed; invalidate review first')
            if stage == 'publish_intent':
                lock = db.execute('SELECT job FROM publications WHERE library=?',(job['library'],)).fetchone()
                if lock:
                    raise ValueError('Library publication already reserved; reconcile it first')
                db.execute('INSERT INTO publications VALUES(?,?,?)',(job['library'],job['id'],evidence['operation']))
            if stage == 'live_verified':
                if evidence['commit'] != job['data']['published']['commit']:
                    raise ValueError('Live evidence does not match publication commit')
                root=job['data']['input']['site_root']
                if evidence['library_url'] != root or not evidence['url'].startswith(root) or evidence['url']==root:
                    raise ValueError('Live URL does not belong to the verified library')
                canonical_url(evidence['url'])
            if stage == 'published':
                if evidence['operation'] != job['data']['publish_intent']['operation']:
                    raise ValueError('Publication operation mismatch')
                db.execute('DELETE FROM publications WHERE library=? AND job=?',(job['library'],job['id']))
            job['stage'] = stage
            job['data'][stage] = evidence
        elif action == 'resolve-publish':
            need(data,'operation','outcome','receipt')
            receipt(data['receipt'])
            if job['stage']!='publish_intent' or data['operation']!=job['data']['publish_intent']['operation']:
                raise ValueError('No matching publication intent')
            if data['outcome']=='definitely_not_executed':
                db.execute('DELETE FROM publications WHERE library=? AND job=?',(job['library'],job['id']))
                job['stage']='drafting'
                for key in ('review_pending','review_passed','publish_intent'): job['data'].pop(key,None)
            elif data['outcome']!='unknown':
                raise ValueError('Confirmed publication uses the published checkpoint')
            job['data']['publication_resolution']=data
        elif action == 'repreflight':
            need(data,'reason','previous_work_reconciled','receipt')
            receipt(data['receipt'])
            if data['previous_work_reconciled'] is not True:
                raise ValueError('Reconcile/stop old work before changing environments')
            if job['stage'] not in ('environment_ready','drafting','review_pending','review_passed'):
                raise ValueError('Cannot replace environment at this stage')
            job['stage']='source_ready'
            for key in ('environment_ready','drafting','review_pending','review_passed'): job['data'].pop(key,None)
            job['data']['environment_recovery']=data
        elif action == 'invalidate':
            if job['stage'] in ('publish_intent','published','live_verified','send_intent','sent_confirmed'):
                raise ValueError('Reconcile consequential actions before changing a candidate')
            need(data, 'reason')
            if STAGES.index(job['stage']) < STAGES.index('drafting'):
                raise ValueError('No draft review to invalidate')
            job['stage']='drafting'
            for key in ('review_pending','review_passed'):
                job['data'].pop(key,None)
            job['data']['invalidation']=data['reason']
        elif action == 'block':
            need(data, 'reason', 'retryable')
            if job['stage'] in IN_FLIGHT:
                raise ValueError('Cannot clear an uncertain external intent')
            job['attempts'] += 1
            retry = data['retryable'] is True and job['attempts'] <= 3
            if retry:
                delay = min(3600, 60*(2**(job['attempts']-1)))
                job.update(status='blocked',next_attempt=now+delay)
            else:
                job.update(status='manual_block',next_attempt=None)
            job.update(owner=None,token=None,lease_until=None)
            job['data']['blocker']={'reason':data['reason'],'retryable':retry,'time':now}
        elif action == 'unblock':
            raise ValueError('Use reconcile-block with new evidence, not an active lease')
        else:
            raise ValueError('Unsupported action')
    save(db, job)
    event(db, job['id'], action, {k:v for k,v in data.items() if k!='token'})
    result=public_row(job)
    if action in ('claim','renew'):
        result['token']=job['token']
    return result

def reconcile_block(db,data):
    need(data,'job','new_evidence','receipt')
    receipt(data['receipt'])
    job=row(db,data['job'])
    if job['status'] != 'manual_block' or job['stage'] in IN_FLIGHT:
        raise ValueError('Only a manual blocker may be reopened with new evidence')
    job.update(status='ready',next_attempt=None,attempts=0)
    job['data']['recovery_evidence']=data
    save(db,job); event(db,job['id'],'reconcile-block',data)
    return public_row(job)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('init','list','get','enqueue','import-handled','claim','renew','checkpoint','invalidate','repreflight','block','reconcile-block','resolve-publish','send-result'))
    parser.add_argument('--db',type=Path,default=default_db())
    args=parser.parse_args()
    try:
        data=json.load(sys.stdin) if args.action!='list' else {}
        if not isinstance(data,dict): raise ValueError('Input must be a JSON object')
        if args.action=='init':
            need(data,'prior_state_reconciled','receipt')
            if data['prior_state_reconciled'] is not True: raise ValueError('History reconciliation required')
            receipt(data['receipt'])
        db=connect(args.db,create=args.action=='init')
        try:
            db.execute('BEGIN IMMEDIATE')
            result=reconcile_block(db,data) if args.action=='reconcile-block' else execute(db,args.action,data)
            db.execute('COMMIT')
        except BaseException:
            db.execute('ROLLBACK'); raise
        finally:
            db.close()
        print(json.dumps(result,sort_keys=True))
    except (ValueError,KeyError,TypeError,OSError,sqlite3.Error,json.JSONDecodeError) as error:
        print(json.dumps({'error':str(error)}),file=sys.stderr)
        sys.exit(1)
if __name__=='__main__': main()
