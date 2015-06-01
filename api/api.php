<?php

date_default_timezone_set('America/Mexico_City');

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

    //$dbhost="www.medicavial.net";
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


if($funcion == 'buscaExpedientes'){
    
    //Obtenemos los datos que mandamos de angular
    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $data = json_decode($postdata);
    $conexion = conectarMySQL();
    
    //Obtenemos los valores de usuario y contraseña 
    $fechaini = $data->fechaini;
    $fechafin = $data->fechafin;
    $folio = $data->folio;
    $lesionado = $data->lesionado;
    $poliza = $data->poliza;
    $reporte = $data->reporte;
    $siniestro = $data->siniestro;
    $valorUni = $data->unidad;

    $sql = "SELECT Expediente.Exp_folio as folio, UNI_nombreMV as unidad, Exp_poliza as poliza,
            Exp_siniestro as siniestro,Exp_reporte as reporte,
            CASE 
                WHEN EXP_cancelado = 0 THEN 'Activo'
                ELSE 'Cancelado'
            END as estatus,
            Exp_completo as lesionado, Exp_fecreg as fecharegistro, Cia_nombrecorto as cliente, RIE_nombre as riesgo
            FROM Expediente
                inner join Unidad on Unidad.Uni_clave = Expediente.Uni_clave 
                inner join Compania on Compania.Cia_clave = Expediente.Cia_clave
                left join RiesgoAfectado on RiesgoAfectado.RIE_clave = Expediente.RIE_clave
            Where Unidad.Uni_clave <> 8";


    if ($folio != '') {
        
        $criterio1 = " AND Expediente.Exp_folio = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($fechaini != '' && $fechafin != '') {

       $criterio2 = " AND Exp_fecreg BETWEEN '$fechaini 00:00:00' and '$fechafin 23:59:59'";
       
    }elseif ($fechaini != '' && $fechafin == '') {
        $criterio2 = " AND Exp_fecreg BETWEEN '$fechaini 00:00:00' and now() ";
    }else{
        $criterio2 = "";
    }

    if ($lesionado != '') {

        $criterio3 = " AND Exp_completo like '%$lesionado%' ";

    }else{
        $criterio3 = "";
    }

    if ($poliza != '') {

        $criterio4 = " AND Exp_poliza = $poliza ";

    }else{

        $criterio4 = "";

    }

    if ($reporte != '') {

        $criterio5 = " AND EXP_reporte = $reporte ";

    }else{
        $criterio5 = "";
    }


    if ($siniestro != '') {

        $criterio6 = " AND Exp_siniestro = $siniestro ";

    }else{

        $criterio6 = "";
    }

    if ($valorUni != '') {

        $criterio7 = " AND Expediente.UNI_clave = $valorUni ";

    }else{

        $criterio7 = "";
    }


    $sql .= $criterio1 . $criterio2 . $criterio3 . $criterio4 . $criterio5 . $criterio6 . $criterio7;
    
    if($criterio1 == '' && $criterio2 == '' && $criterio3 == '' && $criterio4 == '' && $criterio5 == '' && $criterio6 == '' && $criterio7 == ''){
        $sql .= " ORDER BY Exp_fecreg DESC LIMIT 0,1000";
    }elseif ($criterio7 != '' && $criterio2 == '') {
        $sql .= ' ORDER BY Exp_fecreg DESC LIMIT 0,1000';
    }


    $result = $conexion->query($sql);

    $datos = $result->fetchAll(PDO::FETCH_OBJ);
    
    echo json_encode($datos);

    $conexion = null;

}

if($funcion == 'detalleExpediente'){
    
    //expediente = folio 
    $expediente = $_REQUEST['expediente'];

    $conexion = conectarMySQL();

    $sql = "SELECT  Expediente.Exp_folio as folio,Exp_completo as lesionado, UNI_nombreMV as unidad, 
                    ExpedienteInfo.Exp_poliza as poliza, ExpedienteInfo.Exp_siniestro as siniestro ,ExpedienteInfo.EXP_reporte as reporte,
                    DATE(Exp_fecreg) as fechaatencion , Expediente.EXP_edad as edad, Expediente.EXP_sexo as sexo,EXP_fechaCaptura as fechacaptura,
                    ExpedienteInfo.EXP_fechaExpedicion as fechaexpedicion, ExpedienteInfo.EXP_orden as orden,  RIE_nombre as riesgo, 
                    POS_nombre as posicion, EXP_ajustador as ajustador, EXP_obsAjustador as observaciones, TLE_nombre as lesion,
                    EXP_diagnostico as descripcion, FAC_folioFiscal as sat, CONCAT(FAC_serie,FAC_folio) as foliointerno,
                    FAC_fecha as fechafactura, FAC_importe as importe, FAC_iva as iva, FAC_total as total, Cia_rfc as rfc,
                    Cia_nombrecorto as empresa, LesE_clave as clasificacion
            FROM Expediente
                inner join Unidad on Unidad.Uni_clave = Expediente.Uni_clave 
                inner join Compania on Compania.Cia_clave = Expediente.Cia_clave
                left join ClasificacionLes ON ClasificacionLes.Exp_folio = Expediente.Exp_folio
                left join RiesgoAfectado on RiesgoAfectado.RIE_clave = Expediente.RIE_clave
                left join ExpedienteInfo on ExpedienteInfo.EXP_folio = Expediente.EXP_folio
                left join Posicion on Posicion.POS_clave = ExpedienteInfo.POS_claveint
                left join LesionMV on LesionMV.LES_clave = ExpedienteInfo.LES_empresa
                left join TipoLesion on TipoLesion.TLE_claveint = LesionMV.TLE_claveint 
            WHERE Unidad.Uni_clave = $unidad and Expediente.EXP_folio = '$expediente' and EXP_cancelado = 0 ";

    $result = $conexion->query($sql);
    $datos = $result->fetch(PDO::FETCH_OBJ);

    $documentos = array();

    $sqlEtapas ="SELECT DOC_clave,DOC_folio,DOC_etapa,DOC_entrega,UNI_clave,DATE(DOC_fecha) as DOC_fecha ,DATE(DOC_fechaReg) as DOC_fechaReg ,DATE(DOC_fechaImp) as DOC_fechaImp FROM Documento
                WHERE DOC_folio = '$expediente' ORDER BY DOC_etapa,DOC_entrega";

    foreach ($conexion->query($sqlEtapas) as $item) {

        $dato = array();

        $clave = $item['DOC_clave'];
        $dato['documento'] = $item['DOC_clave'];
        $dato['etapa'] = $item['DOC_etapa'];
        $dato['entrega'] = $item['DOC_entrega'];
        $dato['unidad'] = $item['UNI_clave'];
        $dato['original'] = $item['DOC_fecha'];
        $dato['originalRegistro'] = $item['DOC_fechaReg'];
        // fecha en que se subio a esta tabla
        $dato['fechasubio'] = $item['DOC_fechaImp'];

        //Obtener pagos de ese folio y etapa
        $queryPagos="SELECT *
        FROM PagoUnidad
        where DOC_clave = $clave";

        $result = $conexion->query($queryPagos);
        $pagos = $result->fetchAll(PDO::FETCH_OBJ);
        $dato['pagos'] = $pagos;

        array_push($documentos,$dato);

    }          

    $sqlTick = "SELECT TSeg_clave as clave, TSeg_etapa as etapa, Tseg_fechaactualizacion as fecha, TSub_nombre as subcategoria, TCat_nombre as categoria, TStatus_nombre as estatus, TSeg_obs as observa, Usu_nombre 
                FROM TicketSeguimiento 
                LEFT JOIN TicketSubcat ON TicketSubcat.TSub_clave = TicketSeguimiento.TSub_clave
                LEFT JOIN TicketCat ON TicketCat.TCat_clave = TicketSeguimiento.TCat_clave
                LEFT JOIN TicketStatus ON TicketStatus.TStatus_clave = TicketSeguimiento.TStatus_clave
                LEFT JOIN Usuario on Usuario.Usu_login=TicketSeguimiento.Usu_registro
                WHERE Exp_folio = '$expediente' and TicketSeguimiento.TCat_clave <> 4";

    $tickets = array();

    //obtenemos datos para la busqueda de la factura
    foreach ($conexion->query($sqlTick) as $item) {

        $dato = array();

        $id = $item['clave'];
        $dato['id'] = $item['clave'];
        $dato['etapa'] = $item['etapa'];
        $dato['fecha'] = $item['fecha'];
        $dato['subcategoria'] = $item['subcategoria'];
        $dato['categoria'] = $item['categoria'];
        $dato['estatus'] = $item['estatus'];
        $dato['observaciones'] = $item['observa'];
        $dato['usuario'] = $item['Usu_nombre'];

        //Obtener comunicacion
        $querycomunicacion="SELECT TC_descripcion as Descripcion, TC_fechareg as Fecha, Usuario.Usu_nombre as Usuario
        FROM TicketComunicacion
        inner join Usuario on Usuario.Usu_login=TicketComunicacion.Usu_registro
        where TSeg_clave=$id And Exp_folio='$expediente'";

        $result = $conexion->query($querycomunicacion);
        $comunicacion = $result->fetchAll(PDO::FETCH_OBJ);
        $dato['comunicacion'] = $comunicacion;

        //Obtener notas
        $querynotas="SELECT TN_descripcion as Descripcion, TN_fechareg as Fecha, Usuario.Usu_nombre as Usuario
        FROM TicketNotas 
        inner join Usuario on Usuario.Usu_login=TicketNotas.Usu_registro
        where TSeg_clave=$id And Exp_folio='$expediente'";

        $result = $conexion->query($querynotas);
        $notas = $result->fetchAll(PDO::FETCH_OBJ);
        $dato['notas'] = $notas;

        array_push($tickets,$dato);

    }


    $sqlAut = "SELECT * FROM AutorizacionMedica
            INNER JOIN Unidad ON Unidad.Uni_clave = AutorizacionMedica.UNI_claveint
            INNER JOIN Compania ON Compania.Cia_clave =  AutorizacionMedica.EMP_claveint
            where AUM_folioMV = '$expediente'";

    $result = $conexion->query($sqlAut);
    $autorizacion = $result->fetch();

    foreach ($conexion->query($sqlAut) as $item) {
        $numeroautorizacion = $item['AUM_clave'];
    }
    
    $sqlMov = "SELECT * FROM MovimientoAut 
            INNER JOIN TipoMovimiento ON MovimientoAut.TIM_claveint = TipoMovimiento.TIM_claveint 
            INNER JOIN Usuario ON MovimientoAut.USU_registro = Usuario.USU_claveMV
            WHERE AUM_clave = '$numeroautorizacion' ";

    $result = $conexion->query($sqlMov);
    $movimientos = $result->fetchAll(PDO::FETCH_OBJ);


    $sqlHos = "SELECT * FROM Hospitalario where Exp_folio = '$expediente'";
    $result = $conexion->query($sqlHos);
    $hospitalario = $result->fetch();

    $resultado['detalle'] = $datos;
    // $resultado['tickets'] = $tickets;
    $resultado['autorizacion'] = $autorizacion;
    $resultado['movimientos'] = $movimientos;
    $resultado['hospitalario'] = $hospitalario;
    $resultado['documentos'] = $documentos;
    
    echo json_encode($resultado);

    $conexion = null;

}

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

        $criterio6 .= "AutorizacionMedica.EMP_claveint = $cliente";

    }else{
        $criterio6 = "";
    }

    $sql .= $criterio1 . $criterio2 . $criterio3 . $criterio4 . $criterio5 . $criterio6;

    $result = $db->query($sql);
    $autorizaciones = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($autorizaciones);

     //echo $sql;

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

    $empresa = $datos->cliente;
    $unidad = $datos->unidad;
    $fecha = $datos->fecha;
    $lesionado = $datos->nombrelesionado;
    $edad = $datos->edad;
    $medico = $datos->medico;
    $diagnostico = $datos->diagnostico;
    $usuario = $datos->usuario;
    $folio = $datos->folio;
    $tipoautorizacion = $datos->tipoautorizacion;
    //$usuariocomercial = $datos->autorizacioncomercial;
    
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
                     UCO_claveint,
                     TA_clave                     
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
                    :usuariocomercial,
                    :tipoautorizacion
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
        $temporal->bindParam("tipoautorizacion", $tipoautorizacion, PDO::PARAM_INT);
        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", "clave" => $clave);
            //$correo($html);


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
    
    include_once('../lib/nomad_mimemail.inc.php');

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $AUMClave = $datos->clave;
    $TIMClave = $datos->tipo;
    $fecha = $datos->fecha;
    $texto = $datos->descripcion;
    $usuario = $datos->usuario;
    $usuariocomercial = $datos->autorizacioncomercial;

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
                   MOA_fechaReg,
                   UCO_claveint
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
                    now(),
                    :usuariocomercial
              )";

        $temporal = $db->prepare($sql);
        $temporal->bindParam("AUMClave", $AUMClave, PDO::PARAM_STR, 5);
        $temporal->bindParam("MOAClave", $MOAClave, PDO::PARAM_INT);
        $temporal->bindParam("TIMClave", $TIMClave, PDO::PARAM_INT);
        $temporal->bindParam("fecha", $fecha);
        $temporal->bindParam("texto", $texto , PDO::PARAM_STR);
        $temporal->bindParam("usuario", $usuario , PDO::PARAM_INT);
        $temporal->bindParam("usuariocomercial", $usuariocomercial , PDO::PARAM_INT);

        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente");
            

            if ($usuariocomercial) {

                $sql = "SELECT AUM_clave as clave, AUM_fecha as fecha, Cia_nombrecorto as cliente, Uni_nombreMV as unidad, AUM_lesionado as lesionado, AUM_folioMV as folio, AUM_fechaReg as fecharegistro, AUM_diagnostico as diagnostico, AUM_edad, AUM_medico  FROM AutorizacionMedica 
                        INNER JOIN Unidad ON Unidad.Uni_clave = AutorizacionMedica.UNI_claveint
                        INNER JOIN Compania ON Compania.Cia_clave =  AutorizacionMedica.EMP_claveint
                        WHERE AUM_clave = '$AUMClave'";
                        
                foreach ($db->query($sql) as $row) {
                    $nombreUnidad = $row['unidad'];
                    $nombreEmpresa = $row['cliente'];
                    $lesionado = $row['lesionado'];
                    $edad = $row['AUM_edad'];
                    $medico = $row['AUM_medico'];
                    $diagnostico = $row['diagnostico'];
                }

                $sql = "SELECT UCO_Nombre FROM UsuarioComercial WHERE UCO_claveint = $usuariocomercial";
                foreach ($db->query($sql) as $row) {
                    $nombreComercial = $row['UCO_Nombre'];
                }

                $sql = "SELECT TIM_claveint as id, TIM_nombreE as Nombre FROM TipoMovimiento Where TIM_claveint = $TIMClave";
                foreach ($db->query($sql) as $row) {
                    $nombreMovimiento = $row['Nombre'];
                }


                $contenido = generaTabla($AUMClave,$fecha,$nombreEmpresa,$nombreUnidad,$lesionado,$edad,$medico,$diagnostico,$nombreComercial,$nombreMovimiento,$texto);
                
                $mimemail = new nomad_mimemail();
                $mimemail->set_from("reportes@medicavial.com.mx");
                $mimemail->set_to("agutierrez@medicavial.com.mx");
                $mimemail->add_cc("jsanchez@medicavial.com.mx");
                $mimemail->add_bcc("adominguez@medicavial.com.mx");
                $mimemail->add_bcc("salcala@medicavial.com.mx");

                $mimemail->set_subject("Autorizaciones Comerciales");
            
                $mimemail->set_html("$contenido");

                if ($mimemail->send()){
                //    echo "The MIME Mail has been sent";
                }
                 else {
                //    echo "An error has occurred, mail was not sent";
                }

            }

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
        
        $sql = "SELECT TIM_claveint as id, TIM_nombreE as Nombre FROM TipoMovimiento Where TIM_activo = 1 GROUP BY TIM_nombreE ORDER BY TIM_nombreE";

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
        
        $sql = "SELECT Uni_clave as id, Uni_nombreMV as Nombre FROM Unidad Where Uni_activa='S' and UNI_clave <> 8 ORDER BY Uni_nombreMV";

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
///     ANA  //////

