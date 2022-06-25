const { dialog } = require('electron').remote
const { ipcRenderer, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const { Console } = require('console')
const { setInterval } = require('timers')
const index = require('electron').remote.require('./main')

var OB = new Object();
var fecha_select = new Array(0, 0, 1, 0, 0, 0);
var accion_menu_principal = new Array();
var idioma_dif = true;
var sonando = false;
var seccion_sel = 0;
var grados = 360 / 12;
//-----------------------------------------------
function elige_sonido(Ob, i) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'audio', extensions: ['mp3', 'wav', 'ogg'] }, { name: 'Todos los ficheros', extensions: ['*'] }]
    }).then(result => {
        //console.log(result.canceled)
        //console.log(result.filePaths)
        let f = result.filePaths.toString()
        if (f == '') return false
        Ob.nextSibling.nextSibling.innerHTML = nombre_fich(f)
        establece_sonido(i, url_fich(f))
    }).catch(err => {
        console.log(err)
    })
}
function nombre_fich(tx) {
    let ar = tx.split('\\')
    return ar[ar.length - 1]
}
function url_fich(tx) {
    let ar = tx.replace(/\\/g, '/')
    return 'file://' + ar
}
const alerta = (tx, cancel, funcSi, funcNo) => {
    OB.BNO.style.display = (cancel) ? 'fixed' : 'none'
    OB.alertas.style.display = "block"
    OB.BSI.addEventListener('click', (e) => {
        OB.alertas.style.display = 'none'
        if (funcSi) funcSi()
    })
    OB.BNO.addEventListener('click', (e) => {
        OB.alertas.style.display = 'none'
        if (funcNo) funcNo()
    })
    OB.BSI.innerHTML = DATOS.creacion.formulario[0]
    OB.BNO.innerHTML = DATOS.creacion.formulario[1]
    OB.txt_alertas.innerHTML = tx
}
const formateaTS = t => {
    var tm = new Date(Number(t))
    let tmp = ((tm.getMinutes() < 10) ? '0' + tm.getMinutes() : tm.getMinutes()) + ' : '
    tmp += ((tm.getSeconds() < 10) ? '0' + tm.getSeconds() : tm.getSeconds())
    return tmp

}
//-----------------------------------------------
const reproduce = url_son => {
    let t = nombre_fich(url_son).split('.')
    OB.spectro.style.display = 'block'
    Spectrum.load(url_son);
    sonando = true
}
const indexdia = (i) => {
    if (i == 0) { return 6 } else { return (i - 1) }
}
const alarma = () => {
    let tmp, tmpa, tmpf
    if (!sonando & CONFIG.activacion_info_sel == 11) {
        for (let i in CONFIG.dias) {
            if (CONFIG.dias[i][0] == fhoy.getTime()) {
                especial = true
                for (let j in CONFIG.dias[i][1]) {
                    if (CONFIG.dias[i][1][j] == 1) {
                        tmp = new Date(fecha[0], fecha[1], fecha[2], CONFIG.horarios[j][0], CONFIG.horarios[j][1], 0, 0).getTime();
                        tmpa = new Date().getTime();
                        tmpf = tmp + 1111
                        if (tmpa > tmp && tmpa < tmpf) {
                            reproduce(CONFIG.horarios[j][2])
                            break
                        }
                    }
                }
                return false
            }
        }
        for (let i in CONFIG.periodos) {
            if (CONFIG.periodos[i][0] <= fhoy.getTime() & CONFIG.periodos[i][1] >= fhoy.getTime()) {
                if (CONFIG.periodos[i][3][indexdia(fhoy.getDay())] == 1) {
                    for (let j in CONFIG.periodos[i][2]) {
                        if (CONFIG.periodos[i][2][j] == 1) {
                            tmp = new Date(fecha[0], fecha[1], fecha[2], CONFIG.horarios[j][0], CONFIG.horarios[j][1], 0, 0).getTime();
                            tmpa = new Date().getTime();
                            tmpf = tmp + 1111
                            if (tmpa > tmp && tmpa < tmpf) {
                                reproduce(CONFIG.horarios[j][2])
                                break
                            }
                        }
                    }
                }
                return false
            }
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const establece_instante = () => {
    ahora = new Date();
    fecha = new Array(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), ahora.getHours(), ahora.getMinutes(), ahora.getSeconds(), 0);
    fhoy = new Date(fecha[0], fecha[1], fecha[2], 0, 0, 0, 0);
}
function comprueba_dia(tm) {
    var tmshoy = fhoy.getTime(tm);
    var S = '<table id="informacion_dia">';
    for (var i in CONFIG.dias) {
        if (tmshoy == CONFIG.dias[i][0]) {
            S += pinta_tipodia(i, CONFIG.dias, 1, 2);
            S += pinta_horarios(i, CONFIG.dias, 1, 2) + '</table>';
            return S;
        }
    }
    for (var i in CONFIG.periodos) {
        if (tmshoy >= CONFIG.periodos[i][0] && tmshoy <= CONFIG.periodos[i][1]) {
            var dia_sem = ahora.getDay();
            dia_sem = (dia_sem == 0) ? 6 : dia_sem - 1
            if (CONFIG.periodos[i][3][dia_sem] == 1) {
                S += pinta_tipodia(i, CONFIG.periodos, 2, 4);
                S += pinta_horarios(i, CONFIG.periodos, 2, 4) + '</table>';
                return S;
            }
        }
    }
    return DATOS.creacion.no_eventos;
}
function pinta_horarios(i, a, n, m) {
    var S = '';
    for (var j in a[i][n]) {
        if (a[i][n][j] == 1) {
            S += '<tr><td><div>H' + (Number(j) + 1) + '</div></td><td>' + rellena(CONFIG.horarios[j][0]) + ':' + rellena(CONFIG.horarios[j][1]);
            let nonfich = CONFIG.horarios[j][2].split('/')
            S += '</td><td><div>' + nonfich[nonfich.length - 1] + '</div></td></tr>';
        }
    }
    return S;
}
function pinta_tipodia(i, a, n, m) {
    var S = '<tr><td><div style="background-color:' + CONFIG.colores[CONFIG.estilo_sel][a[i][m]] + '"></div></td>';
    S += '<td colspan="2">' + CONFIG.descripciones[a[i][m]] + '</td></tr>';

    return S;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function rellena(s) {
    if (String(s).length == 1)
        return '0' + String(s);
    else
        return s;
}
function guarda_config() {
    localStorage.setItem('TIMERTIMESconfig', JSON.stringify(CONFIG))
}
function guarda_identidad() {
    localStorage.setItem('TIMERTIMESidentidad', JSON.stringify(IDENT))
}
const elimina_datos = () => {
    alerta(DATOS.creacion.formulario[9] + DATOS.creacion.formulario[10], true, () => {
        localStorage.removeItem('TIMERTIMESconfig')
        localStorage.removeItem('TIMERTIMESidentidad')
        location.reload()
    })
    return false
    localStorage.removeItem('TIMERTIMESconfig')
    localStorage.removeItem('TIMERTIMESidentidad')
    location.reload()
}
//ACCIONES//////////////////////////////////////////////////////////////////////////////////////////////
const contrasena = ob => {
    let el = document.getElementById(ob)
    if (el.getAttribute("data-visible") == "0") {
        el.setAttribute("type", "text")
        el.setAttribute("data-visible", "1")
        setTimeout(() => { contrasena(ob) }, 10000)
    } else {
        el.setAttribute("type", "password")
        el.setAttribute("data-visible", "0")
    }
}
accion_menu_principal[0] = function () {
    if (establece_seccion(0)) {
        let AC = `<div><h2>${DATOS.creacion.formulario[2]}</h2><br>${DATOS.creacion.formulario[3]}<br>`
        AC += `<input type="password" data-visible="0" id="mail" value="${IDENT.e_mail}">`
        AC += `<img src="img/ver.png" onclick="contrasena(\'mail\')">`
        AC += `<br>${DATOS.creacion.formulario[4]}<br>`
        AC += `<input type="password" data-visible="0" id="clave" value="${IDENT.clave}">`
        AC += `<img src="img/ver.png" onclick="contrasena(\'clave\')">`
        AC += `<button  onclick="elimina_datos()">`
        AC += `${DATOS.creacion.formulario[6]}</button>`
        AC += `<div id="activacion">${txt_activacion()}<div`


        //////////////////////////////////
        OB.editor.style.left = '-420px';
        salida_contenido('<div id="descripcion">' + DATOS.descripcion + AC + '</div>');
    }
}
const txt_activacion = () => { return DATOS.creacion.formulario[CONFIG.activacion_info_sel] }
accion_menu_principal[1] = function () {
    if (establece_seccion(1)) {
        OB.editor.style.left = '-420px';
        salida_contenido('<div id="creacion"><div id="horarios">' + crea_menu_horarios() + '</div></div>');
    }
}
accion_menu_principal[2] = function () {
    if (establece_seccion(2)) {
        OB.editor.style.left = '-420px';
        salida_contenido('<div id="creacion"><div id="dia">' + crea_menu_dia() + '</div></div>');
    }
}
accion_menu_principal[3] = function () {
    if (establece_seccion(3))
        salida_contenido('<div id="creacion"><div id="anios">' + crea_menu_anual() + '</div></div>');
}
///////////////////////////////////////////////////////////////////////////////////////////
// H O R A R I O S   -----------------------------------------------------------
function crea_menu_horarios() {
    var sel, ult;
    var S = '<h3>' + DATOS.creacion.horarios + '<div onclick="anade_horario()">+</div></h3>';
    S += '<table>';
    for (var i in CONFIG.horarios) {
        S += '<tr><td>' + (Number(i) + 1) + '</td><td><select onchange="establece_hora(' + i + ',this.value)">';
        for (var j = 0; j < 24; j++) {
            sel = (CONFIG.horarios[i][0] == j) ? ' selected ' : '';
            S += '<option' + sel + '>' + ((j < 10) ? '0' + j : j) + '</option>';
        }
        S += '</select> : <select onchange="establece_minuto(' + i + ',this.value)">';
        for (var j = 0; j < 60; j++) {
            sel = (CONFIG.horarios[i][1] == j) ? ' selected ' : '';
            S += '<option' + sel + '>' + ((j < 10) ? '0' + j : j) + '</option>';
        }
        S += '</select></td>';

        S += '<td data-title="' + CONFIG.horarios[i][2] + '"><button onclick="elige_sonido(this,' + i + ')">Sonido</button>';
        S += '<button onclick="reproduce(\'' + CONFIG.horarios[i][2] + '\')">▶</button>';
        let nonfich = CONFIG.horarios[i][2].split('/')
        S += '<span>' + nonfich[nonfich.length - 1] + '</span></td>';

        S += (i > 0) ? '<td><div onclick="elimina_horario(' + i + ')">+</div></td>' : '<td style="width:17px"></td>';
        S += '</tr>';
    }
    S += '</table>';
    return S;
}
function establece_hora(i, v) {
    CONFIG.horarios[i][0] = Number(v);
    guarda_config();
}
function establece_minuto(i, v) {
    CONFIG.horarios[i][1] = Number(v);
    guarda_config();
}
function establece_sonido(i, u) {
    CONFIG.horarios[i][2] = u
    guarda_config();
    salida_contenido('<div id="creacion"><div id="horarios">' + crea_menu_horarios() + '</div></div>');
}
function elimina_horario(i) {
    dialog.showMessageBox({
        "title": "timer-times",
        "buttons": ['Eliminar', 'NO eliminar'],
        "cancelId": 2,
        "message": '¿ ' + DATOS.creacion.eliminar + ' ' + (i + 1) + ' ?',
        "noLink": true,
        "type": "warning"
    }).then(result => {
        if (result.response === 0) {
            OB.editor.style.left = '-420px';
            CONFIG.horarios.splice(i, 1);
            guarda_config();
            document.getElementById('horarios').innerHTML = crea_menu_horarios();
        }
    }).catch(err => {
        console.log(err)
    })
}
// D I A S +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function crea_menu_dia() {
    var S = '<h3>' + DATOS.creacion.dia_s[0] + '</h3>'
    S += '<table><tr><th>' + DATOS.creacion.dia_s[1] + '</th><th>' + DATOS.creacion.dia_s[2] + '</th></tr>'
    for (var i in CONFIG.colores[CONFIG.estilo_sel]) {
        S += '<tr><td style="background-color:' + CONFIG.colores[CONFIG.estilo_sel][i] + '"></td>'
        S += '<td><input type="text"  placeholder="' + DATOS.creacion.dia_s[3] + '" value="' + CONFIG.descripciones[i] + '" '
        S += ' onchange="establece_dia(' + i + ',this.value)">'

        S += '</tr>'
    }
    S += '</table>'
    return S
}
function establece_dia(i, v) {
    CONFIG.descripciones[i] = v;
    guarda_config();
}
// C A L E N D A R I O  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function crea_menu_anual() {
    var sel;
    var S = '<h3>' + DATOS.creacion.anio + '</h3><select onchange="establece_anio(this.value)">';
    for (var i = 0; i < 5; i++) {
        sel = ((fecha[0] + i) == fecha_select[0]) ? ' selected ' : '';
        S += '<option' + sel + '>' + (fecha[0] + i) + '</option>';
    }
    S += '</select><br/>';
    var dia, tmpf, vdia, finde, k, acci, hoy, color, estilo, id;
    for (var i in DATOS.creacion.meses) {
        fecha_select[1] = i;
        fecha_select[2] = 1;
        S += '<table><caption>' + DATOS.creacion.meses[i] + '</caption><tr>';
        for (var j in DATOS.creacion.dias) {              //Dias de la semana
            S += '<td>' + DATOS.creacion.dias[j].substr(0, 2) + '</td>';
        }
        S += '</tr>';
        for (var sem = 0; sem < 6; sem++) {             // Mes
            S += '<tr>';
            for (var di = 1; di < 8; di++) {            // Semana
                k = (di == 7) ? 0 : di;
                tmpf = new Date(fecha_select[0], fecha_select[1], fecha_select[2], 0, 0, 0, 0);
                vdia = '&nbsp;';
                acci = '';
                id = '';
                hoy = '';
                color = '';
                if (k == tmpf.getDay() && tmpf.getMonth() == i) {
                    vdia = tmpf.getDate();
                    acci = ' onclick="abre_editor(' + tmpf.getTime() + ')" ';
                    id = ' id="' + tmpf.getTime() + '"';
                    hoy = (tmpf.getTime() == fhoy.getTime()) ? ' class="hoy" ' : '';
                    color = (color_dia(tmpf.getTime()) != false) ? 'background-color:' + color_dia(tmpf.getTime()) : '';

                    fecha_select[2]++;
                }
                finde = (k == 0 || k == 6) ? 'font-weight:bolder;' : '';
                estilo = ((finde + color) != '') ? ' style="' + finde + color + '"' : '';

                S += '<td' + estilo + hoy + acci + id + '>' + vdia + '</td>';
                tmpf = 0;
            }
            S += '</tr>';
        }
        S += '</table>';
    }
    return S;
}
function color_dia(tm) {
    for (var j in CONFIG.dias) {
        if (CONFIG.dias[j][0] == tm) { return CONFIG.colores[CONFIG.estilo_sel][CONFIG.dias[j][2]]; break; }
    }
    var t = new Date(tm).getDay();
    var i;
    for (var j in CONFIG.periodos) {
        if (tm >= CONFIG.periodos[j][0] && tm <= CONFIG.periodos[j][1]) {
            i = (t == 0) ? 6 : (t - 1);
            if (CONFIG.periodos[j][3][i] == 1) { return CONFIG.colores[CONFIG.estilo_sel][CONFIG.periodos[j][4]]; } else { return 'transparent'; }
        } else if (tm == CONFIG.periodos[j][0] && 0 == CONFIG.periodos[j][1]) {
            return CONFIG.colores[CONFIG.estilo_sel][CONFIG.periodos[j][4]] + ';outline:2px solid #f00';
        }
    }
    return false;
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function abre_editor(tm) {
    var bloqueado, marcado, formulario;
    var S = '<div onclick="cierra_editor()">+</div>';
    S += dia_diasem_mes_anio(tm);
    var estado = estado_dia(tm);
    //console.log(estado);
    bloqueado = [1, 1, 0]; marcado = [0, 0, 0]; formulario = [0, 0, 0];
    if (estado[2] != -1) {                      //Pertenece a un periodo inacavado
        if (estado[2] == -2) {                 //Es anterior a un periodo inacavado
            //bloqueado = [1,1,0]; marcado = [0,0,0];
        } else {                                 //Es posterior al periodo inacavado
            if (estado[1][1] == 1) {            //Es el inicio delperiodo inacabado
                bloqueado = [0, 1, 1]; marcado = [1, 0, 0]; formulario = [1, 0, 0];
            } else {                             //Es posterior al periodo inacavado
                bloqueado = [1, 0, 1]; //marcado = [0,0,0];
            }
        }
    } else {                                      //No existen periodos inacavados
        if (estado[0] == 1) {                   //Es especial
            bloqueado = [1, 1, 0]; marcado = [0, 0, 1]; formulario = [0, 0, 1];
        } else {
            if (estado[1][0] > -1) {             //Pertenece a un periodo
                if (estado[1][1] == 1) {         //Es inicio de periodo
                    bloqueado = [0, 1, 1]; marcado = [1, 0, 0]; formulario = [1, 0, 0];
                } else {
                    if (estado[1][2] == 1) {     //Es final
                        bloqueado = [1, 1, 1]; marcado = [0, 1, 0];
                    }
                }
            } else {                             //No esta dentro de un periodo
                bloqueado = [0, 1, 0];// marcado = [0,0,0];
            }
        }
    }
    S += crea_menu(marcado, bloqueado, formulario, tm);
    OB.editor.innerHTML = S;
    OB.editor.style.left = '0px';
}
function dia_diasem_mes_anio(tm) {
    var este = new Date(tm);
    var dt = (este.getDay() == 0) ? 6 : (este.getDay() - 1);
    return ('<div id="fecha_texto"><div>' + este.getDate() + '</div><div>' + DATOS.creacion.meses[este.getMonth()] + '<span>' + este.getFullYear() + '</span></div><div>' + DATOS.creacion.dias[dt] + '</div></div>');
}
function cierra_editor() {
    OB.editor.style.left = '-420px';
    document.getElementById('anios').innerHTML = crea_menu_anual();
}
function estado_dia(tm) {
    var especial = 0;           //0 si normal(No existe), 1 si especial
    var periodo = [-1, 0, 0];     //[(index del periodo al que pertenece, -1 si fuera de cualquier periodo), si es ini 0/1, si es fin 0/1 ]
    var inacabado = -1;           // index del periodo al que pertenece, -1 si no hay ningun inacavado, -2 si es anterior al inicio delperiodo
    for (var i in CONFIG.dias) {
        if (tm == CONFIG.dias[i][0]) { especial = 1; break; }
    }
    for (var i in CONFIG.periodos) {
        if (CONFIG.periodos[i][1] == 0) {
            inacabado = i;
            break;
        }
    }
    for (var i in CONFIG.periodos) {
        if ((tm >= CONFIG.periodos[i][0] && tm <= CONFIG.periodos[i][1])
            || (tm >= CONFIG.periodos[i][0] && 0 == CONFIG.periodos[i][1])) {
            periodo[0] = i;
            periodo[1] = (CONFIG.periodos[i][0] == tm) ? 1 : 0;
            periodo[2] = (CONFIG.periodos[i][1] == tm) ? 1 : 0;
        }
    }
    inacabado = (inacabado > -1 && CONFIG.periodos[inacabado][0] > tm) ? -2 : inacabado;
    //console.log('estado_dia : '+[especial,periodo,inacabado]);
    return [especial, periodo, inacabado];
}
///FUNCIONES MENU DIA/////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ACCION = [[[]], [[]], [[]]];
ACCION[0][0][0] = function (tm, i) {
    abre_editor_menu(tm, i);
}
ACCION[0][0][1] = function (tm, i) {
    for (var j in CONFIG.periodos) {
        if (CONFIG.periodos[j][0] == tm) {
            CONFIG.periodos.splice(j, 1);
            guarda_config();
            break;
        }
    }
    cierra_editor();
}
ACCION[1][0][0] = function (tm, i) {
    for (var i in CONFIG.periodos) {
        if (CONFIG.periodos[i][1] == 0) {
            CONFIG.periodos[i][1] = tm;
            guarda_config();
            break;
        }
    }
    //console.log('CONFIG.periodos : '+CONFIG.periodos);
    cierra_editor();
}
ACCION[2][0][0] = function (tm, i) {
    abre_editor_menu(tm, i);
}
ACCION[2][0][1] = function (tm, i) {
    for (var j in CONFIG.dias) {
        if (CONFIG.dias[j][0] == tm) {
            CONFIG.dias.splice(j, 1);
            guarda_config();
            break;
        }
    }
    cierra_editor();
}
function crea_dia(tm) {
    var i = CONFIG.dias.length;
    for (var j in CONFIG.dias) {
        if (tm == CONFIG.dias[j][0]) { i = j; break; }
    }
    CONFIG.dias[i] = [tm, establece_horarios('D'), CONFIG.color_sel];
    guarda_config();
    //console.log('CONFIG.dias : '+CONFIG.dias);
    cierra_editor();
}
function crea_periodo(tm, f) {
    var fin = (f) ? f : 0;
    var hor = establece_horarios('P');
    var sem = establece_semana();
    var val = false;
    for (var i in hor) { if (hor[i] == 1) { val = true; break; } } if (!val) { alerta(DATOS.creacion.errores[0], false); return false; } val = false;
    for (var i in sem) { if (sem[i] == 1) { val = true; break; } } if (!val) { alerta(DATOS.creacion.errores[1], false); return false; }
    var i = CONFIG.periodos.length;
    for (var j in CONFIG.periodos) {
        if (tm == CONFIG.periodos[j][0]) { i = j; break; }
    }
    if (CONFIG.periodos[i]) {
        fin = CONFIG.periodos[i][1];
    }
    CONFIG.periodos[i] = [tm, fin, hor, sem, CONFIG.color_sel];
    guarda_config();

    cierra_editor();
}
function establece_horarios(Lid) {
    var a = []; var tmp;
    for (var i = 0; i < CONFIG.horarios.length; i++) {
        tmp = document.getElementById("H" + Lid + i).checked;
        a[i] = (tmp != false) ? 1 : 0;
    }
    return a;
}
function establece_semana() {
    var a = []; var tmp;
    for (var i = 0; i < 7; i++) {
        tmp = document.getElementById("S" + i).checked;
        a[i] = (tmp != false) ? 1 : 0;
    }
    return a;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function abre_editor_menu(tm, i) {
    for (var j in DATOS.creacion.menu_dia) {
        document.getElementById("M" + j).firstChild.setAttribute('disabled', true);
    }
    var ob = document.getElementById("M" + i);
    ob.parentNode.nextSibling.firstChild.firstChild.style.height = "160px";
}
function crea_menu(m, b, f, tm) {
    //console.log('f : '+f);
    var marcado = ['', ' checked '];
    var bloqueado = ['', ' disabled '];
    var submenu = [crea_submenu_formulario(tm, 0, true), '', crea_submenu_formulario(tm, 2, false)];//
    var S = '<table>';
    for (var i in DATOS.creacion.menu_dia) {
        S += '<tr><td id="M' + i + '"><input type="checkbox"' + marcado[m[i]] + bloqueado[b[i]];
        S += ' onclick="ACCION[' + i + '][' + b[i] + '][' + m[i] + '](' + tm + ',' + i + ')"/></td><td>' + DATOS.creacion.menu_dia[i] + '</td></tr>';
        S += '<tr><td colspan="2"><div>' + submenu[i] + '</div></td></td></tr>';
        if (f[i] == 1) {
            var sel = i; setTimeout(function () {
                document.getElementById("M" + sel).parentNode.nextSibling.firstChild.firstChild.style.height = "160px";
            }, 100);
        }
    }
    S += '</table>';
    return S;
}
function crea_submenu_formulario(tm, i, periodo) {
    var accion = (periodo) ? 'crea_periodo(' + tm + ')' : 'crea_dia(' + tm + ')';
    var S = '<table><tr><td>';
    S += crea_selector_horarios(tm, periodo);
    S += '</td><td>';
    if (periodo) {
        S += crea_selector_semanal(tm);
        S += '</td><td>';
    }
    S += crea_selector_colores(tm, periodo);
    S += (periodo) ? '</td></tr></table>' : '</td><td style="width:0;border:none"></td></tr></table>';
    S += '<button onclick="' + accion + '">' + DATOS.creacion.formulario[0] + '</button>&nbsp;';
    S += '<button onclick="cierra_editor()">' + DATOS.creacion.formulario[1] + '</button>';
    return S;
}
function crea_selector_horarios(tm, periodo) {
    var Lid = (periodo) ? 'P' : 'D';
    var datos = [];
    for (var i in CONFIG.horarios) { datos[i] = 0; }
    var marca = ['', ' checked '];
    if (periodo) {
        for (var i in CONFIG.periodos) { if (CONFIG.periodos[i][0] == tm) { datos = CONFIG.periodos[i][2]; break; } }
    } else {
        for (var i in CONFIG.dias) { if (CONFIG.dias[i][0] == tm) { datos = CONFIG.dias[i][1]; break; } }
    }
    var S = '';
    for (var i in CONFIG.horarios) {
        S += '<div><input type="checkbox" id="H' + Lid + i + '"' + marca[datos[i]] + '> H ' + (Number(i) + 1) + '</div>';
    }
    return S;
}
function crea_selector_semanal(tm) {
    var datos = [0, 0, 0, 0, 0, 0, 0];
    for (var i in CONFIG.periodos) { if (CONFIG.periodos[i][0] == tm) { datos = CONFIG.periodos[i][3]; break; } }
    var marca = ['', ' checked '];
    var S = '';
    for (var i in DATOS.creacion.dias) {
        S += '<div><input type="checkbox" id="S' + i + '"' + marca[datos[i]] + '>' + DATOS.creacion.dias[i].substr(0, 2) + '</div>';
    }
    return S;
}
function crea_selector_colores(tm, periodo) {
    var Lid = (periodo) ? 'P' : 'D';
    var j = 0;
    var S = '<table>';
    for (var i = 0; i < 3; i++) {
        S += '<tr><td data-title="' + CONFIG.descripciones[j] + '" id="C' + Lid + j + '" onclick="selecciona_color(' + j + ',\'' + Lid + '\')" '
        S += 'style="background-color:' + CONFIG.colores[CONFIG.estilo_sel][j] + '"></td>'; j++;
        S += '<td data-title="' + CONFIG.descripciones[j] + '" id="C' + Lid + j + '" onclick="selecciona_color(' + j + ',\'' + Lid + '\')" '
        S += 'style="background-color:' + CONFIG.colores[CONFIG.estilo_sel][j] + '"></td>'; j++;
        S += '<td data-title="' + CONFIG.descripciones[j] + '" id="C' + Lid + j + '" onclick="selecciona_color(' + j + ',\'' + Lid + '\')" '
        S += 'style="background-color:' + CONFIG.colores[CONFIG.estilo_sel][j] + '"></td></tr>'; j++;
    }
    S += '</table>';
    setTimeout(function () {
        var sel = 0;
        if (periodo) {
            for (var i in CONFIG.periodos) { if (CONFIG.periodos[i][0] == tm) { sel = CONFIG.periodos[i][4]; break; } }
        } else {
            for (var i in CONFIG.dias) { if (CONFIG.dias[i][0] == tm) { sel = CONFIG.dias[i][2]; break; } }
        }
        selecciona_color(sel, Lid);
    }, 100);
    return S;
}
function selecciona_color(j, Lid) {
    CONFIG.color_sel = j;
    guarda_config();
    for (var i in CONFIG.colores[CONFIG.estilo_sel]) {
        document.getElementById('C' + Lid + i).innerHTML = ''
    }
    document.getElementById('C' + Lid + j).innerHTML = '&nbsp;&nbsp;✔'
    //document.getElementById('C' + Lid + j).style.innerHTML = '&oslash;';
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
function establece_anio(anio) {
    fecha_select[0] = Number(anio);
    document.getElementById('anios').innerHTML = crea_menu_anual();
}
function anade_horario() {
    if (CONFIG.horarios.length > 9) {
        alerta('¡ ' + DATOS.creacion.superado + ' !', false);
    } else {
        OB.editor.style.left = '-420px';
        var a = CONFIG.horarios[(CONFIG.horarios.length - 1)];
        CONFIG.horarios.push([a[0], a[1], a[2], 0]);
        guarda_config();
        document.getElementById('horarios').innerHTML = crea_menu_horarios();
    }
}
function botones_estilo() {
    S = '';
    for (var i in CONFIG.estilo) {
        est = (i == CONFIG.estilo_sel) ? ' class="estilo_sel"' : '';
        S += '<span onclick="establece_estilo(' + i + ')" ' + est + '>' + DATOS.inicio.estilo[i] + '</span>';
    }
    OB.estilo.innerHTML = S;
}
//////////////////////////////////////////////////////////////////////////
function salida_contenido(S) {
    OB.contenido.style.opacity = '0';
    setTimeout(function () {
        OB.contenido.innerHTML = S;
        OB.contenido.style.opacity = '1';
    }, 500);
}
function establece_idioma(id) {
    if (id != CONFIG.idioma_sel) {
        CONFIG.idioma_sel = id;
        guarda_config();
        idioma_dif = true;
        var nocache = '?nocache=' + new Date().getTime();
        cargaAJAX(CONFIG.idiomas[id][1] + nocache, inicio_app)
    }
}
function establece_estilo(id) {
    if (id != CONFIG.estilo_sel) {
        CONFIG.estilo_sel = id;
        guarda_config();
        OB.hoja_estilo.href = CONFIG.estilo[CONFIG.estilo_sel];
        botones_estilo()
        if (CONFIG.menu_sel == 3) cierra_editor()
    }
}
function establece_seccion(id) {
    if (id == seccion_sel && !idioma_dif) { return false; }
    idioma_dif = false;
    for (var i = 0; i < OB.botones.childNodes.length; i++) {
        if (id == i) {
            OB.botones.childNodes[i].style.borderBottomColor = 'rgba(0,0,0,0.4)';
            OB.botones.childNodes[i].firstChild.style.height = '30px';
            OB.botones.childNodes[i].onmouseout = null;
            OB.botones.childNodes[i].onmouseover = null
            OB.botones.childNodes[i].firstChild.onmouseover = null;
            OB.botones.childNodes[i].firstChild.onmouseout = null;
        } else {
            OB.botones.childNodes[i].style.borderBottomColor = 'rgba(0,0,0,0)';
            OB.botones.childNodes[i].firstChild.style.height = '40px';
            OB.botones.childNodes[i].onmouseout = function () { this.style.borderBottomColor = 'rgba(0,0,0,0)'; }
            OB.botones.childNodes[i].onmouseover = function () { this.style.borderBottomColor = 'rgba(0,0,0,0.4)'; }
            OB.botones.childNodes[i].firstChild.onmouseover = function () { this.style.height = '30px'; }
            OB.botones.childNodes[i].firstChild.onmouseout = function () { this.style.height = '40px'; }
        }
    }
    CONFIG.menu_sel = seccion_sel = id;
    guarda_config();
    return true;
}
////////////////////////// A J A X //////////////////////////////////////////////////////////////////////
const cargaAJAX = (d, f) => {
    xhttp = new XMLHttpRequest();
    xhttp.onload = f;
    xhttp.open("GET", d);
    xhttp.send();
}
const inicio_app = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        DATOS = eval('(' + xhttp.responseText + ')')
        // IDIOMAS
        var S = new String()
        var est;
        for (var i in CONFIG.idiomas) {
            est = (i == CONFIG.idioma_sel) ? ' class="idioma_sel"' : 'class=""';
            S += '<span onclick="establece_idioma(' + i + ')" ' + est + '>' + CONFIG.idiomas[i][0] + '</span>';
        }
        OB.idioma.innerHTML = S;
        // ESTILO
        botones_estilo()
        //SECCIONES
        S = '';
        for (var i in DATOS.inicio.secciones) {
            S += '<div><div  onclick="accion_menu_principal[' + i + ']()">' + DATOS.inicio.secciones[i] + '</div></div>';
        }
        OB.botones.innerHTML = S;
        accion_menu_principal[CONFIG.menu_sel]();
        // M O T O R -------------------------------------------------------------------------
        setInterval(() => {
            IDENT.caduca = IDENT.caduca == -10000 ? IDENT.caduca : IDENT.caduca - 1000
            if (IDENT.caduca > 0) {
                if (seccion_sel == 0 && document.getElementById('caduca'))
                    document.getElementById('caduca').innerHTML = formateaTS(IDENT.caduca)
            } else if (IDENT.caduca !== -10000) {
                if (seccion_sel == 0 && document.getElementById('caduca'))
                    document.getElementById('caduca').innerHTML = DATOS.creacion.errores[3]
                return false
            }
            establece_instante()
            grados = (360 / 60) * fecha[4];
            OB.relog.childNodes[3].style.transform = "rotate(" + grados + "deg)" //Minutos
            grados = (360 / 60) * fecha[5];
            OB.relog.childNodes[5].style.transform = "rotate(" + grados + "deg)" //Segundos
            grados = (360 / 12) * fecha[3] + (360 / (12 * 60)) * fecha[4];
            OB.relog.childNodes[1].style.transform = "rotate(" + grados + "deg)" //horas
            //
            OB.lateral.childNodes[3].innerHTML = (fecha[3] > 11) ? "PM" : "AM"
            //
            OB.lateral.childNodes[5].innerHTML = dia_diasem_mes_anio(ahora.getTime())
            //
            OB.lateral.childNodes[7].innerHTML = comprueba_dia(ahora.getTime())
            //
            alarma()
        }, 1000);
        // A U T E N T I F I C A C I O N
        setTimeout(() => {
            if (!navigator.onLine) alerta(DATOS.creacion.errores[2], false)
            ipcRenderer.send('infoCliente')
        }, 2000)

    }
}
//-----------------------------------------------------------------------------------------------------------------
const inicio_config = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        let res = eval('(' + xhttp.responseText + ')');
        CONFIG = res.configuracion
        IDENT = res.identidad
        // Cada vez que se ejecuta la app
        if (localStorage.TIMERTIMESconfig) {
            CONFIG = JSON.parse(localStorage.getItem('TIMERTIMESconfig'))
        } else { guarda_config() }

        if (localStorage.TIMERTIMESidentidad) {
            IDENT = JSON.parse(localStorage.getItem('TIMERTIMESidentidad'))
        } else { guarda_identidad() }

        if (!window.File && !window.FileReader && !window.FileList && !window.Blob) {
            alerta(DATOS.inicio.alertas[1], false);
        }
        //IDENT.e_mail = 'pablo.lusarreta@gmail.com'
        //IDENT.clave = 'pabl8173'

        OB.hoja_estilo.href = CONFIG.estilo[CONFIG.estilo_sel];
        cargaAJAX(CONFIG.idiomas[CONFIG.idioma_sel][1], inicio_app)
    }
}

