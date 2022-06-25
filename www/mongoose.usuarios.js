const { Schema, model } = require('mongoose')
const usuarioSchema = new Schema({
    _id: { type: String },
    e_mail: { type: String },
    clave: { type: String },
    app: { type: String },
    version: { type: String },
    app_id: { type: String },
    arquitectura: { type: String },
    CPU: { type: String },
    memoriaRAM: { type: Number },
    nombreHost: { type: String },
    plataforma: { type: String },
    tipo: { type: String },
    modificado: { type: Number },
    caduca: { type: Number }
})

module.exports = model('usuario', usuarioSchema)