if ($funcion == 'agenda') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $AUMClave = $datos->autorizacion;
    $proveedor = $datos->proveedor;
    $costo = $datos->costo;
    $tipo = $datos->tipo;
    $notas = $datos->notas;
    $referencia = $datos->referencia;
    $fechacita = $datos->fechacita;
    $horacita = $datos ->horacita;
    $paciente = $datos ->paciente;
    $proveedor1 = $datos ->proveedor1;
    $fecha = $datos->fecha;
    $hora = $datos->hora;
    $usuario = $datos->usuario;
    $status = 1;
    $fecha_hoy = date("Y-m-d");
    $hora_hoy = date("H:i:s");
    $movimiento = $datos->movimiento;
    

    $db = conectarMySQL();

    
    $sql = "SELECT * FROM RegistroCitas 
                WHERE AUM_clave = '$AUMClave' and RC_movimiento='$movimiento'";
    $result = $db->query($sql);
    $numero = $result->rowCount();
    
    if ($numero>0){

        $respuesta = array('respuesta' => 'La autorización ya existe');
        
    }else{

        $sql = "INSERT INTO RegistroCitas  (
                            AUM_clave
                            ,RC_movimiento
                            ,RC_proveedor
                            ,RC_costo
                            ,RC_tipocita
                            ,RC_obs
                            ,RC_conproveedor
                            ,RC_status
                            ,RC_inforeferencia
                            ,RC_fechahora
                            ,RC_hora
                            ,RC_paciente  
                            ,RC_fecharegistro
                            ,RC_fechaconfirmada
                            ,RC_horaconfirmada
                            ,Usu_registro                          
                ) VALUES (:autorizacion,:movimiento,:proveedor,:costo,:tipo,:notas,:proveedor1,'$status',:referencia,:fechacita,:horacita,:paciente, now(), '$fecha_hoy', '$hora_hoy', :usuario)";
        
        $temporal = $db->prepare($sql);


        $temporal->bindParam("autorizacion", $AUMClave);
        $temporal->bindParam("movimiento", $movimiento);
        $temporal->bindParam("proveedor", $proveedor);
        $temporal->bindParam("costo", $costo);
        $temporal->bindParam("tipo", $tipo);
        $temporal->bindParam("notas", $notas);
        $temporal->bindParam("proveedor1", $proveedor1);
        $temporal->bindParam("referencia", $referencia);
        $temporal->bindParam("fechacita", $fechacita);
        $temporal->bindParam("horacita", $horacita);
        $temporal->bindParam("paciente", $paciente);
        $temporal->bindParam("usuario", $usuario);
        // $temporal->bindParam("fecha", $fecha);
        // $temporal->bindParam("hora", $hora);
        
        
        
        
        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Cita Confirmada", 'movimiento' => $movimiento);
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
    }
    
    echo json_encode($respuesta);
    //echo $sql;

    $conexion = null;
}

