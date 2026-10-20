const crypto = require("crypto");

const secret = process.env.WEBHOOK_SECRET || "mi_secreto_super_seguro";
const payload = JSON.stringify({ 
  eventId: "evt_pago_1001", 
  leadId: "3104a06b-ee51-4101-8615-b33ec0a44223", 
  estadoPago: "COMPLETADO" 
});

const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

fetch("http://localhost:3000/api/webhooks/pago", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-signature": signature },
  body: payload
})
.then(async (r) => {
  console.log("Status HTTP:", r.status);
  console.log("Respuesta:", await r.json());
})
.catch((err) => console.error("Error en petición:", err));