/**
 * Registrar bloques custom cuyo proposito principal sea el de construccion.
 */
StartupEvents.registry('block', event => {
    /**
     * Bloque para crear zonas de vacio absoluto.
     * Ejemplos:
     * - Vacio.
     * - Zonas de orcuridad absoluta.
     */
    event.create('dark_void')
        .displayName('Vacio Oscuro')
        .hardness(-1)
        .unbreakable();
    /**
     * Bloque para crear zonas de luz absolutas.
     * Ejemplos:
     * - Luz exterior.
     * - Fuente de luz fuerte y cegadora.
     */
    event.create('light_void')
        .displayName('Vacio Luminoso')
        .hardness(-1)
        .unbreakable()
        .lightLevel(1);
    /**
     * Bloque fundamental de las funciones de zona restringida.
     * Ejemplos:
     * - Crear en las estructuras de raids una area cuadrada perfecta para solucionar las
     *      complicaciones de calculo de area restringida.
     * - Crear en las estructuras de raids un area de prevencion para evitar que los jugadores
     *      no esten en zonas que no deben.
     */
    event.create('restricted_zone')
        .displayName('Zona Restrinigda')
        .hardness(-1)
        .unbreakable()
        .notSolid()
        .noCollision()
        .renderType("translucent")
        .canBeWaterlogged();
});