if ($funcion == 'confirmar') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $AUMClave = $datos->autorizacion;
    $proveedor = $datos->proveedor;
    $costo = $datos->costo;
    $tipo = $datos->tipo;
    $notas = $datos->notas;
    $referencia = $datos->referencia;
    $fechacita = $datos->fechacita;
    $horacita = $datos->horacita;
    $paciente = $datos->paciente;
    $proveedor1 = $datos->proveedor1;
    $fecha = $datos->fecha;
    $hora = $datos->hora;
    $usuario = $datos->usuario;
    $status = 2;
    $fecha_hoy = date("Y-m-d");
    $hora_hoy = date("H:i:s");
    $movimiento = $datos->movimiento;
    

    $db = conectarMySQL();

    
    $sql = "SELECT * FROM RegistroCitas 
                WHERE AUM_clave = '$AUMClave' and RC_movimiento= '$movimiento'";
    $result = $db->query($sql);
    $numero = $result->rowCount();
    
    if ($numero>0){

        $respuesta = array('respuesta' => 'La autorización ya existe');
        
    }else{

        $sql = "INSERT INTO RegistroCitas  (
                            clave
                            ,AUM_clave
                            ,RC_movimiento
                            ,RC_proveedor
                            ,RC_costo
                            ,RC_tipocita
                            ,RC_obs
                            ,RC_conproveedor
                            ,RC_status
                            ,RC_inforeferencia
                            ,RC_fechahora
                            ,RC_hora
                            ,RC_paciente    
                            ,RC_fecharegistro
                            ,Usu_registro                       
                ) VALUES ('',:autorizacion,:movimiento ,:proveedor,:costo,:tipo,:notas,:proveedor1,'$status',:referencia,:fechacita,:horacita,:paciente, now(),:usuario)";
        
        $temporal = $db->prepare($sql);

        $temporal->bindParam("autorizacion", $AUMClave);
        $temporal->bindParam("movimiento", $movimiento);
        $temporal->bindParam("proveedor", $proveedor);
        $temporal->bindParam("costo", $costo);
        $temporal->bindParam("tipo", $tipo);
        $temporal->bindParam("notas", $notas);
        $temporal->bindParam("proveedor1", $proveedor1);
        $temporal->bindParam("referencia", $referencia);
        $temporal->bindParam("fechacita", $fechacita);
        $temporal->bindParam("horacita", $horacita);
        $temporal->bindParam("paciente", $paciente);
        $temporal->bindParam("usuario", $usuario);
        // $temporal->bindParam("fecha", $fecha);
        // $temporal->bindParam("hora", $hora);
        
        
        
        
        if ($temporal->execute()){
            $respuesta = array('respuesta' => "Cita por confirmar");
        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
    }
    
    echo json_encode($respuesta);
    //echo $sql;

    $conexion = null;
}

if ($funcion == 'buscarAutorizacion') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;



    $sql = "SELECT  CONCAT(a.AUM_clave,'-',MOA_claveint) as  autorizacion1,a.AUM_clave as autorizacion, AUM_lesionado as lesionado, TIM_nombre as tipo ,MOA_claveint as movimiento ,f.TIM_claveint as clave_tipo ,UNI_nombreMV as unidad, AUM_fechareg as fecha, Cia_nombrecorto as cliente 
            FROM AutorizacionMedica a
            INNER JOIN Unidad d on a.Uni_claveint=d.Uni_clave
            INNER JOIN Compania e on a.EMP_claveint=e.cia_clave 
            INNER JOIN MovimientoAut f on a.AUM_clave=f.AUM_clave
            INNER JOIN TipoMovimiento g on f.TIM_claveint=g.TIM_claveint WHERE";

    if ($folio != '') {

        $criterio1 = " a.AUM_clave = '$folio' ";

    }else{
        $criterio1 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' ) {
        }else{
            $criterio2 = " AND ";
        }

        $criterio2 = " a.AUM_clave = '$autorizacion' ";

    }else{

        $criterio2 = "";

    }    

         $criterio3 = "and NOT EXISTS (select null as autorizacion from RegistroCitas b WHERE b.AUM_clave=a.AUM_clave) and 
                        (f.TIM_claveint='3' or f.TIM_claveint='4') and AUM_fechareg>='2014-11-01'";


    $sql .= $criterio1 . $criterio2 . $criterio3;
    

    $result = $db->query($sql);
    $autoriza = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;

    echo json_encode($autoriza);

}
if ($funcion == 'consultaAut') {

    $fecha = date('Y-m-d');

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT  CONCAT(a.AUM_clave,'-',MOA_claveint) as  autorizacion1,a.AUM_clave as autorizacion, MOA_claveint as movimiento, AUM_folioMV as folio, f.TIM_claveint as clave_tipo, MOA_texto as descripcion,TIM_nombre as tipo,AUM_lesionado as lesionado, UNI_nombreMV as unidad, AUM_fechareg as fecha, Cia_nombrecorto as cliente
                FROM AutorizacionMedica a
                INNER JOIN Unidad d on a.Uni_claveint=d.Uni_clave
                INNER JOIN Compania e on a.EMP_claveint=e.cia_clave
                INNER JOIN MovimientoAut f on a.AUM_clave=f.AUM_clave
                INNER JOIN TipoMovimiento g on f.TIM_claveint=g.TIM_claveint
                where NOT EXISTS (select null as autorizacion from RegistroCitas b WHERE b.AUM_clave=a.AUM_clave and b.RC_movimiento=f.MOA_claveint) and (f.TIM_claveint='3'
                or f.TIM_claveint='4') and AUM_fechareg>='2014-11-01' and TA_clave<>'2'
                ORDER BY fecha  DESC";

        $result = $db->query($sql);
        $autoriza = $result->fetchAll(PDO::FETCH_OBJ);

 //       echo json_encode($autoriza);
        //echo $sql;

        $sql = "SELECT  count(a.AUM_clave) as contador
                FROM AutorizacionMedica a
                INNER JOIN Unidad d on a.Uni_claveint=d.Uni_clave
                INNER JOIN Compania e on a.EMP_claveint=e.cia_clave
                INNER JOIN MovimientoAut f on a.AUM_clave=f.AUM_clave
                INNER JOIN TipoMovimiento g on f.TIM_claveint=g.TIM_claveint
                where NOT EXISTS (select null as autorizacion from RegistroCitas b WHERE b.AUM_clave=a.AUM_clave and b.RC_movimiento=f.MOA_claveint) and (f.TIM_claveint='3'
                or f.TIM_claveint='4') and AUM_fechareg>='2014-11-01' and TA_clave<>'2'";

        foreach ($db->query($sql) as $row) {
            $contador = $row['contador'];
        }
        $db = null;
 //       echo json_encode($contador);

        $respuesta  = array('autoriza' => $autoriza, 'contador' => $contador);
        echo json_encode($respuesta);
        //$sql;


    }
    
}
if ($funcion == 'buscarConfirmados') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;



    $sql = "SELECT AUM_clave as autorizacion, TIM_nombre as tipo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
            INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint WHERE";

    if ($folio != '') {

        $criterio1 = " AND ";
        $criterio1 .= "AUM_folioMV = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' and $criterio0 != '') {
        }else{
            $criterio2 = " AND ";
        }

        $criterio2 .= "AUM_clave = '$autorizacion' ";

    }else{

        $criterio2 = "";

    }

        $criterio0 = " RC_status='2'";

    $sql .= $criterio0 . $criterio1 . $criterio2;

    $result = $db->query($sql);
    $confirmaciones = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($confirmaciones);

    //echo $sql;

}

if ($funcion == 'detalleAgenda') {

    $numeroautorizacion = $_REQUEST['autorizacion'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT  *
                FROM AutorizacionMedica a
                INNER JOIN Unidad d on a.Uni_claveint=d.Uni_clave
                INNER JOIN Compania e on a.EMP_claveint=e.cia_clave
                INNER JOIN MovimientoAut f on a.AUM_clave=f.AUM_clave
                INNER JOIN TipoMovimiento g on f.TIM_claveint=g.TIM_claveint
                INNER JOIN Expediente h on a.AUM_folioMV=h.Exp_folio
                where NOT EXISTS (select null as autorizacion from RegistroCitas b WHERE b.AUM_clave=a.AUM_clave and b.RC_movimiento=f.MOA_claveint) and (f.TIM_claveint='3'
                or f.TIM_claveint='4') and a.AUM_clave='$numeroautorizacion'";

        $result = $db->query($sql);
        $autorizacion = $result->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        echo json_encode($autorizacion);
        //echo $sql;

    }

    }

    if ($funcion == 'detallealtacita') {

    $numeroautorizacion = $_REQUEST['autorizacion'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT * FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on b.TIM_claveint=a.RC_tipocita
                INNER JOIN AutorizacionMedica c on a.AUM_clave=c.AUM_clave
                INNER JOIN Expediente d on c.AUM_folioMV=d.Exp_folio
                where a.AUM_clave = '$numeroautorizacion'";

        $result = $db->query($sql);
        $confirma = $result->fetchAll(PDO::FETCH_OBJ);

        $db = null;

        echo json_encode($confirma);
        //echo $sql;
    }

    }


    if ($funcion == 'detalleobservacion') {

    $numeroautorizacion = $_REQUEST['autorizacion'];
    $tipo = $_REQUEST['tipo'];
    $movimiento = $_REQUEST['movimiento'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT * FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on b.TIM_claveint=a.RC_tipocita
                where AUM_clave = '$numeroautorizacion'";

         foreach ($db->query($sql) as $row) {
            $proveedor = $row['RC_proveedor'];
            $clave = $row['AUM_clave'];
            $costo = $row['RC_tipocita'];
            $tipo = $row['RC_tipocita'];
            $obs = $row['RC_obs'];
            $referencia = $row['RC_inforeferencia'];
            $fechahora = $row['RC_fechahora'];
            $hora = $row['RC_hora'];
            $paciente = $row['RC_paciente'];
            $conproveedor = $row['RC_conproveedor'];
            $resobservacion = $row['RC_resobservacion'];
            $observacioncoor = $row['RC_observacioncoor'];
            $preexistencia = $row['RC_preexistencia'];

        }

        $db = null;

            $ruta = "../archivo/$numeroautorizacion-$movimiento/";


      $directorio = opendir("../archivo/$numeroautorizacion-$movimiento/"); //ruta actual
        while ($archivo1 = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo1))//verificamos si es o no un directorio
            {
                //echo "[".$archivo . "]<br />"; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {   
     
                    $archivo[] = $archivo1;
                
            
            }
        }

        $respuesta  = array('archivo' => $archivo, 'proveedor' => $proveedor, 'clave' => $clave, 'costo' => $costo, 'tipo' => $tipo, 'observacion' => $obs
                           , 'inforeferencia' => $referencia, 'fecha' => $fechahora, 'hora' => $hora, 'paciente' => $paciente, 'conproveedor' => $conproveedor
                           , 'resobservacion' => $resobservacion, 'observacioncoor' => $observacioncoor, 'preexistencia' => $preexistencia, 'movimiento' => $movimiento);

        
        //echo $archivo;
    }

    echo json_encode($respuesta);

    }


    if ($funcion == 'actualizacita') {

    //$numeroautorizacion = $_REQUEST['autorizacion'];

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;
    $paciente = $datos->paciente;
    $proveedor = $datos->proveedor1;
    $fecha = $datos->fecha;
    $hora = $datos->hora;
    $confirmar = 1;
    $fecha_hoy = date("Y-m-d");
    $hora_hoy = date("H:i:s");


    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "UPDATE RegistroCitas a 
                SET
                
                 RC_fechaconfirmada='$fecha_hoy'
                ,RC_horaconfirmada='$hora_hoy'
                ,RC_paciente='$paciente'
                ,RC_conproveedor='$proveedor'
                ,RC_status='$confirmar'
                where AUM_clave = '$autorizacion'";

  //      $result = $db->query($sql);

        $temporal = $db->prepare($sql);

        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Tu cita fue Confirmada", "clave" => $autorizacion);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información", "clave" => $autorizacion);
        }
        
        echo json_encode($respuesta);
        //echo $sql;
}
    }

