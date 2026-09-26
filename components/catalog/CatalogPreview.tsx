'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
const Viewer=dynamic(()=>import('./CatalogFlipbook').then(mod=>mod.CatalogFlipbook),{
  loading:()=> <p role="status" className="p-8 text-center">Opening the cabinet catalog…</p>,
});

export function CatalogPreview({pdfUrl}:{pdfUrl:string}){
  const [open,setOpen]=useState(false);
  return open?<Viewer pdfUrl={pdfUrl} downloadUrl={pdfUrl}/>:<div className="rounded-xl border bg-card p-6 md:p-10">
    <img src="/images/marketing/og-catalog.jpg" alt="Boise Cabinet Co cabinet catalog cover" width={1200} height={630} className="mx-auto w-full max-w-xl rounded-lg" loading="lazy"/>
    <div className="mt-6 text-center"><h2 className="text-2xl">Explore the cabinet catalog</h2><p className="mx-auto mt-3 max-w-xl">Browse product pages below, open the interactive catalog, or download the PDF. The interactive viewer loads only when you open it.</p>
      <button type="button" className="mt-5 min-h-12 rounded-lg bg-primary px-6 py-3 text-primary-foreground" onClick={()=>setOpen(true)}>Open interactive catalog</button>
      <p className="mt-4"><a href={pdfUrl} className="underline" download>Download the cabinet catalog PDF</a></p>
    </div>
  </div>;
}
