StartupEvents.registry('block', event => {
    event.create('dark_void')
        .displayName('Vacio Oscuro')
        .hardness(-1)
        .unbreakable();
    event.create('light_void')
        .displayName('Vacio Luminoso')
        .hardness(-1)
        .unbreakable()
        .lightLevel(1);
    event.create('restricted_zone')
        .displayName('Zona Restrinigda')
        .hardness(-1)
        .unbreakable()
        .notSolid()
        .noCollision()
        .renderType("translucent")
        .canBeWaterlogged();
});