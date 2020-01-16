var app = angular.module('miniapp', []);
var accounts;
var currentAccount;
var accountsUI;
var stopRequest = false;
var objets = null;
var crafts = null;
var skills = null;
var jobs = null;
var monsters = null;
var serveurs = null;
$(document).ready(function () {

    InitNetfu();

    //EVENT
    $("#addAccount").click(function () {
        $("#botPanel").hide();
        $(".account").removeClass('selected');
        $("#addAccountPanel").show("100");
      
    });


    $("#tab-proxy").click(function () {
        $("#ipProxy").val(bot().config.proxyHost);
        $("#portProxy").val(bot().config.proxyPort);
        $("#loginProxy").val(bot().config.proxyLogin);
        $("#passProxy").val(bot().config.proxyPass);
        $("#sock5").val(bot().config.sock5);
        $("#proxyAuto").prop("checked", bot().config.proxyRandom);
        $("#ipProxy,#portProxy").prop("disabled", $("#proxyAuto").is(':checked'));
    });

    $("#ipProxy,#portProxy,#loginProxy,#passProxy,#sock5").change(function () {
        NetfuLauncher.setProxy(currentAccount, $("#ipProxy").val(), $("#portProxy").val(), $("#loginProxy").val(), $("#passProxy").val(), $("#sock5").is(':checked'));
    });

    $("#proxyAuto").change(function () {
        $("#ipProxy,#portProxy").prop("disabled", $("#proxyAuto").is(':checked'));
        NetfuLauncher.setProxyAuto(currentAccount, $("#proxyAuto").is(':checked'));
    });

    //checkboxfix
    $(".pure-toggle").click(function () {
        $(this).parent().find('input[type=checkbox]').click();
    });

  

    $("#copieToGroupe").click(function () {
        NetfuLauncher.setDeleteItemGroup(currentAccount);
    });

    $("#tab-compte").click(function () {
  
        if ($("#serveurModAcc option").length == 0)
        {
            for (var i = 0; i < serveurs.length; i++) {
                var s = serveurs[i];
                $("#serveurModAcc").append("<option name=" + s.name + "   value=" + s.idServer + ">" + s.name + "</option>");
            }
        }

        $("#serveurModAcc option").removeAttr('selected');
        var current = $("#serveurModAcc option[name='" + bot().config.serverName + "']");
        current.attr("selected", "selected")
        current.prop("selected", true);

        $("#loginModAcc").val(bot().config.nomDuCompte);
        $("#passModAcc").val(bot().config.passDuCompte);
        $("#passBotModAcc").val(bot().config.passBot);
        $("#numPersoModAcc").val(bot().config.numeroPerso);
        $("#mitmModAcc").prop("checked",bot().config.mitm);

   
    });

    $("#tab-metier").click(function () {
        createRecolte();
    });

    $("#ModAccountBtn").click(function () {
        var inputs = $("#modifAccountPanel input");
        var checkControl = true;
        for (var i = 0; i < inputs.length; i++)
        {
            if ($(inputs[i]).val() == null || $(inputs[i]).val() == "") {
   
                $(inputs[i]).attr('style', 'border: 1px solid #dc3545');
                setTimeout(function () {
 
                    $("#modifAccountPanel input").attr('style', '');
                }, 2000);
                checkControl = false;
            }
        }
        if (checkControl)
            var succes = NetfuLauncher.modifieAccount(currentAccount, $("#loginModAcc").val(), $("#passModAcc").val(), $("#passBotModAcc").val(), $("#serveurModAcc").find(":selected").text(), $("#mitmModAcc").is(":checked"), $("#numPersoModAcc").val());
    });

    $("#SupprAccountBtn").click(function () {
        var succes = NetfuLauncher.supprAccount(currentAccount);
        if(succes)
        {
            $("#" + currentAccount).remove();
            $("#botPanel").hide();
        }
    });

    $("#addAccountBtn").click(function () {
        var inputs = $("#addAccountPanel input");
        var checkControl = true;
        for (var i = 0; i < inputs.length; i++) {
            if ($(inputs[i]).val() == null || $(inputs[i]).val() == "") {

                $(inputs[i]).attr('style', 'border: 1px solid #dc3545');
                setTimeout(function () {

                    $("#addAccountPanel input").attr('style', '');
                }, 2000);
                checkControl = false;
            }
        }
        if (checkControl) {
            var succes = NetfuLauncher.addAccount($("#loginNewAcc").val(), $("#passNewAcc").val(), $("#passBotNewAcc").val(), $("#serveurNewAcc").find(":selected").text(), $("#mitmNewAcc").is(":checked"), $("#numPersoNewAcc").val());

            if (succes) {
                refreshAccounts();
                $(".account[id='" + $("#loginNewAcc").val() + "']").click();
            }
            
        }
    });

    $("#tab-chat").click(function () {
        var checkbox = $("#divCanalChat input");
        for (var i = 0; i < checkbox.length; i++) {
            var canal = $(checkbox[i]).attr('canal');
            var opened = bot().chatHandler.openedCanal.indexOf(canal) >= 0;

            $(checkbox[i]).prop('checked', opened)

        }

    });

    $("#divCanalChat input").change(function () {
        var checked = $(this).is(':checked');
        var canal =$(this).attr('canal');
        NetfuLauncher.setCanalChat(currentAccount, canal, checked);
    });



    $("#toolbar .fa-users").click(function () {
        refreshAccounts();
        $("#groupManager .botGroup").remove();
        var html = "";                
        for (var i = 0; i < accounts.length; i++) {
            var bot = accounts[i];
            if(bot != null && bot.monNom.length>0){
                html += "<div style='margin-bottom:15px' class='botGroup'>";
                    html += "<name style='margin-right: 15px;'>"+bot.monNom+"</name>";
                    html += "<select  idDofus='" + bot.monIdDofus + "' onchange='setChef(this)' class='selectChef'>";
                    html += "<option value='-1'>Pas de chef</option>";
                    for (var j = 0; j < accounts.length; j++) {
                        var chef = accounts[j];
                        if (chef.monNom.length > 0 && chef.monNom != bot.monNom) {
                            var selected = chef.monNom==bot.nomChef && chef.monNom.length>0?"selected":"";
                            html += "<option " + selected + "  value='" + chef.monIdDofus + "'>" + chef.monNom + "</option>";
                        }
                    }
                    html+= " </select>";
                    html += "</div>";
                }
        }
        $("#groupManager").append(html);
       $("#groupContainer").show("100");
      
    });

    $("#toolbar .fa-shield-alt").click(function () {
        $("#checkModo").prop("checked", NetfuLauncher.decoModo);
        $("#notifMP").prop("checked", NetfuLauncher.notifMP);
        $("#notifBank").prop("checked", NetfuLauncher.notifBank);
        $("#notifLevelUP").prop("checked", NetfuLauncher.notifLevelUp);
        $("#tokenPushFleet").val(NetfuLauncher.tokenPush);
        $("#recoModo").val(NetfuLauncher.timeModo);


        $("#checkModo").unbind('change').change(function () {
            NetfuLauncher.decoModo = $(this).is(':checked');
        });

        $("#notifMP").unbind('change').change(function () {
            NetfuLauncher.notifMP = $(this).is(':checked');
        });

        $("#notifBank").unbind('change').change(function () {
            NetfuLauncher.notifBank = $(this).is(':checked');
        });

        $("#notifLevelUP").unbind('change').change(function () {
            NetfuLauncher.notifLevelUp = $(this).is(':checked');
        });

        $("#tokenPushFleet").unbind('change').change(function () {
            NetfuLauncher.tokenPush = $(this).val();
        });

        $("#recoModo").unbind('change').change(function () {
            NetfuLauncher.timeModo = parseInt( $(this).val());
        });

        $("#configContainer").show("100");
    });

    $(".ContainerPopup ,.fa-window-close").click(function (e) {
        if ($(e.target).hasClass('ContainerPopup')  || $(e.target).hasClass('fa-window-close'))
            $(".ContainerPopup").hide("100");
    });


    $('#autoboost').change(function () {
        NetfuLauncher.setAutoBoostCaract(currentAccount, $('#autoboost option:selected').val());
    });

    $('#regenPC').change(function () {
        NetfuLauncher.regenPC(currentAccount, $('#regenPC').val());
    });

    $('#nombrecombat').change(function () {
        NetfuLauncher.nombrecombat(currentAccount, $(this).val());
    });
    $('#niveaumin').change(function () {
        NetfuLauncher.lvlmincombat(currentAccount, $(this).val());
    });
    $('#niveaumax').change(function () {
        NetfuLauncher.lvlmaxcombat(currentAccount, $(this).val());
    });

    $("#ordreMonstre").change(function () {
        NetfuLauncher.orderCombat(currentAccount, $(this).val());
    });
    $("#spectaOuvert").change(function () {
        NetfuLauncher.spectaCombat(currentAccount, $(this).is(':checked'));
    });

    $("#groupOuvert").change(function () {
        NetfuLauncher.groupeCombat(currentAccount, $(this).is(':checked'));
    });

    $("#combatAuto").change(function () {
        NetfuLauncher.combatAuto(currentAccount, $(this).val());
    });

    $("#onglet-trajet .custom-file-label").click(function () { $("#trajetFile").click(); });


    $("#trajetFile").change(function () {
        var file = $("#trajetFile")[0].files[0];
        var fr = new FileReader();
        fr.readAsText(file);
        fr.onload = function (evt) {
            var trajetOk = NetfuLauncher.setTrajet(currentAccount, fr.result, file.name.indexOf(".lua")>0);
            $("#trajetFile").val("");
           
        }

    });

    $("#iaFile").change(function () {
        var file = $("#iaFile")[0].files[0];
        var fr = new FileReader();
        fr.readAsText(file);
        fr.onload = function (evt) {


            var iaOK = NetfuLauncher.setIa(currentAccount, $("#iaFile").val(), fr.result);

            $("#iaFile").val("");
        }
  


    });

    $(".stopTrajet").click(function () {
       var stopped = NetfuLauncher.stopTrajet(currentAccount);
        if (stopped) {
            $("#infosTrajet").hide();
            $("#trajetFile").val("");

        }
    });

    $("input,option").click(function (e) {
        stopRequest = true;
    });

    $('.nav-item').click(function () {
       
        var id = $($(this).find('a')[0]).attr('href').replace("#", "");
        var oldid = $('.nav-link.active.show');
        oldid = oldid.length > 0 ? oldid.attr('href').replace("#", "") : null;

        if (oldid != id) {
            $('.tab-pane').hide();
            $('#' + id).show("slide", 250, function () {
                $('#' + oldid).hide();
            });
        }
    });


    $(".filterInventaire a").click(function (e) {
        $(".filterInventaire a span").removeClass("selected");
        $(this).find("span").addClass("selected");
        $("#listItemInventaire li").hide();
        switch ($(this).find("span").text()) {

            case 'Equipements':
                $("#listItemInventaire li[itemType=e]").show();
                break;
            case 'Utilisables':
                $("#listItemInventaire li[itemType=u]").show();
                break;

            case 'Ressources':
                $("#listItemInventaire li[itemType=r]").show();
                break;
            default:
                $("#listItemInventaire li").show();
                break;
        }

    });

    $("#zoneDeleteAuto .fa-plus-square").click(function () {
        NetfuLauncher.addItemDelete(currentAccount, parseInt($('#deleteItemSearch').attr('itemId')));
    });

    $("#optionTrajet #check").change(function () {
        NetfuLauncher.setOnlyRessourceBank(currentAccount, $("#optionTrajet #check").is(':checked'));
    });

    $("#retourBanque").change(function () {
        NetfuLauncher.setRetourBanck(currentAccount, parseInt($("#retourBanque").val()));
    });

    $("#antiAgro").change(function () {
        NetfuLauncher.setCaseAgro(currentAccount, parseInt($("#antiAgro").val()));
    });

    $("#vitesseBot").change(function () {
        NetfuLauncher.setVitesseGlobal(currentAccount, parseInt($(this).val()));
    });

    $("#addMonsterInterdit").click(function () {
        NetfuLauncher.addMonsterInterdit(currentAccount, $("#searchMonsterAD").val());
    });

    $("#positionFight").change(function () {
        NetfuLauncher.setIaPlacement(currentAccount, $(this).val());
    });

    $("#iaType").change(function () {
        NetfuLauncher.setIaType(currentAccount, $(this).val());
    });

    $("#vitesseCombat").change(function () {
        var speed = parseInt($(this).val());

        if (speed < 350 && bot().config.mitm == false)
        {
            alert("Baisser la vitesse en dessous de 350 en mode socket (sans dofus d'ouvert) peut provoquer un ban automatique");
            speed = 350;
        }

        NetfuLauncher.setVitesseCombat(currentAccount, speed);
    });

    $("#craftParS").change(function () {
        NetfuLauncher.setNbCraftS(currentAccount, parseInt($(this).val()));
    });

    $("#recolteAuto").change(function () {
        NetfuLauncher.recolteAuto(currentAccount, $(this).val());
    });


    $("#addItemAchat").click(function () {
        NetfuLauncher.addItemAchat(currentAccount, $("#searchItemAchatAuto").attr('itemId'),$("#searchItemAchatAuto").val(), $("#timeItemAchatAuto").val());
    });

    $("#activeFlood").change(function () {
        NetfuLauncher.setFlood(currentAccount, $(this).is(':checked'),$("#timeFlood").val());
    });
    $("#mpFlood").change(function () {
        NetfuLauncher.setFloodMP(currentAccount, $(this).is(':checked'), $("#timeFlood").val());
    });

    $("#timeFlood").change(function () {
        NetfuLauncher.launchFlood(currentAccount,$(this).val())
    });

    $("#phraseFlood").change(function () {
        NetfuLauncher.setPhraseFlood(currentAccount, $(this).val());
    });




});

