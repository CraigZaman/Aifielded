"use client";

import {useState} from "react";

export function CompanyLogo({src,name}:{src?:string;name:string}) {
 const[failed,setFailed]=useState(false);
 if(!src||failed||!/^https?:\/\//i.test(src))return null;
 // A company-provided public URL is loaded in the browser, never through a server image proxy.
 // eslint-disable-next-line @next/next/no-img-element
 return <img className="company-logo" src={src} alt={`${name} logo`} width={144} height={64} referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>;
}
