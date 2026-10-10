import { readFile } from 'node:fs/promises';
import { test, after } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
const env = await initializeTestEnvironment({projectId:'demo-mcmud16-tests',firestore:{host:'127.0.0.1',port:8087,rules:await readFile('firebase/firestore.rules','utf8')},storage:{host:'127.0.0.1',port:9197,rules:await readFile('firebase/storage.rules','utf8')}});
after(()=>env.cleanup());
const guest = env.unauthenticatedContext().firestore();
const unapproved = env.authenticatedContext('visitor',{email:'visitor@example.test',email_verified:true}).firestore();
const staff = env.authenticatedContext('approved',{districtAdmin:true,email_verified:true,email:'staff@example.test'}).firestore();
test('public records are readable but drafts and archived metadata are private',async()=>{
 await env.withSecurityRulesDisabled(async context=>{const db=context.firestore();await setDoc(doc(db,'WebsiteContent','board'),{key:'board_members',value:'[]'});await setDoc(doc(db,'WebsiteDraft','draft'),{key:'board_members',value:'[]'});await setDoc(doc(db,'Document','removed'),{archived:true});});
 await assertSucceeds(getDoc(doc(guest,'WebsiteContent','board')));
 await assertFails(getDoc(doc(guest,'WebsiteDraft','draft')));
 await assertFails(getDoc(doc(guest,'Document','removed')));
});
test('only verified staff claims can write and meeting validation is enforced',async()=>{
 const meeting={title:'Special Meeting',date:'2026-11-10',time:'7 p.m.',location:'Test only',type:'special',status:'scheduled'};
 await assertFails(setDoc(doc(guest,'Meeting','new'),meeting));
 await assertFails(setDoc(doc(unapproved,'Meeting','new'),meeting));
 await assertSucceeds(setDoc(doc(staff,'Meeting','new'),meeting));
 await assertFails(setDoc(doc(staff,'Meeting','invalid'),{...meeting,type:'unknown'}));
 await assertFails(deleteDoc(doc(staff,'Meeting','new')));
});
test('publishing history cannot be changed or impersonated',async()=>{
 const history={actor:'staff@example.test',summary:'Test only'};
 await assertSucceeds(setDoc(doc(staff,'ContentChange','audit'),history));
 await assertFails(setDoc(doc(staff,'ContentChange','audit'),{...history,summary:'Altered'}));
 await assertFails(setDoc(doc(staff,'ContentChange','fake'),{actor:'someone@example.test'}));
});
test('PDF uploads require verified staff and cannot overwrite original files',async()=>{
 const context=env.authenticatedContext('approved',{districtAdmin:true,email_verified:true,email:'staff@example.test'});
 const storage=context.storage();
 const bytes=new TextEncoder().encode('%PDF-1.7 test only');
 await assertFails(uploadBytes(ref(env.unauthenticatedContext().storage(),'public-documents/guest.pdf'),bytes,{contentType:'application/pdf'}));
 await assertSucceeds(uploadBytes(ref(storage,'public-documents/test.pdf'),bytes,{contentType:'application/pdf'}));
 await assertFails(uploadBytes(ref(storage,'public-documents/test.pdf'),new TextEncoder().encode('%PDF-1.7 replacement test'),{contentType:'application/pdf'}));
 await assertFails(uploadBytes(ref(storage,'public-documents/script.pdf'),bytes,{contentType:'text/javascript'}));
});
