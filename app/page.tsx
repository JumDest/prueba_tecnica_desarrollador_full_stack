"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    pais: "",
    procedimiento: "",
    mensaje: "",
  });
  const [mensajeExito, setMensajeExito] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "correo") setErrorCorreo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación visible del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      setErrorCorreo("El formato del correo es inválido");
      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMensajeExito("¡Solicitud enviada correctamente!"); // Mensaje de confirmación[cite: 9]
        setFormData({ nombre: "", correo: "", telefono: "", pais: "", procedimiento: "", mensaje: "" });
      } else {
        alert("Hubo un error al enviar la solicitud.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión.");
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 flex justify-center items-center text-black">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Valoración MedLeads</h1>
        
        {mensajeExito && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-200">
            {mensajeExito}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
            <input required type="email" name="correo" value={formData.correo} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
            {errorCorreo && <p className="text-red-500 text-xs mt-1">{errorCorreo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <input required type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">País *</label>
            <select required name="pais" value={formData.pais} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-white">
              <option value="">Selecciona un país</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="España">España</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Procedimiento de interés *</label>
            <input required type="text" name="procedimiento" value={formData.procedimiento} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mensaje (opcional)</label>
            <textarea name="mensaje" value={formData.mensaje} onChange={handleChange} rows={3} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-2 rounded-md hover:bg-blue-700 transition-colors">
            Enviar solicitud
          </button>
        </form>
      </div>
    </main>
  );
}