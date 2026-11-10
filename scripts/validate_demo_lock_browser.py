#!/usr/bin/env python3
"""Browser-enforced ASTRO-DEMO-LOCK for the Digital Growth Society migration."""
from __future__ import annotations
import glob, json, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

AUTHORITY=os.environ.get('AUTHORITY_BASE','https://'+'boilerplate'+'.blissdrive.net').rstrip('/')
TARGET=os.environ.get('TARGET_BASE','http://127.0.0.1:4321').rstrip('/')
OUT=Path(os.environ.get('DEMO_LOCK_EVIDENCE','demo-lock-evidence'));OUT.mkdir(parents=True,exist_ok=True)
MUTATION=os.environ.get('DEMO_LOCK_MUTATION','')
ROUTES=[
 ('home','/','/',['.ffn-home','.hero','.hero-in','.hero-k','.hero h1','.hero-d','.rp','.eye','.h2']),
 ('cookies','/cookie-policy/','/cookies-policy/',['.ffn-demo-page-template','.pt','.pt h1','.pg','.pg article','.pg h2','.pg p']),
 ('privacy','/privacy-policy/','/privacy-policy/',['.ffn-demo-page-template','.pt','.pt h1','.pg','.pg article','.pg h2','.pg p']),
 ('terms','/terms-of-use/','/terms-of-use/',['.ffn-demo-page-template','.pt','.pt h1','.pg','.pg article','.pg h2','.pg p']),
 ('sitemap','/sitemap/','/sitemap/',['.ffn-demo-sitemap','.sitemap-ph','.sitemap-metrics','.sitemap-intro','.sitemap-panel','.sitemap-list']),
]
VIEWPORTS={'desktop':{'width':1440,'height':1000},'mobile':{'width':390,'height':844}}
GLOBAL=['.tr','.mh','.mh-in','.mh-logo-link','.brg','.mnav','.w']
PROPS=['display','position','font-family','font-size','font-weight','line-height','letter-spacing','color','background-color','border-top-width','border-bottom-width','border-radius','max-width','padding-top','padding-right','padding-bottom','padding-left','gap']

def chromium_path():
 explicit=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
 candidates=[explicit] if explicit else []
 candidates += sorted(glob.glob(str(Path.home()/'.cache/ms-playwright/chromium-*/chrome-linux/chrome')),reverse=True)
 for value in candidates:
  if value and Path(value).is_file(): return value
 raise RuntimeError('No Playwright Chromium executable found')

def snapshot(page,selectors):
 return page.evaluate("""({selectors,props})=>Object.fromEntries(selectors.map(selector=>{const e=document.querySelector(selector);if(!e)return [selector,null];const s=getComputedStyle(e),r=e.getBoundingClientRect();return [selector,{tag:e.tagName,classes:e.className,styles:Object.fromEntries(props.map(p=>[p,s.getPropertyValue(p)])),box:{x:r.x,width:r.width},count:document.querySelectorAll(selector).length}]}))""",{'selectors':selectors,'props':PROPS})

def compare(name,authority,target,failures):
 for selector,a in authority.items():
  t=target.get(selector)
  if a is None: failures.append(f'{name}:{selector}:authority-missing');continue
  if t is None: failures.append(f'{name}:{selector}:target-missing');continue
  if a['tag']!=t['tag']:failures.append(f'{name}:{selector}:tag:{a["tag"]}!={t["tag"]}')
  for prop,value in a['styles'].items():
   if t['styles'].get(prop)!=value:failures.append(f'{name}:{selector}:{prop}:{value!r}!={t["styles"].get(prop)!r}')
  if selector in {'.w','.mh-in','.pt','.pg','.hero','.sitemap-panel'}:
   if abs(a['box']['width']-t['box']['width'])>2:failures.append(f'{name}:{selector}:width:{a["box"]["width"]}!={t["box"]["width"]}')

def load(page,url):
 response=page.goto(url,wait_until='networkidle',timeout=90000)
 if not response or response.status!=200:raise RuntimeError(f'{url} returned {response.status if response else "no response"}')
 page.evaluate('document.fonts && document.fonts.ready')
 page.wait_for_timeout(300)

report={'schema':'dgs-demo-lock-v1','authority':AUTHORITY,'target':TARGET,'mutation':MUTATION or None,'results':[],'failures':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=chromium_path(),args=['--no-sandbox'])
 for viewport_name,viewport in VIEWPORTS.items():
  context=browser.new_context(viewport=viewport,reduced_motion='reduce',color_scheme='light')
  authority_page=context.new_page();target_page=context.new_page()
  for route,authority_path,target_path,selectors in ROUTES:
   key=f'{route}-{viewport_name}'
   try:
    load(authority_page,AUTHORITY+authority_path);load(target_page,TARGET+target_path)
    if MUTATION=='font':target_page.add_style_tag(content='.ffn-home,.ffn-demo{font-family:serif!important}')
    elif MUTATION=='dom':target_page.evaluate("document.querySelector('.hero,.pt,.sitemap-ph')?.remove()")
    selected=GLOBAL+selectors
    a=snapshot(authority_page,selected);t=snapshot(target_page,selected)
    compare(key,a,t,report['failures'])
    target_page.screenshot(path=str(OUT/f'{key}.png'),full_page=True)
    report['results'].append({'case':key,'authorityPath':authority_path,'targetPath':target_path,'selectors':len(selected),'status':'PASS'})
   except Exception as error:
    report['failures'].append(f'{key}:exception:{error}')
  context.close()
 browser.close()
report['status']='PASS' if not report['failures'] else 'FAIL'
(OUT/'demo-lock-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'schema':report['schema'],'status':report['status'],'cases':len(report['results']),'failures':report['failures'][:30],'failureCount':len(report['failures']),'evidence':str(OUT)},indent=2))
raise SystemExit(0 if report['status']=='PASS' else 1)
