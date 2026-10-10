#!/usr/bin/env python3
"""Browser QA for the Eldorado Musings page at MUSINGS_URL (default localhost:3001)."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 opts={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ELDORADO_CHROMIUM_PATH'):opts['executable_path']=os.environ['ELDORADO_CHROMIUM_PATH']
 browser=p.chromium.launch(**opts)
 page=browser.new_page(viewport={'width':1500,'height':980})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 base=os.environ.get('MUSINGS_URL','http://localhost:3001')
 page.goto(base+'/musings',wait_until='networkidle')
 assert page.locator('a[href="/musings/eldorado"]').count()==1
 for slug in ['codex-in-the-dungeon','reflexivity-maxxing']:
  assert page.locator(f'a[href="/musings/{slug}"]').count()==1
 assert page.locator('main').evaluate('(e)=>getComputedStyle(e).fontFamily.includes("monospace")')
 assert page.locator('main').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(37, 68, 254)'
 (ROOT/'artifacts').mkdir(exist_ok=True)
 page.screenshot(path=str(ROOT/'artifacts/musings-index.png'),full_page=True)
 page.locator('a[href="/musings/eldorado"]').click()
 page.wait_for_url('**/musings/eldorado')
 page.wait_for_load_state('networkidle')
 assert page.locator('.eldorado-musing').evaluate('(e)=>getComputedStyle(e).fontFamily.includes("monospace")')
 assert page.locator('.eldorado-musing').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(37, 68, 254)'
 page.locator('.leaflet-overlay-pane svg').wait_for()
 assert page.locator('.leaflet-interactive').count()>72
 (ROOT/'artifacts').mkdir(exist_ok=True)
 page.screenshot(path=str(ROOT/'artifacts/eldorado-musings-desktop.png'),full_page=True)
 page.get_by_role('button',name='Art',exact=True).click()
 assert page.locator('.eldorado-art-row').count()==9
 page.get_by_role('button',name='Enlarge Santarém riverfront',exact=True).click()
 assert page.locator('.eldorado-art-dialog').evaluate('(d)=>d.matches(":modal")')
 assert page.locator('.eldorado-art-dialog img').evaluate('(i)=>i.complete && i.naturalWidth>0')
 page.keyboard.press('Escape');assert page.locator('.eldorado-art-dialog').count()==0
 page.get_by_role('button',name='Hide right-hand map').click()
 assert not page.locator('.eldorado-map-area').is_visible()
 page.get_by_role('button',name='Places',exact=True).click()
 assert page.locator('.eldorado-row').count()==96
 page.locator('#place-search').fill('Juruty')
 assert page.locator('.eldorado-row').count()==1
 page.locator('.eldorado-row-button').click()
 assert page.locator('.eldorado-map-area').is_visible()
 assert 'Juruti' in page.locator('.eldorado-evidence').inner_text()
 page.get_by_role('button',name='Close source evidence').click()
 page.get_by_role('button',name='Hide right-hand map').click()
 page.get_by_role('button',name='Show map',exact=True).click()
 page.get_by_label('Place references',exact=True).uncheck()
 page.get_by_label('Place references',exact=True).check()
 page.get_by_role('button',name='Library',exact=True).click()
 assert page.locator('.eldorado-row').count()==28
 page.locator('#search').fill('canoe');page.locator('#book').select_option('bates')
 page.locator('.eldorado-pagination').wait_for(timeout=30000)
 first=page.locator('.eldorado-row-button').last.inner_text()
 page.get_by_role('button',name='Next',exact=True).click()
 page.wait_for_function("document.querySelector('.eldorado-pagination')?.textContent.includes('21')")
 assert page.locator('.eldorado-row-button').last.inner_text()!=first
 page.locator('.eldorado-row-button').first.click()
 assert 'Source line' in page.locator('.eldorado-evidence').inner_text()
 page.reload(wait_until='networkidle');assert page.locator('#search').input_value()=='canoe';assert page.locator('#book').input_value()=='bates'
 page.get_by_role('button',name='Journeys',exact=True).click()
 page.get_by_role('button',name='Belém',exact=True).click()
 assert 'Source line 4980' in page.locator('.eldorado-evidence').inner_text()
 page.get_by_role('button',name='Close source evidence').click()
 page.get_by_label('Show schematic connections').check()
 page.get_by_label('Show schematic connections').uncheck()
 page.locator('#book').select_option('')
 page.get_by_role('button',name='Review',exact=True).click()
 assert 'disconnected river basins' in page.locator('.eldorado-results').inner_text()
 page.get_by_role('button',name='Sources & methods').click()
 assert page.locator('dialog').evaluate('(d)=>d.matches(":modal")')
 page.keyboard.press('Escape');assert page.locator('dialog').count()==0
 assert page.request.get(base+'/api/eldorado/search?q=canoe&book=missing').status==400
 assert page.request.get(base+'/api/eldorado/source/missing').status==404
 source=page.request.get(base+'/api/eldorado/source/bates');assert source.status==200
 page.goto(base+'/musings/eldorado?q=belem&book=bates',wait_until='networkidle')
 page.locator('.eldorado-results .eldorado-row').first.wait_for()
 assert 'Belém' in page.locator('.eldorado-results').inner_text()
 page.emulate_media(color_scheme='dark')
 page.screenshot(path=str(ROOT/'artifacts/eldorado-musings-dark.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.screenshot(path=str(ROOT/'artifacts/eldorado-musings-mobile.png'),full_page=True)
 page.get_by_role('button',name='Art',exact=True).click()
 page.locator('#book').select_option('')
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.get_by_role('button',name='Hide right-hand map').click()
 assert not page.locator('.eldorado-map-area').is_visible()
 assert page.get_by_role('button',name='Show map',exact=True).is_visible()
 page.screenshot(path=str(ROOT/'artifacts/eldorado-musings-art-mobile.png'),full_page=True)
 assert not errors,errors
 (ROOT/'artifacts/musings-browser-checks.json').write_text(json.dumps({'status':'passed','javascript_errors':errors,'checks':['full-text search','pagination','book filter','URL restoration','selected stop evidence','map layers','review queue','modal keyboard dismissal','API validation','accent-insensitive search','dark mode','mobile overflow','historical artwork','art dialog','place aliases','place layer','hide and reopen map','musings navigation','site typography']},indent=2))
 browser.close()
 print('Musings browser checks passed')
