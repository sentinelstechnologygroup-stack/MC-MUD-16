import snapshot from '../data/public-content.json' with { type: 'json' };
// Public export only. Staff writes require the replacement server backend.
export function matches(record,query={}){return Object.entries(query).every(([key,expected])=>{if(key==='$or')return expected.some(q=>matches(record,q));if(key==='$and')return expected.every(q=>matches(record,q));const actual=record[key];if(expected&&typeof expected==='object')return Object.entries(expected).every(([op,value])=>{if(op==='$ne')return actual!==value;if(op==='$in')return value.includes(actual);if(op==='$gte')return actual>=value;if(op==='$lte')return actual<=value;throw new Error('Unsupported content filter: '+op);});return actual===expected;});}
function read(name,query,sort,limit=5000){if(!(name in snapshot))throw Object.assign(new Error('Private content is unavailable'),{status:403});const rows=snapshot[name].filter(r=>matches(r,query)).map(r=>structuredClone(r));if(sort){const desc=sort.startsWith('-');const field=desc?sort.slice(1):sort;rows.sort((a,b)=>String(a[field]??'').localeCompare(String(b[field]??''),undefined,{numeric:true})*(desc?-1:1));}return rows.slice(0,limit);}
const unavailable=async()=>{throw Object.assign(new Error('Staff publishing is awaiting backend setup.'),{status:503});};
const signedOut=async()=>{throw Object.assign(new Error('Staff access is not enabled.'),{status:401});};
const snapshotDistrict={entities:Object.fromEntries(['Document','Meeting','TaxRate','Consultant','WebsiteContent','WebsiteDraft','ContentChange'].map(name=>[name,{list:async(sort,limit)=>read(name,{},sort,limit),filter:async(query,sort,limit)=>read(name,query,sort,limit),create:unavailable,update:unavailable,delete:unavailable}])),auth:{me:signedOut,logout:()=>{},redirectToLogin:()=>{},loginViaEmailPassword:unavailable,loginWithProvider:unavailable},integrations:{Core:{UploadFile:unavailable}}};


const env = import.meta.env || {};
const config={apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET,appId:env.VITE_FIREBASE_APP_ID};
let live;
const backend=()=>live ||= import('./firebaseClient.js').then(module=>module.createFirebaseDistrict(config,matches));
const forward=path=>async(...args)=>{let target=await backend();for(const part of path) target=target[part];return target(...args);};
export const district=config.projectId?{configured:true,entities:Object.fromEntries(Object.keys(snapshotDistrict.entities).map(name=>[name,Object.fromEntries(['list','filter','create','update','delete'].map(method=>[method,forward(['entities',name,method])]))])),auth:Object.fromEntries(['me','logout','loginViaEmailPassword','resetPassword'].map(method=>[method,forward(['auth',method])])),integrations:{Core:{UploadFile:forward(['integrations','Core','UploadFile'])}}}:snapshotDistrict;
