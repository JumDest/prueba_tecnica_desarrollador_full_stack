import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Clasificación de prioridad por IA con Fallback heurístico
async function clasificarPrioridad(mensaje: string, procedimiento: string): Promise<string> {
  const fallbackHeuristico = () => {
    const texto = `${mensaje} ${procedimiento}`.toLowerCase();
    if (texto.includes("urgente") || texto.includes("dolor") || texto.includes("cirug") || texto.includes("inmediat") || texto.includes("complicac")) {
      return "Alta";
    }
    if (texto.includes("precio") || texto.includes("costo") || texto.includes("cotiz") || texto.includes("descuento")) {
      return "Media";
    }
    return "Baja";
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackHeuristico();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un triage médico. Clasifica la prioridad del mensaje en 'Alta', 'Media' o 'Baja'. Responde ÚNICAMENTE con una de esas tres palabras." },
          { role: "user", content: `Procedimiento: ${procedimiento}. Mensaje: ${mensaje}` },
        ],
        max_tokens: 10,
      }),
    });

    if (!res.ok) return fallbackHeuristico();
    const data = await res.json();
    const output = data.choices?.[0]?.message?.content?.trim();
    return ["Alta", "Media", "Baja"].includes(output) ? output : fallbackHeuristico();
  } catch {
    return fallbackHeuristico();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, correo, telefono, pais, procedimiento, mensaje } = body;

    if (!nombre || !correo || !telefono || !pais || !procedimiento) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const coordinacion = pais === "Colombia" ? "Nacional" : "Internacional";
    const prioridad = await clasificarPrioridad(mensaje || "", procedimiento);

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
        prioridad,
      },
    });

    return NextResponse.json({ success: true, lead: nuevoLead }, { status: 201 });
  } catch (error) {
    console.error("Error al crear lead:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}