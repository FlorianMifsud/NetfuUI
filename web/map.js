
var initMapData = false;
var los = Array();
var entities = Array();
var tileWidth = 43;
var tileHeight = 21.5;
var CELLPOS = Array();
	

			

function buildMap()
{
    los = bot().map.los;
    CELLPOS = Array();
	initCells();


	var c=document.getElementById("mapStatus");
	var cxt = c.getContext("2d");

	c.width = tileWidth * (bot().map.width + 1);
	c.height = tileHeight * (bot().map.height + 1);
				
	c.addEventListener("click", onMouseMove, false);
				
	
	var htmlBuffer = "<ul>";
	var done = Array();

	htmlBuffer += "</ul>";
	

	for(var cellId in CELLPOS)
	{
		// Affichage de la grille
		drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0xFFFFFF, 0xBBBBBB);
					
						
		// Ligne de vue
		if(los[cellId] == 0)
			drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, 0x777777);
			
	    //Soleil

		if (bot().map.Changeurs.indexOf(parseInt(cellId))>=0)
		    drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "f7e51b");

		

	
	
	if(bot().fight != null){
		var fighters = bot.fight.fighters;
		for(var i=0;i<fighters.length;i++)
		{
			if(fighters[i].cellId == cellId)
			{
				if((fighters[i].Id >0))
					drawCircle(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "ffabf2");
				else
					drawSquare(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "eb3c07");
				
			}
		}
	}
	else
	{
		var char = bot().map.Characters[cellId];
		var monster = bot().map.MonstersGroups[cellId];
		var npc = bot().map.Npcs[cellId];
		var ressource = bot().map.Ressources[cellId];
		if (char){
		    if (char.Id == bot().monIdDofus)
		        drawCircle(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "ffabf2");
		    else
		        drawSquare(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "caff33");
        }

		if (monster)
		    drawSquare(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "eb3c07");

		if (npc)
		    drawSquare(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, "6a07eb");

		if(ressource)
		    drawTile(cxt, CELLPOS[cellId].pixelX, CELLPOS[cellId].pixelY, getColorFromString(ressource.nom));
		
	}
	}
}
			
function onMouseMove(e)
{
    cellPosX = CELLPOS[461].pixelX;
    cellPosY = CELLPOS[461].pixelY;


	for (var i in bot().map.mapDataActuel)
	{

	    var data = bot().map.mapDataActuel[i];
	    if (CELLPOS[data.Id]) {
	        cellPosX = CELLPOS[data.Id].pixelX + tileWidth / 2;
	        cellPosY = CELLPOS[data.Id].pixelY + tileHeight / 2;

	        if ((Math.abs(e.layerX  - cellPosX) + Math.abs(e.layerY  - cellPosY)) < tileHeight / 2) {
	            showCellInfo(data.Id, e.layerX, e.layerY, data);
	            return
	        }
	    }
	}

}
			
function showCellInfo(cell, x, y,data)
{
    $("#tooltip").hide();
	var tooltip = document.getElementById("tooltip");
	tooltip.style.display = "block";
	
	var htmlBuffer = "";
	var char = bot().map.Characters[cell];
	var monster = bot().map.MonstersGroups[cell];
	var npc = bot().map.Npcs[cell];
	var ressource = bot().map.Ressources[cell];
	htmlBuffer += "<ul>";
	htmlBuffer += "<li><span> cellId : </span>" + cell + "</li>";
	
	if(bot().fight != null){
		var fighters = bot.fight.fighters;
		for(var i=0;i<fighters.length;i++)
		{
			if(fighters[i].cellId == cell)
				htmlBuffer += "<li><span> Point de vie : </span>" + fighters[i].LP + "</li>";
		}
		
			
	}
	else{
		if (char) {
			htmlBuffer += "<li><span> Joueur : </span>" + char.nom + "</li>";
			htmlBuffer += "<li><span> Niveau : </span>" + char.level + "</li>";
			htmlBuffer += "<li><span> Guilde : </span>" + char.guild + "</li>";
			htmlBuffer += "<li><span> Alignement : </span>" + char.Alignement + "</li>";
		}
		if (monster) {
			htmlBuffer += "<li><span> Monstres : </span>" + monster.names + "</li>";
			htmlBuffer += "<li><span> Niveau : </span>" + monster.level + "</li>";
			htmlBuffer += "<li><span> Agressif : </span>" + (monster.Aggro ? "oui" : "non") + "</li>";
		}
		if (npc) 
			htmlBuffer += "<li><span> NPC ID : </span>" + npc.Id + "</li>";
		
		if (ressource) {
			htmlBuffer += "<li><span> Ressource : </span>" + ressource.nom + "</li>";
			htmlBuffer += "<li><span> Statut : </span>" + ressource.stat + "</li>";
		}
	}
	htmlBuffer += "<div class='actionMap'>";
	htmlBuffer += "<button class='btn btn-primary' onclick='Move(" + cell + ")'>Se deplacer</button>";
	console.log(data.IsChangeur);
	if (data.IsChangeur==true)
	    htmlBuffer += "<button class='btn btn-warning' onclick='SetNTrigger(" + cell + ")'>Retirer un trigger</button>";
    else
	    htmlBuffer += "<button class='btn btn-warning' onclick='SetTrigger(" + cell + ")'>Mettre un trigger</button>";

	if (data.los == 0)
	    htmlBuffer += "<button class='btn btn-success' onclick='SetMarchable(" + cell + ")'>Rendre marchable</button>";
    else
	    htmlBuffer += "<butto class='btn btn-success'n onclick='SetNMarchable(" + cell + ")'>Rendre non marchable</button>";

	htmlBuffer += "</div>";
	htmlBuffer += "</ul>";

	tooltip.innerHTML = htmlBuffer;
	tooltip.style.left = (x +$("#map").position().left) + "px";
	tooltip.style.top = (y  +$("#map").position().top) -15 + "px";
	tooltip.style.display = "block";

	$("#tooltip").unbind('mouseleave').mouseleave(function () {
	    $(this).hide();
	});
}