//-----------------------------------------------------------------------------------------------------------------
window.onload = () => {
    OB.logo = document.getElementById('logo')
    OB.lateral = document.getElementById('lateral')
    OB.idioma = document.getElementById('idioma')
    OB.estilo = document.getElementById('estilo')
    OB.botones = document.getElementById('botones')
    OB.contenido = document.getElementById('contenido')
    OB.relog = document.getElementById('relog')
    OB.editor = document.getElementById('editor_dias')
    OB.audio = document.getElementById('audio')
    OB.spectro = document.getElementById('audio-spectrum')
    OB.hoja_estilo = document.getElementById("hoja_estilo")
    OB.alertas = document.getElementById("alertas")
    OB.txt_alertas = document.getElementById("txt_alertas")
    OB.BSI = document.getElementById("alertaSi")
    OB.BNO = document.getElementById("alertaNo")

    fecha_select[0] = new Date().getFullYear()
    var j = 1
    for (var i = 0; i < 12; i++) {
        OB.relog.childNodes[7].childNodes[j + i].style.transform = "rotate(" + grados * i + "deg)"
        j++;
    }
    OB.relog.addEventListener('dblclick', () => { ipcRenderer.send('herramientas') })
    Spectrum.on('ready', () => { Spectrum.play() })
    establece_instante()
    cargaAJAX('config/default.json', inicio_config)
    setInterval(() => { location.reload() }, (24 * 60 * 60 * 1000))
}
window.onunload = () => {
    // guarda_config()
    // guarda_identidad()
}
//-----------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------------------------
const login = () => {
    IDENT.e_mail = document.getElementById("mail").value
    IDENT.clave = document.getElementById("clave").value
    guarda_identidad()
    ipcRenderer.send('comprueba', {
        e_mail: IDENT.e_mail,
        clave: IDENT.clave,
        app_id: IDENT.app_id
    })
}

