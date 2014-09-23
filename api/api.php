<?php

date_default_timezone_set('America/Mexico_City');


function conectar(){

    //$host="www.medicavial.net";
    $host="localhost";
    $user="medica_webusr";
    $password="tosnav50";
    $conn=mysql_connect($host,$user,$password) or die('Error al conectar: ' . mysql_error());
    mysql_select_db("medica_registromv",$conn);
    
	return $conn;
}


function generar_clave(){ 

        $pares = '24680';
        $nones = '13579';
        $vocales = 'AEIOU';
        $consonantes = "BCDEFGHIJKLMNOPQRSTUVWXYZ";
        $todos = $vocales . $pares . $consonantes . $nones;
        $valor = "";

        $valor .= substr($vocales,rand(0,4),1);
        $valor .= substr($consonantes,rand(0,23),1);
        $valor .= substr($pares,rand(0,4),1);
        $valor .= substr($nones,rand(0,4),1);
        $valor .= substr($todos,rand(0,34),1);

        return $valor;

} 

function conectarMySQL(){

    $dbhost="localhost";
    $dbuser="medica_webusr";
    $dbpass="tosnav50";
    $dbname="medica_registromv";
    $conn = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass,array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $conn;
}

//Obtenemos la funcion que necesitamos y yo tengo que mandar 
//la URL de la siguiente forma api/api.php?funcion=login
$funcion = $_REQUEST['funcion'];

if ($funcion == 'empresas') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT Cia_clave as id, Cia_nombrecorto as Nombre FROM Compania WHERE Cia_Activa='S' ORDER BY Cia_nombrecorto";

        $result = $db->query($sql);
        $empresas = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;

        echo json_encode($empresas);

    }

}

if($funcion == 'clave'){

    // $clave = 'W'. generar_clave(); //generar clave
    // echo $clave;

    $db = conectarMySQL();

    $sqlValor = "SELECT MAX(MOA_claveint) FROM MovimientoAut WHERE AUM_clave = 'WR63I'";

    $result = $db->query($sqlValor);
    $numero = $result->rowCount();
    
    if ($numero>0){

        $cantidad = $result->fetchColumn() + 1;
        

    }else{

        $cantidad = 0;
    }

    echo $cantidad;

}


if ($funcion == 'busquedaAutorizacion') {
   
    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;
    $fechaIni = $datos->fechaini;
    $fechaFin = $datos->fechafin;
    $lesionado = $datos->lesionado;
    $cliente = $datos->cliente;
    $unidad = $datos->unidad;

    // $fechaIni =  date('Y-m-d', strtotime(str_replace('/', '-', $fecha1)));
    // $fechaFin = date('Y-m-d', strtotime(str_replace('/', '-', $fecha2)));
    


    $sql = "SELECT AUM_clave as clave, AUM_fecha as fecha, Cia_nombrecorto as cliente, Uni_nombreMV as unidad, AUM_lesionado as lesionado, AUM_folioMV as folio, AUM_fechaReg as fecharegistro, AUM_diagnostico as diagnostico FROM AutorizacionMedica 
            INNER JOIN Unidad ON Unidad.Uni_clave = AutorizacionMedica.UNI_claveint
            INNER JOIN Compania ON Compania.Cia_clave =  AutorizacionMedica.EMP_claveint";
            //INNER JOIN Usuario ON Usuario.USU_claveMV = AutorizacionMedica.USU_registro";

    if ($folio != '') {
        
        $criterio1 = " WHERE ";
        $criterio1 .= "AUM_folioMV = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($fechaIni != '' && $fechaFin != '') {

        if ($criterio1 == "") {
            $criterio2 = " WHERE ";
        }else{
            $criterio2 = " AND ";
        }

       $criterio2 .= "AUM_fecha BETWEEN '$fechaIni 00:00:00' and '$fechaFin 23:59:59'";
       
    }else{
        $criterio2 = "";
    }

    if ($lesionado != '') {

        if ($criterio1 == "" && $criterio2 == "") {
            $criterio3 = " WHERE ";
        }else{
            $criterio3 = " AND ";
        }

        $criterio3 .= "AUM_lesionado like '%$lesionado%' ";

    }else{
        $criterio3 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '') {
            $criterio4 = " WHERE ";
        }else{
            $criterio4 = " AND ";
        }

        $criterio4 .= "AUM_clave = '$autorizacion' ";

    }else{

        $criterio4 = "";

    }

    if ($unidad != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '' && $criterio4 == '') {
            $criterio5 = " WHERE ";
        }else{
            $criterio5 = " AND ";
        }

        $criterio5 .= "AutorizacionMedica.UNI_claveint = $unidad ";

    }else{
        $criterio5 = "";
    }


    if ($cliente != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '' && $criterio4 == '' && $criterio5 == '') {
            $criterio6 = " WHERE ";
        }else{
            $criterio6 = " AND ";
        }

        $criterio6 .= "AutorizacionMedica.EMP_claveint = $cliente ";

    }else{
        $criterio6 = "";
    }

    $sql .= $criterio1 . $criterio2 . $criterio3 . $criterio4 . $criterio5 . $criterio6;

    $result = $db->query($sql);
    $autorizaciones = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($autorizaciones);

    // echo $sql;

}


