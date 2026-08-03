/**
 * Proposito:
 *  Esta fucion a pesar de poder ser aplicada a cualquiera esta deseñada para lockear la posicion y
 *  nombre de los npcs de Easy NPC. Debido a que el mod no esta echo/pensado para cubrir ciertas las
 *  interacciones con otros mods como el cambio de pocision y nombre se decidio hacer esta funcion
 *  echa commando.
 * 
 * Uso:
 *  Para lockear/deslockear NPCs puedes copiar el uuid desde la propia interfaz de edicion de estos
 *  y pegarlo en el siguiente comando.
 *  Ejemplo:
 *      * Lockear entidad:
 *      /EntityLock lock <uuid>
 * 
 *      * Deslockear entidad:
 *      /EntityLock unlock <uuid>
 */

//Forzar tipado de configuracion. (No usar para programar.)
import * as config from '../config/EntityLock_config.json';
/**
 * Exportar configuraciones de script.
 * @type {config}
 * @private
 * @readonly
 */
const ScriptConfig_lock = JsonIO.read("kubejs/config/EntityLock_config.json");

/**
 * Comando para lockear y desloquear entidades.
 */
ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event

    event.register(
        Commands.literal('EntityLock')
            .requires(source => source.hasPermission(2))
            .then(
                Commands.literal('lock')
                    .then(
                        Commands.argument('uuid', Arguments.STRING.create(event))
                            .executes(ctx => {
                                try {
                                    return lockNpc(ctx.source, Arguments.STRING.getResult(ctx, 'uuid'), true)
                                } catch (e) {
                                    console.error('Error en /npclock lock: ' + e)
                                    ctx.source.sendFailure(Text.red('Error interno, revisa la consola.'))
                                    return 0
                                }
                            })
                    )
            )
            .then(
                Commands.literal('unlock')
                    .then(
                        Commands.argument('uuid', Arguments.STRING.create(event))
                            .executes(ctx => {
                                try {
                                    return lockNpc(ctx.source, Arguments.STRING.getResult(ctx, 'uuid'), false)
                                } catch (e) {
                                    console.error('Error en /npclock unlock: ' + e)
                                    ctx.source.sendFailure(Text.red('Error interno, revisa la consola.'))
                                    return 0
                                }
                            })
                    )
            )
    )
})

/**
 * Funcion para bloquear pocision y nombre de entidades para cubrir interacciones de vanilla y mods.
 * Se usa en comando para que operadores y npcs puedan ejecutar.
 * @param {object} source - Aquel o aquello que ejecuto la funcion.
 * @param {string} uuid - UUID de cuya entidad se la bloqueara o desbloqueara la pocision y nombre.
 * @param {boolean} lockState - 'true' para bloquear estado, 'false' para desbloquear estado.
 * @returns {number} - Devuelve 1 para declarar exito y 0 para fallo segun el exito de la ejecucion.
 */
function lockNpc(source, uuid, lockState) {
    //Verificar si una entidad con el uuid entregado existe
    let entity = source.level.getEntities().find(e => e.uuid.toString() === uuid)
    if (!entity) {
        source.sendFailure(Text.red('No se encontró ninguna entidad con ese UUID en esta dimensión.'))
        return 0; //Devolver 0 (error) en comando.
    }

    //Obtener los datos de la entidad.
    let data = entity.persistentData;

    //Bloquear estado de la entidad.
    if (lockState) {
        entity.addTag(ScriptConfig_lock.TAG_LOCK)
        data.putBoolean('locked', true)
        data.putDouble('lockX', entity.x)
        data.putDouble('lockY', entity.y)
        data.putDouble('lockZ', entity.z)
        data.putFloat('lockYaw', entity.yRot)
        data.putFloat('lockPitch', entity.xRot)
        data.putString('lockName', entity.customName ? entity.customName.string : '')
        source.sendSuccess(() => Text.green('NPC bloqueado (posición y nombre).'), true)
    } else { //Desbloquear estado de la entidad.
        data.putBoolean('locked', false)
        entity.removeTag(ScriptConfig_lock.TAG_LOCK)
        source.sendSuccess(() => Text.yellow('NPC desbloqueado.'), true)
    }

    return 1; //Devolver 1 (exito) en comando.
}

/**
 * Devolver a cada entidad lockeada en la pocision correspondiente al igual que su nombre.
 */
ServerEvents.tick(event => {
    const locked = event.server.entities.filterSelector(`@e[tag=${ScriptConfig_lock.TAG_LOCK}]`)

    locked.forEach(entity => {
        const data = entity.persistentData

        if (!data.getBoolean('locked')) return
        if (!data.contains('lockX')) return

        const dx = entity.x - data.getDouble('lockX')
        const dy = entity.y - data.getDouble('lockY')
        const dz = entity.z - data.getDouble('lockZ')

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || Math.abs(dz) > 0.01) {
            entity.teleportTo(data.getDouble('lockX'), data.getDouble('lockY'), data.getDouble('lockZ'))
            entity.yRot = data.getFloat('lockYaw')
            entity.xRot = data.getFloat('lockPitch')
            entity.deltaMovement = [0, 0, 0]
        }

        const lockedName = data.getString('lockName')
        const currentName = entity.customName ? entity.customName.string : ''

        if (currentName !== lockedName) {
            entity.customName = lockedName ? Text.of(lockedName) : null
        }
    })
});

/**
 * Exportar funciones.
 */
global.lib.lockNpc = lockNpc;
