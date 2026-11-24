import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabase=createClient('https://nuovqgybrszacjlolacy.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51b3ZxZ3licnN6YWNqbG9sYWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUyODk4NjMsImV4cCI6MjExMDg2NTg2M30.8noAToTx0lTbRYPzWCeCrgXtfz6yezbnFgSWNmH5mg8');
const $=s=>document.querySelector(s);
const units=[
{id:'adjectives',name:'Adjectives',pt:'Adjectivos: descrição, emoções, comparações e superlativos.',items:[
['happy','/ˈhæpi/','feliz','adjective','She is happy today.','They look happy together.','Use “happy” before a noun or after “be”.'],
['beautiful','/ˈbjuːtɪfəl/','bonito / bela','adjective','It is a beautiful city.','What a beautiful dress!','“Beautiful” has three syllables.'],
['careful','/ˈkeəfəl/','cuidadoso','adjective','Be careful with the glass.','She is a careful driver.','Do not confuse careful with careless.'],
['strong','/strɒŋ/','forte','adjective','He is very strong.','This is a strong team.','The comparative is stronger.'],
['quiet','/ˈkwaɪət/','silencioso / calmo','adjective','The room is quiet.','Please be quiet.','Quiet is not the same as quite.'],
['expensive','/ɪkˈspensɪv/','caro','adjective','This phone is expensive.','That hotel is too expensive.','Opposite: cheap.'],
['friendly','/ˈfrendli/','simpático / amigável','adjective','Our teacher is friendly.','The people are very friendly.','Friendly ends in -ly but is an adjective.'],
['difficult','/ˈdɪfɪkəlt/','difícil','adjective','English is not difficult.','This exercise is difficult.','Opposite: easy.'],
['healthy','/ˈhelθi/','saudável','adjective','Fruit is healthy.','She has a healthy lifestyle.','The noun is health.'],
['tired','/ˈtaɪəd/','cansado','adjective','I am tired after work.','They look tired.','Use “tired”, not “tiring”, for how a person feels.']]},
{id:'nouns',name:'Nouns',pt:'Substantivos: pessoas, lugares, objectos, ideias e quantidades.',items:[
['teacher','/ˈtiːtʃə/','professor','noun','My teacher is kind.','The teacher explains grammar.','Plural: teachers.'],
['knowledge','/ˈnɒlɪdʒ/','conhecimento','noun','Knowledge is important.','She has a lot of knowledge.','Uncountable: do not say “knowledges”.'],
['city','/ˈsɪti/','cidade','noun','Luanda is a big city.','I live in this city.','Plural: cities.'],
['advice','/ədˈvaɪs/','conselho','noun','Thank you for your advice.','Can you give me some advice?','Uncountable: say “a piece of advice”.'],
['child','/tʃaɪld/','criança','noun','The child is reading.','Every child needs support.','Irregular plural: children.'],
['journey','/ˈdʒɜːni/','viagem / percurso','noun','The journey was long.','Have a safe journey.','Plural: journeys.'],
['language','/ˈlæŋɡwɪdʒ/','língua / idioma','noun','English is a global language.','I study a new language.','Plural: languages.'],
['money','/ˈmʌni/','dinheiro','noun','I need some money.','Money does not buy happiness.','Uncountable in ordinary use.'],
['opportunity','/ˌɒpəˈtjuːnəti/','oportunidade','noun','This is a great opportunity.','Take every opportunity to practise.','Plural: opportunities.'],
['success','/səkˈses/','sucesso','noun','Hard work brings success.','Her success inspired us.','Adjective: successful.']]},
{id:'pronouns',name:'Pronouns',pt:'Pronomes pessoais, possessivos, reflexivos e demonstrativos.',items:[
['I','/aɪ/','eu','personal pronoun','I study English.','I am ready to learn.','Always write the subject pronoun “I” with a capital letter.'],
['you','/juː/','tu / você / vocês','personal pronoun','You are my friend.','Do you speak English?','You can be singular or plural.'],
['he','/hiː/','ele','personal pronoun','He works every day.','He is learning English.','Use he for a male person.'],
['she','/ʃiː/','ela','personal pronoun','She reads every night.','She is a good student.','Use she for a female person.'],
['they','/ðeɪ/','eles / elas','personal pronoun','They live in Luanda.','They are studying now.','They can also refer to one person.'],
['we','/wiː/','nós','personal pronoun','We are classmates.','We learn together.','We = the speaker and other people.'],
['mine','/maɪn/','meu / minha','possessive pronoun','This book is mine.','The choice is mine.','Do not write “mine book”; use “my book”.'],
['ourselves','/aʊəˈselvz/','nós próprios','reflexive pronoun','We taught ourselves.','We prepared ourselves.','Use ourselves when subject and object are we.'],
['this','/ðɪs/','este / esta / isto','demonstrative pronoun','This is my pen.','I like this.','Use this for one thing near you.'],
['someone','/ˈsʌmwʌn/','alguém','indefinite pronoun','Someone is at the door.','I need someone to help me.','Usually takes a singular verb.']]},
{id:'verbs',name:'Verbs',pt:'Verbos regulares e irregulares, formas verbais e utilização.',items:[
['be','/biː/','ser / estar','verb · be–was/were–been','I am a student.','They were at home.','Forms: be, am/is/are, was/were, been.'],
['go','/ɡəʊ/','ir','irregular verb · go–went–gone','I go to school.','She went home yesterday.','Past simple: went, not “goed”.'],
['make','/meɪk/','fazer / criar','irregular verb · make–made–made','I make breakfast.','He made a mistake.','Past and participle: made.'],
['study','/ˈstʌdi/','estudar','regular verb · study–studied–studied','I study English.','She studied last night.','Change y to i before -ed.'],
['write','/raɪt/','escrever','irregular verb · write–wrote–written','I write every day.','He has written a letter.','Past participle: written.'],
['speak','/spiːk/','falar','irregular verb · speak–spoke–spoken','Do you speak English?','She has spoken to him.','Past simple: spoke.'],
['learn','/lɜːn/','aprender','regular verb · learn–learned–learned','We learn new words.','I learned a lot yesterday.','Learnt is also common in British English.'],
['teach','/tiːtʃ/','ensinar','irregular verb · teach–taught–taught','They teach English.','She taught me grammar.','Past: taught, not “teached”.'],
['have','/hæv/','ter','irregular verb · have–had–had','I have a question.','We had a lesson.','Third person singular: has.'],
['do','/duː/','fazer','irregular verb · do–did–done','I do my homework.','Did you do the exercise?','Use do/does in present questions.']]},
{id:'prepositions',name:'Prepositions',pt:'Preposições de tempo, lugar, movimento e expressões comuns.',items:[
['in','/ɪn/','em / dentro de','preposition · place/time','The keys are in the bag.','I was born in July.','Use in with months, years and enclosed spaces.'],
['on','/ɒn/','sobre / em','preposition · place/time','The book is on the table.','The class is on Monday.','Use on with days and dates.'],
['at','/æt/','em / às','preposition · place/time','She is at school.','The lesson starts at nine.','Use at for exact clock times.'],
['under','/ˈʌndə/','debaixo de','preposition · place','The cat is under the chair.','Your shoes are under the bed.','Opposite: over / above.'],
['between','/bɪˈtwiːn/','entre (dois)','preposition · place','The bank is between the shops.','Sit between Ana and Paulo.','Use among for a group.'],
['from','/frɒm/','de / desde','preposition · origin','I am from Angola.','The train goes from Luanda to Malanje.','Often paired with to.'],
['to','/tuː/','para / a','preposition · direction','We go to school.','Send the message to me.','Do not use “to” before home in “go home”.'],
['with','/wɪð/','com','preposition · company','I study with my friend.','Coffee with milk, please.','With indicates company or association.'],
['for','/fɔː/','para / por','preposition · purpose','This gift is for you.','I waited for an hour.','For can express purpose or duration.'],
['behind','/bɪˈhaɪnd/','atrás de','preposition · place','The car is behind the house.','Stand behind the line.','Opposite: in front of.']]},
{id:'mixture',name:'The Mixture',pt:'Desafios combinados: gramática, leitura, tradução e construção.',items:[]}
];
const extras=[
{q:'READING: “Lena has a beautiful garden. Every morning, she waters the flowers and reads a book under a tree.” What does Lena have?',opts:['A beautiful garden','A new school','A big shop'],a:0,why:'O texto diz que Lena tem um jardim bonito.'},
{q:'READING: In the passage, what does Lena do every morning?',opts:['She watches television.','She waters the flowers and reads.','She goes shopping.'],a:1,why:'Ela rega as flores e lê um livro todas as manhãs.'},
{q:'WORD HUNT: Which word in this sentence is an adjective? “The small dog runs quickly.”',opts:['dog','runs','small'],a:2,why:'Small descreve o substantivo dog.'},
{q:'WORD HUNT: Which word is the verb? “The children play in the garden.”',opts:['children','play','garden'],a:1,why:'Play expressa a acção.'},

{q:'Choose the correct sentence:',opts:['She go to school.','She goes to school.','She going to school.'],a:1,why:'Na terceira pessoa do singular, acrescentamos -s: she goes.'},
{q:'Complete: I have lived here ___ 2020.',opts:['for','since','at'],a:1,why:'Since indica o ponto de início: since 2020.'},
{q:'What is the plural of “child”?',opts:['childs','childes','children'],a:2,why:'Children é o plural irregular de child.'},
{q:'Translate: “Nós estamos a aprender.”',opts:['We are learning.','We is learning.','We learning.'],a:0,why:'Present continuous: subject + am/is/are + verb-ing.'},
{q:'Choose the correct preposition: The class starts ___ 8 o’clock.',opts:['in','on','at'],a:2,why:'Usamos at para horas exactas.'},
{q:'Identify the adjective: “The clever student answered.”',opts:['student','clever','answered'],a:1,why:'Clever descreve o substantivo student.'},
{q:'Choose the past simple of “buy”.',opts:['buyed','bought','buy'],a:1,why:'Buy é irregular: buy–bought–bought.'},
{q:'Complete: This is ___ book. It belongs to me.',opts:['mine','my','me'],a:1,why:'My é determinante possessivo e acompanha o substantivo book.'}
];
const key='luciane_arena_v1';
let stats=JSON.parse(localStorage.getItem(key)||'{}');
let selectedLevel='training',currentUnit=null,questions=[],index=0,correct=0,chosen=null,started=0,tick=null,locked=false,sessionMastered=new Set();
function save(){localStorage.setItem(key,JSON.stringify(stats));renderStats()}
function renderStats(){const total=Object.values(stats.units||{}).reduce((n,x)=>n+(x.mastered||0),0);$('#score').textContent=stats.score||0;$('#mastered').textContent=total;$('#streak').textContent=stats.streak||0;const attempts=stats.attempts||0;$('#accuracy').textContent=attempts?Math.round((stats.correct||0)/attempts*100)+'%':'—';const possible=units.filter(x=>x.id!=='mixture').length*10;$('#overall').textContent=Math.min(100,Math.round(total/possible*100))+'% de progresso'}
function drawUnits(){const grid=$('#unitGrid');grid.innerHTML='';units.forEach((u,i)=>{const s=(stats.units||{})[u.id]||{};const mastered=s.mastered||0;const card=document.createElement('article');card.className='unit';card.innerHTML='<div class="num">0'+(i+1)+'</div><h3>'+u.name.toUpperCase()+'</h3><p>'+u.pt+'</p><div class="unit-foot"><span>'+u.items.length+' fichas iniciais</span><span>'+mastered+'/10 dominadas</span></div><div class="barline"><i style="width:'+Math.min(100,mastered*10)+'%"></i></div>';card.addEventListener('click',()=>startUnit(u.id));grid.append(card)})}
function setLevel(level){selectedLevel=level;document.querySelectorAll('.level').forEach(b=>b.classList.toggle('active',b.dataset.level===level))}
document.querySelectorAll('.level').forEach(b=>b.addEventListener('click',()=>setLevel(b.dataset.level)));
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function makeQuestions(unit){const q=[];if(unit.id==='mixture'){shuffle(extras).forEach(x=>q.push({type:'mc',question:x.q,options:x.opts,answer:x.a,why:x.why,tag:x.q.startsWith('READING')?'READING ARENA':x.q.startsWith('WORD HUNT')?'WORD HUNT':'MIXED SKILLS'}));return q}
unit.items.forEach((w,i)=>{q.push({type:'mc',question:'What does “'+w[0]+'” mean in Portuguese?',options:shuffle([w[2],...unit.items.filter(x=>x!==w).slice(0,2).map(x=>x[2])]),answer:null,word:w,tag:unit.name.toUpperCase(),why:w[6]})});return q.map(x=>{if(x.word){x.answer=x.options.indexOf(x.word[2]);}return x})}
function startUnit(id){currentUnit=units.find(u=>u.id===id);questions=makeQuestions(currentUnit);if(selectedLevel==='speed')questions=questions.slice(0,8);if(selectedLevel==='master')questions=shuffle(questions).slice(0,10);index=0;correct=0;locked=false;started=Date.now();sessionMastered=new Set();$('#results').hidden=true;$('#arena').hidden=false;$('#unitGrid').parentElement.hidden=true;$('#arenaLevel').textContent=({training:'TRAINING MODE',speed:'SPEED CHALLENGE',master:'MASTER ARENA'})[selectedLevel];$('#arenaTitle').textContent=currentUnit.name;$('#arenaDesc').textContent=currentUnit.pt;renderQuestion();if(tick)clearInterval(tick);if(selectedLevel==='speed'){tick=setInterval(()=>{const remaining=Math.max(0,60-Math.floor((Date.now()-started)/1000));$('#timer').textContent='⏱ '+remaining+'s';if(remaining===0){clearInterval(tick);finish(true)}},200)}else $('#timer').textContent=selectedLevel==='master'?'Avaliação de 10 perguntas':'Sem limite de tempo'}
function renderQuestion(){locked=false;chosen=null;const q=questions[index];$('#questionCount').textContent='Pergunta '+(index+1)+' / '+questions.length;$('#categoryTag').textContent=q.tag;$('#question').textContent=q.question;$('#subQuestion').textContent=q.word?'Pronúncia: '+q.word[1]+' · Classe: '+q.word[3]:'Escolhe a melhor resposta.';$('#feedback').textContent='';$('#feedback').className='feedback';$('#answers').innerHTML='';q.options.forEach((opt,i)=>{const b=document.createElement('button');b.className='answer';b.textContent=opt;b.addEventListener('click',()=>{if(locked)return;chosen=i;document.querySelectorAll('.answer').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});$('#answers').append(b)});$('#check').hidden=false;$('#next').hidden=true;$('#check').disabled=false;$('#speak').hidden=!q.word;$('#speak').onclick=()=>{const utter=new SpeechSynthesisUtterance(q.word?.[0]||'');utter.lang='en-GB';speechSynthesis.speak(utter)}}
function checkAnswer(){if(locked||chosen===null)return;locked=true;const q=questions[index],ok=chosen===q.answer;correct+=ok?1:0;stats.attempts=(stats.attempts||0)+1;stats.correct=(stats.correct||0)+(ok?1:0);stats.score=(stats.score||0)+(ok?10:0);stats.streak=ok?(stats.streak||0)+1:0;if(ok&&q.word&&!sessionMastered.has(q.word[0])){sessionMastered.add(q.word[0]);stats.units=stats.units||{};stats.units[currentUnit.id]=stats.units[currentUnit.id]||{mastered:0,words:[]};const saved=stats.units[currentUnit.id].words||[];if(!saved.includes(q.word[0]))saved.push(q.word[0]);stats.units[currentUnit.id].words=saved;stats.units[currentUnit.id].mastered=saved.length;}save();document.querySelectorAll('.answer').forEach((b,i)=>{if(i===q.answer)b.classList.add('correct');else if(i===chosen)b.classList.add('wrong')});$('#feedback').textContent=(ok?'✓ Correcto! ':'✗ Ainda não. ')+(q.why||'Resposta correcta: '+q.options[q.answer]);$('#feedback').className='feedback '+(ok?'good':'bad');$('#check').hidden=true;$('#next').hidden=false}
function nextQuestion(){index++;if(index>=questions.length){finish();return}renderQuestion()}
function finish(timeExpired=false){if(tick)clearInterval(tick);$('#arena').hidden=true;$('#results').hidden=false;$('#unitGrid').parentElement.hidden=false;const pct=Math.round(correct/questions.length*100);$('#resultScore').textContent=pct+'%';$('#resultTitle').textContent=pct>=80?'Excelente desempenho!':pct>=60?'Bom progresso!':'Continua a treinar!';$('#resultText').textContent='Acertaste '+correct+' de '+questions.length+' perguntas. '+(timeExpired?'O tempo de 60 segundos terminou. ':selectedLevel==='speed'?'Tempo total: '+Math.round((Date.now()-started)/1000)+' segundos. ':'')+'Revê as explicações e repete o treino para consolidar.';$('#retry').onclick=()=>startUnit(currentUnit.id);drawUnits()}
$('#check').addEventListener('click',checkAnswer);$('#next').addEventListener('click',nextQuestion);$('#closeArena').addEventListener('click',()=>{if(tick)clearInterval(tick);$('#arena').hidden=true;$('#unitGrid').parentElement.hidden=false});renderStats();drawUnits();
(async()=>{const {data:{session}}=await supabase.auth.getSession();if(!session){location.replace('./');return}})();