if ($funcion == 'busquedaHospitalarios') {
   
    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $db = conectarMySQL();

    $folio = $datos->folio;
    $hospitalario = $datos->hospitalario;
    $fecha1 = $datos->fechaini;
    $fecha2 = $datos->fechafin;
    $lesionado = $datos->lesionado;
    $cliente = $datos->cliente;
    $unidad = $datos->unidad;

   $sql = "SELECT HOS_clave as clave, EXP_folio as folio, HOS_lesionado as lesionado, Cia_nombrecorto as cliente, Uni_nombreMV as unidad, 
                HOS_poliza as poliza, HOS_siniestro as siniestro, RIE_nombre as riesgo, HOS_reporte as reporte, HOS_fechaCaptura as fechacaptura, 
                HOS_fechaHospitalario as fechahospitalario, HOS_quienReporta as reporta, HOS_quienAutoriza as autoriza, LEFT(HOS_motivoHos,50) as motivo
                FROM Hospitalario
                INNER JOIN Unidad ON Unidad.Uni_clave = Hospitalario.UNI_claveint
                INNER JOIN Compania ON Compania.Cia_clave =  Hospitalario.EMP_claveint
                LEFT JOIN RiesgoAfectado ON RiesgoAfectado.RIE_clave = Hospitalario.RIE_claveInt";

                //INNER JOIN Usuario ON Usuario.USU_claveMV = Hospitalario.USU_capturo
    
    if ($folio != '') {
        
        $criterio1 = " WHERE ";
        $criterio1 .= "EXP_folio = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($fecha1 != '' && $fecha2 != '') {

        if ($criterio1 == '') {
            $criterio2 = " WHERE ";
        }else{
            $criterio2 = " AND ";
        }

       $criterio2 .= "HOS_fechaHospitalario BETWEEN '$fecha1 00:00:00' and '$fecha2 23:59:59'";
       
    }else{
        $criterio2 = "";
    }

    if ($lesionado != '') {

        if ($criterio1 == '' && $criterio2 == '') {
            $criterio3 = " WHERE ";
        }else{
            $criterio3 = " AND ";
        }

        $criterio3 .= "HOS_lesionado like '%$lesionado%' ";

    }else{
        $criterio3 = "";
    }

    if ($unidad != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '') {
            $criterio4 = " WHERE ";
        }else{
            $criterio4 = " AND ";
        }

        $criterio4 .= "Hospitalario.UNI_claveint = $unidad ";

    }else{
        $criterio4 = "";
    }

    if ($cliente != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '' && $criterio4 == '') {
            $criterio5 = " WHERE ";
        }else{
            $criterio5 = " AND ";
        }

        $criterio5 .= "Hospitalario.EMP_claveint = $cliente ";

    }else{
        $criterio5 = "";
    }


    if ($hospitalario != '') {

        if ($criterio1 == '' && $criterio2 == '' && $criterio3 == '' && $criterio4 == '' && $criterio5 == '') {
            $criterio6 = " WHERE ";
        }else{
            $criterio6 = " AND ";
        }

        $criterio6 .= "Hospitalario.HOS_clave = '$hospitalario' ";

    }else{
        $criterio6 = "";
    }

    $sql .= $criterio1 . $criterio2 . $criterio3 . $criterio4 . $criterio5 . $criterio6;

    $result = $db->query($sql);
    $hospitalarios = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    // echo $sql;

    echo json_encode($hospitalarios);

}

