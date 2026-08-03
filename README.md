# DaClub-MinecraftServerCode
Repositorio cuyo contenido incluye contenido agregado, fix de mods y funciones para el servidor de Da Club.
Tiene la configuracion de probejs para la extension de VScode.
<<<<<<< HEAD

Se ejecuta en Minecraft 1.21.1 con NeoForge.

## Readme (Kubejs): (Traducción no oficial)

Encuentra más información en la pagina web: https://kubejs.com/

Directorio informativo:

assets - Actua como un paquete de recursos, puedes colocar cualquier recurso del cliente aqui, como texturas, modelos y otros más.
Ejemplo: assets/kubejs/textures/item/test_item.png
data - Actua como un paquete de datos, puede colocar cualquier recurso de servidor aqui, como tablas de recompensas, funciones y más.
Ejemplo: data/kubejs/loot_tables/blocks/test_block.json

startup-scripts - Codigo que es cargado una vez el juego inicia. - Usado para añadir items y otras cosas que solo pueden pasar cuando el juego carga. (Puede ser recargado usando el comando "/kubejs reload_startup_scripts", pero puede ser que no funcione.)
server_scripts - Codigo que es cargado cuando el servidor (o al entrar a un mundo). - Usado para modificar recetas, etiquetas, tabla de recompensas y manejar eventos de servidor/mundo. (Puede ser recargado usando "/reload".)
client_scripts - Codigo que es cargado cuando los recursos de cliente son cargados. - Usado para eventos de JEI(mod), comentarios de items y otras funciones de lado de el cliente. (Puede ser recargado con f3+t.)

config - Almacenamiento de configuraciones de Kubejs. Este tambien es el unico directorio en donde el codigo puede acceder a otra cosa ademas de el directorio del mundo.
exported - Los volcados de datos, como los atlas de texturas, terminan aquí.

Tu puedes encontrar tipos especificos de registros en el directorio: logs/kubejs
=======
>>>>>>> 423d4275775f3617355ba92b3a05dfc0c9ca6f3e
