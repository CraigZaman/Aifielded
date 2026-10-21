'use client';

import {useEffect,useRef,useState} from 'react';
import type * as THREE from 'three';

const rooms=[{name:'Leadership',x:-5.4,y:3.35},{name:'Finance',x:0,y:3.35},{name:'HR & People',x:5.4,y:3.35},{name:'Sales',x:-5.4,y:.15},{name:'IT',x:0,y:.15},{name:'Delivery',x:5.4,y:.15}];
const focusForStage=[0,5,3,1,0,2,5];

export function BuildingScene({stage,mode='delivery',paused=false}:{stage:number;mode?:'delivery'|'growth';paused?:boolean}){
 const mount=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null),controls=useRef({stage,selected:focusForStage[stage],hoverX:0,hoverY:0,progress:0,paused});
 const[error,setError]=useState(false),[selected,setSelected]=useState(focusForStage[stage]);
 useEffect(()=>{controls.current.stage=stage;controls.current.selected=focusForStage[stage];setSelected(focusForStage[stage]);},[stage]);
 useEffect(()=>{controls.current.paused=paused;},[paused]);
 useEffect(()=>{
  let stopped=false,cleanup=()=>{};
  void import('three').then(T=>{
   if(stopped||!mount.current||!root.current)return;
   const host=mount.current,wrapper=root.current;
   let renderer:THREE.WebGLRenderer;
   try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power',preserveDrawingBuffer:true});}catch{setError(true);return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0xf3f5f1,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
   renderer.domElement.setAttribute('aria-label',mode==='growth'?'A furnished six-department office. Highlighted rooms represent different perspectives on growth readiness.':'Six-department cutaway office with leadership, finance, HR, sales, IT, and delivery. A red delivery truck waits outside. The view follows the discussion.');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
   const scene=new T.Scene(),building=new T.Group();scene.add(building);
   const camera=new T.OrthographicCamera(-12,12,9,-9,.1,100);camera.position.set(13,12,21);camera.lookAt(0,2.1,1);
   scene.add(new T.HemisphereLight(0xffffff,0xb5c0b0,2.4));
   const sun=new T.DirectionalLight(0xffffff,3.2);sun.position.set(-5,14,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.normalBias=.04;scene.add(sun);
   const fill=new T.DirectionalLight(0xd8ecd3,1.1);fill.position.set(10,6,-8);scene.add(fill);
   const materials=new Set<THREE.Material>(),geometries=new Set<THREE.BufferGeometry>(),textures=new Set<THREE.Texture>();
   const mat=(color:number,opts:Partial<THREE.MeshStandardMaterialParameters>={})=>{const m=new T.MeshStandardMaterial({color,roughness:.78,...opts});materials.add(m);return m;};
   const white=mat(0xf6f5ef),wall=mat(0xe5e8e0),edge=mat(0x3b4942),desk=mat(0xc6cfba),dark=mat(0x26352f),rust=mat(0xb56647),green=mat(0x728f60),screen=mat(0xb2d5bb,{emissive:0x5c9271,emissiveIntensity:.2});
   function box(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=building){const geometry=new T.BoxGeometry(w,h,d);geometries.add(geometry);const mesh=new T.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
   function cylinder(radius:number,height:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=building){const geometry=new T.CylinderGeometry(radius,radius*.88,height,12);geometries.add(geometry);const mesh=new T.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
   function sphere(radius:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=building){const geometry=new T.SphereGeometry(radius,12,8);geometries.add(geometry);const mesh=new T.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;}
   const groundGeo=new T.PlaneGeometry(45,45);geometries.add(groundGeo);const shadow=new T.ShadowMaterial({opacity:.15});materials.add(shadow);const ground=new T.Mesh(groundGeo,shadow);ground.rotation.x=-Math.PI/2;ground.position.y=-.35;ground.receiveShadow=true;scene.add(ground);
   box(16.7,.25,5.6,0,-.14,0,white);box(16.6,.25,5.35,0,3.1,0,white);
   box(16.6,.16,1.1,0,6.35,-2.1,white);
   for(const x of [-8.1,-2.7,2.7,8.1]){box(.16,6.3,.2,x,3.1,-2.55,edge);box(.13,6.3,.13,x,3.1,2.55,white);}
   const glass=mat(0xb6ccbb,{transparent:true,opacity:.23,roughness:.15,metalness:.15,depthWrite:false});
   for(const y of [0,3.25]){
    box(16.5,.45,.15,0,y+.15,-2.5,wall);box(16.5,.14,.14,0,y+2.95,-2.5,edge);box(16.5,2.65,.08,0,y+1.58,-2.53,glass);
    for(const x of [-7,-5.7,-4.3,-1.3,0,1.3,4.3,5.7,7])box(.05,2.75,.09,x,y+1.6,-2.48,edge);
    for(const x of [-2.7,2.7])box(.12,1.7,4.9,x,y+.85,-.05,wall);
    box(.14,2.8,5.1,-8.1,y+1.4,0,wall);
   }
   const floors:THREE.MeshStandardMaterial[]=[];
   rooms.forEach((room,i)=>{
    const floor=mat(0xe4e8de);floors.push(floor);box(5.17,.04,4.98,room.x,room.y-.01,0,floor);
    const x=room.x,y=room.y;
    // Furnished rooms remain legible from the open facade and the top-down camera.
    box(2.65,.13,1.25,x,y+1.03,-.45,desk);
    for(const dx of [-1.06,1.06])for(const dz of [-.42,.42])box(.065,1,.065,x+dx,y+.5,-.45+dz,edge);
    for(const dx of [-.66,.66]){box(.72,.52,.07,x+dx,y+1.42,-.77,dark);box(.62,.41,.015,x+dx,y+1.44,-.727,screen);box(.065,.17,.1,x+dx,y+1.1,-.77,edge);box(.5,.035,.17,x+dx,y+1.115,-.11,white);}
    box(.37,.025,.51,x+.16,y+1.115,-.2,white);box(.26,.025,.32,x-.19,y+1.12,-.2,rust);
    for(const dx of [-.7,.7]){box(.62,.13,.62,x+dx,y+.59,.76,i===0?rust:green);box(.63,.61,.12,x+dx,y+.92,1.01,i===0?rust:green);cylinder(.07,.54,x+dx,y+.27,.76,edge);box(.67,.045,.07,x+dx,y+.04,.76,edge);box(.07,.045,.67,x+dx,y+.04,.76,edge);
     cylinder(.18,.47,x+dx,y+.9,.69,i%2?dark:rust);sphere(.16,x+dx,y+1.27,.65,mat(i%2?0xb6876b:0xd3ae8c));
    }
    box(1.24,.88,.46,x+1.74,y+.44,-1.95,white);box(1.28,.07,.49,x+1.74,y+.92,-1.95,desk);
    for(let b=0;b<6;b++)box(.105,.35+(b%2)*.08,.2,x+1.26+b*.16,y+1.16,-1.96,b%2?green:rust);
    cylinder(.24,.4,x-1.87,y+.2,-1.6,white);cylinder(.025,.95,x-1.87,y+.75,-1.6,edge);
    for(let l=0;l<5;l++){const leaf=sphere(.32,x-1.87+Math.sin(l*2.3)*.19,y+1.1+(l%2)*.23,-1.6+Math.cos(l*2.3)*.18,green);leaf.scale.set(.65,1.45,.75);}
    box(.08,1.1,.85,x+2.34,y+1.8,-1.78,white);box(.09,.07,.68,x+2.39,y+1.98,-1.78,green);box(.09,.07,.52,x+2.39,y+1.72,-1.78,rust);
   });
   const anchors=rooms.map(r=>new T.Vector3(r.x,r.y+1.7,2.15));
   const signalMaterial=new T.MeshBasicMaterial({color:0xc63228,toneMapped:false});materials.add(signalMaterial);
   const paths=[[0,5],[5,3],[3,1],[1,0],[0,2],[2,5]].map(([from,to])=>{const a=anchors[from].clone(),b=anchors[to].clone(),mid=a.clone().lerp(b,.5);mid.z+=2.2;mid.y+=.55;const curve=new T.QuadraticBezierCurve3(a,mid,b);const geometry=new T.TubeGeometry(curve,48,.095,8,false);geometries.add(geometry);const line=new T.Mesh(geometry,signalMaterial);building.add(line);const arrowGeometry=new T.ConeGeometry(.32,.7,12);geometries.add(arrowGeometry);const arrow=new T.Mesh(arrowGeometry,signalMaterial);arrow.position.copy(curve.getPoint(.96));arrow.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),curve.getTangent(.96).normalize());building.add(arrow);return{curve,line,arrow};});
   // The waiting truck and loading motion make the operational consequence tangible.
   const truck=new T.Group();building.add(truck);truck.position.set(4.7,0,5.6);
   const red=mat(0xc84035),tyre=mat(0x242c28),parcel=mat(0xc9ac77),road=mat(0xc9d3c5);
   if(mode==='delivery'){
    box(21,.08,3.1,1,-.25,5.6,road);
    for(let x=-9;x<12;x+=2)box(.8,.02,.065,x,-.19,7,white);
   }
   box(3.3,.18,1.5,0,.38,0,dark,truck);box(2.4,1.65,1.5,-.55,1.24,0,white,truck);
   box(1.25,1.35,1.5,1.25,1.08,0,red,truck);box(.68,.62,1.52,1.19,1.5,0,glass,truck);
   box(.05,.24,1.15,1.9,.72,0,white,truck);box(.045,.8,.8,-1.77,1.15,0,dark,truck);
   for(const x of [-1.1,1.2])for(const z of [-.77,.77]){const wheel=cylinder(.38,.22,x,.37,z,tyre,truck);wheel.rotation.x=Math.PI/2;}
   box(1.05,.35,.025,-.5,1.25,.765,red,truck);
   const loader=new T.Group();building.add(loader);cylinder(.15,.57,0,.83,0,green,loader);sphere(.17,0,1.28,0,mat(0xb98d70),loader);for(const x of [-.12,.12])box(.12,.5,.14,x,.29,0,dark,loader);
   const carried=box(.55,.45,.5,0,1,.38,parcel,loader);
   if(mode==='delivery')for(let i=0;i<4;i++)box(.55,.48,.5,6.8+(i%2)*.65,.12+Math.floor(i/2)*.5,3.55,parcel);
   const tokenCanvas=document.createElement('canvas');tokenCanvas.width=512;tokenCanvas.height=200;const ctx=tokenCanvas.getContext('2d')!;const texture=new T.CanvasTexture(tokenCanvas);texture.colorSpace=T.SRGBColorSpace;textures.add(texture);const tokenMaterial=new T.SpriteMaterial({map:texture,toneMapped:false,depthTest:false});materials.add(tokenMaterial);const token=new T.Sprite(tokenMaterial);token.scale.set(4.8,1.875,1);token.renderOrder=10;building.add(token);
   function paintQuestion(stage:number){ctx.fillStyle='#c63228';ctx.fillRect(0,0,512,200);ctx.fillStyle='#ffffff';ctx.font='bold 23px Arial';ctx.fillText(stage<4?'FIELDED ASKS':'FIELDED FOLLOWS THROUGH',28,48);ctx.font='bold 38px Arial';ctx.fillText(['Why the delay?','What is missing?','What comes first?','When is it sent?','What should change?','Is the change clear?','Did it help?'][stage],28,117);ctx.font='22px Arial';ctx.fillText(['Leadership','Delivery','Sales','Finance','Leadership','HR & People','Delivery'][stage],28,165);texture.needsUpdate=true;}
   const markerElements=Array.from(wrapper.querySelectorAll<HTMLElement>('.room-marker'));
   const pointer=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const r=host.getBoundingClientRect();controls.current.hoverX=(event.clientX-r.left)/r.width-.5;controls.current.hoverY=(event.clientY-r.top)/r.height-.5;};
   const leave=()=>{controls.current.hoverX=0;controls.current.hoverY=0;};host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);
   const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;const aspect=w/h,view=Math.max(13.5,23/aspect);camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();renderer.setSize(w,h);};const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
   let inView=true;const visibleObserver=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;},{rootMargin:'150px'});visibleObserver.observe(host);
   const reduce=matchMedia('(prefers-reduced-motion: reduce)'),normalColor=new T.Color(0xe4e8de),activeColor=new T.Color(0xf0c4ac);let frame=0,lastStage=-1,stageTime=0;
   const lookAt=new T.Vector3(0,2.1,1);
   if(mode==='growth'){truck.visible=false;loader.visible=false;token.visible=false;}
   let motionTime=0,previousTime=0;
   const animate=(time:number)=>{if(stopped)return;frame=requestAnimationFrame(animate);if(!inView||document.hidden)return;
    const state=controls.current,story=wrapper.closest('.journey-story'),p=story?parseFloat(getComputedStyle(story).getPropertyValue('--story-progress'))||0:0;state.progress=p;
    if(!state.paused&&!reduce.matches)motionTime+=Math.min(50,time-previousTime);previousTime=time;
    if(lastStage!==state.stage){lastStage=state.stage;stageTime=time;paintQuestion(state.stage);}
    const arrival=clamp((time-stageTime)/1600),focused=rooms[state.selected],close=mode!=='growth'&&host.clientWidth>500&&!reduce.matches&&arrival>.8;
    const closeFinance=state.stage===3&&close;
    camera.position.lerp(new T.Vector3(closeFinance?6:13,closeFinance?20:12,closeFinance?14:21),.035);
    lookAt.lerp(new T.Vector3(close?focused.x*.65:0,close?focused.y*.65+1.5:2.1,close&&state.stage===1?2.4:1),.035);
    camera.zoom=T.MathUtils.lerp(camera.zoom,close?(state.stage===0||state.stage===3?1.4:1.15):1,.03);camera.lookAt(lookAt);camera.updateProjectionMatrix();
    const loading=reduce.matches?0:(Math.sin(motionTime*.0014)+1)/2;
    loader.position.set(6.7-loading*3.5,0,6.8-loading*.8);carried.visible=loading<.83;
    loader.visible=mode!=='growth'&&state.stage!==6;truck.position.x=T.MathUtils.lerp(truck.position.x,state.stage===6?13:4.7,.012);
    building.rotation.y=T.MathUtils.lerp(building.rotation.y,reduce.matches||state.paused?0:state.hoverX*.12+(mode==='growth'?Math.sin(motionTime*.0003)*.07:(p-.5)*.11),.055);
    building.position.y=T.MathUtils.lerp(building.position.y,reduce.matches?0:state.hoverY*-.12,.05);building.updateMatrixWorld(true);
    floors.forEach((floor,i)=>floor.color.lerp((mode==='growth'?[0,3,5][Math.floor(motionTime/2400)%3]===i:state.selected===i)?activeColor:normalColor,.05));
    paths.forEach((path,i)=>{const show=mode!=='growth'&&state.stage===i+1;path.line.visible=show;path.arrow.visible=show;});
    token.visible=mode!=='growth'&&!reduce.matches&&host.clientWidth>500;
    token.position.copy(state.stage===0?anchors[0]:paths[state.stage-1].curve.getPoint(arrival));token.position.y+=1.4;
    markerElements.forEach((el,i)=>{const point=new T.Vector3(rooms[i].x,rooms[i].y+.3,2.9).applyMatrix4(building.matrixWorld).project(camera);el.style.left=`${(point.x*.5+.5)*host.clientWidth}px`;el.style.top=`${(-point.y*.5+.5)*host.clientHeight}px`;});
    renderer.render(scene,camera);renderer.domElement.dataset.ready='true';renderer.domElement.dataset.frame=String(Math.floor(time));
   };frame=requestAnimationFrame(animate);
   const lost=(e:Event)=>{e.preventDefault();setError(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
   cleanup=()=>{cancelAnimationFrame(frame);resizeObserver.disconnect();visibleObserver.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();};
  }).catch(()=>setError(true));
  return()=>{stopped=true;cleanup();};
 },[mode]);
 return <div className={`building-experience ${mode==='growth'?'growth-building':''}`} ref={root}>{mode!=='growth'&&<div className="world-department"><span>{stage===0?'Start here':`0${stage+1} / The next perspective`}</span><strong>{rooms[selected].name}</strong>{stage>0&&<small>{rooms[focusForStage[stage-1]].name} → {rooms[selected].name}</small>}</div>}<div className="building-canvas" ref={mount}>{error&&<div className="building-fallback"><img src="/fielded-workplace.webp" alt="Connected offices across a company"/><span>Leadership → Conversations → Evidence → Action</span></div>}</div><div className="world-caption"><span className="status-dot"/>{mode==='growth'?'Leadership · Sales · Operations · Support · Finance · People':stage===3?'Finance explains when payment confirmation reaches Sales':stage===6?'The next conversation checks what changed':stage===1?'The driver is ready. Fielded asks what is holding the release.':'Leadership · Finance · HR · Sales · IT · Delivery'}</div></div>;
}
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
