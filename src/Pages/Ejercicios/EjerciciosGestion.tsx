import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EjerciciosApi } from '../../API/Ejercicios/EjerciciosApi';
import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';

interface Ejercicio {
    id: number;
    nombre: string;
    urlVideo?: string;
}

export const EjerciciosGestion = () => {
    const navigate = useNavigate();
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edición Inline
    const [editId, setEditId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ nombre: '', urlVideo: '' });

    // Estilos de Inputs para Edición (Más pequeños)
    const editInputClass = "bg-black/50 border border-green-500/50 text-white text-sm p-2 rounded w-full focus:outline-none";

    const fetchEjercicios = async () => {
        try {
            const data = await EjerciciosApi.getAll();
            setEjercicios(data);
        } catch (error) {
            console.error("Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEjercicios();
    }, []);

    // --- LÓGICA CRUD ---
    const handleDelete = async (id: number) => {
        if(!window.confirm("¿Estás seguro de eliminar este ejercicio?")) return;
        try {
            await EjerciciosApi.delete(id);
            setEjercicios(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    const startEdit = (ejercicio: Ejercicio) => {
        setEditId(ejercicio.id);
        setEditForm({ nombre: ejercicio.nombre, urlVideo: ejercicio.urlVideo || '' });
    };

    const saveEdit = async (id: number) => {
        try {
            const actualizado = await EjerciciosApi.update(id, editForm);
            setEjercicios(prev => prev.map(e => (e.id === id ? actualizado : e)));
            setEditId(null);
        } catch (error: any) {
            alert(error.response?.data?.error || "Error al actualizar");
        }
    };

    return (
        <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">
             {/* --- FONDO FIJO --- */}
             <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: `url(${fondoGym})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    filter: 'brightness(0.3) contrast(1.1)'
                }}
            />

            <Navbar />

            <div className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
                <div className="w-full max-w-6xl space-y-6">
                    
                    {/* Header: Título y Botón Crear */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">
                            Gestión <span className="text-green-500">Ejercicios</span>
                        </h2>
                        <button 
                            onClick={() => navigate('/ejercicios/crear')}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-green-900/30 border border-green-500/20 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <span>+</span> Nuevo Ejercicio
                        </button>
                    </div>

                    {/* Tarjeta Tabla */}
                    <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl overflow-hidden relative">
                        {/* Decoración */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-green-500/50"></div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/40 text-gray-400 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="p-5 border-b border-white/10">Nombre</th>
                                        <th className="p-5 border-b border-white/10">Video URL</th>
                                        <th className="p-5 border-b border-white/10 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">Cargando catálogo...</td></tr>
                                    ) : ejercicios.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400">No hay ejercicios registrados.</td></tr>
                                    ) : (
                                        ejercicios.map((ej) => {
                                            const isEditing = editId === ej.id;
                                            return (
                                                <tr key={ej.id} className="hover:bg-white/5 transition-colors group">
                                                    
                                                    {/* NOMBRE */}
                                                    <td className="p-5 font-medium text-white">
                                                        {isEditing ? (
                                                            <input 
                                                                className={editInputClass}
                                                                value={editForm.nombre}
                                                                onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="text-lg">{ej.nombre}</span>
                                                        )}
                                                    </td>

                                                    {/* VIDEO */}
                                                    <td className="p-5">
                                                        {isEditing ? (
                                                            <input 
                                                                className={editInputClass}
                                                                value={editForm.urlVideo}
                                                                onChange={(e) => setEditForm({...editForm, urlVideo: e.target.value})}
                                                                placeholder="URL del video"
                                                            />
                                                        ) : (
                                                            ej.urlVideo ? (
                                                                <a href={ej.urlVideo} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-full w-fit border border-blue-500/20 transition-all hover:bg-blue-500/20">
                                                                    📺 Ver Video
                                                                </a>
                                                            ) : <span className="text-gray-600 text-sm italic">Sin video</span>
                                                        )}
                                                    </td>

                                                    {/* ACCIONES */}
                                                    <td className="p-5 text-right space-x-2">
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => saveEdit(ej.id)} className="bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white px-3 py-1 rounded-lg text-sm border border-green-500/30 transition-all">Guardar</button>
                                                                <button onClick={() => setEditId(null)} className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1 rounded-lg text-sm transition-all">Cancelar</button>
                                                            </>
                                                        ) : (
                                                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => startEdit(ej)}
                                                                    className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-500/20 transition-all"
                                                                    title="Editar"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(ej.id)}
                                                                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                                                                    title="Eliminar"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};