if ($funcion == 'pagina') {

    $html =  generaTabla(1,'2014-01-01','Qualitas','MV ROMA','JOSE LUIS CHACON CRUZ','99','MEDICO','ESTA PUEDE SER LA ULTIMA PRUEBA DE AUTORIZACIÓN','Jose Abraham Sanchez Hernandez');
    echo $html;
}

if ($funcion == 'consultaConfirmaciones') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT CONCAT(a.AUM_clave,'-',MOA_claveint) AS autorizacion1,a.AUM_clave as autorizacion, TIM_nombre as tipo, AUM_folioMV as folio, RC_costo as costo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint
                INNER JOIN AutorizacionMedica c on a.AUM_clave=c.AUM_clave
                INNER JOIN MovimientoAut d on c.AUM_clave=d.AUM_clave
                WHERE RC_status='2' limit 30";

                // INNER JOIN Usuario ON Usuario.USU_claveMV = AutorizacionMedica.USU_registro

        $result = $db->query($sql);
        $confirma = $result->fetchAll(PDO::FETCH_OBJ);

         $sql = "SELECT count(*) as contador FROM RegistroCitas  where RC_status='2'";
         foreach ($db->query($sql) as $row) {
            $contadorcita = $row['contador'];
        }
        $db = null;
 //       echo json_encode($contador);

        $respuesta  = array('confirma' => $confirma, 'contadorcita' => $contadorcita);
        echo json_encode($respuesta);

    }
    
}

function generaTabla($clave,$fecha,$nombreEmpresa,$nombreUnidad,$lesionado,$edad,$medico,$diagnostico,$nombreComercial,$nombreMovimiento,$texto){

    $html= "<style type='text/css'>
                <!--
                /* ------------------
                 styling for the tables 
                   ------------------   */


                body
                {
                    line-height: 1.6em;
                }

                #hor-minimalist-a
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    background: #fff;
                    margin: 45px;
                    width: 480px;
                    border-collapse: collapse;
                    text-align: left;
                }
                #hor-minimalist-a th
                {
                    font-size: 14px;
                    font-weight: normal;
                    color: #039;
                    padding: 10px 8px;
                    border-bottom: 2px solid #6678b1;
                }
                #hor-minimalist-a td
                {
                    color: #669;
                    padding: 9px 8px 0px 8px;
                }
                #hor-minimalist-a tbody tr:hover td
                {
                    color: #009;
                }


                #hor-minimalist-b
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    background: #fff;
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                #hor-minimalist-b th
                {
                    font-size: 14px;
                    font-weight: normal;
                    color: #039;
                    padding: 10px 8px;
                    border-bottom: 2px solid #6678b1;
                }
                #hor-minimalist-b td
                {
                    border-bottom: 1px solid #ccc;
                    color: #669;
                    padding: 6px 8px;
                }
                #hor-minimalist-b tbody tr:hover td
                {
                    color: #009;
                }


                #ver-minimalist
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #ver-minimalist th
                {
                    padding: 8px 2px;
                    font-weight: normal;
                    font-size: 14px;
                    border-bottom: 2px solid #6678b1;
                    border-right: 30px solid #fff;
                    border-left: 30px solid #fff;
                    color: #039;
                }
                #ver-minimalist td
                {
                    padding: 12px 2px 0px 2px;
                    border-right: 30px solid #fff;
                    border-left: 30px solid #fff;
                    color: #669;
                }


                #box-table-a
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #box-table-a th
                {
                    font-size: 13px;
                    font-weight: normal;
                    padding: 8px;
                    background: #b9c9fe;
                    border-top: 4px solid #aabcfe;
                    border-bottom: 1px solid #fff;
                    color: #039;
                }
                #box-table-a td
                {
                    padding: 8px;
                    background: #e8edff; 
                    border-bottom: 1px solid #fff;
                    color: #669;
                    border-top: 1px solid transparent;
                }
                #box-table-a tr:hover td
                {
                    background: #d0dafd;
                    color: #339;
                }


                #box-table-b
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: center;
                    border-collapse: collapse;
                    border-top: 7px solid #9baff1;
                    border-bottom: 7px solid #9baff1;
                }
                #box-table-b th
                {
                    font-size: 13px;
                    font-weight: normal;
                    padding: 8px;
                    background: #e8edff;
                    border-right: 1px solid #9baff1;
                    border-left: 1px solid #9baff1;
                    color: #039;
                }
                #box-table-b td
                {
                    padding: 8px;
                    background: #e8edff; 
                    border-right: 1px solid #aabcfe;
                    border-left: 1px solid #aabcfe;
                    color: #669;
                }


                #hor-zebra
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #hor-zebra th
                {
                    font-size: 14px;
                    font-weight: normal;
                    padding: 10px 8px;
                    color: #039;
                }
                #hor-zebra td
                {
                    padding: 8px;
                    color: #669;
                }
                #hor-zebra .odd
                {
                    background: #e8edff; 
                }


                #ver-zebra
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #ver-zebra th
                {
                    font-size: 14px;
                    font-weight: normal;
                    padding: 12px 15px;
                    border-right: 1px solid #fff;
                    border-left: 1px solid #fff;
                    color: #039;
                }
                #ver-zebra td
                {
                    padding: 8px 15px;
                    border-right: 1px solid #fff;
                    border-left: 1px solid #fff;
                    color: #669;
                }
                .vzebra-odd
                {
                    background: #eff2ff;
                }
                .vzebra-even
                {
                    background: #e8edff;
                }
                #ver-zebra #vzebra-adventure, #ver-zebra #vzebra-children
                {
                    background: #d0dafd;
                    border-bottom: 1px solid #c8d4fd;
                }
                #ver-zebra #vzebra-comedy, #ver-zebra #vzebra-action
                {
                    background: #dce4ff;
                    border-bottom: 1px solid #d6dfff;
                }


                #one-column-emphasis
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #one-column-emphasis th
                {
                    font-size: 14px;
                    font-weight: normal;
                    padding: 12px 15px;
                    color: #039;
                }
                #one-column-emphasis td
                {
                    padding: 10px 15px;
                    color: #669;
                    border-top: 1px solid #e8edff;
                }
                .oce-first
                {
                    background: #d0dafd;
                    border-right: 10px solid transparent;
                    border-left: 10px solid transparent;
                }
                #one-column-emphasis tr:hover td
                {
                    color: #339;
                    background: #eff2ff;
                }


                #newspaper-a
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    border: 1px solid #69c;
                }
                #newspaper-a th
                {
                    padding: 12px 17px 12px 17px;
                    font-weight: normal;
                    font-size: 14px;
                    color: #039;
                    border-bottom: 1px dashed #69c;
                }
                #newspaper-a td
                {
                    padding: 7px 17px 7px 17px;
                    color: #669;
                }
                #newspaper-a tbody tr:hover td
                {
                    color: #339;
                    background: #d0dafd;
                }


                #newspaper-b
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    border: 1px solid #69c;
                }
                #newspaper-b th
                {
                    padding: 15px 10px 10px 10px;
                    font-weight: normal;
                    font-size: 14px;
                    color: #039;
                }
                #newspaper-b tbody
                {
                    background: #e8edff;
                }
                #newspaper-b td
                {
                    padding: 10px;
                    color: #669;
                    border-top: 1px dashed #fff;
                }
                #newspaper-b tbody tr:hover td
                {
                    color: #339;
                    background: #d0dafd;
                }


                #newspaper-c
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    border: 1px solid #6cf;
                }
                #newspaper-c th
                {
                    padding: 20px;
                    font-weight: normal;
                    font-size: 13px;
                    color: #039;
                    text-transform: uppercase;
                    border-right: 1px solid #0865c2;
                    border-top: 1px solid #0865c2;
                    border-left: 1px solid #0865c2;
                    border-bottom: 1px solid #fff;
                }
                #newspaper-c td
                {
                    padding: 10px 20px;
                    color: #669;
                    border-right: 1px dashed #6cf;
                }


                #rounded-corner
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #rounded-corner thead th.rounded-company
                {
                    background: #b9c9fe url('table-images/left.png') left -1px no-repeat;
                }
                #rounded-corner thead th.rounded-q4
                {
                    background: #b9c9fe url('table-images/right.png') right -1px no-repeat;
                }
                #rounded-corner th
                {
                    padding: 8px;
                    font-weight: normal;
                    font-size: 13px;
                    color: #039;
                    background: #b9c9fe;
                }
                #rounded-corner td
                {
                    padding: 8px;
                    background: #e8edff;
                    border-top: 1px solid #fff;
                    color: #669;
                }
                #rounded-corner tfoot td.rounded-foot-left
                {
                    background: #e8edff url('table-images/botleft.png') left bottom no-repeat;
                }
                #rounded-corner tfoot td.rounded-foot-right
                {
                    background: #e8edff url('table-images/botright.png') right bottom no-repeat;
                }
                #rounded-corner tbody tr:hover td
                {
                    background: #d0dafd;
                }


                #background-image
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    background: url('table-images/blurry.jpg') 330px 59px no-repeat;
                }
                #background-image th
                {
                    padding: 12px;
                    font-weight: normal;
                    font-size: 14px;
                    color: #339;
                }
                #background-image td
                {
                    padding: 9px 12px;
                    color: #669;
                    border-top: 1px solid #fff;
                }
                #background-image tfoot td
                {
                    font-size: 11px;
                }
                #background-image tbody td
                {
                    background: url('table-images/back.png');
                }
                * html #background-image tbody td
                {
                    /* 
                       ----------------------------
                        PUT THIS ON IE6 ONLY STYLE 
                        AS THE RULE INVALIDATES
                        YOUR STYLESHEET
                       ----------------------------
                    */
                    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='table-images/back.png',sizingMethod='crop');
                    background: none;
                }   
                #background-image tbody tr:hover td
                {
                    color: #339;
                    background: none;
                }


                #gradient-style
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                }
                #gradient-style th
                {
                    font-size: 13px;
                    font-weight: normal;
                    padding: 8px;
                    background: #b9c9fe url('table-images/gradhead.png') repeat-x;
                    border-top: 2px solid #d3ddff;
                    border-bottom: 1px solid #fff;
                    color: #039;
                }
                #gradient-style td
                {
                    padding: 8px; 
                    border-bottom: 1px solid #fff;
                    color: #669;
                    border-top: 1px solid #fff;
                    background: #e8edff url('table-images/gradback.png') repeat-x;
                }
                #gradient-style tfoot tr td
                {
                    background: #e8edff;
                    font-size: 12px;
                    color: #99c;
                }
                #gradient-style tbody tr:hover td
                {
                    background: #d0dafd url('table-images/gradhover.png') repeat-x;
                    color: #339;
                }


                #pattern-style-a
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    background: url('table-images/pattern.png');
                }
                #pattern-style-a thead tr
                {
                    background: url('table-images/pattern-head.png');
                }
                #pattern-style-a th
                {
                    font-size: 13px;
                    font-weight: normal;
                    padding: 8px;
                    border-bottom: 1px solid #fff;
                    color: #039;
                }
                #pattern-style-a td
                {
                    padding: 8px; 
                    border-bottom: 1px solid #fff;
                    color: #669;
                    border-top: 1px solid transparent;
                }
                #pattern-style-a tbody tr:hover td
                {
                    color: #339;
                    background: #fff;
                }


                #pattern-style-b
                {
                    font-family: 'Lucida Sans Unicode', 'Lucida Grande', Sans-Serif;
                    font-size: 12px;
                    margin: 45px;
                    width: 480px;
                    text-align: left;
                    border-collapse: collapse;
                    background: url('table-images/patternb.png');
                }
                #pattern-style-b thead tr
                {
                    background: url('table-images/patternb-head.png');
                }
                #pattern-style-b th
                {
                    font-size: 13px;
                    font-weight: normal;
                    padding: 8px;
                    border-bottom: 1px solid #fff;
                    color: #039;
                }
                #pattern-style-b td
                {
                    padding: 8px; 
                    border-bottom: 1px solid #fff;
                    color: #669;
                    border-top: 1px solid transparent;
                }
                #pattern-style-b tbody tr:hover td
                {
                    color: #339;
                    background: #cdcdee;
                }
                -->        
            </style>";
    $html.="<table id='hor-minimalist-b' summary='Autorizaciones Comerciales MV'>
                <thead>
                    <tr>
                        <th scope='col' colspan='9' align='center'><div align='center' >Autorizaciones Comerciales</div></td>
                    </tr>
                    <tr>
                        <th scope='col'>Folio</th>
                        <th scope='col'>Fecha</th>
                        <th scope='col'>Cliente</th>
                        <th scope='col'>Unidad</th>
                        <th scope='col'>Lesionado</th>
                        <th scope='col'>Edad</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>".$clave."</td>
                        <td>".$fecha."</td>
                        <td>".utf8_decode($nombreEmpresa)."</td>
                        <td>".utf8_decode($nombreUnidad)."</td>
                        <td>".utf8_decode($lesionado)."</td>
                        <td>".utf8_decode($edad)."</td>  
                    </tr>
                </tbody>
            </table>
            <table id='hor-minimalist-b' summary='Autorizaciones Comerciales MV'>
                <thead>
                    <tr>
                        <th scope='col'>Medico Tratante</th>
                        <th scope='col'>Diagnostico</th>
                        <th scope='col'>Autorizacion Comercial</th>
                        <th scope='col'>Tipo Movimiento</th>
                        <th scope='col'>Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>".utf8_decode($medico)."</td>
                        <td>".utf8_decode($diagnostico)."</td>
                        <td>".utf8_decode($nombreComercial)."</td>
                        <td>".utf8_decode($nombreMovimiento)."</td>
                        <td>".utf8_decode($texto)."</td>
                    </tr>
                </tbody>
            </table>";

    return $html;

}


