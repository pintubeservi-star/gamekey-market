import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, adminCookieName } from "@/lib/admin-auth";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) return NextResponse.json({error:"El administrador todavía no está configurado en el servidor."},{status:503});
  const body = await req.json().catch(()=>({}));
  const supplied = typeof body.password === "string" ? body.password : "";
  const a=Buffer.from(supplied), b=Buffer.from(configured);
  if (a.length !== b.length || !timingSafeEqual(a,b)) return NextResponse.json({error:"Contraseña incorrecta."},{status:401});
  const response=NextResponse.json({ok:true});
  response.cookies.set(adminCookieName,createAdminToken(),{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:60*60*12});
  return response;
}
