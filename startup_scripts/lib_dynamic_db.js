// declarar el "lib" si no existe
if (global.lib == undefined) global.lib = {}

function dynamicJson(dir) {
    this.dir = dir
    this.db = JsonIO.read(dir)
}

// getter
dynamicJson.prototype.get = function() {
    return this.db
}

// setter
dynamicJson.prototype.write = function(varName, val) {
    if (typeof varName != 'string')
        throw Error("No se recibio una direccion valida de variable.")

    let getVarDir = varName.replace(/\[/g, ".")
    getVarDir = getVarDir.replace(/\]/g, "")
    getVarDir = getVarDir.split(".")
    let targetObj = this.db

    for (let i = 0; i < getVarDir.length - 1; i++) {
        targetObj = targetObj[getVarDir[i]]
    }

    targetObj[getVarDir[getVarDir.length - 1]] = val

    JsonIO.write(this.dir, this.db)
}

// Exportar globalmente.
global.lib.dynamicJson = dynamicJson