if ($funcion == 'temporal') {

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;

 
        if (is_uploaded_file($_FILES['file']['tmp_name'])) {
      
        copy($_FILES['file']['tmp_name'], '../archivo/'. $_FILES['file']['name']);
        $file_name = $_FILES['file']['name'];
        $subido = true;
        }
        if($subido) {
           $respuesta = array('respuesta' => "El Archivo subio con exito", 'ruta' => $file_name);
        } else {
        $respuesta = array('respuesta' => "Error al subir el archivo");
        }
        echo json_encode($respuesta);

}

if ($funcion == 'guardaresultado') {

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);
   // $nombre = $_REQUEST['nombre'];

    $autorizacion = $datos->autorizacion;
    $movimiento = $datos->movimiento;
    $observaciones = $datos->observaciones;
    $preexistencia = $datos->preexistencia;
    $reagendado = $datos->reagendado;
    $archivos = $datos->archivo;


    mkdir("../archivo/".$autorizacion."-".$movimiento."/", 0755);

    foreach ($archivos as  $archi) {

        copy("../archivo/$archi", "../archivo/$autorizacion-$movimiento/$archi");
        unlink("../archivo/$archi");
    }
       
    $status = 4;

     $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "UPDATE RegistroCitas a 
                SET

                 RC_resobservacion='$observaciones'
                ,RC_preexistencia='".$preexistencia."'
                ,RC_reagendado='".$reagendado."'
                ,RC_status ='$status'
                where AUM_clave = '$autorizacion' ";

    //    $result = $db->query($sql);

        $temporal = $db->prepare($sql);

        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Datos guardados");
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
        //echo json_encode($respuesta);
        
}

    }

if ($funcion == 'consultaResultados') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT distinct CONCAT(a.AUM_clave,'-',RC_movimiento) AS autorizacion1,a.AUM_clave as autorizacion,RC_movimiento as movimiento ,RC_status ,TIM_nombre as tipo, d.TIM_claveint as clave_tipo,AUM_folioMV as folio ,RC_costo as costo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint
                INNER JOIN AutorizacionMedica c on a.AUM_clave=c.AUM_clave
                INNER JOIN MovimientoAut d on c.AUM_clave=d.AUM_clave
                WHERE RC_status='1' limit 100";

                // INNER JOIN Usuario ON Usuario.USU_claveMV = AutorizacionMedica.USU_registro

        $result = $db->query($sql);
        $resultado = $result->fetchAll(PDO::FETCH_OBJ);

         $sql = "SELECT count(*) as contador FROM RegistroCitas  where RC_status='1'";
         foreach ($db->query($sql) as $row) {
            $contadorres = $row['contador'];
        }
        $db = null;
 //       echo json_encode($contador);

        $respuesta  = array('resultado' => $resultado, 'contadorres' => $contadorres);
        echo json_encode($respuesta);

    }
    
}

if ($funcion == 'buscarResultados') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;



    $sql = "SELECT CONCAT(a.AUM_clave,'-',RC_movimiento) as  autorizacion1,AUM_clave as autorizacion, 
            TIM_nombre as tipo ,RC_movimiento as movimiento, b.TIM_claveint as clave_tipo ,RC_paciente as paciente, RC_proveedor as proveedor 
            FROM RegistroCitas a
            INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint WHERE";

    if ($folio != '') {

        $criterio1 = " AND ";
        $criterio1 .= "AUM_folioMV = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' and $criterio0 != '') {
        }else{
            $criterio2 = " AND ";
        }

        $criterio2 .= "AUM_clave = '$autorizacion' ";

    }else{

        $criterio2 = "";

    }

        $criterio0 = " RC_status='1'";

    $sql .= $criterio0 . $criterio1 . $criterio2;

    $result = $db->query($sql);
    $resultados = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($resultados);

    //echo $sql;

}

if ($funcion == 'consultaObservacion') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT distinct CONCAT(a.AUM_clave,'-',RC_movimiento) AS autorizacion1,a.AUM_clave as autorizacion, b.TIM_claveint as clave_tipo, 
                RC_movimiento as movimiento ,TIM_nombre as tipo, RC_costo as costo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint
                INNER JOIN MovimientoAut c on a.AUM_clave=c.AUM_clave
                WHERE RC_status='4'";

        $result = $db->query($sql);
        $observacion = $result->fetchAll(PDO::FETCH_OBJ);

         $sql = "SELECT count(*) as contador FROM RegistroCitas  where RC_status='4'";
         foreach ($db->query($sql) as $row) {
            $contadorob = $row['contador'];
        }
        $db = null;
 //       echo json_encode($contador);

        $respuesta  = array('observacion' => $observacion, 'contadorob' => $contadorob);
        echo json_encode($respuesta);

    }
    
}

