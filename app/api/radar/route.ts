import { NextResponse } from "next/server";
import { runRadarBacktest, type RadarBar } from "@/lib/radar/engine";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const body=await request.json();
  if(!Array.isArray(body?.rows))return NextResponse.json({ok:false,error:"يجب إرسال ملف CSV يحتوي على rows."},{status:400});
  if(body.rows.length>15000)return NextResponse.json({ok:false,error:"الحد الأقصى 15 ألف صف في الدفعة الواحدة."},{status:413});
  const rows=body.rows as RadarBar[],required=["symbol","date","open","high","low","close","volume"] as const;
  if(rows.some(row=>!row||required.some(k=>row[k]===undefined||row[k]===null||row[k]==="")))return NextResponse.json({ok:false,error:"بعض الصفوف ينقصها حقل مطلوب."},{status:400});
  return NextResponse.json({ok:true,...runRadarBacktest(rows)});
 }catch{return NextResponse.json({ok:false,error:"تعذر تحليل الملف. تحقق من CSV والقيم الرقمية."},{status:400});}
}
