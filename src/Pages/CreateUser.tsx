import { useCreateUser } from "../Hooks/CreateUser/useCreateUser";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const CreateUser = () => {
  const { formData, isAdmin, handleChange, handleSubmit, handleCancel } = useCreateUser();

  return (
    <PageLayout>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Card title="Registrar Nuevo Usuario">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
              <Input label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
              <Input label="Usuario" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange}/>
              <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
              <Input label="Contraseña" type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} />
              
              <Input as="select" label="Rol" name="rol" value={formData.rol} onChange={handleChange} disabled={!isAdmin}>
                <option value="Alumno">Alumno</option>
                {isAdmin && <option value="Entrenador">Entrenador</option>}
              </Input>
            </div>
            
            {!isAdmin && <p className="text-xs text-gray-400 mt-2">Como Entrenador solo puedes crear Alumnos.</p>}

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleSubmit}>CREAR USUARIO</Button>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};