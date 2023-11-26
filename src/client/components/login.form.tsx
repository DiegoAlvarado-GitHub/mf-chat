import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  RoomNameSchema,
  UserNameSchema,
  RoomNameSchemaRegex,
} from '../../shared/schemas/chat.schema';
import { generateUserId, setUser } from '../lib/user';
import { User } from '../../shared/interfaces/chat.interface';

//FUNCION QUE ESCUCHA EL MENSAJE DE LA APP PRINCIPAL
window.addEventListener("message", event => {
  if (event.origin === 'http://localhost:9001') {
    console.log("Mensaje recibido en el microfrontend:", event.data.name, event.data.room);
    // Manejo de mensajes recibidos desde la app principal
  }

  //PARA PODER SETEAR EL NOMBRE DE USUARIO
  const newUser = {
    userId: generateUserId(event.data.name),
    userName: event.data.name,
  };

  setUser(newUser);
  ///////////
  //sessionStorage.removeItem('room');


});

const formSchema = z.object({
  userName: UserNameSchema,
  roomName: RoomNameSchema.or(z.string().length(0))
    .optional()
    .transform((name) => (name === '' ? undefined : name)),
});

export type LoginFormInputs = z.infer<typeof formSchema>;

export const LoginForm = (
  {

    onSubmitSecondary,
    disableNewRoom,
    defaultUser,

  }: {
    onSubmitSecondary: (data: LoginFormInputs) => void;
    disableNewRoom: boolean;
    defaultUser?: User['userName'];
  }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormInputs) => {
    const newUser = {
      userId: generateUserId(data.userName),
      userName: data.userName,
    };
    setUser(newUser);
    onSubmitSecondary(data);
  };

  return (
    <div className="h-full w-full py-2 md:px-2 md:py-0">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
      >
       
        {/* INPUT nombre de usuario */}
        <input
          type="text"
          id="login"
          placeholder="Nombre de usuario"
          defaultValue={defaultUser && defaultUser}
          required={true}
          minLength={UserNameSchema.minLength ?? undefined}
          maxLength={UserNameSchema.maxLength ?? undefined}
          {...register('userName')}
          className="h-12 rounded-md border border-slate-400 bg-gray-fondo3 text-white placeholder-slate-400 invalid:text-pink-600 invalid:ring-pink-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:invalid:border-pink-600 focus:invalid:ring-pink-600 active:invalid:border-pink-600"
        ></input>
        <p className="py-1 text-sm text-pink-600">{errors.userName?.message}</p>

        {/* INPUT nombre de la sala */}
        <input
          type="text"
          id="room"
          required={!disableNewRoom}
          disabled={disableNewRoom}
          minLength={RoomNameSchema?.minLength ?? undefined}
          maxLength={RoomNameSchema?.maxLength ?? undefined}
          pattern={RoomNameSchemaRegex.source.toString()}
          placeholder="Nombre de la sala"
          {...register('roomName')}
          className="h-12 rounded-md border border-slate-400 bg-gray-fondo3 text-white placeholder-slate-400 invalid:text-pink-600 invalid:ring-pink-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:invalid:border-pink-600 focus:invalid:ring-pink-600 disabled:opacity-50"
        ></input>
        <p className="py-1 text-sm text-pink-600">{errors.roomName?.message}</p>


        {/* BOTON unirse a la sala de chat */}
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-md bg-gray-fondo4 text-white"
        >
          Unirse
        </button>
      </form>
    </div>
  );
};
