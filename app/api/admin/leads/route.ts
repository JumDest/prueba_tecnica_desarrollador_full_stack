import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Función rápida para validar la contraseña enviada desde el frontend[cite: 9]
const checkAuth = (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  const password = process.env.ADMIN_PASSWORD || "admin";
  return authHeader === password;
};

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" }, // Listado de más reciente a más antigua[cite: 9]
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener leads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { id, estado } = await request.json();
    // Guardar el cambio de estado en la base de datos[cite: 9]
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { estado },
    });
    return NextResponse.json(updatedLead);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}