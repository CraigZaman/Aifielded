'use client';

import {ArrowDown, ArrowRight, ArrowUpRight, Check, FileCheck2, FolderSearch, MessagesSquare, Search, Users} from 'lucide-react';

const dialogues = {
  discover: {
    title: 'Find out what is really happening.',
    description: 'Ask a business question. Fielded brings the right people into adaptive conversations, tests explanations and connects evidence to action.',
    prompt: 'Why are confirmed orders reaching delivery late?',
    person: 'Delivery team',
    answer: 'We are ready to ship. The release slips arrive a day or two later.',
    reply: 'What has to happen before a release slip reaches you?',
    outcome: 'A lead to investigate, not a conclusion.',
    detail: 'Follow up with the relevant team, with approval where required.',
    steps: ['Ask a question', 'Follow the evidence', 'Decide & act'],
  },
  communicate: {
    title: 'Make sure the message lands.',
    description: 'Share a policy, memo or update. Fielded talks people through it, answers their questions and checks understanding beyond a read receipt.',
    prompt: 'Help everyone understand our updated speaking-up policy.',
    person: 'Team member',
    answer: 'What if my concern involves my own manager?',
    reply: 'Let’s look at the alternative reporting route in your policy, then check your understanding.',
    outcome: 'Understanding, not just “opened”.',
    detail: 'See completion, understanding checks and recurring concerns.',
    steps: ['Share the source', 'Talk it through', 'Check understanding'],
  },
};

export function DialoguePaths() {
 return <section className="dialogue-paths narrative-paths" id="dialogue-types" aria-labelledby="dialogue-paths-title"><header className="section-pad paths-introduction"><span className="eyebrow">Two directions. One dialogue model.</span><h2 id="dialogue-paths-title">Sometimes you need answers.<br/>Sometimes you need <em>understanding.</em></h2><p>The forward-deployed model, reimagined around dialogue. Close to your people. Connected to the bigger picture.</p></header>
 {(['discover','communicate'] as const).map((mode,index)=>{const story=dialogues[mode];return <article className={`path-chapter path-chapter-${mode} section-pad`} key={mode}><div className="path-chapter-copy reveal"><span className="eyebrow">0{index+1} / {mode==='discover'?'Discovery missions':'Communication missions'}</span><h3>{story.title}</h3><p>{story.description}</p><ol>{story.steps.map((step,i)=><li key={step}><span>{i+1}</span>{step}{i<2&&<ArrowDown size={15}/>}</li>)}</ol><a className="button line" href={`/use-cases#${mode}`}>{mode==='discover'?'Explore discovery use cases':'Explore communication use cases'}<ArrowUpRight size={17}/></a></div><div className="path-chapter-visual reveal"><div className="example-topline"><span>{mode==='discover'?<Search size={18}/>:<MessagesSquare size={18}/>}Fielded dialogue</span><small>Illustrative conversation</small></div><div className="example-brief"><span>{mode==='discover'?'A question from management':'A communication from HR'}</span><p>{story.prompt}</p></div><div className="example-person"><span className="example-avatar"><Users size={16}/></span><div><span>{story.person}</span><p>{story.answer}</p></div></div><div className="example-fielded"><img src="/fielded-logo.png" alt="Fielded.ai"/><p>{story.reply}</p></div><div className="example-outcome"><Check size={20}/><div><strong>{story.outcome}</strong><p>{story.detail}</p></div></div></div></article>})}
 <div className="paths-principle section-pad"><p>Not a survey. Not a broadcast. <strong>A company in conversation.</strong></p><a className="text-cta" href="#living-dialogue">And between missions?<ArrowDown size={18}/></a></div></section>;
}

export function AdvisoryFieldwork() {
  return <section className="advisory-fieldwork section-pad" id="advisory" aria-labelledby="advisory-title">
    <div className="advisory-heading reveal"><div><span className="eyebrow">For consultants & due-diligence teams</span><h2 id="advisory-title">Less chasing.<br/>More understanding.</h2></div><p>The same conversation model, working across client teams to collect the evidence behind your advice.</p></div>
    <div className="advisory-rows">
      <article className="reveal"><span className="advisory-number">01</span><div><h3>Consulting fieldwork</h3><p>Turn a project brief into targeted discussions and a structured dataset for your analysis.</p></div><div className="advisory-result"><MessagesSquare size={24}/><ArrowRight size={18}/><FileCheck2 size={24}/><span>Conversations to evidence</span></div></article>
      <article className="reveal"><span className="advisory-number">02</span><div><h3>Due-diligence collection</h3><p>Turn requirements into requests for the right people. Build the data room and see what is still missing.</p></div><div className="advisory-result"><FileCheck2 size={24}/><ArrowRight size={18}/><FolderSearch size={24}/><span>Requirements to a data room</span></div></article>
    </div>
    <div className="advisory-footer reveal"><p>Available to explore in the private demo.<br/>Evidence for professional judgement, not an automatic assurance verdict.</p><a className="text-cta" href="https://demo.fielded.ai/third-party">Explore the third-party demo<ArrowUpRight size={17}/></a></div>
  </section>;
}
