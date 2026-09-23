"use strict";
(() => {
  if (!document.getElementById('facilityLayout')) return;
const facilities = [
  {id:'gate',name:'교문',icon:'✨',sub:'입장 · 역할 수령',desc:'서버에 처음 들어온 팀원이 가장 먼저 거치는 구역입니다. 입장 확인과 역할 수령을 통해 본격적으로 학교생활을 시작합니다.',channels:[
    {name:'#✨입장',type:'TEXT',desc:'팀 이상 디스코드 서버에 처음 입장했을 때 확인하는 시작 채널입니다.'},
    {name:'#🔰역할',type:'TEXT',desc:'소속 부서와 선택 역할을 이모지 반응으로 수령하는 곳입니다.'}
  ]},
  {id:'board',name:'게시판',icon:'✅',sub:'공지 · 회의록 · 경고',desc:'팀 전체가 반드시 확인해야 하는 공식 기록과 공지를 모아두는 구역입니다.',channels:[
    {name:'#🖋️관리자회의록',type:'TEXT',desc:'관리자회의에서 논의된 안건과 결정 사항이 기록됩니다.'},
    {name:'#📢공지',type:'TEXT',desc:'규칙 변경, 시스템 도입, 모집 등 팀 전체 소식을 전달합니다.'},
    {name:'#🚔경고장',type:'TEXT',desc:'팀원에게 부여된 경고 내역을 기록하고 관리하는 채널입니다.'}
  ]},
  {id:'office',name:'교무실',icon:'📌',sub:'규칙 · 학적 · 문의',desc:'운영 규칙과 주요 링크, 학적 정보, 개선 제안 및 문의를 처리하는 행정 구역입니다.',channels:[
    {name:'#📌규칙',type:'TEXT',desc:'팀 활동 규칙과 각종 기준표를 확인할 수 있습니다.'},
    {name:'#📝링크',type:'TEXT',desc:'팀 공식 플랫폼과 출석부 등 주요 링크를 모아둡니다.'},
    {name:'#📜학적과',type:'TEXT',desc:'부서별 팀원 현황을 확인하고 휴가 신청을 진행합니다.'},
    {name:'#💡안건똑똑',type:'TEXT',desc:'관리자회의에서 논의했으면 하는 제도·운영 개선안을 제안합니다.'},
    {name:'#🫧질문톡톡',type:'TEXT',desc:'회의록이나 팀 활동 중 생긴 궁금한 점을 관리자에게 질문합니다.'}
  ]},
  {id:'classroom',name:'교실',icon:'💬',sub:'소통 · SNS · 음성생활',desc:'팀원들의 일상적인 소통과 가벼운 교류가 중심이 되는 생활 구역입니다.',channels:[
    {name:'#💬소통방',type:'TEXT',desc:'팀원들이 자유롭게 대화하고 부서별 스레드로 소통할 수 있습니다.'},
    {name:'#📱SNS업로드',type:'TEXT',desc:'새 작품이 공개되었을 때 링크와 소식을 공유합니다.'},
    {name:'#📎자랑방',type:'TEXT',desc:'작업, 일상, 취미 등 자랑하고 싶은 이야기를 나누는 공간입니다.'},
    {name:'#📼명령어',type:'TEXT',desc:'음악 등 서버 봇 명령어를 입력하는 전용 채널입니다.'},
    {name:'#💬소통방',type:'VOICE',desc:'잡담, 영상 감상, 게임 등 자유로운 음성 소통 공간입니다.'},
    {name:'#📋마감방',type:'VOICE',desc:'함께 작업하며 마감을 진행하는 집중형 음성 공간입니다.'},
    {name:'#🔥카페테리아',type:'VOICE',desc:'특별한 목적 없이 편하게 머물며 일상을 공유하는 공간입니다.'},
    {name:'#🎤노래방',type:'VOICE',desc:'화면 공유와 함께 노래를 즐길 수 있는 공간입니다.'},
    {name:'#🕹게임방',type:'VOICE',desc:'팀원들과 함께 게임을 플레이하는 공간입니다.'}
  ]},
  {id:'study',name:'자습실',icon:'🔥',sub:'피드백 · 공부 · 연습',desc:'기술 향상과 학습, 피드백처럼 개인의 성장을 돕는 활동이 모이는 구역입니다.',channels:[
    {name:'#🖍️피드백',type:'TEXT',desc:'부서와 관계없이 작업물에 대한 피드백을 주고받습니다.'},
    {name:'#📄다목적실',type:'TEXT',desc:'공모전, 채용, 유용한 도구와 외주 정보 등을 공유합니다.'},
    {name:'#🔮대본모음',type:'TEXT',desc:'자유 리딩에 활용할 수 있는 인원별 대본 목록을 모아둡니다.'},
    {name:'#🔥챌린지방',type:'TEXT',desc:'공부, 운동, 작업 등 일상 속 성장 기록을 스레드로 공유합니다.'},
    {name:'#📚공부방',type:'VOICE',desc:'마이크 없이 함께 공부하는 집중형 음성 공간입니다.'},
    {name:'#📖리딩방',type:'VOICE',desc:'프로젝트 리딩이나 자유 리딩을 진행하는 연습 공간입니다.'}
  ]},
  {id:'board2',name:'칠판',icon:'🌈',sub:'함께하기 · 모집 · 캐스팅',desc:'사람을 모으고 새로운 활동을 시작하는 모집 허브입니다.',channels:[
    {name:'#🌈함께하기',type:'TEXT',desc:'마감, 공부, 잡담 등 즉석 활동에 참여할 팀원을 모집합니다.'},
    {name:'#⚡성장하기',type:'TEXT',desc:'부서장이 스터디 인원을 모집할 때 사용하는 채널입니다.'},
    {name:'#💃구애하기',type:'TEXT',desc:'프로젝트 반장이 빈 슬롯이 있는 팀원에게 캐스팅을 제안합니다.'}
  ]},
  {id:'meeting',name:'회의실',icon:'🔒',sub:'회의 일정 · 촬영',desc:'프로젝트 회의와 정상회의, 공식 촬영을 위한 일정·음성 활동 구역입니다.',channels:[
    {name:'#⏰회의일정',type:'TEXT',desc:'프로젝트 회의 일정을 요일별 스레드에 맞춰 기록하고 조율합니다.'},
    {name:'#🔒회의실',type:'VOICE',desc:'예약된 일정에 맞춰 실제 프로젝트 회의를 진행합니다.'},
    {name:'#🎬촬영중',type:'VOICE',desc:'공식 게임 플레이, TRPG, 상영회 등 촬영 목적의 활동을 진행합니다.'}
  ]},
  {id:'meal',name:'정식컨 급식실',icon:'🍚',sub:'정식컨 프로젝트',desc:'정식컨 프로젝트의 아이디어, 기획, 모집, 중간보고, 업로드 요청이 이어지는 전용 구역입니다.',channels:[
    {name:'#✅중간보고',type:'TEXT',desc:'정식컨 프로젝트의 주간 진행 상황을 보고합니다.'},
    {name:'#🌶정식재료방',type:'TEXT',desc:'정식컨으로 만들고 싶은 아이디어를 자유롭게 나눕니다.'},
    {name:'#🍜레이드모집방',type:'TEXT',desc:'정식컨 기획과 참여자 모집을 진행합니다.'},
    {name:'#🍽정식 진열대',type:'TEXT',desc:'완성된 정식컨의 업로드 방식과 희망 일정을 관리자에게 전달합니다.'}
  ]},
  {id:'snack',name:'간식컨 매점',icon:'🍭',sub:'간식컨 프로젝트',desc:'부서 제약이 적은 간식컨 프로젝트를 기획하고 모집하며, 완성까지 관리하는 전용 구역입니다.',channels:[
    {name:'#✅중간보고',type:'TEXT',desc:'간식컨 프로젝트의 주간 진행 상황을 보고합니다.'},
    {name:'#🍒간식재료방',type:'TEXT',desc:'간식컨으로 진행하고 싶은 아이디어를 자유롭게 나눕니다.'},
    {name:'#🍧파티모집방',type:'TEXT',desc:'간식컨 프로젝트의 참여자를 모집합니다.'},
    {name:'#🍽간식 진열대',type:'TEXT',desc:'완성된 간식컨의 업로드 방식과 희망 일정을 관리자에게 전달합니다.'}
  ]},
  {id:'archive',name:'판매보류 · 판매완료',icon:'✋',sub:'프로젝트 보관',desc:'진행이 중단되었거나 모든 작업과 업로드를 마친 프로젝트 채널을 정리·보관하는 아카이브 구역입니다.',channels:[
    {name:'✋ 판매보류',type:'ARCHIVE',desc:'공식 보관 처리된 중단 프로젝트와 이벤트성 채널을 임시 보관합니다.'},
    {name:'🌟 판매완료',type:'ARCHIVE',desc:'업로드까지 마무리된 프로젝트 채널을 장기 보관합니다.'}
  ]}
];


const driveRooms = [
  {
    id:'attendance', name:'출석부', icon:'📊', sub:'명단 · 슬롯 · 휴가', mode:'sheet',
    desc:'팀원 명단과 프로젝트 참여 현황을 확인하는 스프레드시트입니다. 신입생이 가장 자주 확인하게 되는 팀 내부 자료 중 하나입니다.',
    path:'Google Drive / 출석부',
    items:[
      {name:'출석부 사용법',type:'SHEET TAB',desc:'프로젝트 슬롯을 언제, 어떻게 기입하고 비우는지 설명합니다.'},
      {name:'출석부(부서별 명단)',type:'SHEET TAB',desc:'부서별 팀원 정보와 참여 프로젝트 슬롯, 휴가 복귀일 등을 확인합니다.'},
      {name:'부서중복자 명단',type:'SHEET TAB',desc:'두 개 이상의 부서에 소속된 팀원과 중복 부서를 한눈에 확인합니다.'},
      {name:'기수, 학년',type:'SHEET TAB',desc:'팀원을 기수와 설정상 학년을 기준으로 나누어 확인합니다.'}
    ]
  },
  {
    id:'official', name:'정식컨', icon:'🍚', sub:'정식컨 프로젝트 폴더', mode:'browser',
    desc:'정식컨 프로젝트의 원본 작업 파일을 프로젝트별로 보관하는 폴더입니다. 프로젝트가 개설되면 Pn_프로젝트명 형식의 폴더가 만들어지며, 문서·일러스트·음성·영상 등 해당 프로젝트의 실제 작업물이 그 안에서 관리됩니다. 스터디용 P0 폴더는 고정적으로 사용됩니다.',
    path:'Google Drive / 정식컨',
    items:[
      {name:'P0_스터디',type:'FOLDER',desc:'스터디 프로젝트가 사용하는 고정 폴더입니다.',icon:'📁',meta:'폴더'},
      {name:'Pn_프로젝트명',type:'FOLDER',desc:'정식컨 프로젝트가 개설될 때 생성되는 기본 폴더명 형식입니다.',icon:'📁',meta:'폴더'}
    ]
  },
  {
    id:'snack', name:'간식컨', icon:'🍭', sub:'간식컨 프로젝트 폴더', mode:'browser',
    desc:'간식컨 프로젝트의 원본 작업 파일을 프로젝트별로 보관하는 폴더입니다. 프로젝트가 개설되면 Pn_프로젝트명 형식의 폴더가 만들어지고, 문서·일러스트·음성·영상 등 작업에 필요한 원본 파일을 한곳에서 관리합니다.',
    path:'Google Drive / 간식컨',
    items:[
      {name:'Pn_프로젝트명',type:'FOLDER',desc:'간식컨 프로젝트가 개설될 때 생성되는 기본 폴더명 형식입니다.',icon:'📁',meta:'폴더'}
    ]
  },
  {
    id:'fridge', name:'냉장고', icon:'🧊', sub:'팀 공용 프리소스', mode:'browser',
    desc:'다른 작업에서도 다시 사용할 수 있는 팀 공용 자료를 부서별로 정리해 둔 폴더입니다.',
    path:'Google Drive / 냉장고',
    items:[
      {name:'로고',type:'FOLDER',desc:'팀 이상·이상고등학교 로고의 다양한 버전을 보관합니다.',icon:'📁'},
      {name:'문예부',type:'FOLDER',desc:'캐릭터 프로필 양식 등 문예부 공용 자료가 들어 있습니다.',icon:'📁'},
      {name:'미술부',type:'FOLDER',desc:'교복·체육복 시트, LD·SD·배경 등 공용 미술 자료가 들어 있습니다.',icon:'📁'},
      {name:'방송부',type:'FOLDER',desc:'공식 인트로 영상, 효과음 등 영상 제작용 공용 자료가 들어 있습니다.',icon:'📁'},
      {name:'연기부',type:'FOLDER',desc:'연기부가 함께 사용하는 공용 자료를 보관합니다.',icon:'📁'},
      {name:'시디부',type:'FOLDER',desc:'썸네일 양식, 컬러코드, 학생증 등 시각디자인 공용 자료가 들어 있습니다.',icon:'📁'},
      {name:'밴드부',type:'FOLDER',desc:'밴드부가 함께 사용하는 공용 자료를 보관합니다.',icon:'📁'}
    ]
  },
  {
    id:'planning', name:'기획서', icon:'🛒', sub:'프로젝트 기획 문서', mode:'browser',
    desc:'프로젝트를 본격적으로 모집하기 전에 작성하는 기획서가 모이는 폴더입니다.',
    path:'Google Drive / 기획서',
    items:[
      {name:'기획서 양식 원본',type:'DOCUMENT',desc:'프로젝트 기획 시 복제해서 사용하는 공통 양식입니다.',icon:'📄'},
      {name:'기획서_프로젝트명',type:'DOCUMENT COPY',desc:'공통 양식을 복제한 뒤 파일명을 ‘기획서_프로젝트명’ 형식으로 바꾸고 기획 내용을 작성합니다.',icon:'📄'}
    ]
  },
  {
    id:'completed', name:'판매완료', icon:'🌟', sub:'완료 프로젝트 보관', mode:'browser',
    desc:'작품 공개까지 끝난 프로젝트의 작업 폴더가 이동되어 보관되는 곳입니다.',
    path:'Google Drive / 판매완료',
    items:[
      {name:'업로드 완료 프로젝트',type:'FOLDER',desc:'완료된 프로젝트 폴더가 업로드일을 기준으로 정리되어 보관됩니다.',icon:'📁'}
    ]
  },
  {
    id:'chaos', name:'혼돈과 카오스', icon:'🎞️', sub:'팀 활동 녹화 원본', mode:'browser',
    desc:'팀에서 있었던 재미있는 순간의 녹화 원본을 모아두는 폴더입니다.',
    path:'Google Drive / 혼돈과 카오스',
    items:[
      {name:'팀 활동 녹화 원본',type:'MEDIA',desc:'팀 내부의 재미있는 순간을 녹화한 원본 영상이 보관됩니다.',icon:'🎞️'},
      {name:'방송부 편집 활용',type:'USAGE',desc:'방송부가 이 원본을 활용해 예능 영상 등의 소재로 사용할 수 있습니다.',icon:'✂️'}
    ]
  }
];

const directory=document.getElementById('directory');
const grid=document.getElementById('channelGrid');
const title=document.getElementById('panelTitle');
const desc=document.getElementById('panelDesc');
const icon=document.getElementById('panelIcon');
const discordSearchInput=document.getElementById('discordSearchInput');
const discordSearchResults=document.getElementById('discordSearchResults');
const discordResultsGrid=document.getElementById('discordResultsGrid');
const driveSearchInput=document.getElementById('driveSearchInput');
const driveSearchResults=document.getElementById('driveSearchResults');
const driveResultsGrid=document.getElementById('driveResultsGrid');
const driveDirectory=document.getElementById('driveDirectory');
const driveContent=document.getElementById('driveContent');
const driveIcon=document.getElementById('driveIcon');
const driveTitle=document.getElementById('driveTitle');
const driveDesc=document.getElementById('driveDesc');
let currentRoom='attendance';
let current='gate';

function renderDirectory(){
  facilities.forEach(f=>{
    const b=document.createElement('button');
    b.className='facility-btn'+(f.id===current?' active':'');
    b.dataset.id=f.id;
    b.innerHTML=`<span class="ico">${f.icon}</span><span class="meta"><span>${f.name}</span><small>${f.sub}</small></span><span class="arrow">›</span>`;
    b.onclick=()=>selectFacility(f.id);
    directory.appendChild(b);
  })
}
function selectFacility(id){
  current=id; const f=facilities.find(x=>x.id===id);
  document.querySelectorAll('[data-id]').forEach(x=>x.classList.toggle('active',x.dataset.id===id));
  icon.textContent=f.icon; title.textContent=f.name; desc.textContent=f.desc;
  grid.innerHTML='';
  f.channels.forEach(ch=>{
    const el=document.createElement('article'); el.className='channel';
    const cls=ch.type==='VOICE'?' voice':'';
    el.innerHTML=`<div class="channel-head"><div class="channel-name">${ch.name}</div><span class="type${cls}">${ch.type}</span></div><p>${ch.desc}</p>`;
    grid.appendChild(el);
  });
  if(window.innerWidth<900) document.getElementById('panel').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderResourceDirectory(){
  driveRooms.forEach(r=>{
    const b=document.createElement('button');
    b.className='facility-btn'+(r.id===currentRoom?' active':'');
    b.dataset.driveId=r.id;
    b.innerHTML=`<span class="ico">${r.icon}</span><span class="meta"><span>${r.name}</span><small>${r.sub}</small></span><span class="arrow">›</span>`;
    b.onclick=()=>selectRoom(r.id);
    driveDirectory.appendChild(b);
  });
}
const sheetTabs = {
  usage:{
    name:'출석부 사용법',
    purpose:'프로젝트가 시작되고 끝날 때 반장이 출석부를 관리하는 기본 흐름을 확인하는 탭입니다.',
    type:'usage-minimal'
  },
  roster:{
    name:'출석부(부서별 명단)',
    purpose:'팀원 정보와 현재 프로젝트 참여 상태를 실제로 확인하는 중심 탭입니다.',
    type:'summary',
    intro:'팀원이 부서별·가나다순으로 배치되어 있으며, 프로젝트 참여 여부를 확인하거나 캐스팅 가능 인원을 찾을 때 가장 자주 사용합니다.',
    rows:[
      ['팀원 기본 정보','활동명, 개인위키(캐릭터 시트) 링크, 기수, 성별, 설정상 학년을 확인합니다.'],
      ['참여 프로젝트','각 팀원이 현재 참여 중인 프로젝트명이 슬롯 단위로 표시됩니다.'],
      ['휴가 복귀일','휴가 중인 팀원의 복귀 예정일을 확인할 수 있습니다.'],
      ['반장 수 · 프로젝트 수','현재 반장으로 맡고 있는 프로젝트 수와 전체 참여 프로젝트 수를 확인합니다.']
    ]
  },
  multi:{
    name:'부서중복자 명단',
    purpose:'두 개 이상의 부서에 소속된 팀원을 따로 정리한 탭입니다.',
    type:'summary',
    intro:'여러 부서에서 활동하는 팀원의 닉네임, 소속 부서 수, 중복 소속 부서를 한눈에 확인할 수 있습니다.',
    rows:[
      ['표시 정보','닉네임 / 부서 수 / 중복 부서 내용'],
      ['정렬 기준','소속 부서 수가 많을수록 위에 배치되며, 부서 수가 같다면 합격한 날짜가 빠른 팀원이 먼저 배치됩니다.']
    ]
  },
  generation:{
    name:'기수, 학년',
    purpose:'팀원을 기수와 이상고등학교 설정상 학년을 기준으로 확인하는 탭입니다.',
    type:'summary',
    intro:'현재 출석부에서는 기수별 명단과 학년별 명단을 한 탭 안에서 함께 확인할 수 있습니다.',
    rows:[
      ['기수별 명단','기수마다 소속 팀원이 가나다순으로 정리되어 있습니다.'],
      ['학년별 명단','교사·1학년·2학년·3학년으로 설정상 학년을 나누어 확인합니다.'],
      ['학년의 의미','학년은 이상고등학교 세계관 설정을 위한 분류이며 실제 팀 내 위계를 의미하지 않습니다.']
    ]
  }
};
let currentSheetTab='usage';

function renderAttendance(){
  const order=['usage','roster','multi','generation'];
  const tab=sheetTabs[currentSheetTab];
  const tabs=order.map(key=>{
    const d=sheetTabs[key];
    return `<button class="attendance-tab ${key===currentSheetTab?'active':''}" data-sheet-tab="${key}">${d.name}</button>`;
  }).join('');

  let tabBody='';
  if(tab.type==='usage-minimal'){
    tabBody=`<div class="usage-minimal">
      <div class="usage-flow"><span>모집 완료</span><i>→</i><span>슬롯 기입</span><i>→</i><span>작업 완료자 해제</span><i>→</i><span>프로젝트 종료 후 정리</span></div>
      <p class="usage-note">세부 기준은 위의 출석부 공통 규칙을 참고하세요.</p>
    </div>`;
  } else {
    const rows=(tab.rows||[]).map(r=>`<div class="tab-summary-row"><b>${r[0]}</b><span>${r[1]}</span></div>`).join('');
    tabBody=`<p class="tab-intro">${tab.intro||''}</p><div class="tab-summary">${rows}</div>`;
  }

  driveContent.innerHTML=`
    <div class="attendance-v12 attendance-v13">

      <section class="common-rules attendance-sibling-section">
        <div class="attendance-sibling-head common-rules-head">
          <h5>출석부 공통 규칙</h5>
          <p>특정 탭에만 속하지 않고 출석부 전체에 적용되는 기준입니다.</p>
        </div>
        <div class="rules-inner">
          <div class="rule-block">
            <div class="rule-title"><small>7.1.1</small><b>슬롯제</b></div>
            <div class="rule-body">
              <p>팀원의 업무 과중을 막기 위해 프로젝트 참여 가능 수를 슬롯으로 관리합니다. 총 5개의 슬롯 중 기본적으로 3개가 활성화되며, 필요에 따라 1~5개 범위에서 활성 슬롯 수를 조절할 수 있습니다. 반장으로 동시에 이끌 수 있는 프로젝트는 최대 3개입니다.</p>
              <ul>
                <li>부서중복자는 부서마다 슬롯을 별도로 계산합니다.</li>
                <li>비활성 슬롯 전환은 셀 색상을 직접 바꾸는 것이 아니라 ‘캐스팅뮤트’를 입력해 처리합니다.</li>
                <li>휴가 복귀 시 활성 슬롯은 기본 3개로 초기화되므로 필요하면 다시 조정합니다.</li>
              </ul>
            </div>
          </div>

          <div class="rule-block">
            <div class="rule-title"><small>7.1.2</small><b>셀 컬러 및 폰트</b></div>
            <div class="rule-body">
              <p>출석부의 색상과 글꼴은 소속 부서, 슬롯 상태, 반장 여부, 프로젝트 종류를 구분하기 위한 표시 체계입니다.</p>

              <div class="font-rule-line">기본 글꼴은 Arial이며, 간식컨 프로젝트명은 Gaegu로 적습니다.</div>

              <div class="color-guide-group">
                <div class="color-guide-title">부서별 상징색</div>
                <div class="rule-color-row department-color-row">
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#d6f2ff"></i>방송부</span>
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#fff7be"></i>문예부</span>
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#e4fdc8"></i>미술부</span>
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#e1d5fe"></i>연기부</span>
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#ffd9ef"></i>시디부</span>
                  <span class="rule-color-item"><i class="rule-color-chip" style="background:#ffd4be"></i>밴드부</span>
                </div>
              </div>

              <div class="status-color-list">
                <div class="status-color-item">
                  <i class="rule-color-chip" style="background:#b7b7b7"></i>
                  <span><b>#b7b7b7</b>: 비활성 슬롯의 색. 새 프로젝트명을 기입할 수 없습니다.</span>
                </div>
                <div class="status-color-item">
                  <i class="rule-color-chip" style="background:#999999"></i>
                  <span><b>#999999</b>: 휴가자 슬롯의 색. 신규 프로젝트 참여가 제한됩니다.</span>
                </div>
                <div class="status-color-item">
                  <i class="rule-color-chip" style="background:#990000"></i>
                  <span><b>#990000</b>: 휴가 복귀일 칸의 표시색입니다.</span>
                </div>
                <div class="status-color-item">
                  <i class="rule-color-chip" style="background:#ffff00"></i>
                  <span><b>#FFFF00</b>: 해당 프로젝트의 반장 표시색입니다. 휴가 중인 반장은 <span class="inline-color-code"><i class="rule-color-chip" style="background:#c09119"></i><b>#c09119</b></span>를 사용하기도 합니다.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rule-block">
            <div class="rule-title"><small>7.1.3</small><b>예외 사항</b></div>
            <div class="rule-body">
              <p>휴가자는 원칙적으로 신규 프로젝트에 참여할 수 없지만, 부서장이 개설하는 스터디는 예외적으로 휴가 중에도 참여할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="tabs-section attendance-sibling-section">
        <div class="attendance-sibling-head tabs-section-head">
          <h5>출석부 시트 탭</h5>
          <p>실제 스프레드시트 하단의 탭을 기준으로 각 탭의 용도를 확인할 수 있습니다.</p>
        </div>

        <div class="attendance-tabs-wrap" aria-label="출석부 시트 탭">
          <div class="attendance-tabs">${tabs}</div>
        </div>

        <section class="sheet-manual">
          <div class="sheet-manual-head">
            <div class="left"><h5>${tab.name}</h5></div>
            <div class="tab-purpose">${tab.purpose}</div>
          </div>
          ${tabBody}
        </section>
      </section>
    </div>`;

  driveContent.querySelectorAll('[data-sheet-tab]').forEach(btn=>{
    btn.onclick=()=>{currentSheetTab=btn.dataset.sheetTab;renderAttendance();};
  });
}

function renderDriveBrowser(r){
  const pathParts=r.path.split('/').map(x=>x.trim()).filter(Boolean);
  const currentName=pathParts[pathParts.length-1]||r.name;
  const rows=(r.items||[]).map(item=>{
    const raw=(item.type||'').toUpperCase();
    const iconClass=raw.includes('DOCUMENT')?'doc':raw==='MEDIA'?'media':'folder';
    const kind=raw.includes('DOCUMENT')?'Google 문서':raw==='MEDIA'?'미디어':raw==='USAGE'?'안내':'폴더';
    const sub=(item.meta||kind);
    return `<div class="drive-row">
      <div class="drive-file"><span class="g-file-icon ${iconClass}"></span><div><b>${item.name}</b><small>${sub}</small></div></div>
      <div class="drive-kind">${kind}</div>
      <p class="drive-description">${item.desc}</p>
    </div>`;
  }).join('');
  driveContent.innerHTML=`
    <div class="drive-browser drive-real">
      <div class="drive-topbar">
        <span class="drive-mark" aria-hidden="true"></span>
        <div class="drive-crumbs"><span>Google Drive</span><span class="sep">›</span><span>팀 이상 공유 폴더</span><span class="sep">›</span><span class="current">${currentName}</span></div>
        <span class="drive-count">${(r.items||[]).length}개 항목</span>
      </div>
      <div class="drive-list-head"><span>이름</span><span>유형</span><span>설명</span></div>
      ${rows || `<div class="drive-empty-note">이 폴더에는 현재 표시할 하위 항목이 없습니다.</div>`}
    </div>`;
}

function selectRoom(id,scroll=false){
  currentRoom=id; const r=driveRooms.find(x=>x.id===id);
  document.querySelectorAll('[data-drive-id]').forEach(x=>x.classList.toggle('active',x.dataset.driveId===id));
  driveIcon.textContent=r.icon; driveTitle.textContent=r.name; driveDesc.textContent=r.desc;
  if(r.mode==='sheet') renderAttendance(); else renderDriveBrowser(r);
  if(scroll || window.innerWidth<900) document.getElementById('drivePanel').scrollIntoView({behavior:'smooth',block:'start'});
}

function clearDiscordSearch(){
  discordSearchInput.value='';
  discordSearchResults.classList.remove('show');
  document.getElementById('facilityLayout').style.display='grid';
}

function searchDiscord(q){
  const term=q.trim().toLowerCase();
  const layout=document.getElementById('facilityLayout');

  if(!term){
    discordSearchResults.classList.remove('show');
    layout.style.display='grid';
    return;
  }

  const hits=[];
  facilities.forEach(f=>{
    const categoryHay=(f.name+' '+f.sub+' '+f.desc).toLowerCase();
    if(categoryHay.includes(term)){
      hits.push({kind:'category',f});
    }
    f.channels.forEach(ch=>{
      const channelHay=(ch.name+' '+ch.type+' '+ch.desc).toLowerCase();
      if(channelHay.includes(term)){
        hits.push({kind:'channel',f,ch});
      }
    });
  });

  discordResultsGrid.innerHTML='';
  if(!hits.length){
    discordResultsGrid.innerHTML='<div class="search-empty">검색 결과가 없습니다.</div>';
  }

  hits.forEach(hit=>{
    const el=document.createElement('article');
    el.className='result';

    if(hit.kind==='category'){
      const {f}=hit;
      el.innerHTML=`<small>시설 카테고리 · ${f.icon}</small><b>${f.name}</b><p>${f.desc}</p>`;
    }else{
      const {f,ch}=hit;
      el.innerHTML=`<small>${f.icon} ${f.name} · ${ch.type}</small><b>${ch.name}</b><p>${ch.desc}</p>`;
    }

    el.onclick=()=>{
      clearDiscordSearch();
      selectFacility(hit.f.id);
      if(window.innerWidth<900){
        document.getElementById('panel').scrollIntoView({behavior:'smooth',block:'start'});
      }
    };
    discordResultsGrid.appendChild(el);
  });

  layout.style.display='none';
  discordSearchResults.classList.add('show');
}

function clearDriveSearch(){
  driveSearchInput.value='';
  driveSearchResults.classList.remove('show');
  document.getElementById('driveLayout').style.display='grid';
}

function searchDrive(q){
  const term=q.trim().toLowerCase();
  const layout=document.getElementById('driveLayout');

  if(!term){
    driveSearchResults.classList.remove('show');
    layout.style.display='grid';
    return;
  }

  const hits=[];
  driveRooms.forEach(r=>{
    const roomHay=(r.name+' '+r.sub+' '+r.desc+' '+r.path).toLowerCase();
    if(roomHay.includes(term)){
      hits.push({kind:'room',r});
    }

    (r.items||[]).forEach(item=>{
      const itemHay=(item.name+' '+item.type+' '+(item.meta||'')+' '+item.desc).toLowerCase();
      if(itemHay.includes(term)){
        hits.push({kind:'item',r,item});
      }
    });
  });

  driveResultsGrid.innerHTML='';
  if(!hits.length){
    driveResultsGrid.innerHTML='<div class="search-empty">검색 결과가 없습니다.</div>';
  }

  hits.forEach(hit=>{
    const el=document.createElement('article');
    el.className='result';

    if(hit.kind==='room'){
      const {r}=hit;
      el.innerHTML=`<small>Google Drive · ${r.icon}</small><b>${r.name}</b><p>${r.desc}</p>`;
    }else{
      const {r,item}=hit;
      el.innerHTML=`<small>${r.icon} ${r.name} · ${item.type}</small><b>${item.name}</b><p>${item.desc}</p>`;
    }

    el.onclick=()=>{
      clearDriveSearch();
      selectRoom(hit.r.id,true);
    };
    driveResultsGrid.appendChild(el);
  });

  layout.style.display='none';
  driveSearchResults.classList.add('show');
}

discordSearchInput.addEventListener('input',e=>searchDiscord(e.target.value));
driveSearchInput.addEventListener('input',e=>searchDrive(e.target.value));
renderDirectory();selectFacility(current);renderResourceDirectory();selectRoom(currentRoom);

})();