if ($funcion == 'consultaAutorizaciones') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT AUM_clave as clave, AUM_fecha as fecha, Cia_nombrecorto as cliente, Uni_nombreMV as unidad, AUM_lesionado as lesionado, AUM_folioMV as folio, AUM_fechaReg as fecharegistro, AUM_diagnostico as diagnostico  FROM AutorizacionMedica 
                INNER JOIN Unidad ON Unidad.Uni_clave = AutorizacionMedica.UNI_claveint
                INNER JOIN Compania ON Compania.Cia_clave =  AutorizacionMedica.EMP_claveint
                ORDER BY AUM_fechaReg DESC LIMIT 0,100";

                // INNER JOIN Usuario ON Usuario.USU_claveMV = AutorizacionMedica.USU_registro

        $result = $db->query($sql);
        $empresas = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;

        echo json_encode($empresas);

    }
    
}

if ($funcion == 'consultaFolio') {
    

    $folio = $_REQUEST['folio'];


    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{



        $sql = "SELECT EXP_completo,
                CIA_clave,
                UNI_clave,
                EXP_siniestro,
                EXP_poliza,
                EXP_reporte,
                EXP_edad,
                EXP_fecreg,
                RIE_clave
                FROM Expediente WHERE EXP_folio = '$folio'";

        $result = $db->query($sql);
        $folios = $result->fetchAll(PDO::FETCH_OBJ);


        $sql2 = "SELECT HOS_clave FROM Hospitalario WHERE EXP_folio = '$folio'";
        $result = $db->query($sql2);
        $hospitalarios = $result->fetchAll(PDO::FETCH_OBJ);

        $sql3 = "SELECT AUM_clave FROM AutorizacionMedica WHERE AUM_folioMV = '$folio'";
        $result = $db->query($sql3);
        $autorizaciones = $result->fetchAll(PDO::FETCH_OBJ);

        $respuesta = array('folio' => $folios, 'hospitalario' => $hospitalarios, 'autorizaciones' => $autorizaciones);

        $db = null;

        echo json_encode($respuesta);

    }

}               

if ($funcion == 'consultaHospitalarios') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT HOS_clave as clave, EXP_folio as folio, HOS_lesionado as lesionado, Cia_nombrecorto as cliente, Uni_nombreMV as unidad, 
                HOS_poliza as poliza, HOS_siniestro as siniestro, RIE_nombre as riesgo, HOS_reporte as reporte, HOS_fechaCaptura as fechacaptura, 
                HOS_fechaHospitalario as fechahospitalario, HOS_quienReporta as reporta, HOS_quienAutoriza as autoriza, LEFT(HOS_motivoHos,50) as motivo
                FROM Hospitalario
                INNER JOIN Unidad ON Unidad.Uni_clave = Hospitalario.UNI_claveint
                INNER JOIN Compania ON Compania.Cia_clave =  Hospitalario.EMP_claveint
                INNER JOIN RiesgoAfectado ON RiesgoAfectado.RIE_clave = Hospitalario.RIE_claveInt ORDER BY HOS_fechaCaptura DESC LIMIT 0,100";
                //INNER JOIN Usuario ON Usuario.USU_claveMV = Hospitalario.USU_capturo
                
        $result = $db->query($sql);
        $hospitalarios = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;

        echo json_encode($hospitalarios);

    }
    
}


