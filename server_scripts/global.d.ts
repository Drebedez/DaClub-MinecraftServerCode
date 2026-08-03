// global.d.ts

interface GlobalLib {
    /**
     * Funcion para asignar instrucciones una vez cargado los scripts.
     * @param func Funcion que se ejecutara una vez cargado los scripts.
     */
    OnLoad?: (func: () => void) => void;

    /**
     * Esta funcion se usa por el ultimo script cargado por Kubejs para cargar elementos
     * una vez todos esten cargados para evitar errores de ejecucion.
     */
    load?: () => void;

    /**
     * Funcion para bloquear posicion y nombre de entidades para cubrir interacciones de vanilla y mods.
     * @param source Aquel o aquello que ejecuto la funcion.
     * @param uuid UUID de cuya entidad se le bloqueara o desbloqueara la posicion y nombre.
     * @param lockState 'true' para bloquear estado, 'false' para desbloquear estado.
     * @returns 1 para declarar exito y 0 para fallo.
     */
    lockNPC?: (source: object, uuid: string, lockState: boolean) => number;

    /**
     * Declarar o eliminar funciones que se ejecutan al detectar un jugador en zona restringida.
     */
    restrictedZoneEvent?: {
        /**
         * Crear evento de zona restringida.
         * @param exec Usa 'create' para crear eventos.
         * @param customID ID personalizado para el evento.
         * @param callback Callback ejecutado cuando la entidad entra en la zona.
         */
        (exec: 'create', customID: string, callback?: (entity: object) => void): void;

        /**
         * Eliminar evento de zona restringida.
         * @param exec Usa 'delete' para eliminar eventos.
         * @param customID ID del evento a eliminar.
         */
        (exec: 'delete', customID: string): void;
    };

    [key: string]: any;
}

/**
 * Variable global de KubeJS compartida entre scripts.
 */
declare var global: {
    lib: GlobalLib;
    [key: string]: any;
};