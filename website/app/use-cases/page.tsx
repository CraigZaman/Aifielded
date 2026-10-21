import {ArrowDown, ArrowRight, ArrowUpRight, FileStack, MessagesSquare, Workflow} from 'lucide-react';
import {SiteHeader} from '@/components/site-sections';
import {UseCaseExplorer} from '@/components/use-case-explorer';
import {PageMotion} from '@/components/story';

export const metadata = {
  title: 'Use Cases | Fielded.ai',
  description: 'A digital forward-deployed engineer for organisational understanding. Explore discovery, HR and IT communication, company knowledge, consulting fieldwork and due-diligence collection.',
  alternates: {canonical: 'https://fielded.ai/use-cases'},
};

export default function UseCasesPage() {
  return <main id="top"><PageMotion/><SiteHeader/>
    <section className="cases-welcome"><img src="/fielded-workplace.webp" alt="A shared office, filled with people and natural light" fetchPriority="high"/><div><span className="eyebrow">Your digital forward-deployed engineer</span><h1>Fielded use cases</h1><h2>Good conversations.<br/>Every part of your company.</h2><p>From a question worth exploring to a change worth explaining. Find where Fielded fits into your working day.</p><a className="button dark" href="#explore">Find your use case<ArrowDown size={18}/></a></div></section>
    <UseCaseExplorer/>
    <section className="use-cases-model section-pad"><div><span className="eyebrow">From fieldwork to follow-through</span><h2>Closer to the work.<br/>Connected to the whole.</h2><p>Fielded adapts the forward-deployed model into conversational fieldwork: learn the context, ask the next useful question, and turn approved contributions into intelligence people can act on.</p></div><ol>{[{icon:FileStack,title:'Company context',text:'Your people, processes and approved sources.'},{icon:MessagesSquare,title:'Adaptive dialogue',text:'Discovery, communication and everyday clarification.'},{icon:Workflow,title:'Intelligence & action',text:'Evidence, understanding, decisions and follow-up.'}].map((item,index) => <li key={item.title}><item.icon size={22}/><div><span>0{index+1}</span><h3>{item.title}</h3><p>{item.text}</p></div>{index<2 && <ArrowRight size={18}/>}</li>)}</ol></section>
    <section className="use-case-close section-pad"><span className="eyebrow">One living organisational dialogue layer</span><h2>Start with what matters<br/>to your company.</h2><p>Discover what is missing. Explain what is changing.<br/>Keep the understanding moving in both directions.</p><div><a className="button dark" href="https://app.fielded.ai/sign-up">Try Fielded<ArrowUpRight size={18}/></a><a className="text-cta" href="https://demo.fielded.ai">Explore the private demo<ArrowUpRight size={17}/></a></div></section>
    <footer className="site-footer"><span>© {new Date().getFullYear()} Fielded.ai</span><span>The company, in conversation.</span><div><a href="/">Home</a><a href="/pricing">Pricing</a><a href="mailto:tech@fielded.ai">Get in touch</a></div></footer>
  </main>;
}
