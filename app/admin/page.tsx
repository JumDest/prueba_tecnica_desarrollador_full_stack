"use client";
import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("Todos"); // Filtro por coordinación[cite: 9]

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(password);
  };

  const fetchLeads = async (pass: string) => {
    const res = await fetch("/api/admin/leads", {
      headers: { Authorization: pass },
    });
    if (res.ok) {
      const data = await res.json();
      setLeads(data);
      setIsLoggedIn(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: password },
      body: JSON.stringify({ id, estado: nuevoEstado }),
    });
    if (res.ok) {
      fetchLeads(password); // Recargar la tabla con el cambio guardado en base de datos[cite: 9]
    }
  };

  // Protección: sin iniciar sesión no debe poder verse ninguna información[cite: 9]
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-black">
        <form onSubmit={login} className="bg-white p-8 rounded shadow-md w-96 text-center">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Acceso Administrativo</h2>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full mb-4 rounded text-black" placeholder="Ingresa la contraseña" required />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700">Ingresar</button>
        </form>
      </div>
    );
  }

  // Lógica de Contadores en la parte superior[cite: 10]
  const leadsFiltrados = filtro === "Todos" ? leads : leads.filter(l => l.coordinacion === filtro);
  const totalNacionales = leads.filter(l => l.coordinacion === "Nacional").length;
  const totalInternacionales = leads.filter(l => l.coordinacion === "Internacional").length;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control - MedLeads</h1>
          <button onClick={() => setIsLoggedIn(false)} className="text-red-600 font-semibold underline">Cerrar Sesión</button>
        </div>
        
        {/* Contadores[cite: 10] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-white p-4 rounded shadow font-bold text-lg border-t-4 border-gray-500">Total Solicitudes: {leads.length}</div>
          <div className="bg-white p-4 rounded shadow font-bold text-lg text-green-700 border-t-4 border-green-500">Nacionales: {totalNacionales}</div>
          <div className="bg-white p-4 rounded shadow font-bold text-lg text-blue-700 border-t-4 border-blue-500">Internacionales: {totalInternacionales}</div>
        </div>

        {/* Filtros[cite: 9] */}
        <div className="mb-4 bg-white p-4 rounded shadow flex items-center gap-4">
          <label className="font-bold text-gray-700">Filtrar por coordinación:</label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="border p-2 rounded bg-white text-gray-800">
            <option value="Todos">Todas las solicitudes</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
          </select>
        </div>

        {/* Listado de solicitudes[cite: 9] */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-gray-600">Nombre</th>
                <th className="p-3 text-gray-600">País</th>
                <th className="p-3 text-gray-600">Coordinación</th>
                <th className="p-3 text-gray-600">Fecha</th>
                <th className="p-3 text-gray-600">Estado</th>
                <th className="p-3 text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{lead.nombre}</td>
                  <td className="p-3">{lead.pais}</td>
                  <td className="p-3 font-semibold text-gray-700">{lead.coordinacion}</td>
                  <td className="p-3 text-sm">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${lead.estado === 'Nuevo' ? 'bg-yellow-100 text-yellow-800' : lead.estado === 'Contactado' ? 'bg-blue-100 text-blue-800' : lead.estado === 'Convertido' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {lead.estado}
                    </span>
                  </td>
                  <td className="p-3">
                    <select 
                      value={lead.estado} 
                      onChange={(e) => cambiarEstado(lead.id, e.target.value)}
                      className="border p-1 rounded bg-white text-sm font-medium outline-none cursor-pointer"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="Contactado">Contactado</option>
                      <option value="Convertido">Convertido</option>
                      <option value="Descartado">Descartado</option>
                    </select>
                  </td>
                </tr>
              ))}
              {leadsFiltrados.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No hay solicitudes para mostrar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}