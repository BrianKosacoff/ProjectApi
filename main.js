var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

var con = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "root",
  database: "proyecto"
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

function insertValue(insert){
  return new Promise(function(resolve, reject){
    con.query(insert, function (err, result) {
      if (err) throw err;
      message = "Added user";
      success = true;
      resolve({message:message, success:success});
      console.log("1 record inserted");
    });
  })
}

app.post('/signup', (req, res) => {
  console.log(req.body);
  var success = null;
  var message = null;
  var select = "SELECT count(*) as usuariosCount FROM usuarios WHERE username='" + req.body.username + "'";
  var insert = "INSERT INTO usuarios (`username`, `password`) VALUES (\""+req.body.username+"\",\""+req.body.password+"\")";
  con.query(select, function (err, result) {
    if (err) throw err;
    if(result[0].usuariosCount > 0){
      success = false;
      message = "User already exists";
      response(res, {message: message, success: success});
    } else {
      console.log(result);
      insertValue(insert).then(function(value){
        response(res, value);
      });
    }
  });
});

app.post('/signin', (req, res) => {
  var message = null;
  var success = null;
  var username = req.body.username;
  var password = req.body.password;
  var selectusu = "SELECT username, password FROM usuarios WHERE username = ? and password = '"+ password +"'";

  con.query(selectusu, [username], function (err, result, fields) {
    if(err){
      throw err;
    }else{
      console.log(result);
      if(result.length > 0){
        if(password == result[0].password){
          success = true;
          message = "Ingresaste";
          response(res, {message: message, success: success});
        }else{
          success = false;
          message = "username and password does not match";
          response(res, {message: message, success: success});
        }
      }else{
        success = false;
        message = "Username " + username + " does not exists";
        response(res, {message: message, success: success});
      }
    }
  });
});

app.post('/cargarpedido', (req, res) => {
  var message = null;
  var success = null;
  var UnidadDeNegocio = req.body.UnidadDeNegocio;
  var Cliente = req.body.Cliente;
  var TipoDePedido = req.body.TipoDePedido;
  var TipoDeContrato = req.body.TipoDeContrato;
  var Vendedor = req.body.Vendedor;
  var Proveedor = req.body.Proveedor;
  var Pais = req.body.Pais;
  var precio = parseInt(req.body.precio);
  var descuento = parseInt(req.body.descuento);
  var cantidad = parseInt(req.body.cantidad);
  var costoproveedor = parseInt(req.body.costoproveedor);
  var insertar = "INSERT INTO pedidos (unidaddenegocio, cliente, tipodepedido, tipodecontrato, vendedor, proveedor, pais, idvendedor, idcliente, idtipodepedido, cantidad, costoproveedor, fechapedido, idunidaddenegocio, idregion) VALUES ('"+UnidadDeNegocio+"','"+Cliente+"','"+TipoDePedido+"','"+TipoDeContrato+"','"+Vendedor+"','"+Proveedor+"','"+Pais+"', 1, 1, 1, '"+cantidad+"', '"+costoproveedor+"', NOW(), 1, 0)";

  con.query(insertar, function(err, result){
    if(err) {throw err;}else{
      var total = precio*(descuento/100);
      success = true;
      message = "Se han ingresado los datos";
      responseCP(res, {message:message, success:success, total:total});
    }
  });
});

app.post('/consultapedido', (req, res) => {
  var message = null;
  var pais = req.body.Pais;
  var unidaddenegocio;
  var cliente;
  var cantidad;
  var costoproveedor;
  var tipodepedido;
  var tipodecontrato;
  var vendedor;
  var proveedor;
  var select = "SELECT unidaddenegocio, cliente, cantidad, costoproveedor, tipodepedido, tipodecontrato, vendedor, proveedor, pais FROM pedidos WHERE pais = ?";

  con.query(select, [pais], function(err, result){
    if(err){throw err;}else{
      console.log(result.length);
      if(result.length > 0){
        message = result[0];
        responseConsPedido(res, {message:message});
      }else{
        message = "No se ha encontrado nada";
        responseConsPedido(res, {message:message});
      }
    }
  });
});

function insertValueCli(insertar){
  return new Promise(function(resolve, reject){
    con.query(insertar, function(err, result){
      if(err) throw err;
      message = "Nuevo cliente insertado";
      resolve({message:message});
    });
  })
}

