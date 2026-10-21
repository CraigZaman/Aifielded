import Link from "next/link";
import crypto from "node:crypto";
import {requireViewer} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
import {PersonalProfileForm} from "@/components/personal-profile-form";
import {PersonalDocumentForm,PersonalDocumentActions} from "@/components/personal-documents";

export default async function PersonalProfilePage() {
  const viewer = await requireViewer(),db=await createClient();
  const [profile,work,documents]=await Promise.all([
    db.from("personal_context").select("details,use_for_dialogue").eq("user_id",viewer.id).maybeSingle(),
    db.rpc("my_work_structure",{workspace:viewer.organisationId}),
    db.from("personal_reference_documents").select("id,title,source_name,content,use_for_dialogue").eq("organisation_id",viewer.organisationId).eq("user_id",viewer.id).order("created_at",{ascending:false}).limit(20),
  ]);
  if(profile.error||work.error||documents.error)throw new Error("Your personal profile could not be loaded.");
  return <div className="page"><header className="page-header"><div className="page-title"><span className="eyebrow">My Profile</span><h1>{viewer.name}</h1><p>{viewer.email}</p></div><div className="page-actions"><Link className="button button-quiet" href="/app/concerns">Raise a concern</Link><Link className="button button-quiet" href="/app/settings">Account settings</Link></div></header>
    <section className="company-section"><div className="profile-employment"><strong>{viewer.organisationName}</strong><span className="chip">{viewer.role}</span></div><dl className="company-field-grid"><div><dt>Department</dt><dd>{work.data?.department||"Not assigned"}</dd></div><div><dt>Reports to</dt><dd>{work.data?.reportsTo||"Not assigned"}</dd></div></dl><p className="role-note">Company-managed placement. Contact your administrator for corrections; editing your personal context does not change authority.</p><PersonalProfileForm accountId={viewer.id} details={profile.data?.details||{}} allowDialogue={profile.data?.use_for_dialogue||false}/></section>
    <section className="company-section"><h2>Private references</h2><details className="company-document"><summary>Add a reference document</summary><PersonalDocumentForm id={crypto.randomUUID()}/></details>{documents.data?.map(d=><details className="company-document" key={d.id}><summary><strong>{d.title}</strong><span className="chip">{d.use_for_dialogue?"Dialogue allowed":"Private storage only"}</span></summary><small>{d.source_name}</small><p style={{whiteSpace:"pre-wrap"}}>{d.content}</p><PersonalDocumentActions id={d.id} allowed={d.use_for_dialogue}/></details>)}</section>
  </div>;
}
