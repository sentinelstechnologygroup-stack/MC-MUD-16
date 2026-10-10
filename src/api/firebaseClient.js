import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, query, where, writeBatch } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { validateDocumentFile } from '../lib/validate-document-file.js';

export function createFirebaseDistrict(config, matches) {
  const app = initializeApp(config);
  const auth = getAuth(app), db = getFirestore(app), storage = getStorage(app);
  const failure = (message, status) => Object.assign(new Error(message), { status });
  async function staff() {
    await auth.authStateReady();
    const user = auth.currentUser;
    if (!user) throw failure('Sign in to your staff account.', 401);
    const token = await user.getIdTokenResult(true);
    if (token.claims.districtAdmin !== true || !user.emailVerified) throw failure('Staff access has not been approved.', 403);
    return { id:user.uid, email:user.email, full_name:user.displayName, role:'admin' };
  }
  async function read(name, filter={}, sort, limit=5000) {
    await auth.authStateReady();
    const token = auth.currentUser ? await auth.currentUser.getIdTokenResult() : null;
    const admin = token?.claims.districtAdmin === true && auth.currentUser.emailVerified;
    const target = collection(db, name);
    const request = name === 'Document' && !admin ? query(target, where('archived', '==', false)) : target;
    const response = await getDocs(request);
    const rows = response.docs.map(item=>({...item.data(),id:item.id})).filter(row=>matches(row,filter));
    if (sort) { const descending=sort.startsWith('-'), field=descending?sort.slice(1):sort; rows.sort((a,b)=>String(a[field]??'').localeCompare(String(b[field]??''),undefined,{numeric:true})*(descending?-1:1)); }
    return rows.slice(0,limit);
  }
  async function save(name, id, data) {
    const actor = await staff();
    const target = id ? doc(db,name,id) : doc(collection(db,name));
    const clean = Object.fromEntries(Object.entries(data).filter(([key,value])=>value!==undefined && !['id','created_by','created_date','updated_date'].includes(key)));
    const now = new Date().toISOString();
    const record = {...clean,updated_date:now,...(!id?{created_date:now,created_by:actor.email}:{} )};
    const batch = writeBatch(db);
    batch.set(target,record,{merge:Boolean(id)});
    if (!['ContentChange','WebsiteDraft'].includes(name)) batch.set(doc(collection(db,'ContentChange')), {actor:actor.email,key:name,summary:(id?'Updated ':'Created ')+(clean.title||clean.key||name),value:JSON.stringify(clean),created_date:now,updated_date:now});
    await batch.commit();
    return {...record,id:target.id};
  }
  return {
    configured:true,
    entities:Object.fromEntries(['Document','Meeting','TaxRate','Consultant','WebsiteContent','WebsiteDraft','ContentChange'].map(name=>[name,{list:(sort,limit)=>read(name,{},sort,limit),filter:(filter,sort,limit)=>read(name,filter,sort,limit),create:data=>save(name,null,data),update:(id,data)=>save(name,id,data),delete:async()=>{throw failure('Archive records instead of deleting them.',403);}}])),
    auth:{me:staff,logout:()=>signOut(auth),loginViaEmailPassword:async(email,password)=>{await signInWithEmailAndPassword(auth,email,password);return staff();},resetPassword:email=>sendPasswordResetEmail(auth,email)},
    integrations:{Core:{UploadFile:async({file})=>{await staff();const invalid=await validateDocumentFile(file);if(invalid) throw failure(invalid,400);const path='public-documents/'+crypto.randomUUID()+'.pdf';const object=ref(storage,path);await uploadBytes(object,file,{contentType:'application/pdf',customMetadata:{uploadedBy:auth.currentUser.uid}});return {file_url:await getDownloadURL(object)};}}},
  };
}