//BIND ANGULAR
var oldbot;
function Ctrl($scope, $timeout)
{
   

    $timeout(function () {
        Ctrl($scope, $timeout)
        if (stopRequest) {
            stopRequest = false;
            return;
        }

        if ($scope.serveurs == null)
            $scope.serveurs = serveurs;

        $scope.bots = accounts;


        var b = bot();
    
        if (b != null) {
            $scope.bot = b;
 
            if ($scope.currentConfig == null || b.config.hashCode != $scope.currentConfig.hashCode)
                $scope.currentConfig = b.config;

            if (b.InfosPerso != null) {

                $scope.vieRestante = ((b.InfosPerso.LP / b.InfosPerso.LPmax) * 100).toFixed(0);
                $scope.exp = (((b.InfosPerso.XP - b.InfosPerso.XPlow) / (b.InfosPerso.XPhigh - b.InfosPerso.XPlow)) * 100).toFixed(0);
            }

            if (b.map != null) {
                if (oldbot == null || oldbot.map == null || (b.map.hashCode != oldbot.map.hashCode)) {
                    buildMap();
                }
            }

            if (b.spellHandler) {
                if ($scope.spellsList == null || $scope.spellsList.hashCode != b.spellHandler.hashCode) {
   
               
                    for (var i = 0; i < b.spellHandler.SpellsList.length; i++) {
                        var prio = b.config.listSpellLaunch[b.spellHandler.SpellsList[i].Key];
                        b.spellHandler.SpellsList[i].name = b.spellHandler.SpellsName[i];
                        b.spellHandler.SpellsList[i].priorite = prio;
                    }

                    $scope.spellsList = b.spellHandler;


                    setTimeout(function () {
                        $("#grilleSort .form-control").unbind('change').change(function (e,s) {
                            NetfuLauncher.changeSpellPriority(currentAccount, parseInt($(this).attr("spellid")), parseInt($(this).val()));
                        });

                        $('#autoboostSpell').unbind('change').change(function () {
                            NetfuLauncher.setAutoBoostSpell(currentAccount, parseInt($('#autoboostSpell option:selected').attr('spellid')));
                        });

                        $(".liMonster input").unbind('change').change(function () {
                            var nameMonster = $(this).parent().parent().find('p').text();
                            NetfuLauncher.modifyMonsterInterdit(currentAccount, nameMonster, $(this).is(':checked'));
                        });

                        $(".delmonsterInterdit").unbind('click').click(function () {
                            var nameMonster = $(this).parent().find('p').text();
                            NetfuLauncher.deleteMonsterInterdit(currentAccount, nameMonster);
                        });

                    }, 1000);
                }
            }
            else
                $scope.spellsList = null;

            if (oldbot == null || b.config.monstersDennied.length != oldbot.config.monstersDennied.length ||
                b.config.monstersAllow.length != oldbot.config.monstersAllow.length) {
                setTimeout(function () {
                    $(".liMonster input").unbind('change').change(function () {
                        var nameMonster = $(this).parent().parent().find('p').text();
                        NetfuLauncher.modifyMonsterInterdit(currentAccount, nameMonster, $(this).is(':checked'));
                    });

                    $(".delmonsterInterdit").unbind('click').click(function () {
                        var nameMonster = $(this).parent().find('p').text();
                        NetfuLauncher.deleteMonsterInterdit(currentAccount, nameMonster);
                    });

                }, 1000);
            }


            
            if ($('#autoboost').val() != b.config.autoboost) {
                $('#autoboost option').prop('selected', false);
                $('#autoboost option[value="' + b.config.autoboost + '"]').prop('selected', true);
            }
       
            if ($('#autoboostSpell option:selected').attr('spellid') != b.config.SpellToBoost) {
                $('#autoboostSpell option').prop('selected', false);
                $('#autoboostSpell option[spellid="' + b.config.SpellToBoost + '"]').prop('selected', true);
            }

            if (oldbot == null || oldbot.config.listItemToDelete.length != b.config.listItemToDelete.length) {
                $("#listItemDelete").html('');
                for (var i = 0; i < b.config.listItemToDelete.length; i++) {
                    var objet = getObjetById(b.config.listItemToDelete[i]);
                    objet = objet[0];
                        $("#listItemDelete").append('<li style="border-bottom: solid 1px gray;">' +
                                                      '<img src="image/items/' + objet.id + '.png" /><p>' + objet.nom + '</p><button  itemId=' + objet.id + ' class="btn btn-danger btndeleteItem">Supprimer</button>' +
                                                    '</li>');
                }

                $("#listItemDelete .btndeleteItem").unbind('click').click(function (s) {
                    NetfuLauncher.removeItemDelete(currentAccount,parseInt($(this).attr('itemId')));
                });
            }
      
            if (b.Inventaire) 
                if (!oldbot || !oldbot.Inventaire || oldbot.Inventaire.hashCode != b.Inventaire.hashCode)
                        majInventaire(b.Inventaire);
            

          


            if (oldbot == null || oldbot.config.itemRegen != b.config.itemRegen) {
                var obj = getObjetById(b.config.itemRegen);
                if (obj != null && obj.length > 0)
                    $('#regenItem').val(obj[0].nom);
                else
                    $('#regenItem').val("");
            }

            
            if (oldbot == null || oldbot.config.globalSpeed != b.config.globalSpeed) {
                var max = parseInt($("#vitesseBot").attr('max'));
                var size = parseInt($("#optionTrajet .range").css('width').replace('px',''))-22;
                size = ((b.config.globalSpeed + 1) / max) * size;
                $("#optionTrajet .rangeslider-fill-lower").css('width',size +'px');
                $('#optionTrajet .rangeslider-thumb').css('left', size + 'px');
          
                $("#optionTrajet .output .ng-binding").html(b.config.globalSpeed);
            }

            if (oldbot == null || oldbot.config.speedCombat != b.config.speedCombat) {
                var max = parseInt($("#vitesseCombat").attr('max'));
                var min = parseInt($("#vitesseCombat").attr('min'));
                max = max - min;
                var size = parseInt($("#confGlobalFight .range").css('width').replace('px', ''))-22;
                size = ((b.config.speedCombat - min + 1) / max) * size;
                $("#confGlobalFight .rangeslider-fill-lower").css('width', size + 'px');
                $('#confGlobalFight .rangeslider-thumb').css('left', size + 'px');
                $("#confGlovalFight .output .ng-binding").html(b.config.speedCombat);
            }

            if (oldbot == null || oldbot.config.NbCraftSeconde != b.config.NbCraftSeconde) {
                var max = parseInt($("#craftParS").attr('max'));
                var min = parseInt($("#craftParS").attr('min'));
                max = max - min;
                var size = parseInt($("#onglet-metier .range").css('width').replace('px', '')) - 22;
                if (b.config.NbCraftSeconde == 1)
                    size = 0;
                else
                    size = ((b.config.NbCraftSeconde - min) / max) * size;

                $("#onglet-metier .rangeslider-fill-lower").css('width', size + 'px');
                $('#onglet-metier .rangeslider-thumb').css('left', size + 'px');
                $("#rangecraftpars .rangeslider .rangeslider-thumb .range-output .output").html(b.config.NbCraftSeconde);
            }

           
            if ( oldbot == null || b.FightResult.length != oldbot.FightResult.length) {
                var times = b.FightResult.map(function (v) { return new Date(v.end);});
                var exps = b.FightResult.map(function (v) { return v.expWin; });
                var nbCombat = b.FightResult.length;
                var barChartData = {
                    labels: times.slice(Math.max(b.FightResult.length - 100, 1)).map(function (d) { return d.getHours() + ":" + d.getMinutes() }),
                    datasets: [{
                        label: 'Exp',
                        backgroundColor: Chart.helpers.color(window.chartColors.green).alpha(0.5).rgbString(),
                        borderColor: window.chartColors.green,
                        borderWidth: 1,
                        data: exps.slice(Math.max(b.FightResult.length - 100, 1))
                    }]
                };
                window.myBar.data = barChartData;
                window.myBar.update();

                if (nbCombat > 0) {
                    const reducer = (accumulator, currentValue) => accumulator + currentValue;
                    console.log(times);
                    var totalTime = b.FightResult.map(function (v) { return v.duration;}).reduce(reducer);
                    var totalExps = exps.reduce(reducer);
                    var totalKamas = b.FightResult.map(function (v) { return v.kamas; }).reduce(reducer);

                    $("#nbCombatStats").html("Nombre de combat " + nbCombat);
                    $("#tempsStats").html("Temps moyen " + (totalTime/1000 / nbCombat).toFixed(0) + " s");
                    $("#expStats").html("Experience moyenne " + (totalExps / nbCombat).toFixed(0));
                    $("#kamasStats").html("Kamas moyen " + (totalKamas / nbCombat).toFixed(0));
                }
            }

  
            oldbot = b;
  
        }
    }, 1000);
}


