"use client";
import {P5Estimator} from './P5Estimator';
export interface EstimateCalculatorProps {sectionId?:string|null;inModal?:boolean;fitViewport?:boolean;viewportFit?:boolean;onBookVisit?:()=>void;startStep?:'project'|'size'|'layout'|'style'|'result'|'contact';headingAs?:'h1'|'h2';featured?:boolean}
export function EstimateCalculator({sectionId="calculator",inModal=false,fitViewport=false,viewportFit=false,headingAs}:EstimateCalculatorProps={}){
  const standalone=fitViewport||viewportFit;
  return <section id={sectionId||undefined} style={{padding:inModal?'0':standalone?'112px 0 40px':'36px 0',minWidth:0}}><P5Estimator headingAs={headingAs||(standalone?'h1':'h2')}/></section>;
}
