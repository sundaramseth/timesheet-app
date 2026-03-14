const API_URL = "https://script.google.com/macros/s/AKfycbzQ7fHVzvAclAadfbi-DDvi2MF416wyvaSGrXFz8_JZ7lKtppQ77T0_nrEHd_Gapuir/exec";


export async function callAPI(action,data={}){

const res = await fetch(API_URL,{
method:"POST",
body:JSON.stringify({
action,
...data
}),
});

return res.json();

}