if ($funcion == 'detalleAutorizacion') {

    $numeroautorizacion = $_REQUEST['numero'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT * FROM AutorizacionMedica
                INNER JOIN Unidad ON Unidad.Uni_clave = AutorizacionMedica.UNI_claveint
                INNER JOIN Compania ON Compania.Cia_clave =  AutorizacionMedica.EMP_claveint
                where AUM_clave = '$numeroautorizacion'";

        $result = $db->query($sql);
        $autorizacion = $result->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        echo json_encode($autorizacion);

    }
    
}

if ($funcion == 'detalleHospitalario') {

    $clave = $_REQUEST['numero'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT * FROM Hospitalario where HOS_clave = '$clave'";

        $result = $db->query($sql);
        $autorizacion = $result->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        echo json_encode($autorizacion);

    }
    
}

if ($funcion == 'detalleAutorizacionMovimiento') {

    $numeroautorizacion = $_REQUEST['numero'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{

        $sql2 = "SELECT * FROM MovimientoAut 
                INNER JOIN TipoMovimiento ON MovimientoAut.TIM_claveint = TipoMovimiento.TIM_claveint 
                INNER JOIN Usuario ON MovimientoAut.USU_registro = Usuario.USU_claveMV
                where AUM_clave = '$numeroautorizacion'";

        $result2 = $db->query($sql2);
        $movimientos = $result2->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        echo json_encode($movimientos);

    }
    
}

if ($funcion == 'guardaAutorizacion') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $folio = $datos->folio;
    $empresa = $datos->cliente;
    $unidad = $datos->unidad;
    $fecha = $datos->fecha;
    $lesionado = $datos->nombrelesionado;
    $edad = $datos->edad;
    $medico = $datos->medico;
    $diagnostico = $datos->diagnostico;
    $usuario = $datos->usuario;
    $usuariocomercial = $datos->autorizacioncomercial;
    
    $clave = generar_clave(); //generar clave
    
    $fechacaprtura = date("Y-m-d H:i:s"); 

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "INSERT INTO AutorizacionMedica
              (
                     AUM_clave,
                     AUM_fecha,
                     EMP_claveint,
                     UNI_claveint,
                     AUM_lesionado,
                     AUM_edad,
                     AUM_medico,
                     AUM_diagnostico,      
                     AUM_folioMV,
                     USU_registro,
                     AUM_fechaReg,
                     UCO_claveint                     
              ) 
              VALUES
              (
                    :AUMClave,
                    :fechaAut,
                    :cliente,
                    :unidad,
                    :lesionado,
                    :edad,
                    :medico,
                    :diagnostico,
                    :folio,
                    :usuario,
                    now(),
                    :usuariocomercial
              )";
        
        $temporal = $db->prepare($sql);
        $temporal->bindParam("AUMClave", $clave, PDO::PARAM_STR);
        $temporal->bindParam("fechaAut", $fecha);
        $temporal->bindParam("cliente", $empresa , PDO::PARAM_INT);
        $temporal->bindParam("unidad", $unidad, PDO::PARAM_INT);
        $temporal->bindParam("lesionado", $lesionado, PDO::PARAM_STR);
        $temporal->bindParam("edad", $edad, PDO::PARAM_INT);
        $temporal->bindParam("medico", $medico, PDO::PARAM_STR);
        $temporal->bindParam("diagnostico", $diagnostico, PDO::PARAM_STR);
        $temporal->bindParam("folio", $folio, PDO::PARAM_STR, 10);
        $temporal->bindParam("usuario", $usuario, PDO::PARAM_INT);
        $temporal->bindParam("usuariocomercial", $usuariocomercial, PDO::PARAM_INT);
        
        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", "clave" => $clave);
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información", "clave" => $clave);
        }
        
        echo json_encode($respuesta);

    }
    
}

