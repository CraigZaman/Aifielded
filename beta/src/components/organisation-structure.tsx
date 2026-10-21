import { Building2,Network,UserRound } from "lucide-react";
import { getWorkspaceDirectory } from "@/lib/workspace-directory";
import { StructureEditor } from "@/components/structure-editor";
import { BUSINESS_ROLE_OPTIONS,optionLabel } from "@/lib/profile-options";

export async function OrganisationStructure({organisationId,organisationName,canEdit}:{organisationId:string;organisationName:string;canEdit:boolean}) {
  const {members,departments}=await getWorkspaceDirectory(organisationId);
  const unassigned=members.filter(m=>!m.department && m.role!=="owner");
  return <section className="organisation-structure" id="organisation-structure">
    <div className="panel-head"><h2><Network size={18} />Organisation structure</h2><span className="chip">{departments.length} departments / {members.length} active members</span></div>
    <div className="organisation-root"><Building2 size={24} /><div><h3>{organisationName}</h3><p>Workspace leadership: {members.filter(m=>m.role==="owner").map(m=>m.name).join(", ") || "No active owner"}</p></div></div>
    <div className="department-tree">{departments.map(d=>{
      const people=members.filter(m=>m.department===d.key),head=people.find(m=>m.id===d.headUserId);
      return <article className="panel department-node" key={d.id}><div className="panel-head"><h3>{d.name}</h3><span className="chip">{people.length}</span></div>
        <div className="department-head"><UserRound size={18} /><div><strong>{head?.name || "Head not appointed"}</strong><small>Department head</small></div></div>
        <ul className="department-people">{people.map(m=><li key={m.id}><strong>{m.name}</strong><span>{optionLabel(BUSINESS_ROLE_OPTIONS,m.businessRole)}</span><small>Reports to: {members.find(p=>p.id===m.reportsTo)?.name || "Not specified"}</small>{!m.confirmed && <span className="chip amber">From work profile</span>}</li>)}</ul>
        {!people.length && <p className="empty-state">No members assigned</p>}
      </article>;
    })}</div>
    {unassigned.length>0 && <div className="unassigned-people"><strong>Department not assigned</strong><p>{unassigned.map(m=>m.name).join(", ")}</p></div>}
    {canEdit && <StructureEditor members={members} departments={departments} />}
  </section>;
}