function bot() {
        if (accounts != null) {
            for (var i = 0; i < accounts.length; i++)
                if (accounts[i] != null && accounts[i]['config']["nomDuCompte"] == currentAccount)
                    return accounts[i];
        }
        return null;
}

function majInventaire(Inventaire) {

    $("#listItemInventaire").html("");
    for (var i = 0; i < Inventaire._LObjets.length; i++) {
        var objet = getObjetById(Inventaire._LObjets[i].idObjet);
        objet = objet[0];
        var type = objet.isEquipement ? 'e' : (objet.usable ? 'u' : 'r');

        var btnFami = Inventaire._LObjets[i].isFami ? '<button class="btn btn-warning" style="margin-top: 5px;margin-left:15px" class="eatFami">Nourir</button>' : '';
        $("#listItemInventaire").append('<li  itemType=' + type + ' itemIdInv=' + Inventaire._LObjets[i].idObjetInv + ' style="border-bottom: solid 1px gray;">' +
                        '<div class="row" style="margin-right:0px;">' +
                            '<div class="col-sm-4">' +
                                '<img src="image/items/' + objet.id + '.png" style="width:35px" />' +
                            '</div>' +
                            '<div class="col-sm-4 infosItem">' +
                                '<name>' + objet.nom + '</name>' +
                                '<qty>Nombre ' + Inventaire._LObjets[i].numObjet + '</qty>' +
                                '<level>Niveau ' + objet.level + '</level>' +
                            '</div>' +
                            '<div class="col-sm-4">' +
                                '<button class="btn btn-danger" style="margin-top: 5px;" class="deleteItem">Supprimer</button>' +
                                btnFami+
                            '</div>' +
                        '</div>' +
                    '</li>');
    }


    $("#listItemInventaire").find(".btn-danger").unbind('click').click(function () {
        NetfuLauncher.deleteItem(currentAccount, parseInt($(this).parents("li").attr('itemIdInv')));
    });

    $("#listItemInventaire").find(".btn-warning").unbind('click').click(function () {
        var itemID = $(this).parents("li").attr('itemIdInv');
        var fami = bot().familiers.find(function (f) { return f.Fami.idObjetInv.toString() == itemID.toString() });
        console.log(fami);

        if (fami) 
            showFami(fami);
    });
}