if ($funcion == 'buscarObservacion') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;



    $sql = "SELECT CONCAT(a.AUM_clave,'-',RC_movimiento) as  autorizacion1,AUM_clave as autorizacion, 
            TIM_nombre as tipo ,RC_movimiento as movimiento, b.TIM_claveint as clave_tipo ,RC_paciente as paciente, RC_proveedor as proveedor 
            FROM RegistroCitas a
            INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint WHERE";

    if ($folio != '') {

        $criterio1 = " AND ";
        $criterio1 .= "AUM_folioMV = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' and $criterio0 != '') {
        }else{
            $criterio2 = " AND ";
        }

        $criterio2 .= "AUM_clave = '$autorizacion' ";

    }else{

        $criterio2 = "";

    }

        $criterio0 = " RC_status='4'";

    $sql .= $criterio0 . $criterio1 . $criterio2;

    $result = $db->query($sql);
    $resultados = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($resultados);

    //echo $sql;

}

if ($funcion == 'consultaConcluidos') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT distinct CONCAT(a.AUM_clave,'-',RC_movimiento) AS autorizacion1,a.AUM_clave as autorizacion, RC_movimiento as movimiento, TIM_nombre as tipo, RC_costo as costo, RC_paciente as paciente, RC_proveedor as proveedor
                FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint
                INNER JOIN MovimientoAut c on a.AUM_clave=c.AUM_clave
                WHERE not exists
                (select * FROM PagosFactura tb where a.AUM_clave = tb.AUM_clave
                and a.RC_movimiento = tb.TIM_claveint) and RC_status='5'";

        $result = $db->query($sql);
        $concluido = $result->fetchAll(PDO::FETCH_OBJ);

         $sql = "SELECT COUNT(DISTINCT a.AUM_clave, a.RC_movimiento) as contador
                FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint
                INNER JOIN MovimientoAut c on a.AUM_clave=c.AUM_clave
                WHERE  not exists (select AUM_clave, TIM_claveint FROM PagosFactura tb where a.AUM_clave = tb.AUM_clave
                and a.RC_movimiento = tb.TIM_claveint) and RC_status='5'";

         foreach ($db->query($sql) as $row) {
            $contadorconcluido = $row['contador'];
        }
        $db = null;
 //       echo json_encode($contador);

        $respuesta  = array('concluido' => $concluido, 'contadorconcluido' => $contadorconcluido);
        echo json_encode($respuesta);

    }
    
}

if ($funcion == 'buscarConcluidos') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $folio = $datos->folio;
    $autorizacion = $datos->autorizacion;



    $sql = "SELECT AUM_clave as autorizacion, RC_movimiento as movimiento , TIM_nombre as tipo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
            INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint WHERE";

    if ($folio != '') {

        $criterio1 = " AND ";
        $criterio1 .= "AUM_folioMV = '$folio'";

    }else{
        $criterio1 = "";
    }

    if ($autorizacion != '') {

        if ($criterio1 == '' and $criterio0 != '') {
        }else{
            $criterio2 = " AND ";
        }

        $criterio2 .= "AUM_clave = '$autorizacion' ";

    }else{

        $criterio2 = "";

    }

        $criterio0 = " not exists
                        (select * FROM PagosFactura tb where a.AUM_clave = tb.AUM_clave
                        and a.RC_movimiento = tb.TIM_claveint) and RC_status='5'";

    $sql .= $criterio0 . $criterio1 . $criterio2;

    $result = $db->query($sql);
    $resultados = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($resultados);

    //echo $sql;

}

if ($funcion == 'actualizacoordinacion') {

    //$numeroautorizacion = $_REQUEST['autorizacion'];

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;
    $observacion = $datos->observacion;
    $preexistencia = $datos->preexistencia;


    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "UPDATE RegistroCitas a 
                SET
                
                 RC_observacioncoor='$observacion'
                ,RC_preexistencia='".$preexistencia."'
                where AUM_clave = '$autorizacion'";

  //      $result = $db->query($sql);

        $temporal = $db->prepare($sql);

        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Tus observaciones fueron guardadas", "clave" => $autorizacion, "correo" => true);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información", "clave" => $autorizacion);
        }
        
        echo json_encode($respuesta);
        //echo $sql;
}
    }


if ($funcion == 'enviacorreo') {

    include_once('../lib/nomad_mimemail.inc.php');

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->clave;
    $para = $datos->para;
    $copia = $datos->copia;
    $comentarios = $datos->comentarios;
    $status = 5;

    $ruta = "../archivo/$autorizacion/";

    $directorio = opendir($ruta); //ruta actual
        while ($archivo = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo))//verificamos si es o no un directorio
            {
                   $archivo; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {
                   $archivo;
        }
        $archi.= $archivo;
    }    
    $nombre = $archi;
     $string_sin_modificar = $nombre; 
     $nombre1 = substr($string_sin_modificar, 3); 

     $db = conectarMySQL();

    // $nombre1 = substr($nombre1,0,-1);

     $sql="select a.AUM_clave as autorizacion, AUM_lesionado as lesionado, AUM_folioMV as folio, TIM_nombre as tipo ,Uni_nombre as unidad,
            Cia_nombrecorto as cliente, RC_resobservacion as transcripcion, RC_preexistencia as preexistencia, RC_observacioncoor as observaciones
            from AutorizacionMedica a
            INNER JOIN RegistroCitas b on a.AUM_clave=b.AUM_clave
            INNER JOIN Unidad c on a.UNI_claveint=c.Uni_clave
            INNER JOIN Compania d on a.EMP_claveint=d.Cia_clave
            INNER JOIN TipoMovimiento e on b.RC_tipocita=e.TIM_claveint
            where a.AUM_clave='$autorizacion'";

    foreach ($db->query($sql) as $row) {
            $autoriza = $row['autorizacion'];
            $lesionado = $row['lesionado'];
            $folio = $row['folio'];
            $unidad = $row['unidad'];
            $cliente = $row['cliente'];
            $tipo = $row['tipo'];
            $transcripcion = $row['transcripcion'];
            $preexistencia = $row['preexistencia'];
            $observaciones = $row['observaciones'];


    $html="<style type='text/css'>
            .small font {
                color: #224B99;
            }
            .small font strong {
                font-size: 9px;
            }
            .clase1 {
                color: #224B99;
                font-size: 9px;
            }
            .clase1 font {
                font-family: Verdana, Geneva, sans-serif;
            }
            .clase1 font {
                font-size: 9px;
            }
            .clase1 font {
                font-size: small;
            }
            .clase1 font {
                font-weight: bold;
            }
            .clase2 {
                color: #224B99;
            }
            .clase3 {
                color: #224B99;
                font-size: 9px;
            }
            }
            </style>";


    $html.="<h3 class='clase2'><img src='file:../img/logomv.png' width='195' height='93' />Por medio del presente le hacemos llegar el resultado sobre la Autorizacion:<span class=''> $autorizacion</span></h3>
            <hr />
            <p><br />
      
          <span class='clase2'>Folio MedicaVial:<strong>$folio</strong><br />
          Nombre del Paciente:<strong>$lesionado</strong><br />
          Tipo de Autorizacion:<strong>$tipo</strong><br />
          Unidad de Atencion:<strong>$unidad</strong><br />
          Cliente:<strong>$cliente</strong><br />
          Transcripcion de Resultado:<strong>$transcripcion</strong><br />
          Preexistencia Detectada:<strong>$preexistencia</strong><br />
          Observacion de Coordinacion Medica:<strong>$observaciones</strong><br />
          Comentarios:<strong>$comentarios</strong></span>
        <p>
          
          <hr />          
          
          <FONT SIZE=2 class='clase3'>Abjunto encontrara archivo con el resultado</font><br />
          <FONT SIZE=2>Para cualquier asunto relacionado a esta informacion favor de comunicarse en los medios <a href='mailto:coordmed@medicavial.com.mx'>coordmed@medicavial.com.mx</a> o al 01 803 MEDICA</font><BR><HR>'; 

        </p>";

        }

        $db = null;

    $mimemail = new nomad_mimemail();
    $mimemail->set_from("resultadoscoordinacion@medicavial.com");
    $mimemail->set_to($para);
    $mimemail->add_cc($copia);
    $mimemail->add_bcc("adominguez@medicavial.com.mx");
    $mimemail->add_bcc("resultadoscoordinacion@medicavial.com.mx");


    $mimemail->set_subject("Informacion de Paciente Coordinacion Medica Medica Vial");        
    $mimemail->set_html($html);
    $mimemail->add_attachment($ruta.$nombre1,$nombre1);


    if ($mimemail->send()){
                 $correo = "si";
    }
    else {
                 $correo = "no";
   }

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "UPDATE RegistroCitas a 
                SET
                
                 RC_status='$status'

                where AUM_clave = '$autorizacion'";

        $temporal = $db->prepare($sql);

        
        if ($temporal->execute()){

           
            $respuesta = array('correo' => "Tus observaciones fueron guardadas", "clave" => $autorizacion);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información", "clave" => $autorizacion);
        }


    echo json_encode($respuesta);

}

}

    if ($funcion == 'detalleConcluido') {

    $numeroautorizacion = $_REQUEST['autorizacion'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT * FROM RegistroCitas a
                INNER JOIN TipoMovimiento b on b.TIM_claveint=a.RC_tipocita
                where AUM_clave = '$numeroautorizacion'";

        foreach ($db->query($sql) as $row) {
            $proveedor = $row['RC_proveedor'];
            $clave = $row['AUM_clave'];
            $costo = $row['RC_tipocita'];
            $tipo = $row['RC_tipocita'];
            $obs = $row['RC_obs'];
            $referencia = $row['RC_inforeferencia'];
            $fechahora = $row['RC_fechahora'];
            $hora = $row['RC_hora'];
            $paciente = $row['RC_paciente'];
            $conproveedor = $row['RC_conproveedor'];
            $resobservacion = $row['RC_resobservacion'];
            $observacioncoor = $row['RC_observacioncoor'];
            $preexistencia = $row['RC_preexistencia'];

        }

        $db = null;

         $ruta = "../archivo/$numeroautorizacion/";

         $directorio = opendir($ruta); //ruta actual
        while ($archivo = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo))//verificamos si es o no un directorio
            {
                   $archivo; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {
                   $archivo;
        }
        $archi.= $archivo;
    }    
     $nombre = $archi;
     $string_sin_modificar = $nombre; 
     $nombre1 = substr($string_sin_modificar, 3); 

      $respuesta  = array('archivo' => $nombre1, 'proveedor' => $proveedor, 'clave' => $clave, 'costo' => $costo, 'tipo' => $tipo, 'observacion' => $obs
                           , 'inforeferencia' => $referencia, 'fecha' => $fechahora, 'hora' => $hora, 'paciente' => $paciente, 'conproveedor' => $conproveedor
                           , 'resobservacion' => $resobservacion, 'observacioncoor' => $observacioncoor, 'preexistencia' => $preexistencia);



        echo json_encode($respuesta);
        //echo $sql;
    }

    }

    if ($funcion == 'detalleres') {

    $numeroautorizacion = $_REQUEST['autorizacion'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT  *
                FROM AutorizacionMedica a
                INNER JOIN RegistroCitas h on a.AUM_clave=h.AUM_clave
                where a.AUM_clave='$numeroautorizacion'";

        $result = $db->query($sql);
        $autorizacion = $result->fetchAll(PDO::FETCH_OBJ);

        $db = null;

    }

    echo json_encode($autorizacion);

    }


    if ($funcion == 'buscarConcluidos2') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $autorizacion = $datos->autorizacion;


   $sql = "SELECT AUM_clave as autorizacion, TIM_nombre as tipo, RC_paciente as paciente, RC_proveedor as proveedor FROM RegistroCitas a
            INNER JOIN TipoMovimiento b on a.RC_tipocita=b.TIM_claveint ";


    if ($autorizacion != '') {

        $criterio2=" where ";
        $criterio2.= " RC_status = '5' and ";
        $criterio2.= " AUM_clave = '$autorizacion' ";

    }else{

        $criterio2=" where ";
        $criterio2.= " RC_status = '5' ";

    }

    $sql .= $criterio2;

    $result = $db->query($sql);
    $resultados = $result->fetchAll(PDO::FETCH_OBJ);
    $db = null;


    echo json_encode($resultados);

    //echo $sql;

}

