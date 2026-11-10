#!/usr/bin/env python3
"""Verify the six requested Digital Growth Society pages against Tina and SSR."""
from __future__ import annotations
import json, os, re, sys
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
import requests

def load_env():
    for raw in Path('.env').read_text(encoding='utf-8').splitlines():
        if '=' not in raw or raw.lstrip().startswith('#'): continue
        k,v=raw.split('=',1); key=k.strip()
        if key=='SITE_URL' and os.environ.get(key): continue
        os.environ[key]=v.strip().strip('"').strip("'")
load_env()
SITE=os.environ.get('SITE_URL','http://127.0.0.1:4321').rstrip('/')
CLIENT=os.environ.get('NEXT_PUBLIC_TINA_CLIENT_ID','');BRANCH=os.environ.get('NEXT_PUBLIC_TINA_BRANCH','main');TOKEN=os.environ.get('TINA_TOKEN','')
if not CLIENT or not TOKEN: raise SystemExit('Missing Tina runtime identity')
TINA=f'https://content.tinajs.io/2.4/content/{CLIENT}/github/{BRANCH}'
EXPECTED={
 'home.mdx':('/', 'Digital Growth Society'),
 'cookies-policy.mdx':('/cookies-policy/','Cookies Policy'),
 'privacy-policy.mdx':('/privacy-policy/','Privacy Policy'),
 'terms-of-use.mdx':('/terms-of-use/','Terms of Use'),
 'thank-you.mdx':('/thank-you/','Thank You'),
}
QUERY='''query SixPages { pageConnection(first: 100) { edges { node { title permalink seo { metaTitle noindex } _sys { relativePath filename } } } } }'''
class P(HTMLParser):
 def __init__(self): super().__init__();self.in_title=False;self.in_h1=False;self.title=[];self.h1=[];self.links=[];self._href=None;self._txt=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='title':self.in_title=True
  if tag=='h1':self.in_h1=True
  if tag=='a' and d.get('href'):self._href=d['href'];self._txt=[]
 def handle_endtag(self,tag):
  if tag=='title':self.in_title=False
  if tag=='h1':self.in_h1=False
  if tag=='a' and self._href:self.links.append((self._href,' '.join(''.join(self._txt).split())));self._href=None;self._txt=[]
 def handle_data(self,data):
  if self.in_title:self.title.append(data)
  if self.in_h1:self.h1.append(data)
  if self._href:self._txt.append(data)
def fetch(path):
 r=requests.get(SITE+path,headers={'Cache-Control':'no-cache','User-Agent':'DGSSixPageVerifier'},timeout=45);p=P();p.feed(r.text);return r,p,unescape(r.text)
r=requests.post(TINA,headers={'X-API-KEY':TOKEN,'Content-Type':'application/json'},json={'query':QUERY},timeout=45);r.raise_for_status();payload=r.json()
if payload.get('errors'): raise RuntimeError(json.dumps(payload['errors']))
nodes={x['node']['_sys']['relativePath']:x['node'] for x in payload['data']['pageConnection']['edges'] if x.get('node')}
fail=[]
if set(nodes)!=set(EXPECTED):fail.append(f'page documents mismatch: {sorted(nodes)}')
report={'site':SITE,'backendDocuments':sorted(nodes),'routes':{}}
for rel,(path,label) in EXPECTED.items():
 node=nodes.get(rel,{});resp,parser,html=fetch(path);h1=' '.join(''.join(parser.h1).split());title=' '.join(''.join(parser.title).split())
 item={'status':resp.status_code,'h1':h1,'title':title,'backendTitle':node.get('title')};report['routes'][path]=item
 if resp.status_code!=200:fail.append(f'{path} status {resp.status_code}')
 if label.casefold() not in h1.casefold() and label.casefold() not in title.casefold():fail.append(f'{path} missing page identity {label!r}')
 if 'Starter Site' in html:fail.append(f'{path} contains stale source identity')
resp,parser,html=fetch('/sitemap/');report['routes']['/sitemap/']={'status':resp.status_code,'h1':' '.join(''.join(parser.h1).split()),'title':' '.join(''.join(parser.title).split()),'linkCount':len(parser.links)}
if resp.status_code!=200 or 'Sitemap' not in ''.join(parser.h1):fail.append('/sitemap/ failed identity/status')
for _rel,(path,label) in EXPECTED.items():
 if _rel=='thank-you.mdx':continue
 if not any(href.rstrip('/')==path.rstrip('/') and label.casefold() in text.casefold() for href,text in parser.links):fail.append(f'/sitemap/ missing {path} {label}')
if 'Starter Site' in html:fail.append('/sitemap/ contains stale source identity')
report['failures']=fail;report['status']='PASS' if not fail else 'FAIL';print(json.dumps(report,indent=2));raise SystemExit(0 if not fail else 1)
