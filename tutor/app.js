import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://nuovqgybrszacjlolacy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b3ZxZ3licnN6YWNqbG9sYWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyODk4NjMsImV4cCI6MjExMDg2NTg2M30.8noAToTx0lTbRYPzWCeCrgXtfz6yezbnFgSWNmH5mg8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = s => document.querySelector(s);
const messages = $('#messages');
let mode = 'conversation';
let conversationId = null;
let isSignup = false;
let busy = false;

const modeNames = {
  conversation:['Conversação em inglês','Pratica ao teu ritmo'],
  grammar:['Treino de gramática','Constrói frases correctas'],
  vocabulary:['Expansão de vocabulário','Aprende palavras em contexto'],
  writing:['Oficina de escrita','Escreve e melhora os teus textos'],
  listening:['Compreensão oral','Ouve, compreende e responde']
};
const levelCode = () => $('#level').value.split(' · ')[0];
function showError(message){ $('#authError').textContent = message || ''; }
function setAuthMode(signup){
  isSignup = signup;
  $('#authTitle').textContent = signup ? 'Cria a tua conta de aluno' : 'Entra na tua sala de aula';
  $('#nameLabel').hidden = !signup;
  $('#fullName').hidden = !signup;
  $('#fullName').required = signup;
  $('#authSubmit').textContent = signup ? 'Criar conta' : 'Entrar na plataforma';
  $('#authSwitch').textContent = signup ? 'Já tens conta? Iniciar sessão' : 'Ainda não tens conta? Criar conta';
  $('#password').autocomplete = signup ? 'new-password' : 'current-password';
  showError('');
}
function addMessage(text, who='tutor', corrections=[]){
  const row=document.createElement('div'); row.className='message '+who;
  const avatar=document.createElement('span'); avatar.className='avatar'; avatar.textContent=who==='tutor'?'L':'A';
  const body=document.createElement('div'); const tag=document.createElement('small'); tag.textContent=who==='tutor'?'LUCIANE AI TUTOR':'TU';
  const p=document.createElement('p'); p.textContent=text; body.append(tag,p);
  if(corrections?.length){
    const wrap=document.createElement('div'); wrap.className='corrections';
    const heading=document.createElement('strong'); heading.textContent='Correcções e aprendizagem'; wrap.append(heading);
    corrections.forEach(item=>{
      const line=document.createElement('p');
      line.textContent=(item.original ? item.original+' → ' : '')+(item.corrected||'')+(item.explanation ? ' — '+item.explanation : '');
      wrap.append(line);
    });
    body.append(wrap);
  }
  row.append(avatar,body); messages.append(row); messages.scrollTop=messages.scrollHeight;
}
function setBusy(value){
  busy=value; $('#send').disabled=value; $('#send').textContent=value?'A responder…':'Enviar ↑';
  $('#prompt').disabled=value;
}
async function startConversation(){
  const {data:{user}} = await supabase.auth.getUser();
  const {data,error}=await supabase.from('tutor_conversations').insert({
    user_id:user.id, title:modeNames[mode][0], mode, cefr_level:levelCode()
  }).select('id').single();
  if(error) throw error;
  conversationId=data.id;
}
async function send(){
  const field=$('#prompt'); const value=field.value.trim();
  if(!value || busy) return;
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){showAuth();return}
  addMessage(value,'user'); field.value=''; setBusy(true);
  try{
    if(!conversationId) await startConversation();
    const {data,error}=await supabase.functions.invoke('luciane-tutor',{
      body:{conversation_id:conversationId,message:value,mode,cefr_level:levelCode()}
    });
    if(error) throw error;
    if(data?.error) throw new Error(data.error);
    addMessage(data.reply || 'Vamos continuar a praticar.', 'tutor', data.corrections || []);
  }catch(error){
    const msg=error?.message || 'Não foi possível contactar o tutor. Verifica a ligação e tenta novamente.';
    addMessage('Não consegui responder agora: '+msg,'tutor');
  }finally{setBusy(false);field.focus()}
}
function showAuth(){
  $('#authPanel').hidden=false; $('#workspace').hidden=true; $('#status').innerHTML='<i></i> Inicia sessão para aprender';
}
function showWorkspace(user){
  $('#authPanel').hidden=true; $('#workspace').hidden=false;
  $('#status').innerHTML='<i></i> Tutor de IA activo';
  $('#studentName').textContent=user.user_metadata?.full_name || user.email || 'Aluno';
  $('#messages').innerHTML='';
  addMessage('Hello! 👋 Bem-vindo à LUCIANE English Academy. Sou o teu tutor de inglês. Escreve em inglês ou português e vamos começar!','tutor');
}
$('#authForm').addEventListener('submit',async e=>{
  e.preventDefault(); showError('');
  const email=$('#email').value.trim(); const password=$('#password').value;
  $('#authSubmit').disabled=true; $('#authSubmit').textContent='A processar…';
  try{
    if(isSignup){
      const full_name=$('#fullName').value.trim();
      const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name}}});
      if(error) throw error;
      if(data.session && data.user) showWorkspace(data.user);
      else showError('Conta criada. Confirma o teu e-mail através da mensagem enviada para poderes iniciar sessão.');
    }else{
      const {data,error}=await supabase.auth.signInWithPassword({email,password});
      if(error) throw error;
      showWorkspace(data.user);
    }
  }catch(error){showError(error.message || 'Não foi possível autenticar. Tenta novamente.')}
  finally{$('#authSubmit').disabled=false;$('#authSubmit').textContent=isSignup?'Criar conta':'Entrar na plataforma'}
});
$('#authSwitch').addEventListener('click',()=>setAuthMode(!isSignup));
$('#logout').addEventListener('click',async()=>{await supabase.auth.signOut();conversationId=null;showAuth()});
$('#send').addEventListener('click',send);
$('#prompt').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}});
document.querySelectorAll('.skill').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.skill').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  mode=btn.dataset.mode; conversationId=null;
  $('#modeTitle').textContent=modeNames[mode][0];
  $('#modeSub').textContent=modeNames[mode][1]+' · Nível '+levelCode();
  addMessage('Vamos começar uma nova actividade: '+modeNames[mode][0]+'. Envia a tua primeira resposta quando estiveres pronto.','tutor');
}));
$('#level').addEventListener('change',()=>{conversationId=null;$('#modeSub').textContent=modeNames[mode][1]+' · Nível '+levelCode()});
$('#clear').addEventListener('click',()=>{conversationId=null;messages.innerHTML='';addMessage('Nova aula iniciada! O que gostarias de praticar hoje?','tutor')});
$('#voice').addEventListener('click',()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){addMessage('O ditado por voz não está disponível neste navegador. Podes escrever a tua resposta.','tutor');return}
  const rec=new SR();rec.lang=$('#language').value==='pt'?'pt-PT':'en-US';
  rec.onresult=e=>{$('#prompt').value=e.results[0][0].transcript;$('#prompt').focus()};
  rec.onerror=()=>addMessage('Não consegui captar a voz. Tenta novamente ou escreve a tua resposta.','tutor');rec.start();
});
supabase.auth.onAuthStateChange((_event,session)=>{
  if(session?.user) showWorkspace(session.user);
  else showAuth();
});
const {data:{session}}=await supabase.auth.getSession();
if(session?.user) showWorkspace(session.user); else showAuth();