app.post('/agregarcliente', (req, res) => {
    var message = null;
    var razonsocial = req.body.razonsocial;
    var industria = req.body.industria;
    var nroclienteproveedor = req.body.nroclienteproveedor;
    var region = req.body.region;
    var nroclienteplng = req.body.nroclienteplng;
    var comentarios = req.body.comentarios;
    var insertar = "INSERT INTO cliente (razonsocial, industria, nroclienteproveedor, region, nroclienteplng, FechaDeAlta, comentarios) VALUES ('"+ razonsocial +"', '"+ industria +"', '"+ nroclienteproveedor +"', '"+ region +"', '"+ nroclienteplng +"', NOW(), '"+ comentarios +"')";
    var seleccionar = "SELECT count(*) as clientecount FROM cliente WHERE nroclienteproveedor='"+ nroclienteproveedor +"'";

    con.query(seleccionar, function (err,result){
      if(err) throw err;
      if(result[0].clientecount > 0){
        message = "Numero de cliente repetido";
        responseAC(res, {message:message});
      }else{
        console.log(result);
        insertValueCli(insertar).then(function(value){
          responseAC(res, value);
        });
      }
    });
});
//    con.query(insertar, function(err, result){
//      if(err){throw err;}else{
//          if(nroclienteproveedor == result[0].nroclienteproveedor){
//            message = "Numero de cliente repetido";
//            responseAC(res, {message:message, nroclienteproveedor:nroclienteproveedor});
//          }else{
//            message = "Nuevo cliente agregado";
//            responseAC(res, {message:message, RazonSocial:razonsocial, industria:industria, nroclienteproveedor:nroclienteproveedor,region:region, nroclienteplng:nroclienteplng});
//          }
//      }
//    });

function insertValuePro(insertar){
  return new Promise(function(resolve, reject){
    con.query(insertar, function(err, result){
      if(err) throw err;
      message = "Nuevo producto agregado";
      resolve({message:message});
    });
  })
}

app.post('/agregarproducto', (req,res) => {
  var message = null;
  var activado = "Esta activado";
  var desactivado = "Esta desactivado";
  var sku = req.body.sku;
  var nombreproducto = req.body.nombreproducto;
  var unidaddenegocio = req.body.unidaddenegocio;
  var descripcion = req.body.descripcion;
  var tipodeproducto = req.body.tipodeproducto;
  var metrica = req.body.metrica;
  var unidadesblocks = parseInt(req.body.unidadesblocks);
  var activo = parseInt(req.body.activo);
  var insertar = "INSERT INTO producto (sku, nombreproducto, unidaddenegocio, descripcion, tipodeproducto, metrica, unidadesblocks, activo) VALUES ('"+ sku +"', '"+ nombreproducto +"', '"+ unidaddenegocio +"', '"+ descripcion +"', '"+ tipodeproducto +"', '"+ metrica +"', '"+ unidadesblocks +"', '"+ activo +"')";
  var seleccionar = "SELECT count(*) as productocount FROM producto WHERE nombreproducto='"+ nombreproducto +"'";

  con.query(seleccionar, function (err, result){
    if(err) throw err;
    if(result[0].productocount > 0){
      message = "Producto repetido";
      responseAP(res, {message:message});
    }else{
      console.log(result);
      insertValuePro(insertar).then(function(value){
        responseAC(res, value);
      });
    }
  });
//  con.query(insertar, function(err, result){
//    if(err){throw err;}else{
//      message = "Nuevo producto agregado";
//      if(activo = 1){activo = activado;}else{activo = desactivado;}
//      responseAP(res, {message:message, SKU:sku, nombreproducto:nombreproducto, unidaddenegocio:unidaddenegocio, descripcion:descripcion, tipodeproducto:tipodeproducto, metrica:metrica, unidadesblocks:unidadesblocks, activo:activo})
//    }
//  });
});


function response(res,message){
  res.status(200).send({
    success: message.success,
    message: message.message
  });
}

function responseCP(res,message){
  res.status(200).send({
    success: message.success,
    message: message.message,
    descuento: message.total
  });
}

function responseAC(res,message){
  res.status(200).send({
    message: message.message,
    RazonSocial: message.razonsocial,
    industria: message.industria,
    nroclienteproveedor: message.nroclienteproveedor,
    region: message.region,
    nroclienteplng: message.nroclienteplng
  });
}

function responseAP(res, message){
  res.status(200).send({
    message: message.message,
    sku:message.sku,
    nombreproducto:message.nombreproducto,
    unidaddenegocio:message.unidaddenegocio,
    descripcion:message.descripcion,
    tipodeproducto:message.tipodeproducto,
    metrica:message.metrica,
    unidadesblocks:message.unidadesblocks,
    activo:message.activo
  });
}

function responseConsPedido(res,message){
  res.status(200).send({
    message: message.message,
    Pais: message.pais
  });
}
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
