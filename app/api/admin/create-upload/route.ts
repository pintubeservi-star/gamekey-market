import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({error:"No autorizado."},{status:401});
  const libraryId=process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey=process.env.BUNNY_STREAM_API_KEY;
  if (!libraryId || !apiKey) return NextResponse.json({error:"Falta configurar Bunny Stream en Vercel."},{status:503});
  const body=await req.json().catch(()=>({}));
  const title=typeof body.title==="string" ? body.title.trim().slice(0,180) : "";
  if (!title) return NextResponse.json({error:"Escribe el título del contenido."},{status:400});
  const upstream=await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`,{
    method:"POST",headers:{AccessKey:apiKey,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({title})
  });
  const video=await upstream.json().catch(()=>({}));
  if (!upstream.ok || !video.guid) return NextResponse.json({error:video.message || "Bunny no pudo crear el video."},{status:502});
  const expiration=Math.floor(Date.now()/1000)+60*60*6;
  const signature=createHash("sha256").update(`${libraryId}${apiKey}${expiration}${video.guid}`).digest("hex");
  return NextResponse.json({videoId:video.guid,libraryId,expiration,signature,title});
}
