'use client';
import {useEffect,useState} from 'react';

/**
 * C7: keep the mobile bottom CTA bar available on the first screen of marketing
 * pages. Hide only while editing a field or when a suppress target is in view.
 */
export function useP5MobileActions(pathname:string|null){
  const [state,setState]=useState({path:pathname,visible:true});
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      const active=document.activeElement;
      const editing=active instanceof HTMLElement&&active.matches('input,textarea,select,[contenteditable=true]');
      const footerVisible=[...document.querySelectorAll('[data-suppress-sticky-cta]')].some(el=>{
        const rect=el.getBoundingClientRect();return rect.bottom>0&&rect.top<window.innerHeight;
      });
      setState({path:pathname,visible:!editing&&!footerVisible});
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    update();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    document.addEventListener('focusin',schedule);
    document.addEventListener('focusout',schedule);
    const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(schedule);
    if(resize)resize.observe(document.body);
    return ()=>{
      cancelAnimationFrame(frame);resize?.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
      document.removeEventListener('focusin',schedule);document.removeEventListener('focusout',schedule);
    };
  },[pathname]);
  return state.path===pathname&&state.visible;
}
