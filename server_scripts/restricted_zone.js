/**
 * 
 */

//Forzar tipado de configuracion. (No usar para programar.)
import * as config from '../config/restricted_zone_config.json';
/**
 * Exportar configuraciones de script.
 * @type {config}
 * @private
 * @readonly
 */
const ScriptConfig_rz = JsonIO.read("kubejs/config/restricted_zone_config.json");

/**
 * Lista de funciones de zona restringida.
 * @type {object}
 * @private
 */
const restrictedZoneEventsList = [];

/**
 * Declarar o eliminar funciones que se ejecutan al momento de detectar un jugador en un bloque de zona restringida.
 * 
 * @overload //Crear
 * @param {'create'} exec - Usa 'create' para crear eventos de zonas restringidas.
 * @param {string} customID - Crea un ID customizado para el nuevo evento.
 * @param {callback: function(RaidEditObject)} callback - Introduce un callback al momento de crear.
 * @returns {void}
 * @throws {Error} Tirara error si se intenta crear un eveneto con una id ya existente.
 * 
 * @example //Contexto: (Crear evento para advertir que llego a una zona restringida.)
 * restrictedZoneEvent('create', 'raidRestrict', entity => {
 *      if(entity.isPlayer())
 *          entity.tell("Zona rentringida!");
 * });
 * 
 * @overload //Eliminar
 * @param {'delete'} exec - Usa 'delete' para eliminar un evento de zona restringida.
 * @param {string} customID - Introduce un ID uno ya existente.
 * @returns {void}
 * 
 * @example //Contexto: (Eliminar evento de una zona al completar una mision.)
 * restrictedZoneEvent('delete', 'tempRestiction');
 */
function restrictedZoneEvent(exec, customID, callback){

    if(!customID) throw Error(ScriptConfig_rz.ERROR.CUSTOMID_NOT_EXIST);

    switch(exec){
        case ScriptConfig_rz.CREATE_EVENT_KEY:
            if(typeof callback != 'function')
                throw Error(ScriptConfig_rz.ERROR.CALLBACK);
    
            if(restrictedZoneEventsList.find(x=>x.customID==customID))
                throw Error(ScriptConfig_rz.ERROR.CUSTOMID_EXIST);

            restrictedZoneEventsList.push({
                customID:customID,
                callback:callback
            });
        break;
        case ScriptConfig_rz.DELETE_EVENT_KEY:
            restrictedZoneEventsList = restrictedZoneEventsList.filter(x=>x.customID!=customID);
        break;
        default:
            throw Error(ScriptConfig_rz.ERROR.TYPE_EXECUTION)
    }

}

/**
 * Ver por cada tick del juego si una entidad o jugador esta en un bloque de zona restringida.
 */
ServerEvents.tick(event => {
    event.server.levels.forEach(level => {
        level.entities.forEach(entity => {
            if(
                entity.block.id == ScriptConfig_rz.RESTRICTED_ZONE_BLOCK ||
                entity.eyeBlock == ScriptConfig_rz.RESTRICTED_ZONE_BLOCK
            )
            restrictedZoneEventsList.forEach(x=>x(entity));
        });
    });
});

/**
 * Exportar funciones.
 */
global.lib.restrictedZoneEvent = restrictedZoneEvent;