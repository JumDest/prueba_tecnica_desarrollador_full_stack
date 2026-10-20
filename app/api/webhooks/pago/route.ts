import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-signature") || request.headers.get("x-webhook-signature");
    const secret = (process.env.WEBHOOK_SECRET || "mi_secreto_super_seguro").replace(/[\r\n"']/g, "").trim();

    if (!signature) {
      return NextResponse.json({ error: "Firma faltante" }, { status: 401 });
    }

    // 1. Verificación de firma HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Firma HMAC inválida" }, { status: 401 });
    }

    const payload = JSON.parse(bodyText);
    const { eventId, leadId, estadoPago } = payload;

    if (!eventId || !leadId) {
      return NextResponse.json({ error: "Payload incompleto" }, { status: 400 });
    }

    // 2. Control de Idempotencia
    const eventoExistente = await prisma.processedWebhook.findUnique({
      where: { eventId },
    });

    if (eventoExistente) {
      return NextResponse.json(
        { message: "Evento ya procesado previamente (Idempotente)" },
        { status: 200 }
      );
    }

    // 3. Verificar que el lead exista
    const leadExistente = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!leadExistente) {
      return NextResponse.json({ error: "Lead no encontrado en la BD" }, { status: 404 });
    }

    // 4. Actualización en Transacción ACID
    if (estadoPago === "COMPLETADO" || estadoPago === "PAID") {
      await prisma.$transaction([
        prisma.processedWebhook.create({
          data: { eventId },
        }),
        prisma.lead.update({
          where: { id: leadId },
          data: { estado: "Convertido" },
        }),
      ]);
    }

    return NextResponse.json({ success: true, message: "Lead actualizado a Convertido" });
  } catch (error) {
    console.error("Error en Webhook:", error);
    return NextResponse.json({ error: "Error interno al procesar webhook" }, { status: 500 });
  }
}