if ($funcion == 'guardaHospitalario') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $folio = $datos->folio;
    $lesionado = $datos->nombrelesionado;
    $reporte = $datos->reporte;
    $siniestro = $datos->siniestro;
    $unidad = $datos->unidad;
    $poliza = $datos->poliza;
    $inciso = $datos->inciso;
    $empresa = $datos->cliente;
    $asegurado = $datos->asegurado;
    $domicilio = $datos->domicilio;
    $riesgo = $datos->riesgo;
    $posicion = $datos->posicion;
    $ajustador = $datos->ajustador;
    $ajustadorClave = $datos->claveajustador;
    $quienReporta = $datos->reporta;
    $quienAutoriza = $datos->autoriza;
    $trasladoA = $datos->traslado;
    $ambulancia = $datos->ambulancia;
    $motivoHos = $datos->motivo;
    $observaciones = $datos->observaciones;
    $otros = $datos->otros;
    $fechaAtencion = $datos->fechaatencion;
    $fechaHospitalario = $datos->fechahospitalario;
    $horaIniRep = $datos->horareporte;
    $horaFinRep =  $datos->horarfineporte;
    $usuario = $datos->usuario;
    $edad = $datos->edad;
    $fechacaprtura = date("Y-m-d H:i:s"); 

    $fecha = date("Y-m-d"); 

    $clave = generar_clave(); //generar clave

    if ($riesgo == '') $riesgo = 'NULL';
    if ($posicion == '') $posicion = 'NULL';


    $horaIniRep = date("Y-m-d H:i:s" , strtotime($fecha . $horaIniRep) );
    //$horaFinRep = date("Y-m-d H:i:s" , strtotime($fecha . $horaFinRep) );

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "INSERT INTO Hospitalario
                ( 
                   EXP_folio,         HOS_lesionado,         HOS_reporte,      HOS_siniestro,
                   HOS_fechaAtencion, HOS_fechaHospitalario, UNI_claveint,     EMP_claveint,
                   HOS_poliza,        HOS_inciso,            HOS_asegurado,    HOS_horaIniRep, 
                   HOS_domicilio,     RIE_claveInt,          POS_clave,        HOS_ajustador,
                   HOS_ajustadorClave,HOS_quienReporta,      HOS_quienAutoriza,HOS_trasladoA, 
                   HOS_ambulancia,    HOS_motivoHos,         HOS_observaciones,HOS_otros, 
                   HOS_horaFinRep,    USU_capturo, HOS_edad, HOS_fechaCaptura, HOS_clave
                )
                VALUES
                (  :folio,              :lesionado,              :reporte,            :siniestro,
                   :fechaAtencion,      :fechaHospitalario,      :unidad,             :empresa, 
                   :poliza,             :inciso,                 :asegurado,          :horaIniRep, 
                   :domicilio,          :riesgo,                 :posicion,           :ajustador,
                   :ajustadorClave,     :quienReporta,           :quienAutoriza,      :trasladoA,
                   :ambulancia,         :motivoHos,              :observaciones,      :otros,
                   now(),               :usuario,                :edad,               :fechaCaptura,
                   :clave
                )";

        $temporal = $db->prepare($sql);
        $temporal->bindParam("folio", $folio, PDO::PARAM_STR, 10);
        $temporal->bindParam("lesionado", $lesionado, PDO::PARAM_STR);
        $temporal->bindParam("reporte", $reporte, PDO::PARAM_STR);
        $temporal->bindParam("siniestro", $siniestro , PDO::PARAM_STR);
        $temporal->bindParam("empresa", $empresa , PDO::PARAM_INT);
        $temporal->bindParam("fechaAtencion", $fechaAtencion);
        $temporal->bindParam("fechaHospitalario", $fechaHospitalario);
        $temporal->bindParam("unidad", $unidad, PDO::PARAM_INT);
        $temporal->bindParam("poliza", $poliza, PDO::PARAM_STR);
        $temporal->bindParam("inciso", $inciso, PDO::PARAM_STR);
        $temporal->bindParam("asegurado", $asegurado, PDO::PARAM_STR);
        $temporal->bindParam("horaIniRep", $horaIniRep, PDO::PARAM_STR);
        $temporal->bindParam("domicilio", $domicilio, PDO::PARAM_STR);
        $temporal->bindParam("riesgo", $riesgo);
        $temporal->bindParam("posicion", $posicion);
        $temporal->bindParam("ajustador", $ajustador, PDO::PARAM_STR);
        $temporal->bindParam("ajustadorClave", $ajustadorClave, PDO::PARAM_STR);
        $temporal->bindParam("quienReporta", $quienReporta, PDO::PARAM_STR);
        $temporal->bindParam("quienAutoriza", $quienAutoriza, PDO::PARAM_STR);
        $temporal->bindParam("trasladoA", $trasladoA, PDO::PARAM_STR);
        $temporal->bindParam("ambulancia", $ambulancia, PDO::PARAM_STR);
        $temporal->bindParam("motivoHos", $motivoHos, PDO::PARAM_STR);
        $temporal->bindParam("observaciones", $observaciones, PDO::PARAM_STR);
        $temporal->bindParam("otros", $otros, PDO::PARAM_STR);
        // $temporal->bindParam("horaFinRep", $horaFinRep);
        $temporal->bindParam("usuario", $usuario, PDO::PARAM_INT);
        $temporal->bindParam("edad", $edad, PDO::PARAM_INT);
        $temporal->bindParam("fechaCaptura", $fechacaprtura);
        $temporal->bindParam("clave", $clave, PDO::PARAM_STR);

        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", 'clave' => $clave, 'datos' => $datos);
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }

        echo json_encode($respuesta);


    }
    
}