ipcRenderer.on('infoCliente', (e, dat) => {
    if (IDENT.modificado == 0) {
        // 1º vez que se ejecuta la app
        let TMP = IDENT
        TMP.modificado = new Date().getTime()
        IDENT = Object.assign(TMP, dat);
        console.log('1º vez en esta maquina')
        guarda_identidad()

    } else {
        ipcRenderer.send('comprueba', {
            e_mail: IDENT.e_mail,
            clave: IDENT.clave,
            app_id: IDENT.app_id
        })
    }
})
ipcRenderer.on('comprueba', (e, args) => {
    if (args.length > 0) {
        let IDENTDB = args[0]._doc
        console.log('Usuario conectado 1º paso')
        if (IDENTDB.modificado == 0) {
            //1º activacion
            console.log('Usuario conectado 2º activacion inicial')
            ipcRenderer.send('activa', IDENT)
            guarda_identidad()
        } else {
            if (IDENTDB.tipo == IDENT.tipo &&
                IDENTDB.plataforma == IDENT.plataforma &&
                IDENTDB.arquitectura == IDENT.arquitectura &&
                IDENTDB.nombreHost == IDENT.nombreHost &&
                IDENTDB.memoriaRAM == IDENT.memoriaRAM &&
                IDENTDB.CPU == IDENT.CPU) {
                // es la misma maquina
                console.log('MISMA MAQUINA!!')
                CONFIG.activacion_info_sel = 11
                IDENT.caduca = -10000
                if (seccion_sel == 0) {
                    document.getElementById('activacion').innerHTML = DATOS.creacion.formulario[14]
                    setInterval(() => { document.getElementById('activacion').innerHTML = txt_activacion() }, 2000)
                }
            } else {
                console.log('OTRA MAQUINA!!')
                // es otra maquina
                CONFIG.activacion_info_sel = 7
                alerta(DATOS.creacion.formulario[15], true, () => {
                    IDENT.caduca = 3600000
                    IDENT.modificado = new Date().getTime()
                    if (seccion_sel == 0) document.getElementById('activacion').innerHTML = txt_activacion()
                    ipcRenderer.send('activa', IDENT)
                }, () => {
                    location.reload()
                })


            }
        }
        guarda_identidad()
        guarda_config()
    } else {
        // El login no es bueno
        CONFIG.activacion_info_sel = 7
        document.getElementById('activacion').innerHTML = txt_activacion()
        guarda_config()
    }
})
ipcRenderer.on('activa', (e, args) => {
    CONFIG.activacion_info_sel = 11
    document.getElementById('activacion').innerHTML = txt_activacion()
})

