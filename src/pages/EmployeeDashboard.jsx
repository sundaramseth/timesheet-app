import { useEffect, useState } from "react";
import { callAPI } from "../api";
import Topbar from "../component/Topbar";

export default function EmployeeDashboard(){

const user = JSON.parse(localStorage.getItem("user"));
const RATE = user?.rate || 0;

const [attendance,setAttendance] = useState([]);
const [weekDates,setWeekDates] = useState([]);
const [breaks,setBreaks] = useState({});
const [manualTimes,setManualTimes] = useState({});
// const [isClockingIn, setIsClockingIn] = useState(false);
// const [isClockingOut, setIsClockingOut] = useState(false);


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

// async function clockIn(){
//   setIsClockingIn(true);
//   try {
//     await callAPI("clockIn",{name:user.name});
//     await loadData();
//   } finally {
//     setIsClockingIn(false);
//   }
// }

// async function clockOut(){
//   setIsClockingOut(true);
//   try {
//     await callAPI("clockOut",{name:user.name});
//     await loadData();
//   } finally {
//     setIsClockingOut(false);
//   }
// }


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

{/* <div className="flex gap-4 my-6">

<button
  onClick={clockIn}
  disabled={isClockingIn}
  className="bg-green-500 text-white px-4 py-2 rounded-lg w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  {isClockingIn ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Clocking In...
    </>
  ) : (
    "Clock In"
  )}
</button>

<button
  onClick={clockOut}
  disabled={isClockingOut}
  className="bg-red-500 text-white px-4 py-2 rounded-lg w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
>
  {isClockingOut ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Clocking Out...
    </>
  ) : (
    "Clock Out"
  )}
</button>

</div> */}


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


<div className="bg-blue-500 text-white rounded-xl p-6 mt-6 shadow-xl">

  <h3 className="text-xl font-bold text-center mb-4">Weekly Summary</h3>

  <div className="space-y-3">

    <div className="flex justify-between items-center">
      <span className="text-lg font-medium">Week Total:</span>
      <span className="text-lg font-semibold">{formatHours(totalHours)} (${totalEarnings.toFixed(2)})</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-lg font-medium">4 Weeks:</span>
      <span className="text-lg font-semibold">{formatHours(totalHours*4)} (${(totalEarnings*4).toFixed(2)})</span>
    </div>

    <div className="flex justify-between items-center">
      <span className="text-lg font-medium">Average Month:</span>
      <span className="text-lg font-semibold">${(totalEarnings*4).toFixed(2)}~</span>
    </div>

  </div>

</div>





</div>

</div>

);

}