function showFami(fami) {
    $("#famiName").html(fami.Fami.nomObjet);
    $("#famiImg").attr('src', 'image/items/' + fami.Fami.idObjet + '.png');
    $("#pdvFami").html("Point de vie: " + fami.PDV);
    $("#etatFami").html("Etat: " +( fami.etat ==1000?"maigrichon":fami.etat==1?"normal":"obese"));
    $("#eatFami").html("Dernier repas: " + fami.lastEat.replace('T',' '));
    $("#famiStats").empty();
    $("#famiStats").append("<ul>");
    for (var key in fami.Nourriture) {
        var selected = fami.StatsToAugmente.indexOf(key) >= 0 ? "selected" : "";
        $("#famiStats").append("<li idFami=" + fami.Fami.idObjetInv + " class='statsToAugment " + selected + " 'stats=" + key + ">" + key + "</li>");
    }
    for (var key in fami.NourritureType) {
        var selected = fami.StatsToAugmente.indexOf(key) >= 0 ? "selected" : "";
        $("#famiStats").append("<li idFami=" + fami.Fami.idObjetInv + " class='statsToAugment " + selected + " 'stats=" + key + ">" + key + "</li>");
    }

    $("#famiStats").append("</ul>");
    $("#famiContainer").show();

    $(".statsToAugment").unbind('click').click(function () {
        var selected = $(this).hasClass('selected');
        if (!selected)
            $(this).addClass('selected');
        else
            $(this).removeClass('selected');
        var itemUid = $(this).attr('idFami');
        var stats = $(this).attr("stats");
        NetfuLauncher.setFamilier(currentAccount, itemUid, stats)
    });
}

