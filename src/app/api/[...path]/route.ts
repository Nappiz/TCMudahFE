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

  const body =
    method === "GET" || method === "HEAD" ? undefined : (req.body as any);

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

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path.join("/"));
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path.join("/"));
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path.join("/"));
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path.join("/"));
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return forward(req, params.path.join("/"));
}
