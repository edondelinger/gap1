/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        chargerLesPenseBetes();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    saveInCloud: function(){
        var isonoff = navigator.onLine ? "online" : "offline";
        if (isonoff == "online"){

            navigator.notification.alert(
                'Début du transfert',  // message
                'Erreur',            // title
                'OK'                  // buttonName
            );


            $("#message").empty();
            $("#message").html("Traitement en cours ...");
            for (var i = 0; i < lesEcheances.length; i++) {
                var url = "http://192.168.1.24/tests/index.php?tache=" + lesTaches[i] + "&echeance=" + lesEcheances[i] + "&effectue=" + lesEffectuees[i];

                // Log
                console.log("Request string: " + url);

                // Call to web server
                $.get(url, function (data) {

                        // Log received content
                        console.log("Received string: " + data);

                    }
                );
            }
            $("#message").html("Traitement effectué");

        }else{

            navigator.notification.alert(
                'Pas de réseau pour le moment',  // message
                'Erreur',            // title
                'OK'                  // buttonName
            );
        }
    }
};

// déclaration des 2 tableaux nécessaires (les dates et les échéances)
var lesEcheances = new Array();
var lesTaches = new Array();
var lesEffectuees = new Array();

/*
 PROCEDURE QUI MODIFIE LE TABLEAU HTML POUR Y AFFICHER TOUS LES PENSE BETES CONNUS (issus des tableaux)
 */
function afficherLesPenseBetes(){
    var contenu = "";

    // on parcourt tous les pense betes pour construire une chaine qui contiendra le HTML des lignes du tableau
    for (var i = 0; i < lesEcheances.length; i++) {
        var image = "nocheck.png";
        if(lesEffectuees[i] == 1){
            image = "check.png";
        }
        var ligne = '<tr><td>'+lesTaches[i]+'!</td><td>'+lesEcheances[i]+'</td><td id="tache'+i+'"><img src="img/'+image+'" onclick="effectuer_tache('+i+');" width="16" height="16" alt="check"></td></tr>';
        contenu += ligne;
    }
    var laTable = document.getElementById('table_content');
    // on affiche ce contenu sur la page
    laTable.innerHTML = contenu;
}

/*
 PROCEDURE POUR AJOUTER UN NOUVEAU PENSE BETE
 */
function ajouterNote(){
    // on va chercher la zone du tableau HTML (dont l'id est table_content)
    var laTable = document.getElementById('table_content');
    // on récupère la taille du tableau des échéances (pour savoir combien il y en a)
    var tacheNumero = lesEcheances.length;
    // on ajoute les infos dans les tableaux
    lesEcheances.push(document.forms['frm_ajout_pb'].echeance.value);
    lesTaches.push(document.forms['frm_ajout_pb'].libelle.value);
    lesEffectuees.push(0);
    // on met à jour l'affichage dans la page HTML
    // on fait attention à gérer le clic sur la case de la tâche afin de pouvoir la valider par la suite avec son bon numéro (qui est sa position dans le tableau)
    laTable.innerHTML += '<tr><td>'+document.forms['frm_ajout_pb'].libelle.value+'</td><td>'+document.forms['frm_ajout_pb'].echeance.value+'</td><td id="tache'+tacheNumero+'"><img src="img/nocheck.png" onclick="effectuer_tache('+tacheNumero+');" width="16" height="16" alt="check"></td></tr>';

    enregistrerLesPenseBetes();
}

/*
 PROCEDURE QUI VALIDERA LA BONNE REALISATION D'UNE TACHE A PARTIR DE SON NUMERO
 */
function effectuer_tache(numero){
    // on va chercher la cellule du tableau qui a le numéro de la tâche cliquée (tacheXX)
    var element = document.getElementById('tache'+numero);
    lesEffectuees[numero] = 1;
    // mise à jour de l'affichage pour mettre la coche verte en face de la tâche
    element.innerHTML = '<img src="img/check.png" onclick="effectuer_tache('+numero+');" width="16" height="16" alt="check">';
    enregistrerLesPenseBetes();
}

/*
 PROCEDURE qui enregistre dans un fichier texte tous les pense bêtes contenus dans les tableaux
 */
function enregistrerLesPenseBetes(){
    localStorage.clear();
    localStorage.setItem("nombre", lesEcheances.length);

    for (var i = 0; i < lesEcheances.length; i++) {
        localStorage.setItem("tache"+i, lesEcheances[i] + '|'+ lesTaches[i]+'|'+ lesEffectuees[i]);
    }
}
/*
 PROCEDURE QUI MODIFIE LE TABLEAU HTML POUR Y AFFICHER TOUS LES PENSE BETES CONNUS (issus des tableaux)
 */
function chargerLesPenseBetes(){
    // Détection du support
    if(typeof localStorage!='undefined') {
        if('nombre' in localStorage) {
            var nb = localStorage.getItem("nombre");
            for (var i=0; i<nb; i++){
                info = localStorage.getItem("tache"+i).split("|");
                lesEcheances.push(info[0]);
                lesTaches.push(info[1]);
                lesEffectuees.push(info[2]);
            }
            afficherLesPenseBetes();
        }
    } else {
        alert("localStorage n'est pas supporté");
    }
}

