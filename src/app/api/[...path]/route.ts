import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BE = "https://tcmudahbe.vercel.app";

async function forward(req: NextRequest, path: string) {
  const url = `${BE}/${path}`;
  const method = req.method;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(BE).host);
  headers.delete("content-length");
  headers.delete("x-forwarded-host");
  headers.delete("x-forwarded-proto");
  headers.delete("connection");

  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? (req.body as any) : undefined;

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

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(req, path.join("/"));
}
export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(req, path.join("/"));
}
export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(req, path.join("/"));
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(req, path.join("/"));
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forward(req, path.join("/"));
}
