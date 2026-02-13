import { useUsersManager } from "../../Hooks/Users/useUsersManager";
import { AppStyles } from "../../Styles/AppStyles";
import { UserDetailView } from "./UserDetailView";

export const UsersManager = () => {
    const {
        usuarios, totalUsuarios, loading,
        busqueda, setBusqueda,
        showAll, setShowAll,
        selectedUser, setSelectedUser
    } = useUsersManager();

    if (selectedUser) {
        return <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} />;
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* CONTROLES SUPERIORES */}
            <div className="bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-cyan-500"></div>
                
                {/* Buscador */}
                <div className="w-full md:flex-1">
                    <div className={AppStyles.searchWrapper}>
                        <div className={`${AppStyles.searchGlow} bg-gradient-to-r from-green-600 to-blue-600`}></div>
                        <input 
                            type="text" 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre, apellido o DNI..." 
                            className={AppStyles.searchInput}
                        />
                    </div>
                </div>

                {/* Switcher y Contador */}
                <div className="flex items-center gap-5 bg-black/30 p-4 rounded-2xl border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">FILTRADO</p>
                        <p className="text-white font-bold text-sm whitespace-nowrap">
                            {showAll ? `Todos (${totalUsuarios})` : 'Top 10'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
            </div>

            {/* GRILLA DE USUARIOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading && usuarios.length === 0 ? (
                    Array(8).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-800/50 rounded-2xl animate-pulse" />)
                ) : (
                    usuarios.map(user => (
                        <div 
                            key={user.id} 
                            onClick={() => setSelectedUser(user)}
                            className="group bg-gray-900/40 hover:bg-gray-800/60 border border-white/5 hover:border-green-500/30 p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
                                {user.fotoPerfil ? <img src={user.fotoPerfil} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{user.nombre[0]}</div>}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-white font-bold truncate group-hover:text-green-400 transition-colors">{user.nombre} {user.apellido}</h4>
                                <p className="text-gray-500 text-xs font-mono">DNI: {user.dni}</p>
                            </div>
                            {/* Badge de Plan Resumen */}
                            <div className={`absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded border ${user.planResumen?.estado === 'Activo' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'}`}>
                                {user.planResumen?.estado}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};