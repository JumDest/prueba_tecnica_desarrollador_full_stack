import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Instancia del cliente de Prisma
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo, telefono, pais, procedimiento, mensaje } = body;

    // Validación en el servidor (requisito obligatorio)
    if (!nombre || !correo || !telefono || !pais || !procedimiento) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Asignación automática de coordinación
    const coordinacion = pais === "Colombia" ? "Nacional" : "Internacional";

    // Guardar en la base de datos de Supabase
    const nuevoLead = await prisma.lead.create({
      data: {
        nombre,
        correo,
        telefono,
        pais,
        procedimiento,
        mensaje: mensaje || "",
        coordinacion,
        estado: "Nuevo",
      },
    });

    return NextResponse.json(
      { success: true, lead: nuevoLead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear el lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la solicitud" },
      { status: 500 }
    );
  }
}