if ($funcion == 'guardaMovimiento') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $AUMClave = $datos->clave;
    $TIMClave = $datos->tipo;
    $fecha = $datos->fecha;
    $texto = $datos->descripcion;
    $usuario = $datos->usuario;

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sqlValor = "SELECT MAX(MOA_claveint) FROM MovimientoAut WHERE AUM_clave = '$AUMClave'";

        $result = $db->query($sqlValor);
        $numero = $result->rowCount();
        
        if ($numero>0){

            $MOAClave = $result->fetchColumn() + 1;
            

        }else{

            $MOAClave = 0;
        }


        $sql = "INSERT INTO MovimientoAut
              (
                   AUM_clave,
                   MOA_claveint,
                   TIM_claveint,
                   MOA_fecha,
                   MOA_texto,
                   USU_registro,
                   MOA_claveAut,
                   MOA_autorizado,
                   MOA_fechaReg
              )   
              VALUES
              (
                    :AUMClave,                     
                    :MOAClave,
                    :TIMClave,
                    :fecha,
                    :texto,
                    :usuario,
                    NULL,
                    1,
                    now()
              )";

        $temporal = $db->prepare($sql);
        $temporal->bindParam("AUMClave", $AUMClave, PDO::PARAM_STR, 5);
        $temporal->bindParam("MOAClave", $MOAClave, PDO::PARAM_INT);
        $temporal->bindParam("TIMClave", $TIMClave, PDO::PARAM_INT);
        $temporal->bindParam("fecha", $fecha);
        $temporal->bindParam("texto", $texto , PDO::PARAM_STR);
        $temporal->bindParam("usuario", $usuario , PDO::PARAM_INT);

        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente");
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }

        echo json_encode($respuesta);


    }
    
}

