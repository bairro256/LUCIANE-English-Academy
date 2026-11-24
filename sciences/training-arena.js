import React,{useMemo,useState,useEffect} from "https://esm.sh/react@18.3.1";
const h=React.createElement;
const BANK={
 adjective:[
 ["beautiful","/ˈbjuːtɪfəl/","bonito/a","beautiful, more beautiful, most beautiful",["The garden is beautiful.","She has a beautiful voice.","It was a beautiful morning.","Your idea is beautiful."]],
 ["careful","/ˈkeəfəl/","cuidadoso/a","careful, more careful, most careful",["Be careful with the glass.","He is a careful driver.","Read the instructions carefully.","We must be careful."]],
 ["happy","/ˈhæpi/","feliz","happy, happier, happiest",["I am happy today.","They look happy together.","A happy child smiled.","She feels happier now."]],
 ["difficult","/ˈdɪfɪkəlt/","difícil","difficult, more difficult, most difficult",["This exercise is difficult.","English is not difficult with practice.","It was a difficult decision.","The last question is more difficult."]],
 ["strong","/strɒŋ/","forte","strong, stronger, strongest",["He is strong.","We need a strong team.","This coffee is strong.","She became stronger."]],
 ["friendly","/ˈfrendli/","amigável","friendly, friendlier, friendliest",["Our teacher is friendly.","The neighbours are friendly.","Be friendly to everyone.","It was a friendly match."]],
 ["expensive","/ɪkˈspensɪv/","caro/a","expensive, more expensive, most expensive",["That phone is expensive.","This is a more expensive option.","The hotel is expensive.","Cars are often expensive."]],
 ["early","/ˈɜːli/","cedo","early, earlier, earliest",["I wake up early.","She arrived early.","Today is an early start.","Come earlier tomorrow."]],
 ["interesting","/ˈɪntrəstɪŋ/","interessante","interesting, more interesting, most interesting",["This book is interesting.","We had an interesting lesson.","That is an interesting question.","The film was more interesting."]],
 ["quiet","/ˈkwaɪət/","silencioso/a","quiet, quieter, quietest",["The room is quiet.","Please be quiet.","It is quieter at night.","We found a quiet place."]]
 ],
 noun:[
 ["achievement","/əˈtʃiːvmənt/","conquista; realização","plural: achievements",["Passing the exam is an achievement.","Her achievements inspire us.","It was a great achievement.","Celebrate every achievement."]],
 ["advice","/ədˈvaɪs/","conselho","uncountable noun; no plural -s",["I need your advice.","She gave me good advice.","His advice was useful.","Thank you for the advice."]],
 ["knowledge","/ˈnɒlɪdʒ/","conhecimento","uncountable noun",["Knowledge is powerful.","Reading builds knowledge.","He has useful knowledge.","Share your knowledge."]],
 ["opportunity","/ˌɒpəˈtjuːnəti/","oportunidade","plural: opportunities",["This is an opportunity.","Do not miss the opportunity.","We need more opportunities.","She found a new opportunity."]],
 ["decision","/dɪˈsɪʒən/","decisão","plural: decisions",["It was my decision.","Make a good decision.","Our decisions matter.","He changed his decision."]],
 ["child","/tʃaɪld/","criança","plural: children (irregular)",["The child is reading.","Children learn quickly.","Every child needs care.","The children are playing."]],
 ["information","/ˌɪnfəˈmeɪʃən/","informação","uncountable noun",["I need information.","The information is correct.","Please give me more information.","We found useful information."]],
 ["journey","/ˈdʒɜːni/","viagem; percurso","plural: journeys",["The journey was long.","Have a safe journey.","Our learning journey continues.","They shared their journey."]],
 ["success","/səkˈses/","sucesso","usually uncountable; successes when countable",["Hard work brings success.","Her success is inspiring.","We celebrated our success.","Success takes time."]],
 ["equipment","/ɪˈkwɪpmənt/","equipamento","uncountable noun",["The equipment is ready.","We need new equipment.","This equipment is expensive.","Store the equipment safely."]]
 ],
 pronoun:[
 ["I","/aɪ/","eu","subject pronoun; object: me; possessive: my/mine",["I study English.","I am ready.","My friend helps me.","This book is mine."]],
 ["you","/juː/","tu; você; vocês","subject/object: you; possessive: your/yours",["You are welcome.","I can help you.","Your answer is correct.","This seat is yours."]],
 ["he","/hiː/","ele","subject: he; object: him; possessive: his",["He works here.","I know him.","His bag is blue.","The choice is his."]],
 ["she","/ʃiː/","ela","subject: she; object: her; possessive: her/hers",["She speaks English.","I called her.","Her book is new.","The book is hers."]],
 ["we","/wiː/","nós","subject: we; object: us; possessive: our/ours",["We are students.","The teacher helps us.","Our class is ready.","The victory is ours."]],
 ["they","/ðeɪ/","eles/elas","subject: they; object: them; possessive: their/theirs",["They live nearby.","I saw them yesterday.","Their house is large.","The decision is theirs."]],
 ["this","/ðɪs/","este/esta/isto","demonstrative; plural: these",["This is my pen.","I like this lesson.","This book is useful.","This is what I need."]],
 ["those","/ðəʊz/","aqueles/aquelas","demonstrative plural; singular: that",["Those are my shoes.","I remember those days.","Those students are ready.","Who are those people?"]],
 ["who","/huː/","quem","interrogative/relative pronoun",["Who is your teacher?","Who called me?","The woman who teaches us is kind.","Who wants to answer?"]],
 ["someone","/ˈsʌmwʌn/","alguém","indefinite pronoun; singular verb",["Someone is at the door.","I need someone to help.","Someone called you.","Someone has my book."]]
 ],
 verb:[
 ["go","/ɡəʊ/","ir","go – went – gone; goes; going",["I go to school.","She goes home early.","We went yesterday.","They have gone already."]],
 ["study","/ˈstʌdi/","estudar","study – studied – studied; studies; studying",["I study English.","He studies every day.","We studied last night.","She is studying now."]],
 ["write","/raɪt/","escrever","write – wrote – written; writes; writing",["I write in my notebook.","She writes clearly.","He wrote a letter.","I have written the answer."]],
 ["speak","/spiːk/","falar","speak – spoke – spoken; speaks; speaking",["I speak Portuguese.","She speaks English.","We spoke yesterday.","They have spoken to him."]],
 ["make","/meɪk/","fazer; criar","make – made – made; makes; making",["I make breakfast.","He makes mistakes.","She made a cake.","We have made progress."]],
 ["play","/pleɪ/","jogar; brincar; tocar","play – played – played; plays; playing",["They play football.","He plays chess.","We played yesterday.","The children are playing."]],
 ["teach","/tiːtʃ/","ensinar","teach – taught – taught; teaches; teaching",["I teach English.","She teaches children.","He taught me grammar.","They have taught for years."]],
 ["buy","/baɪ/","comprar","buy – bought – bought; buys; buying",["I buy bread.","She buys books.","We bought a phone.","He has bought a car."]],
 ["think","/θɪŋk/","pensar","think – thought – thought; thinks; thinking",["I think you are right.","She thinks carefully.","We thought about it.","I have thought of a plan."]],
 ["have","/hæv/","ter","have – had – had; has; having",["I have a question.","He has a car.","We had a lesson.","They have had lunch."]]
 ],
 preposition:[
 ["in","/ɪn/","em; dentro de","place, months, years, parts of the day",["The keys are in the bag.","I live in Angola.","We meet in July.","She studies in the morning."]],
 ["on","/ɒn/","em; sobre","surface, days, dates",["The book is on the table.","I work on Monday.","The meeting is on 12 May.","There is a mark on the wall."]],
 ["at","/æt/","em; a","specific place/time",["I am at home.","The class starts at eight.","Meet me at the door.","She is at school."]],
 ["under","/ˈʌndə/","debaixo de","position below something",["The cat is under the chair.","Your shoes are under the bed.","The bridge is under repair.","Put the box under the table."]],
 ["between","/bɪˈtwiːn/","entre (dois)","position separating two people/things",["The bank is between the shops.","Choose between tea and coffee.","Sit between us.","The secret stays between friends."]],
 ["behind","/bɪˈhaɪnd/","atrás de","position at the back",["The car is behind the house.","He stood behind me.","The garden is behind the school.","She is behind the project."]],
 ["for","/fɔː/","para; por; durante","purpose, recipient, duration",["This gift is for you.","I study for my exam.","We waited for an hour.","Thank you for your help."]],
 ["since","/sɪns/","desde","starting point in time",["I have lived here since 2020.","She has worked since Monday.","We have known him since childhood.","It has rained since noon."]],
 ["with","/wɪð/","com","company, instrument, manner",["I live with my family.","Write with a pen.","She came with us.","He speaks with confidence."]],
 ["about","/əˈbaʊt/","sobre; acerca de","topic or approximate quantity",["We talked about school.","This book is about history.","It is about five kilometres away.","Tell me about your day."]]
 ],
 mixture:[]
};
const CATS=[
 {id:"adjective",name:"Adjectives",pt:"Adjectivos",symbol:"✦",desc:"Qualidades, comparação e intensidade."},
 {id:"noun",name:"Nouns",pt:"Substantivos",symbol:"◈",desc:"Pessoas, lugares, objectos e ideias."},
 {id:"pronoun",name:"Pronouns",pt:"Pronomes",symbol:"◎",desc:"Substituir nomes e ligar frases."},
 {id:"verb",name:"Verbs",pt:"Verbos",symbol:"↗",desc:"Acções, tempos e formas regulares/irregulares."},
 {id:"preposition",name:"Prepositions",pt:"Preposições",symbol:"⌖",desc:"Lugar, tempo, movimento e relações."},
 {id:"mixture",name:"The Mixture",pt:"Mistura total",symbol:"⟁",desc:"Combinação de todas as classes gramaticais."}
];
const MODES=["Aprender","Escolha rápida","Completar frase","Leitura e caça-palavras","Arena cronometrada"];
function Arena(){
 const [cat,setCat]=useState("adjective"),[mode,setMode]=useState("Aprender"),[idx,setIdx]=useState(0),[answer,setAnswer]=useState(""),[feedback,setFeedback]=useState(""),[score,setScore]=useState(0),[attempts,setAttempts]=useState(0),[seconds,setSeconds]=useState(60),[running,setRunning]=useState(false),[filter,setFilter]=useState("");
 const category=CATS.find(x=>x.id===cat);
 const pool=cat==="mixture"?CATS.filter(x=>x.id!=="mixture").flatMap(x=>BANK[x.id].map(w=>({...w,kind:x.pt}))):BANK[cat].map(w=>({...w,kind:category.pt}));
 const word=pool[idx%pool.length];
 const challenge=idx%5;
 useEffect(()=>{if(!running||seconds<=0)return;const t=setInterval(()=>setSeconds(s=>s-1),1000);return()=>clearInterval(t)},[running,seconds]);
 useEffect(()=>{if(seconds===0)setRunning(false)},[seconds]);
 const options=useMemo(()=>{const others=pool.filter(x=>x!==word).slice(0,3);return [word,...others].sort((a,b)=>a[0].localeCompare(b[0]))},[idx,cat]);
 function next(){setIdx(x=>x+1);setAnswer("");setFeedback("")}
 function check(){if(!answer.trim())return;const correct=mode==="Escolha rápida"?answer===word[0]:mode==="Completar frase"?answer.toLowerCase().trim()===word[0].toLowerCase():answer.toLowerCase().trim()===word[2].toLowerCase();setAttempts(x=>x+1);if(correct)setScore(x=>x+1);setFeedback(correct?"Excelente! Resposta correcta.":"Ainda não. Resposta: "+(mode==="Escolha rápida"?word[0]:mode==="Completar frase"?word[0]:word[2]));}
 function startArena(){setMode("Arena cronometrada");setSeconds(60);setRunning(true);setIdx(x=>x+1);setAnswer("");setFeedback("")}
 const count=500;
 const card=(w)=>h("article",{className:"arena-word"},h("div",{className:"arena-wordtop"},h("span",null,w.kind||category.pt),h("span",null,"VOCABULÁRIO")),h("h3",null,w[0]),h("p",{className:"arena-pron"},w[1]),h("p",{className:"arena-meaning"},w[2]),h("p",{className:"arena-forms"},w[3]),h("div",{className:"arena-examples"},w[4].map((ex,i)=>h("p",{key:i},h("b",null,String(i+1).padStart(2,"0")), " ",ex))));
 return h("div",{className:"arena"},
  h("section",{className:"arena-hero"},h("div",{className:"arena-kicker"},"LUCIANE · ENGLISH TRAINING ARENA"),h("h1",null,"Treina. Resiste. ",h("em",null,"Domina.")),h("p",null,"Uma área intensiva para transformar vocabulário em domínio real: compreender, pronunciar, aplicar e responder sob pressão."),h("div",{className:"arena-metrics"},h("span",null,"6 ÁREAS"),h("span",null,"META: 500 PALAVRAS POR ÁREA"),h("span",null,"TODOS OS NÍVEIS"))),
  h("div",{className:"arena-head"},h("div",null,h("p",{className:"arena-kicker"},"ESCOLHE O TEU CAMPO"),h("h2",null,"Seis frentes de treino")),h("span",{className:"arena-count"},"META: 3 000 PALAVRAS")),
  h("div",{className:"arena-categories"},CATS.map(c=>h("button",{key:c.id,className:"arena-category "+(cat===c.id?"selected":""),onClick:()=>{setCat(c.id);setIdx(0);setFeedback("");setAnswer("")}},h("span",{className:"arena-symbol"},c.symbol),h("b",null,c.name),h("small",null,c.pt),h("p",null,c.desc),h("i",null,"Meta: 500 palavras ↗")))),
  h("section",{className:"arena-workspace"},h("div",{className:"arena-toolbar"},h("div",null,h("p",{className:"arena-kicker"},"ÁREA ACTIVA"),h("h2",null,category.name)),h("div",{className:"arena-selects"},h("select",{value:mode,onChange:e=>{setMode(e.target.value);setFeedback("");setAnswer("")}},MODES.map(m=>h("option",{key:m},m))),h("button",{className:"arena-button arena-dark",onClick:next},"Seguinte →"))),
  mode==="Aprender"?card(word):h("div",{className:"arena-challenge"},h("div",{className:"arena-challenge-meta"},h("span",null,"DESAFIO "+String(idx+1).padStart(3,"0")),mode==="Arena cronometrada"?h("strong",null,"00:"+String(seconds).padStart(2,"0")):h("span",null,category.pt)),h("h3",null,mode==="Leitura e caça-palavras"?"Lê o texto e identifica a palavra-alvo":mode==="Completar frase"?"Completa a frase com a palavra correcta":mode==="Escolha rápida"?"Selecciona a tradução correcta":"Desafio de velocidade"),
  mode==="Leitura e caça-palavras"?h("p",{className:"arena-reading"},word[4].join(" ")):mode==="Completar frase"?h("p",{className:"arena-question"},word[4][idx%4].replace(new RegExp("\\b"+word[0]+"\\b","i"),"________")):h("p",{className:"arena-question"},word[1]+" · "+word[3]),
  mode==="Escolha rápida"?h("div",{className:"arena-options"},options.map(w=>h("button",{key:w[0],className:answer===w[0]?"picked":"",onClick:()=>setAnswer(w[0])},w[2]))):h("input",{className:"arena-answer",value:answer,onChange:e=>setAnswer(e.target.value),placeholder:mode==="Leitura e caça-palavras"?"Escreve a palavra que encontraste":mode==="Completar frase"?"Escreve a palavra em falta":"Escreve o significado em português"}),
  h("div",{className:"arena-actions"},h("button",{className:"arena-button arena-gold",onClick:check},"Confirmar resposta"),mode==="Arena cronometrada"?h("button",{className:"arena-button",onClick:startArena},"Reiniciar 60 s"):null),feedback?h("p",{className:"arena-feedback"},feedback):null),
  h("div",{className:"arena-score"},h("div",null,h("small",null,"RESPOSTAS CORRECTAS"),h("b",null,String(score))),h("div",null,h("small",null,"TENTATIVAS"),h("b",null,String(attempts))),h("div",null,h("small",null,"PRECISÃO"),h("b",null,attempts?Math.round(score/attempts*100)+"%":"—")),h("div",null,h("small",null,"PROGRESSO"),h("b",null,String((idx%count)+1))))),
  h("section",{className:"arena-method"},h("h3",null,"Como dominar cada palavra"),h("div",{className:"arena-methodgrid"},["Pronúncia fonética e leitura em voz alta","Significado e classe gramatical","Formas e regras de utilização","Quatro exemplos contextualizados","Identificação em textos e frases","Revisão por desafios e tempo"].map((x,i)=>h("div",{key:i},h("b",null,"0"+(i+1)),h("span",null,x))))));
}
export default Arena;
