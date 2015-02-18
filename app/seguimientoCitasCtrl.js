app.controller('seguimientoCitasCtrl', function($scope, $http, busqueda) {


	$scope.inicio = function(){

        $scope.buscaautorizaciones();
        $scope.buscaconfirmaciones();
        $scope.buscaresultados();
        $scope.buscaobservaciones();
        $scope.buscaconcluidos();
        $scope.xvalidarxml();
        $scope.pagar();

	}

    $scope.buscaautorizaciones = function(){

        busqueda.autoriza().success(function (data){
            console.log(data);
            //$scope.autoriza = data;
            $scope.contador = data.contador;
            $scope.autoriza = data.autoriza;

        });

    }

    $scope.buscaconfirmaciones = function(){

        busqueda.confirma().success(function (data){
            
            $scope.contadorcita = data.contadorcita;
            $scope.confirma = data.confirma;
        });

    }

    $scope.buscaobservaciones = function(){

        busqueda.observacion().success(function (data){
            
            $scope.contadorob = data.contadorob;
            $scope.observacion = data.observacion;
        });

    }

    $scope.buscaresultados = function(){

        busqueda.resultado().success(function (data){
            
            $scope.contadorres = data.contadorres;
            $scope.resultado = data.resultado;
        });

    }

    $scope.buscaconcluidos = function(){

        busqueda.concluido().success(function (data){
            
            $scope.contadorconcluido = data.contadorconcluido;
            $scope.concluido = data.concluido;
        });

    }

    $scope.xvalidarxml = function(){

        busqueda.pendiente().success(function (data){
            
            $scope.contadorxml = data.contador_xml;
        });

    }

    $scope.pagar = function(){

        busqueda.pendienteTranferir().success(function (data){
            
            $scope.contadorpago = data.contadorpago;
        });

    }

});