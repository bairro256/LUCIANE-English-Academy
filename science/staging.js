import React, {useEffect,useMemo,useState} from "https://esm.sh/react@18.3.1";
import {createRoot} from "https://esm.sh/react-dom@18.3.1/client";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2.57.0";
import {marked} from "https://esm.sh/marked@15.0.7";
import DOMPurify from "https://esm.sh/dompurify@3.2.6";
import {jsPDF} from "https://esm.sh/jspdf@2.5.2";
import QRCode from "https://esm.sh/qrcode@1.5.4?bundle";

const h=React.createElement;
const supabase=createClient("https://nuovqgybrszacjlolacy.supabase.co","sb_publishable_9n4nC6h05pCuwEO0qTQsoQ_cSyEvNGo",{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const META={
 mathematics:{title:"Escola de Matemática",code:"MAT",symbol:"∑",description:"Do domínio dos números reais à análise, cálculo e estruturas matemáticas.",color:"#3567bb"},
 physics:{title:"Escola de Física",code:"FIS",symbol:"Φ",description:"Da mecânica clássica ao electromagnetismo e à física moderna.",color:"#168477"},
 chemistry:{title:"Escola de Química",code:"QUI",symbol:"⚗",description:"Da estrutura atómica à físico-química e à química orgânica.",color:"#8061b6"}
};
const PHASE={refresh:"Refrescamento intensivo",foundation:"Área de Base",main:"Curso Principal",completed:"Concluído"};
function safeMarkdown(value){return DOMPurify.sanitize(marked.parse(String(value||"")),{USE_PROFILES:{html:true}})}
function App(){
 const [session,setSession]=useState(null),[authReady,setAuthReady]=useState(false);
 const [signup,setSignup]=useState(false),[fullName,setFullName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[authNotice,setAuthNotice]=useState("");
 const [view,setView]=useState("dashboard"),[activeDepartment,setActiveDepartment]=useState("mathematics");
 const [departments,setDepartments]=useState([]),[states,setStates]=useState([]),[schoolState,setSchoolState]=useState(null);
 const [phaseLessons,setPhaseLessons]=useState([]),[selectedLesson,setSelectedLesson]=useState(null);
 const [levels,setLevels]=useState([]),[activeLevel,setActiveLevel]=useState(null),[levelLessons,setLevelLessons]=useState([]),[selectedLevelLesson,setSelectedLevelLesson]=useState(null);
 const [practice,setPractice]=useState(null),[practiceAnswer,setPracticeAnswer]=useState(""),[practiceFeedback,setPracticeFeedback]=useState("");
 const [exam,setExam]=useState(null),[examAnswers,setExamAnswers]=useState([]),[remaining,setRemaining]=useState(0),[examResult,setExamResult]=useState(null);
 const [record,setRecord]=useState([]),[certificates,setCertificates]=useState([]),[profileName,setProfileName]=useState("");
 const [busy,setBusy]=useState(false),[toast,setToast]=useState("");
 const user=session?.user||null;
 const currentPhase=schoolState?.phase||"refresh";
 const nextLevel=Number(schoolState?.current_level||0)+1;
 function notify(message){setToast(message);window.clearTimeout(notify.timer);notify.timer=window.setTimeout(()=>setToast(""),3200)}
 useEffect(()=>{
  let alive=true;
  supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setAuthReady(true)}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setAuthReady(true)});
  const onHash=()=>{const r=location.hash||"#/dashboard";if(r==="#/boletim")setView("record");else if(r==="#/certificados")setView("certificates");else if(r.startsWith("#/escola/")){setView("school");setActiveDepartment("mathematics")}else setView("dashboard")};
  window.addEventListener("hashchange",onHash);onHash();
  return()=>{alive=false;subscription.unsubscribe();window.removeEventListener("hashchange",onHash)};
 },[]);
 useEffect(()=>{if(user){loadDashboard();const route=location.hash||"#/dashboard";if(route.startsWith("#/escola/"))openMath();else if(route==="#/boletim")openRecord();else if(route==="#/certificados")openCertificates()}},[user?.id]);
 useEffect(()=>{
  if(!exam)return;
  const tick=()=>{const left=Math.max(0,Math.floor((new Date(exam.deadline_at).getTime()-Date.now())/1000));setRemaining(left)};
  tick();const id=window.setInterval(tick,1000);return()=>window.clearInterval(id);
 },[exam?.id]);
 useEffect(()=>{
  if(!exam?.id||!user?.id)return;
  const onVisibilityChange=()=>{
   if(document.visibilityState==="hidden"){
    supabase.functions.invoke("science-assessment",{body:{action:"event",department_id:"mathematics",session_id:exam.id,event_type:"tab_hidden"}}).catch(()=>{});
   }
  };
  document.addEventListener("visibilitychange",onVisibilityChange);
  return()=>document.removeEventListener("visibilitychange",onVisibilityChange);
 },[exam?.id,user?.id]);
 useEffect(()=>{
  const target=document.querySelector(".md-content");
  if(target&&window.renderMathInElement){const slash=String.fromCharCode(92),dollar=String.fromCharCode(36);window.renderMathInElement(target,{delimiters:[{left:dollar+dollar,right:dollar+dollar,display:true},{left:slash+"[",right:slash+"]",display:true},{left:slash+"(",right:slash+")",display:false}],throwOnError:false})}
 },[selectedLesson,selectedLevelLesson,view]);
 async function loadDashboard(){
  const [d,s]=await Promise.all([
   supabase.from("science_departments").select("id,name,short_name,accent_color,description,display_order").eq("is_active",true).order("display_order"),
   supabase.from("science_student_state").select("*").eq("user_id",user.id)
  ]);
  if(d.error){notify("Não foi possível carregar as escolas.");return}
  setDepartments(d.data||[]);setStates(s.data||[]);
 }
 function stateFor(id){return states.find(x=>x.department_id===id)}
 async function refreshSchoolState(){
  const {data,error}=await supabase.from("science_student_state").select("*").eq("user_id",user.id).eq("department_id","mathematics").maybeSingle();
  if(!error&&data){setSchoolState(data);setStates(old=>{const rest=old.filter(x=>x.department_id!=="mathematics");return [...rest,data]})}
  return data||null;
 }
 async function openMath(){
  if(!user){setView("auth");return}
  setActiveDepartment("mathematics");setView("school");location.hash="#/escola/matematica";
  let st=stateFor("mathematics");
  if(!st){const existing=await supabase.from("science_student_state").select("*").eq("user_id",user.id).eq("department_id","mathematics").maybeSingle();st=existing.data||null}
  if(!st){
   setBusy(true);
   const {data,error}=await supabase.functions.invoke("science-enroll",{body:{department_id:"mathematics"}});
   setBusy(false);
   if(error||!data?.ok){notify(data?.error||error?.message||"Não foi possível iniciar a inscrição.");return}
   st=await refreshSchoolState();await loadDashboard();
  }else{setSchoolState(st)}
  await loadPhaseContent(st);
 }
 async function loadPhaseContent(st){
  setSelectedLesson(null);setSelectedLevelLesson(null);setActiveLevel(null);setPractice(null);setPracticeFeedback("");setExam(null);setExamResult(null);
  if(!st)return;
  if(["refresh","foundation"].includes(st.phase)){
   const {data,error}=await supabase.from("science_phase_lessons").select("id,phase,lesson_number,title,estimated_minutes,learning_objectives,body_md").eq("department_id","mathematics").eq("phase",st.phase).eq("is_published",true).order("sequence_order");
   if(error){notify("Falha ao carregar aulas.");return}
   setPhaseLessons(data||[]);setSelectedLesson((data||[])[0]||null);setLevels([]);
  }else if(st.phase==="main"){
   const {data,error}=await supabase.from("science_levels").select("id,level_number,title,summary,estimated_minutes,learning_objectives").eq("department_id","mathematics").eq("publication_status","published").order("level_number");
   if(error){notify("Falha ao carregar níveis.");return}
   setLevels(data||[]);setPhaseLessons([]);
  }else{setLevels([]);setPhaseLessons([])}
 }
 async function openLevel(level){
  setBusy(true);setActiveLevel(level);setSelectedLevelLesson(null);
  const {data,error}=await supabase.from("science_lessons").select("id,title,lesson_order,body_md").eq("level_id",level.id).eq("is_published",true).order("lesson_order");
  setBusy(false);
  if(error){notify("Não foi possível carregar as aulas do nível.");return}
  setLevelLessons(data||[]);setSelectedLevelLesson((data||[])[0]||null);
 }
 async function callPractice(action,extra){
  const {data,error}=await supabase.functions.invoke("science-practice",{body:{action,department_id:"mathematics",...(extra||{})}});
  if(error){notify(data?.error||error.message);return null}
  if(data?.error){notify(data.error);return null}
  return data;
 }
 async function newPractice(){
  setPracticeFeedback("");setPracticeAnswer("");setPractice(null);setBusy(true);
  const data=await callPractice("generate");setBusy(false);
  if(data?.problem)setPractice(data.problem);
 }
 async function answerPractice(e){
  e.preventDefault();if(!practice||!practiceAnswer.trim())return;
  setBusy(true);const data=await callPractice("answer",{problem_id:practice.id,answer:practiceAnswer});setBusy(false);
  if(data){setPracticeFeedback((data.correct?"Correcto. ":"Ainda não. ")+"Resposta: "+data.expected_answer+". "+data.solution);setPractice(null)}
 }
 async function startExam(){
  setExamResult(null);setBusy(true);
  const {data,error}=await supabase.functions.invoke("science-assessment",{body:{action:"start",department_id:"mathematics"}});
  setBusy(false);
  if(error||data?.error){notify(data?.error||error?.message||"Não foi possível iniciar a avaliação.");return}
  setExam({...data.session,questions:data.questions});setExamAnswers(Array(data.questions.length).fill(""));setRemaining(data.duration_seconds);setView("school");
  setTimeout(()=>document.getElementById("exam-panel")?.scrollIntoView({behavior:"smooth",block:"start"}),120);
 }
 async function submitExam(e){
  e.preventDefault();if(!exam)return;
  if(examAnswers.some(x=>!String(x).trim())){notify("Preenche todas as respostas.");return}
  setBusy(true);
  const {data,error}=await supabase.functions.invoke("science-assessment",{body:{action:"submit",department_id:"mathematics",session_id:exam.id,answers:examAnswers}});
  setBusy(false);
  if(error||data?.error){notify(data?.error||error?.message||"Falha ao submeter.");return}
  setExam(null);const st=await refreshSchoolState();await loadPhaseContent(st);await loadDashboard();
  if(data.certificate){
   const [{data:profile},{data:certs}]=await Promise.all([
    supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
    supabase.from("science_certificates").select("certificate_code,verification_hash,department_id,average_score,workload_hours,issued_at,revoked_at,curriculum_snapshot").eq("user_id",user.id)
   ]);
   setProfileName(profile?.full_name||user.user_metadata?.full_name||user.email||"Estudante");setCertificates(certs||[]);
   notify("Certificado final emitido com código e QR de verificação.");
  }
  setExamResult(data);
 }
 async function openRecord(){
  setView("record");location.hash="#/boletim";
  const {data,error}=await supabase.from("science_level_progress").select("department_id,level_id,practice_mastery,exam_best_score,attempts_count,completed_at").eq("user_id",user.id).order("completed_at",{ascending:false});
  if(error){notify("Não foi possível carregar o boletim.");return}setRecord(data||[]);
 }
 async function openCertificates(){
  setView("certificates");location.hash="#/certificados";
  const [{data,error},{data:profile}]=await Promise.all([
   supabase.from("science_certificates").select("certificate_code,verification_hash,department_id,average_score,workload_hours,issued_at,revoked_at,curriculum_snapshot").eq("user_id",user.id),
   supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle()
  ]);
  if(error){notify("Não foi possível carregar certificados.");return}
  setProfileName(profile?.full_name||user.user_metadata?.full_name||user.email||"Estudante");
  setCertificates(data||[]);
 }
 async function downloadCertificate(c){
  if(c.revoked_at){notify("Este certificado foi revogado.");return}
  try{
   const verifyUrl="https://nuovqgybrszacjlolacy.supabase.co/functions/v1/science-certificate?code="+encodeURIComponent(c.certificate_code)+"&hash="+encodeURIComponent(c.verification_hash);
   const qr=await QRCode.toDataURL(verifyUrl,{width:420,margin:1,errorCorrectionLevel:"H"});
   const pdf=new jsPDF({orientation:"landscape",unit:"mm",format:"a4"});
   pdf.setProperties({title:"Certificado "+c.certificate_code,subject:"LUCIANE Academic Sciences — Matemática",creator:"LUCIANE Academic Sciences"});
   pdf.setFillColor(248,247,242);pdf.rect(0,0,297,210,"F");
   pdf.setDrawColor(177,138,74);pdf.setLineWidth(1.2);pdf.rect(9,9,279,192);
   pdf.setDrawColor(30,48,68);pdf.setLineWidth(.35);pdf.rect(13,13,271,184);
   pdf.setTextColor(35,49,66);pdf.setFont("times","bold");pdf.setFontSize(13);pdf.text("LUCIANE ACADEMIC SCIENCES",148.5,31,{align:"center"});
   pdf.setTextColor(177,138,74);pdf.setFontSize(10);pdf.text("ANGOLA · FORMAÇÃO CIENTÍFICA",148.5,38,{align:"center"});
   pdf.setTextColor(35,49,66);pdf.setFont("times","bold");pdf.setFontSize(27);pdf.text("CERTIFICADO DE CONCLUSÃO",148.5,61,{align:"center"});
   pdf.setFont("times","normal");pdf.setFontSize(13);pdf.text("Certificamos que",148.5,79,{align:"center"});
   pdf.setTextColor(25,42,62);pdf.setFont("times","bold");pdf.setFontSize(25);pdf.text(profileName||"Estudante",148.5,96,{align:"center",maxWidth:210});
   pdf.setFont("times","normal");pdf.setFontSize(13);
   pdf.text("concluiu com aproveitamento o Percurso Integral de Matemática,",148.5,111,{align:"center"});
   pdf.text("composto por 100 níveis e quatro ciclos de formação académica.",148.5,119,{align:"center"});
   pdf.setFont("helvetica","bold");pdf.setFontSize(11);pdf.text("MÉDIA FINAL: "+Number(c.average_score).toFixed(1)+"%",148.5,137,{align:"center"});
   pdf.setFont("helvetica","normal");pdf.setFontSize(10);
   const issued=new Date(c.issued_at).toLocaleDateString("pt-PT",{day:"2-digit",month:"long",year:"numeric",timeZone:"Africa/Luanda"});
   pdf.text("Carga horária registada: "+Number(c.workload_hours).toFixed(2)+" horas",148.5,146,{align:"center"});
   pdf.text("Emitido em "+issued,148.5,154,{align:"center"});
   pdf.setFont("helvetica","bold");pdf.setFontSize(8);pdf.text("CÓDIGO DE AUTENTICIDADE",148.5,171,{align:"center"});
   pdf.text(c.certificate_code,148.5,177,{align:"center"});
   pdf.addImage(qr,"PNG",238,135,34,34);
   pdf.setFont("helvetica","normal");pdf.setFontSize(7);pdf.text("LER PARA VALIDAR",255,173,{align:"center"});
   pdf.save(c.certificate_code+".pdf");
  }catch(err){notify("Não foi possível gerar o PDF. Tenta novamente.");}
 }
 async function authSubmit(e){
  e.preventDefault();if(signup&&!fullName.trim()){setAuthNotice("Indica o teu nome completo.");return}setBusy(true);setAuthNotice("A validar acesso…");
  const result=signup?await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:fullName.trim()},emailRedirectTo:location.origin+location.pathname+"#/dashboard"}}):await supabase.auth.signInWithPassword({email:email.trim(),password});
  setBusy(false);
  if(result.error){setAuthNotice(result.error.message);return}
  if(signup&&!result.data.session){setAuthNotice("Conta criada. Confirma o endereço de e-mail para activar o acesso.");return}
  setAuthNotice("");setView("dashboard");location.hash="#/dashboard";
 }
 async function signOut(){await supabase.auth.signOut();setSession(null);setView("dashboard");location.hash="#/dashboard";setEmail("");setPassword("");setFullName("")}
 const route=(v)=>{setView(v);if(v==="dashboard")location.hash="#/dashboard"};
 const currentLesson=selectedLesson||selectedLevelLesson;
 if(!authReady)return h("div",{className:"boot"},"LUCIANE ",h("span",null,"ACADEMIC SCIENCES"),h("small",null,"A preparar o ambiente académico…"));
 if(!user)return h("div",{className:"auth"},
  h("section",{className:"auth-brand"},h("div",{className:"brand"},h("span",{className:"seal"},"L"),"LUCIANE",h("small",null,"ACADEMIC SCIENCES")),
   h("div",{className:"auth-copy"},h("p",{className:"eyebrow"},"ECOSSISTEMA ACADÉMICO · CIÊNCIAS EXACTAS"),h("h1",null,"Conhecimento exige ",h("em",null,"método.")),h("p",null,"Três escolas. Um percurso académico rigoroso. Do domínio das bases à competência científica avançada."),h("div",{className:"disciplines"},h("span",null,"01 / MATEMÁTICA"),h("span",null,"02 / FÍSICA"),h("span",null,"03 / QUÍMICA"))),h("div",{className:"auth-foot"},"LUCIANE ACADEMIC SCIENCES · ANGOLA")),
  h("section",{className:"auth-panel"},h("form",{className:"auth-card",onSubmit:authSubmit},h("p",{className:"eyebrow"},"PORTAL DO ESTUDANTE"),h("h2",null,signup?"Criar perfil académico":"A tua jornada começa aqui."),h("p",{className:"muted"},signup?"Uma conta. Três escolas. Um histórico individual.":"Acede ao teu espaço académico individual."),
   signup?h("label",null,"Nome completo"),signup?h("input",{type:"text",value:fullName,onChange:e=>setFullName(e.target.value),required:true,autoComplete:"name",placeholder:"Nome e apelido"}):null,h("label",null,"Endereço de e-mail"),h("input",{type:"email",value:email,onChange:e=>setEmail(e.target.value),required:true,autoComplete:"email",placeholder:"nome@exemplo.com"}),
   h("label",null,"Palavra-passe"),h("input",{type:"password",value:password,onChange:e=>setPassword(e.target.value),required:true,minLength:8,autoComplete:signup?"new-password":"current-password",placeholder:"Mínimo de 8 caracteres"}),
   h("button",{className:"btn",type:"submit",disabled:busy},busy?"A validar…":signup?"Criar conta académica ↗":"Entrar no ecossistema ↗"),
   h("div",{className:"switch"},signup?"Já tens uma conta? ":"Ainda não tens uma conta? ",h("button",{className:"link",type:"button",onClick:()=>{setSignup(!signup);setAuthNotice("")}},signup?"Entrar":"Criar conta")),
   h("p",{className:"notice"},authNotice))));
 const progressRows=departments.map(d=>{const st=stateFor(d.id);return h("div",{className:"record-row",key:d.id},h("strong",null,d.name),h("span",null,d.id==="mathematics"?(PHASE[st?.phase]||"Por iniciar"):"Em desenvolvimento curricular"))});
 const schoolCards=departments.map(d=>{const m=META[d.id]||{};const isMath=d.id==="mathematics";const st=stateFor(d.id);return h("article",{className:"school",key:d.id},h("div",{className:"school-top"},h("span",null,String(d.display_order).padStart(2,"0")),h("span",null,m.code+" / 100")),h("div",{className:"symbol",style:{color:m.color}},m.symbol),h("h3",null,d.name),h("p",null,d.description||m.description),h("div",{className:"school-bottom"},h("span",{className:"school-status"},isMath?(PHASE[st?.phase]||"Percurso por iniciar"):"Em desenvolvimento curricular"),h("button",{className:"btn "+(isMath?"":"secondary"),disabled:!isMath||busy,onClick:openMath},isMath?"Abrir escola ↗":"Em preparação")) )});
 const phaseTrack=h("div",{className:"phase-track"},
  h("div",{className:"phase-step "+(currentPhase==="refresh"?"current":"")},h("span",null,"00"),h("b",null,"Refrescamento"),h("small",null,"Revisão e triagem")),
  h("i"),h("div",{className:"phase-step "+(currentPhase==="foundation"?"current":"")},h("span",null,"01"),h("b",null,"Área de Base"),h("small",null,"Recuperação rigorosa")),
  h("i"),h("div",{className:"phase-step "+(currentPhase==="main"?"current":"")},h("span",null,"02"),h("b",null,"Curso Principal"),h("small",null,"Níveis 01 — 100")));
  const lessonPanel=h("section",{className:"panel"},
   h("div",{className:"panel-head"},h("h3",null,PHASE[currentPhase]||"Aulas estruturadas"),h("span",{className:"tag"},phaseLessons.length+" AULAS")),
   phaseLessons.length
    ? h("div",{className:"lesson-layout"},
       h("nav",{className:"lesson-list"},phaseLessons.map(l=>h("button",{key:l.id,className:"lesson-choice "+(selectedLesson?.id===l.id?"active":""),onClick:()=>setSelectedLesson(l)},h("span",null,String(l.lesson_number).padStart(2,"0")),h("b",null,l.title)))),
       h("article",{className:"lesson-reader"},selectedLesson
        ? h(React.Fragment,null,h("div",{className:"lesson-meta"},"AULA "+String(selectedLesson.lesson_number).padStart(2,"0")+" · "+selectedLesson.estimated_minutes+" MIN"),h("h2",null,selectedLesson.title),h("div",{className:"md-content",dangerouslySetInnerHTML:{__html:safeMarkdown(selectedLesson.body_md)}}))
        : h("div",{className:"empty"},"Selecciona uma aula."))
      )
    : h("div",{className:"empty"},"Não existem aulas publicadas nesta fase.")
  );
  const levelPanel=h("section",{className:"panel"},
   h("div",{className:"panel-head"},h("h3",null,"Mapa curricular · 100 níveis"),h("span",{className:"tag"},"NÍVEL ACTUAL "+String(schoolState?.current_level||0).padStart(2,"0"))),
   h("p",{className:"muted"},"Só o próximo nível sequencial fica disponível. Cada nível exige aprovação mínima de 80%."),
   h("div",{className:"level-grid"},levels.map(l=>{const allowed=l.level_number<=nextLevel;return h("div",{className:"level-card",key:l.id},h("div",null,h("strong",null,"Nível "+String(l.level_number).padStart(2,"0")),h("div",null,h("small",null,l.title))),h("button",{className:"btn "+(allowed?"":"secondary"),disabled:!allowed||busy,onClick:()=>openLevel(l)},allowed?"Abrir ↗":"Bloqueado"))})),
   activeLevel
    ? h("div",{className:"panel"},
       h("div",{className:"panel-head"},h("h3",null,"Nível "+String(activeLevel.level_number).padStart(2,"0")+" · "+activeLevel.title),h("span",{className:"tag"},"80% PARA APROVAR")),
       levelLessons.length
        ? h("div",{className:"lesson-layout"},
           h("nav",{className:"lesson-list"},levelLessons.map(l=>h("button",{key:l.id,className:"lesson-choice "+(selectedLevelLesson?.id===l.id?"active":""),onClick:()=>setSelectedLevelLesson(l)},h("span",null,String(l.lesson_order).padStart(2,"0")),h("b",null,l.title)))),
           h("article",{className:"lesson-reader"},selectedLevelLesson
            ? h(React.Fragment,null,h("h2",null,selectedLevelLesson.title),h("div",{className:"md-content",dangerouslySetInnerHTML:{__html:safeMarkdown(selectedLevelLesson.body_md)}}))
            : h("div",{className:"empty"},"Selecciona uma aula."))
          )
        : h("div",{className:"empty"},"Este nível ainda não tem aulas publicadas.")
      )
    : null
  );
 const practicePanel=h("section",{className:"panel"},h("div",{className:"panel-head"},h("h3",null,"Laboratório de prática"),h("span",{className:"tag"},"GERAÇÃO ALGORÍTMICA")),
  h("p",{className:"muted"},"Exercícios variáveis, correcção individual e resolução explicada. Não depende de créditos de IA."),
  practice?h("div",null,h("div",{className:"lesson-meta"},practice.topic_code||"PRÁTICA"),h("div",{className:"practice-question"},practice.question),h("form",{className:"practice-form",onSubmit:answerPractice},h("input",{value:practiceAnswer,onChange:e=>setPracticeAnswer(e.target.value),placeholder:"A tua resposta",required:true}),h("button",{className:"btn",disabled:busy,type:"submit"},busy?"A corrigir…":"Corrigir resposta"))):h("button",{className:"btn",onClick:newPractice,disabled:busy},busy?"A gerar…":"Novo exercício +"),
  practiceFeedback?h("p",{className:"feedback"},practiceFeedback):null);
 const examPanel=h("section",{className:"panel",id:"exam-panel"},h("div",{className:"panel-head"},h("h3",null,exam?(PHASE[currentPhase]||"Avaliação"):"Avaliação académica"),h("span",{className:"timer"},exam?String(Math.floor(remaining/60)).padStart(2,"0")+":"+String(remaining%60).padStart(2,"0"):"80% PARA APROVAÇÃO")),
  exam?h("form",{onSubmit:submitExam},exam.questions?.map((q,i)=>h("article",{className:"exam-question",key:i},h("span",null,"QUESTÃO "+String(i+1).padStart(2,"0")+" · "+q.topic),h("p",null,q.question),h("input",{value:examAnswers[i]||"",onChange:e=>setExamAnswers(old=>old.map((x,j)=>j===i?e.target.value:x)),required:true,placeholder:"A tua resposta"}))),h("button",{className:"btn",type:"submit",disabled:busy||remaining<=0},busy?"A submeter…":"Submeter avaliação")):h("button",{className:"btn",onClick:startExam,disabled:busy},busy?"A preparar…":currentPhase==="refresh"?"Iniciar diagnóstico (75%)":currentPhase==="foundation"?"Fazer exame de saída (80%)":"Avaliar próximo nível (80%)"),
  examResult?h("div",{className:"result"},h("strong",{className:examResult.passed?"good":"bad"},examResult.passed?"APROVADO":"NÃO APROVADO"),h("p",null,"Resultado: "+examResult.score+"% · "+examResult.correct_count+"/"+examResult.total+" respostas correctas."),examResult.certificate?h("div",{className:"certificate-issued"},h("strong",null,"Certificado final emitido"),h("p",null,examResult.certificate.certificate_code),h("button",{className:"btn gold",onClick:()=>downloadCertificate(examResult.certificate)},"Descarregar certificado PDF")):null,examResult.results?.map((r,i)=>h("p",{key:i},h("b",null,"Questão "+(i+1)+": "),r.correct?"Correcta":"Incorrecta"," · Resposta: "+r.expected_answer,h("br"),r.solution))):null);
 const schoolContent=h(React.Fragment,null,h("div",{className:"section-head"},h("div",null,h("h2",null,"Escola de Matemática"),h("p",null,"Percurso individual · diagnóstico, base e curso principal.")),h("span",{className:"section-no"},"MAT / 100")),
  h("section",{className:"panel"},h("div",{className:"panel-head"},h("h3",null,"Percurso obrigatório"),h("span",{className:"tag"},"PROGRESSÃO CONTROLADA")),phaseTrack,h("div",{className:"notice-panel"},schoolState?"Estado actual: "+PHASE[currentPhase]+". A próxima etapa só abre após aprovação.":"O percurso será iniciado no diagnóstico.")),
  currentPhase==="refresh"||currentPhase==="foundation"?lessonPanel:levelPanel,
  practicePanel,examPanel);
 const recordContent=h("section",{className:"panel"},h("div",{className:"panel-head"},h("h3",null,"Boletim académico"),h("span",{className:"tag"},"HISTÓRICO INDIVIDUAL")),
  record.length?record.map((r,i)=>h("div",{className:"record-row",key:i},h("span",null,"Nível concluído · "+r.level_id),h("strong",null,"Exame "+(r.exam_best_score??"—")+"% · "+r.attempts_count+" tentativas"))):h("div",{className:"empty"},"Ainda não existem níveis concluídos."));
 const certContent=h("section",{className:"panel"},h("div",{className:"panel-head"},h("h3",null,"Certificações"),h("span",{className:"tag"},"CREDENCIAIS VERIFICÁVEIS")),
  certificates.length?certificates.map((c,i)=>h("div",{className:"record-row certificate-row",key:i},h("div",null,h("strong",null,c.certificate_code),h("span",null,"Média "+Number(c.average_score).toFixed(1)+"% · "+Number(c.workload_hours).toFixed(2)+" h")),h("button",{className:"btn gold",disabled:!!c.revoked_at,onClick:()=>downloadCertificate(c)},"Descarregar PDF"))):h("div",{className:"empty"},"Os certificados são emitidos automaticamente após a aprovação no exame final do Nível 100."));
 return h("div",{className:"shell"},
  h("aside",{className:"sidebar"},h("div",{className:"brand side-brand"},h("span",{className:"seal"},"L"),h("span",null,"LUCIANE",h("small",null,"ACADEMIC SCIENCES"))),
   h("div",{className:"side-label"},"AMBIENTE ACADÉMICO"),
   h("nav",{className:"nav"},h("button",{className:view==="dashboard"?"active":"",onClick:()=>route("dashboard")},"⌂  Visão geral"),h("div",{className:"side-label group"},"ESCOLAS"),h("button",{className:view==="school"?"active":"",onClick:openMath},"∑  Matemática"),h("button",{disabled:true,title:"Em desenvolvimento curricular"},"Φ  Física · em preparação"),h("button",{disabled:true,title:"Em desenvolvimento curricular"},"⚗  Química · em preparação"),h("div",{className:"side-label group"},"REGISTO ACADÉMICO"),h("button",{className:view==="record"?"active":"",onClick:openRecord},"▤  Boletim & histórico"),h("button",{className:view==="certificates"?"active":"",onClick:openCertificates},"◇  Certificações")),
   h("div",{className:"side-bottom"},"Rigor. Método. Domínio.",h("br"),"Formação científica progressiva")),
  h("main",{className:"main"},h("header",{className:"topbar"},h("div",{className:"crumb"},"LUCIANE",h("b",null,"/"),view==="school"?"Escola de Matemática":view==="record"?"Boletim & histórico":view==="certificates"?"Certificações":"Visão geral"),h("div",{className:"top-actions"},h("span",{className:"status"},h("i"),"AMBIENTE REACT · SUPABASE"),h("button",{className:"avatar",onClick:signOut,title:"Terminar sessão"},(user.email||"L").slice(0,1).toUpperCase()))),
   view==="dashboard"?h(React.Fragment,null,h("section",{className:"hero"},h("p",{className:"eyebrow"},"PLATAFORMA DE FORMAÇÃO CIENTÍFICA"),h("h1",null,"O domínio não se ",h("em",null,"presume. Comprova-se.")),h("p",null,"Três escolas independentes, progressão sequencial, prática algorítmica e avaliações com validação no servidor."),h("div",{className:"hero-meta"},h("span",null,"03 ESCOLAS"),h("span",null,"100 NÍVEIS POR ESCOLA"),h("span",null,"HISTÓRICO INDIVIDUAL"))),h("div",{className:"section-head"},h("div",null,h("h2",null,"Escolas científicas"),h("p",null,"Cada escola tem currículo, avaliações e progresso próprios.")),h("span",{className:"section-no"},"01 — 03")),h("div",{className:"cards"},schoolCards),h("section",{className:"panel"},h("div",{className:"panel-head"},h("h3",null,"Panorama académico"),h("span",{className:"tag"},"PROGRESSO")),progressRows.length?progressRows:h("div",{className:"empty"},"Inicia a Escola de Matemática para começar."))):view==="school"?schoolContent:view==="record"?recordContent:certContent,
   h("footer",{className:"footer"},h("span",null,"LUCIANE ACADEMIC SCIENCES"),h("span",null,"REACT STAGING · MATEMÁTICA"),h("span",null,"© 2026"))),
  toast?h("div",{className:"toast"},toast):null);
}
const appRoot=document.getElementById("root");
createRoot(appRoot).render(h(App));
requestAnimationFrame(()=>{appRoot.dataset.ready="true"});