function createRecolte() {
    $("#divRecolte").empty();
    $("#divRecolte").html("<h2>Metiers</h2>");

  
    for (var i = 0; i < bot().Jobs.Jobs.length; i++) {
        var job = bot().Jobs.Jobs[i];
        var jobIO = getJobById(job.id)[0];
        var xpcurrent = job.expCurrent - job.expInf;
        var xpsup = job.expSup - job.expInf;
        var xp = parseInt((xpcurrent / xpsup) * 100);
        var html = '<div class="jobContainer">';

        html += '<div style="width:100%;text-align:center;font-size:14px;"><i class="fas fa-arrows-alt-v" aria-hidden="true"></i><job>' + jobIO.nom + '</job></div>';
        html += '<div class="infosJob">';
        html += '<div class="progress">'
        html += '<exp class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="' + xp + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + xp + '%"><label style="color:black;width:162px">Niveau ' + job.level + ' (' + xp + '%)</label></exp>'
        html += '</div>'
        html += '</div>';
        html += '<ul class="ressourceList">';
        var itemsAdded = [];
  
        for (var j = 0; j < job.Skills.length; j++) {
            var skill = job.Skills[j];
            var skillIO = getSkillById(skill._nID)[0];
            if (skillIO.item != null && itemsAdded.indexOf(skillIO.item.nom) < 0) {
                var selected = bot().config.listRessourcesRecolt.indexOf(skillIO.id) >= 0 ? "selected" : "";
                html += "<li class='" + selected + "' itemId='" + skillIO.item.id + "' skillId='" + skillIO.id + "' '>";
                    html += '<name>' + skillIO.item.nom + '</name>'
                    html += '<img src="image/items/' + skillIO.item.id + '.png" />';
                    itemsAdded.push(skillIO.item.nom);
                   
            }
            else if (skillIO != null && skillIO.craftsList != null) 
                for(var si = 0;si<skillIO.craftsList.length;si++){
                    var craft= getCraftById(skillIO.craftsList[si].id);
                    var objTocraft = getObjetById(skillIO.craftsList[si].id)[0];
                    if (craft != null)

                    if (craft != null && craft.Value.Key.length < (2 + Math.floor(job.level / 10)) && itemsAdded.indexOf(objTocraft.nom) <0)
                    {
                        var selected = bot().config.listItemToCrafts.indexOf(objTocraft.id) >= 0 ? "selected" : "";
                        html += "<li class='" + selected + " artisanat' itemId='" + objTocraft.id + "'>";
                        html += '<name>' + objTocraft.nom + '</name>'
                        html += '<img src="image/items/' + objTocraft.id + '.png" />';
                        itemsAdded.push(objTocraft.nom);
                    }


                }
        
            html += "</li>";
        }
        html += '</ul>';

        if (jobIO.id == 36) 
            html += "<div> Porte de la canne : <input style='width: 45px;' id='porteCanne' type='number' value=" + bot().config.portecanne + " > </div>"
        

        html += "</div>";

        if(itemsAdded.length>0)
            $("#divRecolte").append(html);
    }

    $(".jobContainer .fa-arrows-alt-v").unbind('click').click(function () {
        var container = $(this).parent().parent();

        if(!container.hasClass('expanded'))
            container.addClass('expanded');
        else
            container.removeClass('expanded');
    });

    $(".ressourceList li").unbind('click').click(function () {
        if($(this).hasClass('selected'))
            $(this).removeClass('selected');
        else
            $(this).addClass('selected');

        var artisanat =$(this).hasClass('artisanat');
        var id = artisanat?$(this).attr('itemId'):$(this).attr('skillId');

        NetfuLauncher.setRecolteItem(currentAccount, id, $(this).hasClass('selected'), artisanat);
    });

    $("#porteCanne").unbind('change').change(function () {
        NetfuLauncher.setPorteCanne(currentAccount, $(this).val());
    });
   

}

