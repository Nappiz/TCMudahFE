import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BE = "https://tcmudahbe.vercel.app";

const STRIP_HEADERS = ["host", "content-length", "connection", "accept-encoding"];

async function forward(req: NextRequest, path: string[]) {
  const url = `${BE}/${path.join("/")}`;
  const method = req.method;

  const headers = new Headers(req.headers);
  STRIP_HEADERS.forEach((h) => headers.delete(h));

  const hasBody = method !== "GET" && method !== "HEAD";
  let body: BodyInit | undefined;

  if (hasBody) {
    const ct = (headers.get("content-type") || "").toLowerCase();

    if (ct.includes("application/json")) {
      const json = await req.json();
      body = JSON.stringify(json);
      headers.set("content-type", "application/json");
    } else if (ct.startsWith("multipart/form-data")) {
      const inFd = await req.formData();
      const fd = new FormData();
      inFd.forEach((v, k) => {
        if (typeof v === "string") fd.append(k, v);
        else fd.append(k, v as File, (v as File).name);
      });
      body = fd;
      headers.delete("content-type"); 
    } else if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      body = text;
      headers.set("content-type", "application/x-www-form-urlencoded");
    } else {
      const buf = await req.arrayBuffer();
      body = buf;
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const out = new Headers();
  res.headers.forEach((v, k) => out.append(k, v));

  return new Response(res.body, { status: res.status, headers: out });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(req, path);
}
