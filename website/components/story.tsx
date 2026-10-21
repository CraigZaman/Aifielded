'use client';

import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,CheckCheck,CornerDownRight,MessageSquare,Mic,Paperclip,Camera,Send,Search,ShieldCheck,Workflow} from 'lucide-react';

const chapters=[
 {verb:'Ask',title:'Start with a\nbetter question.',copy:'The people closest to the work often see what the numbers cannot. Give that knowledge somewhere to go.',detail:'Missions can start with a leader, or with an idea raised by an employee.'},
 {verb:'Listen',title:'Go to the people\nwho know.',copy:'A digital deployed engineer, in conversation with your team. Not another survey. A dialogue that can ask the next useful question.',detail:'Text, voice notes, photos and documents. Context in the form that makes sense.'},
 {verb:'Connect',title:'Follow the evidence.\nNot the assumption.',copy:'One perspective is a starting point, not a conclusion. Fielded connects accounts, surfaces gaps, and proposes where to investigate next.',detail:'Broader investigations follow your approval rules. Your people keep control of their contributions.'},
 {verb:'Act',title:'A clearer picture.\nA practical next step.',copy:'Bring supported findings, open questions and follow-up work together. Understanding should lead somewhere.',detail:'Trace the finding back to its evidence. Assign the next action. Keep the conversation open.'}
];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));

export function ScrollStory(){
 const root=useRef<HTMLElement>(null),[active,setActive]=useState(0);
 useEffect(()=>{
  const el=root.current;if(!el)return;let frame=0;
  const update=()=>{frame=0;const r=el.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,el.offsetHeight-innerHeight));el.style.setProperty('--story-progress',String(p));setActive(Math.min(3,Math.floor(p*4)));};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
  return()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
 },[]);
 function go(index:number){const el=root.current;if(!el)return;const offset=el.getBoundingClientRect().top+scrollY;scrollTo({top:offset+(el.offsetHeight-innerHeight)*(index/4+.045),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 return <section className="scroll-story" ref={root} id="discovery-story" aria-label="How a discovery mission follows a question"><div className="story-sticky">
  <div className="story-topline"><span className="eyebrow"><i/>Discovery dialogue / follow the question</span><span>Illustrative scenario / not customer results</span></div>
  <div className="story-body"><div className="story-narrative"><span className="chapter-number">0{active+1}<span> / 04</span></span><div key={active} className="chapter-copy"><h2>{chapters[active].title}</h2><p>{chapters[active].copy}</p><small>{chapters[active].detail}</small></div></div>
   <div className={`story-visual scene-${active}`}><div className="visual-cross cross-one"/><div className="visual-cross cross-two"/>
    <div className="scene scene-question"><MobileChapter index={0}/>
     <div className="question-meta"><span><span className="tiny-avatar">JR</span>From the leadership team</span><span className="tag">A new mission</span></div>
     <div className="quote-mark">“</div><h3>Why are our<br/>deliveries slipping?</h3><div className="question-line"/><p>Look beyond the numbers.<br/>Ask the people doing the work.</p><div className="mission-direction"><MessageSquare size={17}/><span>Begin a discussion</span><ArrowRight size={17}/></div>
     <span className="scene-caption">A question worth asking.</span>
    </div>
    <div className="scene scene-listen"><MobileChapter index={1}/>
     <div className="discussion-heading"><div className="fielded-symbol"><Workflow size={24}/></div><div><strong>Fielded</strong><small>Your digital deployed engineer</small></div><span className="private-label"><ShieldCheck size={13}/>Private dialogue</span></div>
     <div className="example-message from-fielded"><span>FIELDED</span><p>What happens between an order being confirmed and your team being able to ship it?</p></div><div className="example-message from-person"><span>DELIVERY TEAM</span><p>We often wait one to three days for the release documents.</p></div><div className="example-message from-fielded next-question"><span>FIELDED</span><p>Who provides those documents, and what needs to happen before they can be issued?</p></div>
     <div className="example-composer"><span>Every perspective adds context</span><div><Mic size={17}/><Paperclip size={17}/><Camera size={17}/><Send size={17}/></div></div><span className="scene-caption">A conversation that goes a little deeper.</span>
    </div>
    <div className="scene scene-connect"><MobileChapter index={2}/>
     <div className="evidence-heading"><Search size={18}/><span>Connecting the perspectives</span></div><div className="evidence-row"><span className="evidence-index">01</span><div><strong>Delivery</strong><p>“We are waiting for the release documents.”</p></div><Check size={17}/></div><div className="evidence-connector"><CornerDownRight size={21}/><span>What happens upstream?</span></div><div className="evidence-row"><span className="evidence-index">02</span><div><strong>Sales</strong><p>“We need payment confirmation before we can release them.”</p></div><Check size={17}/></div><div className="evidence-connector"><CornerDownRight size={21}/><span>Who can clarify the dependency?</span></div><div className="evidence-row last"><span className="evidence-index">03</span><div><strong>Finance</strong><p>A follow-up discussion could test the explanation.</p></div><Search size={17}/></div><div className="approval-stamp"><ShieldCheck size={14}/>Cross-team follow-up requires approval</div><span className="scene-caption">The route follows the evidence. Not a fixed script.</span>
    </div>
    <div className="scene scene-act"><MobileChapter index={3}/>
     <div className="finding-top"><span className="tag lime-tag"><CheckCheck size={13}/>Evidence-led intelligence</span><span className="eyebrow">Mission / 001</span></div><span className="eyebrow finding-label">An emerging hypothesis</span><h3>The delay may start<br/>before delivery.</h3><p>Payment confirmation appears to be a dependency for releasing orders. Confirm how that handover works before changing the delivery process.</p><div className="evidence-strip"><span><MessageSquare size={14}/>Delivery perspective</span><span><MessageSquare size={14}/>Sales perspective</span></div><div className="next-action"><span className="next-action-icon"><CornerDownRight size={22}/></span><div><small>PROPOSED NEXT STEP</small><strong>Clarify the payment-approval handover</strong><span>Finance team · Owner approval</span></div></div><span className="scene-caption">A traceable next step. Not a premature answer.</span>
    </div>
   </div>
  </div><nav className="chapter-nav" aria-label="Story chapters">{chapters.map((chapter,i)=><button key={chapter.verb} onClick={()=>go(i)} aria-current={active===i?'step':undefined}><span>0{i+1}</span>{chapter.verb}<ArrowRight size={16}/></button>)}</nav><div className="story-track"><div/></div>
 </div></section>;
}

function MobileChapter({index}:{index:number}){return <div className="mobile-chapter"><span className="eyebrow">0{index+1} / {chapters[index].verb}</span><h2>{chapters[index].title}</h2><p>{chapters[index].copy}</p></div>}

export function PageMotion(){
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
  const update=()=>{frame=0;const max=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--page-progress',String(max>0?scrollY/max:0));document.documentElement.style.setProperty('--hero-shift',`${reduced.matches?0:Math.min(scrollY*.15,130)}px`);};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);update();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.12});
  if(!reduced.matches)document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('motion-ready');observer.observe(el);});
  return()=>{observer.disconnect();removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
 },[]);
 return <div className="reading-progress" aria-hidden="true"/>;
}
