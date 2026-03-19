const API_URL = "/api/gas";

export async function callAPI(action,data={}){

const res = await fetch(API_URL,{
  method:"POST",
  headers:{
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    action,
    ...data
  })
});

const text = await res.text();

try {
  return JSON.parse(text);
} catch (e) {
  console.error("Invalid JSON:", text);
  throw new Error("API response invalid",e);
}

}