if($funcion == 'login'){
	
	//Obtenemos los datos que mandamos de angular
	$postdata = file_get_contents("php://input");
	//aplicacmos json_decode para manejar los datos como arreglos de php
	//En este caso lo que mando es este objeto JSON {user:username,psw:password}
	$data = json_decode($postdata);
    $conexion = conectarMySQL();
        
	//Obtenemos los valores de usuario y contraseña 
	$user = trim($data->user);
	$psw = trim($data->psw);
	
	$sql = "SELECT Usuario.Usu_login,Per_clave,Unidad.Uni_nombre, USU_claveMV, Hospitalario FROM Usuario  INNER JOIN Unidad on Usuario.UNI_clave = Unidad.UNI_clave
            WHERE Usu_login = '$user' and Usu_pwd = '" . md5($psw) . "'";

    $result = $conexion->query($sql);
    $numero = $result->rowCount();
	
	if ($numero>0){

		$datos = $result->fetchAll(PDO::FETCH_OBJ);
		

	}else{

		$datos = array('respuesta' => 'El Usuario o contraseña son inorrectos');
	}
	
	echo json_encode($datos);

    $conexion = null;

}

if ($funcion == 'posicion') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT POS_clave as id, POS_nombre as Nombre FROM Posicion  ORDER BY POS_nombre";

        $result = $db->query($sql);
        $posicion = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($posicion);

    }
    
}

if ($funcion == 'riesgo') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT RIE_clave as id, RIE_nombre as Nombre FROM RiesgoAfectado Where RIE_activo  = 'S' ORDER BY RIE_nombre";

        $result = $db->query($sql);
        $riesgo = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($riesgo);

    }
    
}

if ($funcion == 'tipoMovimiento') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT TIM_claveint as id, TIM_nombre as Nombre FROM TipoMovimiento Where TIM_activo = 1 ORDER BY TIM_nombre";

        $result = $db->query($sql);
        $movimientos = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($movimientos);

    }
    
}

if ($funcion == 'unidades') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT Uni_clave as id, Uni_nombreMV as Nombre FROM Unidad Where Uni_activa='S' ORDER BY Uni_nombreMV";

        $result = $db->query($sql);
        $unidades = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($unidades);

    }
    
}


if ($funcion == 'usuariosComerciales') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{     
        $sql = "SELECT UCO_claveint as id, UCO_Nombre as Nombre FROM UsuarioComercial ORDER BY UCO_Nombre";

        $result = $db->query($sql);
        $usuarios = $result->fetchAll(PDO::FETCH_OBJ);
        $db = null;
        echo json_encode($usuarios);
    }
     
}

if ($funcion == 'agenda') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $AUMClave = $datos->aum_clave;
    $proveedor = $datos->proveedor;
    $costo = $datos->costo;
    $fecharegistro = $datos->fecharegistro;
    $notas = $datos->notas;
    $referencia = $datos->referencia;

    $db = conectarMySQL();

    
    $sql = "SELECT * FROM RegistroCitas 
                WHERE AUM_clave = '$AUMClave'";
    $result = $db->query($sql);
    $numero = $result->rowCount();
    
    if ($numero>0){

        $respuesta = array('respuesta' => 'La autorización ya existe');
        
    }else{

        $sql = "INSERT INTO RegistroCitas  (
                            AUM_clave
                            ,RC_proveedor
                            ,RC_costo
                            ,RC_fechahora
                            ,RC_obs
                            ,RC_inforeferencia
                ) VALUES (:aum_clave,:proveedor,:costo,:fecharegistro,:notas,:referencia)";
        
        $temporal = $db->prepare($sql);

        // $temporal->bindParam("clave", $clave, PDO::PARAM_INT);
        // $temporal->bindParam("nombre", $nombre, PDO::PARAM_STR);

        $temporal->bindParam("aum_clave", $AUMClave);
        $temporal->bindParam("proveedor", $proveedor);
        $temporal->bindParam("costo", $costo);
        $temporal->bindParam("fecharegistro", $fecharegistro);
        $temporal->bindParam("notas", $notas);
        $temporal->bindParam("referencia", $referencia);
        
        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente");
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
    }


    
    echo json_encode($respuesta);

    $conexion = null;
}


?>