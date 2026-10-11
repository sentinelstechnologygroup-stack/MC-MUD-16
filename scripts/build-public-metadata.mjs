import fs from 'node:fs';
import { PAGE_METADATA, SITE_ORIGIN } from '../src/lib/page-metadata.js';
const source=fs.readFileSync('dist/index.html','utf8');
const indexing=process.env.VITE_INDEX_PUBLIC_SITE==='true';
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
fs.mkdirSync('dist/__pages',{recursive:true});
for(const [path,[name,description]] of Object.entries(PAGE_METADATA)) {
 const title=name+(path==='/'?'':' | Montgomery County MUD 16');
 const noindex=!indexing||path==='/staff-portal';
 const tags=`<link rel="canonical" href="${SITE_ORIGIN+path}"/><meta name="robots" content="${noindex?'noindex, nofollow':'index, follow'}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="Montgomery County MUD 16"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${SITE_ORIGIN+path}"/><meta property="og:image" content="${SITE_ORIGIN}/migrated/41d897b944897a5f.jpg"/><meta name="twitter:card" content="summary_large_image"/>`;
 const html=source.replace(/<title>.*?<\/title>/s,`<title>${escape(title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(description)}"/>`).replace('</head>',tags+'\n</head>');
 fs.writeFileSync(path==='/'?'dist/index.html':'dist/__pages'+path+'.html',html);
}
const paths=Object.keys(PAGE_METADATA).filter(path=>path!=='/staff-portal');
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+SITE_ORIGIN+path+'</loc></url>').join('')+'</urlset>');
fs.writeFileSync('dist/robots.txt',indexing?'User-agent: *\nDisallow: /staff-portal\nDisallow: /__pages/\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n');
fs.writeFileSync('dist/404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page Not Found | Montgomery County MUD 16</title></head><body style="font-family:system-ui;max-width:40rem;margin:5rem auto;padding:1rem"><h1>Page not found</h1><p>The requested page is unavailable. Find district information and public documents from the homepage.</p><a href="/">Return to the district website</a></body></html>');
console.log('Generated page metadata, sitemap, robots and 404. Public indexing:',indexing);