if ($funcion == 'cambiastatus') {
   
    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);


    $db = conectarMySQL();

    $autorizacion = $datos->autorizacion;


   $sql = "UPDATE RegistroCitas SET RC_status='1'  WHERE AUM_clave='$autorizacion'";


    $temporal = $db->prepare($sql);

        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Estatus Cambiado", "clave" => $autorizacion);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información", "clave" => $autorizacion);
        }


    echo json_encode($respuesta);

}

if ($funcion == 'eliminaarchivo'){

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);

    $archivos = $datos->archivo;
    $autorizacion  = $datos->autorizacion;


   if (file_exists("../archivo/$archivos")) {
    
       unlink("../archivo/$archivos");
         
         $respuesta  = array('respuesta' => 'Se elimino el archivo' );
   } else {
         $respuesta  = array('respuesta' => 'No elimino el archivo' );

   }
   //echo json_encode($respuesta);

}

   if ($funcion == 'archivo_temporal') {

        if (is_uploaded_file($_FILES['file']['tmp_name'])) {

            //mkdir("../Facturas/temporal/", 0755);
      
        copy($_FILES['file']['tmp_name'], '../Facturas/'. $_FILES['file']['name']);
        $file_name = $_FILES['file']['name'];
        $subido = true;

        //$total_imagenes = count(glob("../Facturas/{*.pdf,*.xml}",GLOB_BRACE));
          
        $directorio = opendir("../Facturas/"); //ruta actual
        while ($archivo1 = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo1))//verificamos si es o no un directorio
            {
                //echo "[".$archivo . "]<br />"; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {   
                $ext = end(explode('.','../Facturas/'.$archivo1));
                if ($ext == 'xml' or $ext == 'pdf') {
                    
                    $archivo[] = $archivo1;
                }
                
            }
        }

        // foreach (glob("../Facturas/{*.pdf,*.xml}",GLOB_BRACE) as $archivo1)
        // {
        //     $archivo[] = $archivo1;
        // }


        foreach ($archivo as $var) {

                $extension = end( explode('.', '../Facturas/'.$var));
                //echo $extension;
                if ($extension == 'xml') {

                    $leexml = $var;
                    $bit2 = 1;
                }elseif ($extension == 'pdf') {

                    $bit = 1;

                }

                $total_archivos = count(glob("../Facturas/{*.xml,*.pdf}",GLOB_BRACE));
                
                if ($total_archivos == 2) {
                    $bit3 = 1;
                }
                    
        }
    
        if($subido) {
           $respuesta = array('respuesta' => "El Archivo subio con exito yeaah!!!", 'ruta' => $file_name, 'archivo' => $archivo, 'leexml' => $leexml, 'bit2' => $bit2, 'bit' => $bit, 'bit3' => $bit3);
        } else {
           $respuesta = array('respuesta' => "Error al subir el archivo");
        }
}                    
        echo json_encode($respuesta);
}


if ($funcion == 'guardafactura') {

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);
   // $nombre = $_REQUEST['nombre'];

    $autorizacion = $datos->autorizacion;
    $movimiento = $datos->movimiento;
    $archivos = $datos->archivo;


    mkdir("../Facturas/".$autorizacion."-".$movimiento, 0755);

    foreach ($archivos as  $archi) {

         unlink("../Facturas/$archi");

        copy("../Facturas/$archi", "../Facturas/$autorizacion-$movimiento/$archi");
        // unlink("../Facturas/$archi");
    } 
         
        $respuesta = array('respuesta' => "Los Datos se Guardaron");
                
        echo json_encode($respuesta);        

    }

    if ($funcion == 'inserta_xml') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;
    $movimiento = $datos->movimiento;
    $foliofiscal = $datos->foliofiscal;
    $emisor = $datos->emisor;
    $receptor = $datos->receptor;
    $rfc = $datos->rfc;
    $subtotal = $datos->subtotal;
    $iva = $datos->iva;
    $total = $datos->total;
    $descuento = $datos->descuento;
    $fecha = date("Y-m-d H:i:s");
    $fecha_emision = $datos->fechaemision;

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "INSERT INTO PagosFactura
              (
                     AUM_clave, TIM_claveint, rfc ,foliofiscal, emisor, receptor ,importe, iva, total, descuento, fecha, fecha_emision                     
              ) 
              VALUES
              (
                    '$autorizacion', $movimiento, '$rfc' ,'$foliofiscal', '$emisor', '$receptor' ,$subtotal, $iva, $total, $descuento, now(), '$fecha_emision' 
              )";
        
        $temporal = $db->prepare($sql);
        $temporal->bindParam("AUM_clave", $autorizacion, PDO::PARAM_STR);
        $temporal->bindParam("TIM_claveint", $movimiento, PDO::PARAM_INT);
        $temporal->bindParam("foliofiscal", $foliofiscal , PDO::PARAM_STR);
        $temporal->bindParam("emisor", $emisor, PDO::PARAM_STR);
        $temporal->bindParam("importe", $importe);
        $temporal->bindParam("iva", $iva);
        $temporal->bindParam("total", $total);
        $temporal->bindParam("descuento", $descuento);


        
        if ($temporal->execute()){

           
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", 'bit4' => 1);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
        echo json_encode($respuesta);

    }
    
}


if ($funcion == 'timbrar') {

    include_once('../lib/nomad_mimemail.inc.php');

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;
    $movimiento = $datos->movimiento;
    $archivos = $datos->archivo;

    $db = conectarMySQL();


    $ruta = "../Facturas/$autorizacion-$movimiento/";

        $directorio = opendir($ruta); //ruta actual
        while ($archivo1 = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo1))//verificamos si es o no un directorio
            {
                //echo "[".$archivo . "]<br />"; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {
                $archivo[] = $archivo1;

            }
        }

        $sql = "UPDATE PagosFactura a 
                SET
                
                cont_enviado = 1
        
                where AUM_clave = '$autorizacion' and TIM_claveint = $movimiento";

        $temporal = $db->prepare($sql);
        $temporal->execute();


        $sql1 = "UPDATE PagosFactura a 
                SET
                
                PF_pValidar= 1
        
                where AUM_clave = '$autorizacion' and TIM_claveint = $movimiento";

        $temporal1 = $db->prepare($sql1);
        $temporal1->execute();

    $mimemail = new nomad_mimemail();
    $mimemail->set_from("adominguez@medicavial.com.mx");
    $mimemail->set_to("adominguez@medicavial.com.mx");
    $mimemail->add_cc("agutierrez@medicavial.com.mx");
    $mimemail->set_subject("prueba");        
    $mimemail->set_html("prueba");
    for ($d=0;$d<count($archivo);$d++){
    
        $mimemail->add_attachment($ruta.$archivo[$d],$archivo[$d]);
    }
    
    if ($mimemail->send()){
                 $respuesta = array('correo' => "Envio Exitoso", 'archivo' => $archivo);
    }
    else {
                 $respuesta = array('correo' => "Error");
   }

    echo json_encode($respuesta);

}

if ($funcion == 'consultaPendientes') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT AUM_clave as autorizacion, TIM_claveint as movimiento, RFC as rfc, foliofiscal as foliofiscal, emisor as emisor,
               receptor as receptor, importe as importe, iva as iva, total as total, descuento as descuento, fecha as fecha, fecha_emision as emision
                FROM PagosFactura
                WHERE PF_pValidar = 1";


        $result = $db->query($sql);
        $pendiente = $result->fetchAll(PDO::FETCH_OBJ);


        $sql = "SELECT count(*) as contador
                FROM PagosFactura
                WHERE PF_pValidar = 1";

        foreach ($db->query($sql) as $row) {
            $contador = $row['contador'];
        }
        $db = null;

        $respuesta  = array('pendiente' => $pendiente, 'contador_xml' => $contador);



        echo json_encode($respuesta);

    }
    
}

