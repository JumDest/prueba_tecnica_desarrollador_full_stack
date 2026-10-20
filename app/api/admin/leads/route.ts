import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const checkAuth = (request: Request) => {
  const authHeader = request.headers.get("Authorization") || "";
  const envPassword = process.env.ADMIN_PASSWORD || "admin";

  const cleanHeader = authHeader.replace(/[\r\n"']/g, "").trim();
  const cleanExpected = envPassword.replace(/[\r\n"']/g, "").trim();

  return cleanHeader === cleanExpected;
};

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    return NextResponse.json(
      { error: "Error de servidor o base de datos al consultar leads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id, estado } = await request.json();
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { estado },
    });
    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}