function Move(cell) {
    NetfuLauncher.move(currentAccount, cell);
    $("#tooltip").hide();
}

function SetMarchable(cell) {
    NetfuLauncher.setMarchable(currentAccount, cell);
    $("#tooltip").hide();
    buildMap();
}

function SetNMarchable(cell) {
    NetfuLauncher.setNMarchable(currentAccount, cell);
    $("#tooltip").hide();
    buildMap();
}

function SetTrigger(cell) {
    NetfuLauncher.setTrigger(currentAccount, cell);
    $("#tooltip").hide();
    buildMap();
}

function SetNTrigger(cell) {
    NetfuLauncher.setNTrigger(currentAccount, cell);
    $("#tooltip").hide();
    buildMap();
}
			

			
function getColorFromString(str)
{
	var i = 0;
                    var r = 0;
                    var g = 0;
                    var b = 0;
                    for(i = 0; str && i < str.length; ++i)
                    {
                            switch(i % 3)
                            {
                                    case 0:
                                            r += str.charCodeAt(i) * 20;
                                            g += str.charCodeAt(i) * 10;
                                            b += str.charCodeAt(i) * 40;
				break;
                                    case 1:
                                            r += str.charCodeAt(i) * 10;
                                            g += str.charCodeAt(i) * 40;
                                            b += str.charCodeAt(i) * 20;
				break;
                                    case 2:
                                            r += str.charCodeAt(i) * 40;
                                            g += str.charCodeAt(i) * 20;
                                            b += str.charCodeAt(i) * 10;
				break;
                            }
                    }
                    r = 0xEE - r % 150;
                    g = 0xEE - g % 150;
                    b = 0xEE - b % 150;
                    return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
}
			
function drawTile(target, x, y, color, borderColor)
{
	if(color != undefined)
		target.fillStyle= "#" + color.toString(16);
				
	if(borderColor != undefined)
	{
		target.strokeStyle = "#" + borderColor.toString(16);
		target.lineWidth = .5;
	}
				
	target.beginPath();
	target.moveTo(x + tileWidth / 2,	y + 0);
	target.lineTo(x + tileWidth, 		y + tileHeight / 2);
	target.lineTo(x + tileWidth / 2,	y + tileHeight);
	target.lineTo(x + 0,			y + tileHeight / 2);
	target.lineTo(x + tileWidth / 2,	y + 0);
				
	if(color != undefined)
		target.fill();
					
	if(borderColor != undefined)
		target.stroke();
}
			
function drawCircle(target, x, y, color)
{
	if(color != undefined)
		target.fillStyle= "#" + color.toString(16);
				
	target.beginPath();
	target.arc(x + tileWidth / 2,	y + tileHeight / 2, tileHeight / 3, 0, Math.PI * 2, false);
	target.closePath();
				
	if(color != undefined)
		target.fill();
}
			
function drawSquare(target, x, y, color)
{
	if(color != undefined)
		target.fillStyle= "#" + color.toString(16);
					
	target.beginPath();
	target.fillRect (x + tileHeight * .7, y + tileHeight * .2, tileHeight * .6, tileHeight * .6);
	target.closePath();
				
	if(color != undefined)
		target.fill();
}
			
function initCells()
{
	var startX = 0;
	var startY = 0;
	var cell = 0;
	var b;


	for (a = 0; a < bot().map.height-1; a++) 
	{
	    cell = bot().map.width + a * (bot().map.width * 2 - 1)
		for (b = 1; b < bot().map.width; b++) {
			CELLPOS[cell] = {x: b,
						y: a,
						pixelX: b * tileWidth ,
						pixelY: a * tileHeight
						};
			cell++;
		}
		startX++;
	
	}

	for (a = 0; a < bot().map.height-1 ; a++) {
	    cell = (bot().map.width * 2) + (a) * (bot().map.width * 2 - 1)
	    for (b = 1; b < bot().map.width-1 ; b++) {
	        CELLPOS[cell] = {
	            x:  b,
	            y:  b,
	            pixelX: tileWidth/2 + b * tileWidth,
	            pixelY: a * tileHeight + tileHeight/2
	        };
	        cell++;
	    }
	    startX++;

	}
}
			

			
function getLegend(color, text, css)
{
	return '<li><span class="' +  css + '" style="background-color:#' + color.toString(16) + '" ></span>' + text + '</li>';
}