function setChef(elt) {
 
    var idDofus = $(elt).attr('idDofus');
    var chef = $(elt).val();
    NetfuLauncher.setChef(idDofus, chef);
}

function getObjetById(id) {
    return objets.filter(function (o) { return o.id == id });
}

function getJobById(id) {
    return jobs.filter(function (o) { return o.id == id });
}

function getSkillById(id) {
    return skills.filter(function (o) { return o.id == id });
}

function getCraftById(id) {
    for (var i = 0; i < crafts.length; i++)
        if (crafts[i].Key == id)
            return crafts[i];
}

    function getCurrentUI() {
        var b = bot();
        if (accountsUI == null)
            accountsUI = {};

        var menuLogin = ["tab-compte", "tab-proxy"];

        var wrongMenu = accountsUI[currentAccount] == null || accountsUI[currentAccount] == 'undefined' ||
                        ((b['status'] == null || b['status']['connexion'] != 3) && menuLogin.indexOf(accountsUI[currentAccount]) < 0)
                        || (accountsUI[currentAccount] != null &&  b['status'] != null && b['status']['connexion'] == 3 && menuLogin.indexOf(accountsUI[currentAccount]) >= 0);
        if (wrongMenu)
         accountsUI[currentAccount] =  (b['status'] == null || b['status']['connexion'] !=3)?"tab-compte":"tab-perso";
        
        return accountsUI[currentAccount];
    }

    function setCurrentUi(uiName) {
        if (accountsUI == null)
            accountsUI = {};

        accountsUI[currentAccount] = uiName;
       
    }



    var loadTaskRefresh;
    function InitNetfu() {
         loadTaskRefresh = setInterval(function () {
             console.log(NetfuLauncher);
            if (NetfuLauncher.loading) {
                $("#msgLoader").html(NetfuLauncher.loadingStat);
            }
            else if(NetfuLauncher.resLicence == 1)
                $(document).trigger("onLoadCompte");
            else
                $(document).trigger("onLicenceInvalide");

      

        }, 500);
        initChart();
    }

    function initChart() {
        var ctx = document.getElementById('canvasStats').getContext('2d');
            window.myBar = new Chart(ctx, {
                type: 'bar',
                data: null,
                options: {
                    responsive: true,
                    legend: {
                        position: 'top'
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                            color: 'rgb(255, 255, 255)',
                            gridLines: {
                                display: true,
                                color: "rgba(255,255,255,0.3)"

                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Experience',
                                fontColor: 'rgb(255, 255, 255)',
                                fontSize: 14
                            },
                            ticks: {
                                fontColor: 'rgb(255, 255, 255)', // this here
                            }
                        }],
                        xAxes: [{
                            stacked: true,
                            color: 'rgb(255, 255, 255)',
                            gridLines: {
                                display: true,
                                color: "rgba(255,255,255,0.3)"

                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Date',
                                fontColor: 'rgb(255, 255, 255)',
                                fontSize: 14
                            },
                            ticks: {
                                fontColor: 'rgb(255, 255, 255)', // this here
                            }
                        }]
                    }
                }
            });

            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)'
            };
    }

    function bindAutoComplete() {


        $("#deleteItemSearch").autocomplete({
            source:function(request, response) {
                var results = objets.filter(function (o) { return o.nom.toLowerCase().indexOf(request.term.toLowerCase()) > -1 });

                response(results.slice(0, 7));
            },
            select: function (event, ui) {
                $("#deleteItemSearch").val(ui.item.nom);
                $("#deleteItemSearch").attr('itemId',ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
            
          return $('<li itemId="' + item.id + '" class="liItem" ">')
        .append('<div style="display:inline-flex;font-size:10px"><p>' + item.nom + '</p>')
        .append("<img style='width:30px;' src='image\\items\\" + item.id + ".png'/></div>").appendTo(ul);
        };

        $("#searchItemAchatAuto").autocomplete({
            source: function (request, response) {
                var results = objets.filter(function (o) { return o.nom.toLowerCase().indexOf(request.term.toLowerCase()) > -1 });

                response(results.slice(0, 7));
            },
            select: function (event, ui) {
                $("#searchItemAchatAuto").val(ui.item.nom);
                $("#searchItemAchatAuto").attr('itemId', ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            return $('<li itemId="' + item.id + '" class="liItem" ">')
          .append('<div style="display:inline-flex;font-size:10px"><p>' + item.nom + '</p>')
          .append("<img style='width:30px;' src='image\\items\\" + item.id + ".png'/></div>").appendTo(ul);
        };
      

        $("#regenItem").autocomplete({
            source: function (request, response) {
                var results = objets.filter(function (o) { return o.nom.toLowerCase().indexOf(request.term.toLowerCase()) > -1 });
                response(results.slice(0, 7));
            },
            select: function (event, ui) {
                $("#regenItem").val(ui.item.nom);
                $("#regenItem").attr('itemId', ui.item.id);
                NetfuLauncher.setItemRegen(currentAccount,ui.item.id);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            return $('<li itemId="' + item.id + '" class="liItem"  >')
        .append('<div style="display:inline-flex;font-size:10px"><p>' + item.nom + '</p>')
        .append("<img style='width:30px;' src='image\\items\\" + item.id + ".png'/></div>").appendTo(ul);
        };

        $("#searchMonsterAD").autocomplete({
            source: function (request, response) {
                var results = monsters.filter(function (o) { return o.nom.toLowerCase().indexOf(request.term.toLowerCase()) > -1 });
                response(results.slice(0, 7));
            },
            select: function (event, ui) {
                $("#searchMonsterAD").val(ui.item.nom);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            return $('<li  class="liItem"  >')
        .append('<div style="display:inline-flex;font-size:10px"><p>' + item.nom + '</p>').appendTo(ul);
        };
    }

    function refreshAccounts() {
        accounts = JSON.parse(NetfuLauncher.getAccounts(currentAccount));

    }

    function launchRefreshTimer() {
                setInterval(function () {
            if (currentAccount != null)
                $(document).trigger("onRefreshCompte");
        }, 1000);
    }

    $(document).on("onLoadCompte", function () {
        clearInterval(loadTaskRefresh);
        var scope = angular.element('[ng-controller=Ctrl]').scope();


        objets = JSON.parse(NetfuLauncher.getObjets());
        serveurs = JSON.parse(NetfuLauncher.getServeurs());
        monsters = JSON.parse(NetfuLauncher.getMonsters());
        jobs =  JSON.parse(NetfuLauncher.getJobs());
        skills = JSON.parse(NetfuLauncher.getSkills());
        crafts = JSON.parse(NetfuLauncher.getCrafts());
        refreshAccounts();
        launchRefreshTimer();
        bindAutoComplete();
        $("#msgLoader").hide();
        $(".loader-ring").hide();
        $('#accounts').show("500");
        //A la selection d'un onglet
     
        $("#tabsBot li").unbind("click").click(function () {
            setCurrentUi($(this).find("a").attr('id'));
            showBotWindows(false);
        });


    });

    $(document).on('onLicenceInvalide', function (res) {
        console.log(NetfuLauncher.resLicence);
        clearInterval(loadTaskRefresh);
        var raison = "Raison: licence hors date ou invalide";

        if (NetfuLauncher.resLicence == 0)
            raison = "Raison: Impossible de contacter le serveur de licence";

        $("#licenceContainer p").html(raison)
        $("#licenceContainer").show();

        $("#setLicence").unbind('click').click(function () {
            var key = $("#licence").val();
            NetfuLauncher.setLicence(key);
            InitNetfu();
            $("#licenceContainer").hide();
        });

    });


    $(document).on("onRefreshCompte", function () {
        accounts = JSON.parse(NetfuLauncher.getAccounts(currentAccount));
       //var acc = JSON.parse(NetfuLauncher.getAccount(currentAccount));
       //for (var i = 0; i < accounts.length; i++) {
       //    if (acc == null) {
       //        if (accounts[i] == null)
       //            accounts[i] = acc;
       //    }
       //    else if (accounts[i] != null && accounts[i]['config']["nomDuCompte"] == acc['config']["nomDuCompte"])
       //        accounts[i] = acc;
       //}
    });
   

    function accountClick(el) {
        $('.account').removeClass('selected');
        $(el).addClass('selected');
        $("#addAccountPanel").hide();
        currentAccount = $(el).attr('id');
        showBotWindows(true);
    }

    function connectBot(el) {
        if ($(el).hasClass('statut') || $(el).hasClass('statut0'))
            NetfuLauncher.connectAccount($(el).parent().attr('id'));
        else
            NetfuLauncher.discoAccount($(el).parent().attr('id'));
    }
    function deleteItemAchat(me) {
        NetfuLauncher.deleteItemAchat(currentAccount, $(me).attr('itemId'));
    }


    function showBotWindows(fromAccount) {
        var b = bot();
        var currentUi = getCurrentUI();

        if (fromAccount) {
            $('#' + currentUi).click();
            return;
        }
  
        var botConnect = (b['status'] != null && b['status']['connexion'] == 3);
    
        $('.unconnectTab').toggle(!botConnect);
        $('.connectTab').toggle(botConnect);

        if (!$("#botPanel").is(":visible"))
            setTimeout(function () { $("#botPanel").show("1000"); }, 1150);
        switch (currentUi) {
            case 'tab-trajet':
                $("#infosTrajet").toggle(b['MovementTrajet'] != null);
                $("#onglet-trajet .custom-file").toggle(b['MovementTrajet'] == null);
            break;
        }
           
    }

