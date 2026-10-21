import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.QA_URL||'http://localhost:3010',out=new URL('./browser-output/',import.meta.url).pathname;await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
try{for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/use-cases`,{waitUntil:'networkidle'});await page.screenshot({path:`${out}/hero-${viewport.width}.png`});assert.equal(await page.locator('.hero-question').count(),0);
 assert.equal(await page.locator('.case-tile').count(),10);await page.locator('#explore').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/grid-${viewport.width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 for(const id of ['sales','hr','consulting','handover','training','strategy','it','diligence','locations','library']){
  const tile=page.locator(`a.case-tile#${id}`);await tile.click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.locator('.case-detail-process li').count(),3);assert(await dialog.locator('.case-detail-output').isVisible());
  await page.waitForTimeout(200);assert((await dialog.evaluate(e=>e.scrollTop))<20);
  if(id==='hr'||id==='sales'){await page.screenshot({path:`${out}/detail-${id}-${viewport.width}.png`});}
  const overflow=await dialog.evaluate(e=>e.scrollWidth>e.clientWidth);assert.equal(overflow,false);
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(id=>document.activeElement?.id===id,id,{timeout:3000});
 }
 await page.goto(`${base}/use-cases#diligence`,{waitUntil:'networkidle'});await page.getByRole('dialog').waitFor();assert.match(await page.locator('[data-slot=dialog-title]').innerText(),/data room/);await page.getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.goto(`${base}/use-cases#communicate`,{waitUntil:'networkidle'});await page.getByRole('dialog').waitFor({state:'hidden'});
 report.push({viewport,tiles:10,details:'All 10 opened; all steps and outcomes present; Escape restores focus',deepLinks:'Individual and category links passed',errors});assert.equal(errors.length,0);await page.close();
}}finally{await browser.close();await writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
