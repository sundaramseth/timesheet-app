import { useEffect, useState } from "react";
import { callAPI } from "../api";
import Topbar from "../component/Topbar";

export default function EmployeeDashboard(){

const user = JSON.parse(localStorage.getItem("user"));
const RATE = 12;

const [attendance,setAttendance] = useState([]);
const [weekDates,setWeekDates] = useState([]);
const [breaks,setBreaks] = useState({});
const [manualTimes,setManualTimes] = useState({});


/* ---------- DATE FORMAT FIX ---------- */

function formatDateLocal(d){

const date = new Date(d);

const year = date.getFullYear();
const month = String(date.getMonth()+1).padStart(2,"0");
const day = String(date.getDate()).padStart(2,"0");

return `${year}-${month}-${day}`;

}


/* ---------- WEEK RANGE ---------- */

function getWeekDates(){

const today = new Date();
const day = today.getDay();

const sunday = new Date(today);
sunday.setDate(today.getDate()-day);

const week=[];

for(let i=0;i<7;i++){
let d = new Date(sunday);
d.setDate(sunday.getDate()+i);
week.push(d);
}

return week;

}


/* ---------- LOAD DATA ---------- */

async function loadData(){

const week = getWeekDates();
setWeekDates(week);

const startDate = week[0].toISOString();
const endDate = week[6].toISOString();

const res = await callAPI("getWeeklyAttendance",{
name:user.name,
startDate,
endDate
});

let data=[];

if(Array.isArray(res)){
data=res;
}else if(Array.isArray(res.data)){
data=res.data;
}

setAttendance(data);


/* preload manual values */

let times={};
let breakData={};

data.forEach(r=>{

const key = formatDateLocal(r[2]);

times[key]={
in:r[3] ? new Date(r[3]).toTimeString().slice(0,5) : "",
out:r[4] ? new Date(r[4]).toTimeString().slice(0,5) : ""
};

breakData[key] = r[5] || 0;

});

setManualTimes(times);
setBreaks(breakData);

}


/* ---------- CLOCK ---------- */

async function clockIn(){
await callAPI("clockIn",{name:user.name});
await loadData();
}

async function clockOut(){
await callAPI("clockOut",{name:user.name});
await loadData();
}


/* ---------- FIND DAY DATA ---------- */

function findDayData(date){

const cardDate = formatDateLocal(date);

return attendance.find(r=>{

const sheetDate = formatDateLocal(r[2]);

return sheetDate===cardDate;

});

}


/* ---------- BREAK ---------- */

async function addBreak(date){

const key = formatDateLocal(date);

const newBreak = (breaks[key] || 0) + 15;

setBreaks(prev=>({
...prev,
[key]:newBreak
}));

await callAPI("saveBreak",{
name:user.name,
date:key,
minutes:newBreak
});

}


/* ---------- MANUAL ENTRY ---------- */

function updateClockIn(date,val){

setManualTimes(prev=>({
...prev,
[date]:{
...prev[date],
in:val
}
}));

}

function updateClockOut(date,val){

setManualTimes(prev=>({
...prev,
[date]:{
...prev[date],
out:val
}
}));

}


/* ---------- SAVE MANUAL ---------- */

async function saveManual(date){

const times = manualTimes[date];

if(!times?.in || !times?.out){
alert("Enter both times");
return;
}

await callAPI("saveManualTime",{
name:user.name,
date,
clockIn:times.in,
clockOut:times.out
});

await loadData();

}


/* ---------- HOURS ---------- */

function calculateHours(inTime,outTime,breakMin=0){

if(!inTime || !outTime) return 0;

const start=new Date(inTime);
const end=new Date(outTime);

let hours=(end-start)/(1000*60*60);

hours-=breakMin/60;

return hours>0?hours:0;

}


/* ---------- FORMAT ---------- */

function formatHours(h){

const hr=Math.floor(h);
const min=Math.round((h-hr)*60);

return `${hr}h ${min}m`;

}


/* ---------- TOTAL ---------- */

const totalHours = weekDates.reduce((sum,date)=>{

const row=findDayData(date);

const breakMin=breaks[formatDateLocal(date)]||0;

return sum + calculateHours(
row?.[3] ? new Date(row[3]) : null,
row?.[4] ? new Date(row[4]) : null,
breakMin
);

},0);

const totalEarnings = totalHours * RATE;


/* ---------- INIT ---------- */

useEffect(() => {
  const fetchData = async () => {
	await loadData();
  };
  fetchData();
}, []);


/* ---------- UI ---------- */

return(

<div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">

<header className="bg-white shadow">
<Topbar name={"Timesheet"} />
</header>

<div className="max-w-3xl mx-auto p-4">


<div className="text-center text-white mb-6">

<h1 className="text-3xl font-bold">Timesheet</h1>
<p className="text-lg">My rate: ${RATE}/hour</p>

</div>

<div className="flex gap-4 my-6">

<button
onClick={clockIn}
className="bg-green-500 text-white px-4 py-2 rounded-lg w-full cursor-pointer"
>
Clock In
</button>

<button
onClick={clockOut}
className="bg-red-500 text-white px-4 py-2 rounded-lg w-full cursor-pointer"
>
Clock Out
</button>

</div>


{weekDates.map(date=>{

const row=findDayData(date);

const key=formatDateLocal(date);

const breakMin = breaks[key] || row?.[5] || 0;

const hours=calculateHours(
row?.[3] ? new Date(row[3]) : null,
row?.[4] ? new Date(row[4]) : null,
breakMin
);

const earnings=(hours*RATE).toFixed(2);

const day=date.toLocaleDateString("en-US",{weekday:"long"});
const fullDate=date.toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"});

return(

<div key={key} className="bg-white rounded-xl shadow-lg p-4 mb-4">

<div className="flex justify-between">

<div>

<h3 className="text-lg font-semibold text-blue-600">{day}</h3>
<p className="text-sm text-gray-500">{fullDate}</p>

</div>

<div className="text-right">

<p className="text-blue-600 font-semibold">
{hours>0 ? formatHours(hours) : "0h 0m"}
</p>

<p className="text-gray-500 text-sm">
Break {breakMin} min
</p>

<p className="text-blue-600 font-bold">
${earnings}
</p>

</div>

</div>


<div className="flex gap-3 mt-3">

<input
type="time"
value={manualTimes[key]?.in || ""}
onChange={(e)=>updateClockIn(key,e.target.value)}
className="border rounded-lg p-2 w-full"
/>

<input
type="time"
value={manualTimes[key]?.out || ""}
onChange={(e)=>updateClockOut(key,e.target.value)}
className="border rounded-lg p-2 w-full"
/>

</div>


<button
onClick={()=>saveManual(key)}
className="mt-2 bg-blue-500 text-white px-3 py-2 rounded-lg w-full"
>
Save Manual Entry
</button>


<button
onClick={()=>addBreak(date)}
className="mt-3 border border-blue-400 text-blue-500 px-3 py-2 rounded-lg w-full hover:bg-blue-50"
>
+ add a break
</button>


</div>

);

})}


<div className="bg-blue-500 text-white rounded-xl p-5 text-center mt-6 shadow-xl">

<p className="text-lg font-semibold">
Week total {formatHours(totalHours)} ${totalEarnings.toFixed(2)}
</p>

<p className="text-lg">
4 weeks {formatHours(totalHours*4)} ${(totalEarnings*4).toFixed(2)}
</p>

<p className="text-lg">
Average month ${(totalEarnings*4).toFixed(2)}~
</p>

</div>





</div>

</div>

);

}