if ($funcion == 'guardarelacion') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $relacion = $datos->relacion;
    $codigorelacion = $datos->codigorelacion;

    foreach ($relacion as $key ) {

       $autorizacion =  $key->autorizacion;
       $movimiento = $key->movimiento;
       $foliofiscal = $key->foliofiscal;
       $codigo =  $codigorelacion;
       $total = $key->total; 
        
    
    $db = conectarMySQL();   

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{

        
        $sql = "INSERT INTO RelacionPagos
              (
                     RP_clave, RP_foliofiscal, RP_autorizacion, RP_mov, RP_codigorelacion, RP_totalrelacion, RP_fechaalta, TP_transaccion                    
              ) 
              VALUES
              (
                    '', '$foliofiscal' ,'$autorizacion', '$movimiento','$codigo', $total ,now(), 0
              )";
        
        $temporal = $db->prepare($sql);
        $temporal->execute();

        $sql1 = "UPDATE PagosFactura a 
                SET
                
                PF_pTransferencia = 1
        
                where foliofiscal = '$foliofiscal'";
        $temporal1 = $db->prepare($sql1);

        $sql2 = "UPDATE PagosFactura a 
                SET
                
                PF_pValidar = 0
        
                where foliofiscal = '$foliofiscal'";
        $temporal2 = $db->prepare($sql2);
        $temporal2->execute();
        
        
        if ($temporal1->execute()){

           
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", 'bit' => true);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }

    }
        
        //echo json_encode($respuesta);

    }
    
}

if ($funcion == 'elimina_factura'){

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);

    $archivos = $datos->archivo;
    // $autorizacion = $datos->autorizacion;
    // $movimiento = $datos->movimiento;

    $db = conectarMySQL();


                $extension = end( explode('.', '../Facturas/'.$archivos));
                //echo $extension;
                if ($extension == 'xml') {

                    $bit2 = 0;
                    $bit = 1;

                }elseif ($extension == 'pdf') {

                    $bit = 0;
                    $bit2 = 1;

                }

        # code...
   if (file_exists("../Facturas/$archivos")){
    
       unlink("../Facturas/$archivos");


        // $sql = "UPDATE PagosFactura a 
        //         SET
                
        //         cont_enviado = cont_enviado+1
        
        //         where AUM_clave = '$autorizacion' and TIM_claveint = $movimiento";


        // $temporal = $db->prepare($sql);
        // $temporal->execute();

         
         $respuesta  = array('respuesta' => 'Se elimino el archivo', 'bit' => $bit, 'bit2' => $bit2);
   } else {
         $respuesta  = array('respuesta' => 'No elimino el archivo' );

   }
   echo json_encode($respuesta);
}


if ($funcion == 'infolesionado'){

    $numeroautorizacion = $_REQUEST['autorizacion'];

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT AUM_lesionado as paciente, a.AUM_folioMV as folio FROM AutorizacionMedica a
                INNER JOIN Expediente b on a.AUM_folioMV=b.Exp_folio
                where AUM_clave='$numeroautorizacion'";


        foreach ($db->query($sql) as $row) {

            $lesionado = $row['paciente'];
            $folio = $row['folio'];

        }

        $db = null;

         $respuesta = array('lesionado' => $lesionado, 'folio' => $folio);

        echo json_encode($respuesta);

    }
}

if ($funcion == 'buscarFactura'){

    $postdata = file_get_contents("php://input");

    $datos = json_decode($postdata);

    $rfc = $datos->rfc;
    $emisor = $datos->emisor;
    $fecha = $datos->fechaEmi;
    $foliofiscal = $datos->foliofiscal;

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT AUM_clave as autorizacion, TIM_claveint as movimiento, RFC as rfc, foliofiscal as foliofiscal, emisor as emisor,
                receptor as receptor, importe as importe, iva as iva, total as total, descuento as descuento, fecha_emision as fechaemision,
                cont_enviado as enviado, PF_pValidar as validado, PF_pTransferencia as transferencia 
                FROM PagosFactura
                WHERE rfc like '$rfc%' or foliofiscal like '$emisor%' or emisor like '$emisor%' or fecha_emision like '$fecha%'";

        foreach ($db->query($sql) as $row) {

            $rfc = $row['rfc'];
            $emisor = $row['emisor'];
            $foliofiscal = $row['foliofiscal'];
            $fechaemision = $row['fechaemision'];
            $autorizacion = $row['autorizacion'];
            $movimiento = $row['movimiento'];
            $receptor = $row['receptor'];
            $importe = $row['importe'];
            $iva = $row['iva'];
            $total = $row['total'];
            $descuento = $row['descuento'];
            $enviado = $row['enviado'];
            $validado = $row['validado'];
            $transferencia = $row['transferencia'];

            if ($transferencia != 1) {


                $status = "Xml por Validar ";
            }else{

                $status  = "Relación de Factura realizada, falta Transferencia";
            }

        }

        $db = null;

        $directorio = opendir("../Facturas/$autorizacion-$movimiento/"); //ruta actual
        while ($archivo1 = readdir($directorio)) //obtenemos un archivo y luego otro sucesivamente
        {
            if (is_dir($archivo1))//verificamos si es o no un directorio
            {
                //echo "[".$archivo . "]<br />"; //de ser un directorio lo envolvemos entre corchetes
            }
            else
            {   
     
                    $archivo[] = $archivo1;
                
            
            }
        }

         $respuesta = array('rfc' => $rfc, 'emisor' => $emisor, 'foliofiscal' => $foliofiscal, 'fechaemision' => $fechaemision, 'autorizacion' => $autorizacion,
                            'movimiento' => $movimiento, 'receptor' => $receptor, 'importe' => $importe, 'iva' => $iva, 'total' => $total, 'descuento' => $descuento, 'archivo' => $archivo, 'estatus' => $status);

        echo json_encode($respuesta);

    }
}

if ($funcion == 'pendienteTransferir') {

    $db = conectarMySQL();

    if(!$db) {

        die('Something went wrong while connecting to MSSQL');

    }else{
        
        $sql = "SELECT RP_codigorelacion as codigo, sum(RP_totalrelacion) as total, RP_fechaalta as fecha, RP_foliofiscal as foliofiscal
                FROM RelacionPagos
                WHERE TP_transaccion = 0 or TP_transaccion = null
                group by RP_codigorelacion";

        $result = $db->query($sql);
        $pendiente = $result->fetchAll(PDO::FETCH_OBJ);
        $contador = count($pendiente);

        $db = null;

        $respuesta = array('pendiente' => $pendiente, 'contadorpago' => $contador);

        echo json_encode($respuesta);

    }
    
}


if ($funcion == 'guardatransferencia') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $relacion = $datos->relacion;
    $codigotransaccion= $datos->codigotransaccion;
    $fechaalta = $datos->fechaalta;
    $caja = $datos->caja;
    $totaltransaccion = $datos->totaltransaccion;

    foreach ($relacion as $key ) {

       $fecha = $key->fecha;
       $total = $key->total; 
       $codigo = $key->codigo;
        
    $db = conectarMySQL();   

        $sql = "UPDATE RelacionPagos a 
                SET

                TP_transaccion = '$codigotransaccion'
                

                where RP_codigorelacion = '$codigo'";

        $temporal = $db->prepare($sql);
        $temporal->execute();

    }

        
        $sql1 = "INSERT INTO TransferenciaPagos
              (
                     TP_transaccion, TP_fecha, TP_caja, TP_altapago, TP_totalpago                  
              ) 
              VALUES
              (
                    $codigotransaccion, '$fechaalta', $caja, '$fechaalta', $totaltransaccion
              )";
        
        $temporal1 = $db->prepare($sql1);
        
        if ($temporal1->execute()){

           
            $respuesta = array('respuesta' => "Los Datos se guardaron Correctamente", 'bit' => 1);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
        echo json_encode($respuesta);
        //echo $sql;
    
}

if ($funcion == 'eliminaFactura') {

    $postdata = file_get_contents("php://input");
    //aplicacmos json_decode para manejar los datos como arreglos de php
    //En este caso lo que mando es este objeto JSON {user:username,psw:password}
    $datos = json_decode($postdata);

    $autorizacion = $datos->autorizacion;
    $movimiento = $datos->movimiento;
    $usuario = $datos->usuario;
    $foliofiscal = $datos->foliofiscal;
    $archivos = $datos->archivos;

       $carpeta = "../Facturas/$autorizacion-$movimiento";

       foreach(glob($carpeta."/*.*") as $archivos_carpeta)  
        {  
         unlink($archivos_carpeta);     // Eliminamos todos los archivos de la carpeta hasta dejarla vacia  
        }  
        rmdir($carpeta);  


        
    $db = conectarMySQL();   
        
        $sql = "INSERT INTO HistorialFacturas
              (
                     HP_clave, HP_accion, USU_login, HP_autorizamv, HP_fechamovimiento                 
              ) 
              VALUES
              (
                    '', 'Elimino Factura', '$usuario', '$autorizacion-$movimiento', now()
              )";
        
        $temporal = $db->prepare($sql);
        $temporal->execute();

        $sql1 = "Delete from PagosFactura where foliofiscal='$foliofiscal'";
        $temporal1 = $db->prepare($sql1);
        
        if ($temporal1->execute()){

           
            $respuesta = array('respuesta' => "tu factura fue Eliminada", 'bit' => 1);
            //$correo($html);


        }else{
            $respuesta = array('respuesta' => "Los Datos No se Guardaron Verifique su Información");
        }
        
        echo json_encode($respuesta);
        //echo $sql;
    
}



?>