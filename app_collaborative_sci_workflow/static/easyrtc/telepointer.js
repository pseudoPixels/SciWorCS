var all_occupants_list = ""; //list of easyrtcid of all the logged in clients
var all_occupants_details = []; //list of logged in clients along with email, name and corresponding easyrtcid
var selfEasyrtcid = ""; //my own easyrtc id

//user info required for rtc
var user_name = "";
var user_email = "";


//collaboration locking information
var current_floor_owner = "NONE";
var floor_requests_queue = [];


//IMPORTANT
//this id remain unique throughout the pipeline for a module
var unique_module_id = 1;

var iAmDone = false;

//chat application (UI)
//https://jsfiddle.net/61jeuf9c/22/

$(document).ready(function(){


//========================================================
//================ ALL INITIALIZATION CODES STARTS =======
//========================================================

    //connect and login to the easyrtc node server.
    connect();

    //get the user required information from the DOM
    user_name = $("#user_name").text();
    user_email = $("#user_email").text();







//========================================================
//================ ALL INITIALIZATION CODES ENDS =========
//========================================================










//=======================================================
//============== WORKFLOW DAG STARTS ====================
//=======================================================

//========================================================
//============= WORKFLOW CONTROL CODE STARTS =============
//========================================================

  //tree implementation starts

  //node construct
  function Node(data) {
    this.data = data;
    this.nodeName = "A Workflow Module";
    this.parent = null;
    this.isLocked = false;
    this.currentOwner = "NONE";
    this.children = [];
  }

  //tree construct
  function Tree(data) {
    var node = new Node(data);
    this._root = node;
  }

  //traverse the tree by df default starting from the root of the tree
  Tree.prototype.traverseDF = function(callback) {

    // this is a recurse and immediately-invoking function
    (function recurse(currentNode) {
      // step 2
      for (var i = 0, length = currentNode.children.length; i < length; i++) {
        // step 3
        recurse(currentNode.children[i]);
      }

      // step 4
      callback(currentNode);

      // step 1
    })(this._root);

  };

  //traverse by depth first search from a specified start node (parent)
  Tree.prototype.traverseDF_FromNode = function(startNode, callback) {

        // this is a recurse and immediately-invoking function
        (function recurse(currentNode) {
            // step 2
            for (var i = 0, length = currentNode.children.length; i < length; i++) {
                // step 3
                recurse(currentNode.children[i]);
            }

            // step 4
            callback(currentNode);

            // step 1
        })(startNode);

    };

  //scans through all the nodes of the tree
  Tree.prototype.contains = function(callback, traversal) {
    traversal.call(this, callback);

  };

  //add a new node to a specific parent of the tree
  Tree.prototype.add = function(data, toData, traversal) {
    var child = new Node(data),
      parent = null,
      callback = function(node) {
        if (node.data === toData) {
          parent = node;
        }
      };

    this.contains(callback, traversal);

    if (parent) {
      parent.children.push(child);
      child.parent = parent;
    } else {
      throw new Error('Cannot add node to a non-existent parent.');
    }
    //return the newly created node
    return child;
  };

  //change the parent of a node to a new specified parent. the whole subtree (descendants)
  //moves along the node.
  Tree.prototype.changeParent = function(data, newParentData, traversal) {
    var targetNode = null,
    	oldParent = null,
      callback = function(node) {
        if (node.data === data) {
          oldParent = node.parent;
          targetNode = node;
        }
      };

    this.contains(callback, traversal);

    if (oldParent) {
      index = findIndex(oldParent.children, data);

      if (index === undefined) {
        throw new Error('Node to change parents of does not exist.');
      } else {
        nodeToChangeParentOf = oldParent.children.splice(index, 1);

        var newParent = null,
          newParentCallback = function(node) {
            if (node.data === newParentData) {
              newParent = node;
            }
          };

        this.contains(newParentCallback, traversal);

        if (newParent) {
        	newParent.children.push(targetNode);
          targetNode.parent = newParent;
          //alert(newParent.children[0].data);
        } else {
          throw new Error('New Parent Does not exist!');
        }


      }


    } else {
      throw new Error('The node did not have any previous parent!');
    }

  };

  //removes a particular node from its parent.
  Tree.prototype.remove = function(data, fromData, traversal) {
    var tree = this,
      parent = null,
      childToRemove = null,
      index;

    var callback = function(node) {
      if (node.data === fromData) {
        parent = node;
      }
    };

    this.contains(callback, traversal);

    if (parent) {
      index = findIndex(parent.children, data);

      if (index === undefined) {
        throw new Error('Node to remove does not exist.');
      } else {
        childToRemove = parent.children.splice(index, 1);
      }
    } else {
      throw new Error('Parent does not exist.');
    }

    return childToRemove;
  };

  //returns node object, given its node data
  Tree.prototype.getNode = function(nodeData,  traversal) {
    var theNode = null,
        callback = function(node) {
            if (node.data === nodeData) {
                theNode = node;
            }
        };
    this.contains(callback, traversal);

    return theNode;

  }

  //check if the node or any of its descendants are locked currently.
  //if not, the node floor is available as per the client request.
  Tree.prototype.isNodeFloorAvailable = function(nodeData,  traversal) {
    var theNode = this.getNode(nodeData, traversal);
    if(theNode == null){
        throw new Error('The requested node for access does not exist!');
    }

    //if the node is itself locked, then its NOT available for the requested user
    if(theNode.isLocked == true)return false;

    //if the node itself is not locked, check if any of its children are locked or not
    //if any of them are locked, the access is NOT granted...
    var nodeFloorAvailability = true;
    this.traverseDF_FromNode(theNode, function(node){
        //if any of its descendants are locked currently, the node access is not available
        if(node.isLocked == true)nodeFloorAvailability = false;
    });


    return nodeFloorAvailability;

  }

  //someone has got the access to this node, so lock it and all its descendants
  Tree.prototype.lockThisNodeAndDescendants = function(newOwner,nodeData,  traversal) {
    var theNode = this.getNode(nodeData, traversal);
    this.traverseDF_FromNode(theNode, function(node){
         //use helper function to load this node for the corresponding user
         lockNode(node, newOwner);
    });
  }

  //someone has released the access to this node, so UNLOCK it and all its descendants
  Tree.prototype.unlockThisNodeAndDescendants = function(nodeData,  traversal) {
    var theNode = this.getNode(nodeData, traversal);
    this.traverseDF_FromNode(theNode, function(node){
         //use the helper function to unlock the node.
         unlockNode(node);
    });
  }


  //HELPER FUNCTION: child index
  function findIndex(arr, data) {
    var index;

    for (var i = 0; i < arr.length; i++) {
      if (arr[i].data === data) {
        index = i;
      }
    }

    return index;
  }

  //HELPER FUNCTION: lock a given node with corresponding owner name
  function lockNode(node, nodeOwner){
    node.isLocked = true;
    node.currentOwner = nodeOwner;
  }

  //HELPER FUNCTION: unlock a node
  function unlockNode(node){
    node.isLocked = false;
    node.currentOwner = "NONE";
  }

   //====================
   //tree implementation ends
   //====================



function getParentJSON(parentNodeData, tree_nodes){
    for(var i=0; i< tree_nodes.length; i++){
      if(tree_nodes[i].text.node_id == parentNodeData)return tree_nodes[i];
    }

return null;
}


function redrawWorkflowStructure(){
  var all_nodes = [];
  workflow.traverseDF(function(node) {
    all_nodes.push(node);
  });

  all_nodes.reverse();

  var tree_nodes = [];

  for(var i=0; i<all_nodes.length; i++){

    var aNode = null;

    //assign color as per access for visulaization...
    var nodeClass = "";
    if(all_nodes[i].currentOwner == user_email)nodeClass = "lockedByMe";

    if(all_nodes[i].parent){
      aNode = {
        "parent": getParentJSON(all_nodes[i].parent.data, tree_nodes),
        "HTMLclass": "node",
        "text" : {
          "node_id": all_nodes[i].data,
          "name": all_nodes[i].nodeName
          },
        "innerHTML": "<div class='node'><p>" +all_nodes[i].nodeName +"<span style='font-size:12px;color:black;'>::"+  all_nodes[i].data +"</span></p><button class='dag_module' dag_mod_id='"+ all_nodes[i].data.split('_')[1]+"'>Configure</button></div>"

      }
    }else{
      aNode = {
        "HTMLclass": "startNode",
        "text" : {
          "node_id": all_nodes[i].data,
          "name": "Start"
        },
        "innerHTML": "<p>Start</p>"
      }
    }

    tree_nodes.push(aNode);

  }
  config = {
    container: "#tree-simple",
    node: {
        collapsable: true
    },
    connectors:{
        type: "bCurve"
    },
    padding: 0
  };


  tree_nodes.push(config);
  tree_nodes.reverse();

  new Treant(tree_nodes);

}


//create parent workflow at the starting
var workflow = new Tree("Module_0");
//n1 = workflow.add("Module 1", "Workflow", workflow.traverseDF);
//n2 = workflow.add("Module 2", "Module 1", workflow.traverseDF);
//n1.nodeName = 'Extract Potential Clones';
//n2.nodeName = 'Find Near Miss Clones';
//redrawWorkflowStructure();


//GO JS
//https://jsfiddle.net/0Lhfw8k8/55/
$(document).on('click', ".dag_module", function(){
    //alert($(this).attr('dag_mod_id'));
    $(".module").hide();
    $("#module_id_"+$(this).attr('dag_mod_id')).show();
});

//=======================================================
//============== WORKFLOW DAG ENDS ======================
//=======================================================

























//========================================================
//===================== COLLABORATION CODE STARTS ========
//========================================================

    //User requests for floor...
    function requestFloor(requestor_id){
        workflow_id = 'workflow_turn_id_1';
        requestor_id = 'gm_gmail_com';

        $.ajax({
            type: "POST",
            cache: false,
            url: "/locking_turn_request_floor/",
            data: 'workflow_id=' + workflow_id + '&floor_requestor='+requestor_id,
            success: function (option) {
                haveIGotTheFloor = option['haveIGotTheFloor'];
                //alert(haveIGotTheFloor);
                if(haveIGotTheFloor == true){
                    alert("Got the Floor.");
                    onFloorOwnerChanged(user_email);
                    notifyAll("floor_owner_changed", user_email);
                }else{
                    alert("Wating for the Floor...");
                    onNewFloorRequest(user_email);
                    notifyAll("new_floor_request", user_email);
                }
            },
            error: function (xhr, status, error) {
                alert("Some Error Occured while adding Request.");
            },
            async: false

        });


/*
        //No user is holding the floor now
        if(current_floor_owner == "NONE"){
            //update my vars and UIs
            onFloorOwnerChanged(requestor_id);

            //also inform this to others...
            notifyAll("floor_owner_changed", requestor_id);
            return true;//inform the requestor that he has got the floor
        }
        //someone is using the floor currently... so add the requestor to the list
        else{
            //add this requestor to the waiting list.
            onNewFloorRequest(requestor_id);
            //inform every other user too..
            notifyAll("new_floor_request", requestor_id);

            //inform this requestor that he has not got the floor and will have to wait...
            return false;

        }
*/

    }

    //User releases Floor
    function releaseFloor(){
        workflow_id = 'workflow_turn_id_1';
        $.ajax({
            type: "POST",
            cache: false,
            url: "/locking_turn_release_floor/",
            data: 'workflow_id=' + workflow_id,
            success: function (option) {
                   newFloorOwner = option['newFloorOwner'];
                   /*if (iAmDone == true){
                    alert("New FLoor Owner: " + newFloorOwner);
                   }*/


                   //alert("New Floor Owner: " + newFloorOwner);
                   var newFloorOwner_info = {"newFloorOwner" : newFloorOwner};

                   //call my floor release first
                    onFloorRelease(newFloorOwner);

                    //inform all other users as well...
                    notifyAll("release_floor", newFloorOwner_info);

            },
            error: function (xhr, status, error) {
                alert("Some Error Occured while Releasing Floor.");
            },
            async: false

        });








/*
        //call my floor release first
        onFloorRelease();

        //inform all other users as well...
        //in this case no special message is required
        notifyAll("release_floor", "NA");

 */
    }

    //checks if its my turn currently and allowed for changes
    function isItMyFloor(){
        if(current_floor_owner == user_email)return true;
        return false;
        /*
        //alert("Current Floor Owner: " + current_floor_owner);
        //alert("My Email: " + user_email);
        $.ajax({
            type: "POST",
            cache: false,
            url: "/locking_turn_get_current_floor_owner/",
            success: function (option) {
                   current_floor_owner = option['current_floor_owner_srv'];
                   //console.log("From Srv , Current Owner: " + current_floor_owner);

        //if(current_floor_owner == user_email)return true;
        //return false;
            },
            error: function (xhr, status, error) {
                alert("Some Error Occured while Releasing Floor.");
            },
            async:false

        });*/



    }








    //chat room communication
    $("#chatRoom_send_msg_btn").click("on", function(){

        var text = $("#chatRoom_send_msg_txt").val(); //get the msg content

        if(text.replace(/\s/g, "").length === 0) { // Don"t send just whitespace
            return;
        }

        //empty the text box for further msg
        $("#chatRoom_send_msg_txt").val("");

        //create the telegram for all the clients.
        //as its a chat room msg, we don't specify the reciever.
        var telegram = {"sender": user_name, "msg": text};
        var telegram_for_myself = {"sender": "Me", "msg": text};

        //add to my chat room conversation
        addToChatRoomConversation(telegram_for_myself);

        //and also send to all other clients for adding to their chat room conversation
        notifyAll("chat_room_msg", telegram);

    });




//$( "#draggable" ).draggable();


    //Collaborative white board
    var canvas = document.getElementById("mycanvas");
    var context = canvas.getContext('2d');

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;


    //vars for remote draw
    var remote_clickX = new Array();
    var remote_clickY = new Array();
    var remote_clickDrag = new Array();
    var remote_userDrawer = new Array();


    //Tools Vars
    var colorPurple = "#cb3594";
    var colorGreen = "#659b41";
    var colorYellow = "#ffcf33";
    var colorBrown = "#986928";

    var curColor = colorGreen;
    var clickColor = new Array();


    var clickSize = new Array();
    var curSize = 5;

    var curTool = 'Marker';

    function addClick(x, y, dragging) {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
      if(curTool=='Marker')clickColor.push(curColor);
      else if(curTool=='Eraser')clickColor.push('#EEE');

      clickSize.push(curSize);

      var clickInfo = {"userDrawer":user_email, "clickX": x, "clickY": y, "clickDrag": dragging};
      notifyAll("remote_draw", clickInfo);
    }

    //add the click information from remote client
    function remoteAddClick(clickInfo){
        remote_clickX.push(clickInfo.clickX);
        remote_clickY.push(clickInfo.clickY);
        remote_clickDrag.push(clickInfo.clickDrag);
        remote_userDrawer.push(clickInfo.userDrawer);

        //redraw
        redraw();
    }


    $('#mycanvas').mousedown(function(e) {
      var rect = e.currentTarget.getBoundingClientRect(),
      offsetX = e.clientX - rect.left,
      offsetY = e.clientY - rect.top;

      var mouseX = e.pageX - this.offsetLeft;
      var mouseY = e.pageY - this.offsetTop;



      paint = true;
      addClick(offsetX, offsetY);
      redraw();
    });


    $('#mycanvas').mousemove(function(e) {
          var rect = e.currentTarget.getBoundingClientRect(),
          offsetX = e.clientX - rect.left,
          offsetY = e.clientY - rect.top;

          //alert(offsetX);

      if (paint) {
        addClick(offsetX, offsetY, true);
        redraw();
      }
    });


    $('#mycanvas').mouseup(function(e) {
      paint = false;
    });


    $('#mycanvas').mouseleave(function(e) {
      paint = false;
    });


    $('#whiteBoard_clear').click("on", function(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

        //clear the draw points from array
        clickX = [];
        clickY = [];
        clickDrag = [];
        clickColor = [];
        clickSize = [];


        //vars for remote draw
        remote_clickX = [];
        remote_clickY = [];
        remote_clickDrag = [];
        remote_userDrawer = [];

    });

    $(document).on('change', '#whiteBoard_color' ,function(){
        var selectedColor = $(this).val();
        //alert(selectedColor);
        if(selectedColor=='Green')curColor = colorGreen;
        else if(selectedColor=='Purple')curColor = colorPurple;
        else if(selectedColor=='Brown')curColor = colorBrown;
        else curColor = colorYellow;
    });

    $(document).on('change', '#whiteBoard_brushSize' ,function(){
        var selectedSize = $(this).val();

        if(selectedSize=='Small')curSize = 3;
        else if(selectedSize=='Normal')curSize = 5;
        else if(selectedSize=='Large')curSize = 8;
        else curSize = 12;

    });

    $(document).on('change', '#whiteBoard_tool' ,function(){
        var selectedTool = $(this).val();

        if(selectedTool=='Eraser')curTool = 'Eraser';
        else curTool = 'Marker';
    });



    function redraw() {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

      //context.strokeStyle = "#df4b26";
      context.lineJoin = "round";
      //context.lineWidth = 3;

      //self drawing points
      for (var i = 0; i < clickX.length; i++) {
        context.beginPath();

        if (clickDrag[i] && i) {
          context.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
          context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.strokeStyle = clickColor[i];
        context.lineWidth = clickSize[i];
        context.stroke();
      }

      //remote draw points
      for(var i=0; i <remote_clickX.length; i++){
        context.beginPath();

        var prevIndexForThisUser = getPreviousDragIndex(i);
        if (remote_clickDrag[i] && prevIndexForThisUser >= 0) {
          context.moveTo(remote_clickX[i - 1], remote_clickY[i - 1]);
        } else {
          context.moveTo(remote_clickX[i] - 1, remote_clickY[i]);
        }
        context.lineTo(remote_clickX[i], remote_clickY[i]);
        context.closePath();
        context.stroke();

      }


    }

    function getPreviousDragIndex(thisIndex){
        var thisUserDrw = remote_userDrawer[thisIndex];
        var prevIndx = -1;

        for(var i=thisIndex-1;i >=0; i--){
            if(remote_userDrawer[i]==thisUserDrw){
                if(remote_clickDrag[i]==true){
                    prevIndx = i;
                }
                break;
            }
        }


        return prevIndx;
    }
    //collaborative white board ends










    //Hidden Display controls
    $("#id_collaborativeToolsDiv").click("on", function(){
        $("#collaboration_tools").toggle(750);
    });

    $("#id_chatRoomDiv").click("on", function(){
        $("#chatRoom").toggle(750);
    });

    $("#id_canvasDiv").click("on", function(){
        $("#whiteBoard").toggle(750);
    });

    $("#id_collaboration_controls").click("on", function(){
        $("#collaboration_controls").toggle(750);
    });

    $("#collaboration_controls_request_turn").click("on", function(){
        if($(this).text() == 'Request Floor'){
            $(this).prop('disabled', true); //dont allow to request multiple times
            $(this).text('Waiting For Floor');
            $(this).css('background-color', 'DARKGOLDENROD');
            //finally request the floor
            requestFloor(user_email);
        }

        else if($(this).text() == "Release Floor"){
            $(this).text('Request Floor');
            $(this).css('background-color', 'darkcyan');

            releaseFloor();
        }

    });

//========================================================
//===================== COLLABORATION CODE ENDS ==========
//========================================================




























//========================================================
//===================== EASYRTC CODE STARTS ==============
//========================================================

$(document).mousemove(function(e){
    var my_telepointer_info = {"left":e.pageX-50,
                             "top":e.pageY-50,
                             "email":user_email,
                             "rtcid": selfEasyrtcid,
                             "user_name":user_name
                            };

    notifyAll("telepointer_info", my_telepointer_info);


});










//Notify all the other clients of the message with the passed message type.
function notifyAll(messageType, message){
    //loop through all the other clients and send the message.
    for(var otherEasyrtcid in all_occupants_list) {
            easyrtc.sendDataWS(otherEasyrtcid, messageType,  message);
    }
}




function sendP2pTextMsg(toEmail, message){
    var telegram = {"fromID": convertEmailToID(user_email),"fromName":user_name ,"message":message};
    easyrtc.sendDataWS(getEasyRtcidFromEmail(toEmail), "P2P_MSG", telegram);
    //alert("conv->"+getEasyRtcidFromEmail('gm_gmail_com'));
    //alert("norm->"+getEasyRtcidFromEmail('gm@gmail.com'));
}


function onP2pMsgReceived(telegram){
    chatWith($.trim(convertEmailToID(telegram.fromID) ), $.trim(telegram.fromName));
    //alert("fromID->"+telegram.fromID+"<->fromName"+telegram.fromName+"<-");
    addToChat($.trim(convertEmailToID(telegram.fromID) ), $.trim(telegram.fromName), telegram.message);
}



//Message reciver for the message sent from other clients.
//this method performs actions according to the received msgType
function onMessageRecieved(who, msgType, content) {

    switch(msgType) {
        case "telepointer_info":
            updateTelepointer(content);
            break;
        case "inform_my_details_to_all_other_clients":
            addNewClientToAllOccupantsDetails(content);
            updateOnlineStatusOfClients(all_occupants_details);

            //update the audio call button label
            updateAudioCallerBtnLabels(all_occupants_details);
            break;
        case "disconnected":
            alert("Disconnected : " + content);
            break;
        case "chat_room_msg":
            addToChatRoomConversation(content);
            break;
        case "P2P_MSG":
            onP2pMsgReceived(content);
            break;
        case "floor_owner_changed":
            onFloorOwnerChanged(content);
            break;
        case "new_floor_request":
            onNewFloorRequest(content);
            break;
        case "release_floor":
            onFloorRelease(content.newFloorOwner);
            break;
        case "remote_module_addition":
            onRemoteModuleAddition(content);
            break;
        case "moduleSettingsChanged":
            onModuleSettingsChanged(content);
            break;

        case "remote_draw":
            remoteAddClick(content);
            break;


    }
}



function onModuleSettingsChanged(changeInfo){
    $(changeInfo.elementInfo).eq(changeInfo.paramIndex).val(changeInfo.newParamValue).change();
}



function onRemoteModuleAddition(moduleInfo){
    //making sure the snychronization is ok...
    if(getNextUniqueModuleID() == moduleInfo.newModuleID){
        addModuleToPipeline(moduleInfo.newModuleID, moduleInfo.newModuleName);
        updateNextUniqueModuleID();//update my own unique module id for later use too...

        //as its remote module addition... most likely its not my floor...
        //doing a further check for safety before locking the param settings...
        lockParamsSettings();
    }else{
        alert("Some Error Occured while Remote Module Addition. Synchronization Failed!");
    }
}



function onNewFloorRequest(requestor_id){
    //push the new requestor to the end of the waiting list.
    //floor_requests_queue.push(requestor_id);

    //show the updated floor information...
    updateUI_floorInformation();
}

function onFloorRelease(newFloorOwner){
        /*
        var newFloorOwner = "NONE";
        //if someone is in the waiting list... assign the floor to the first one
        if(floor_requests_queue.length > 0){
            newFloorOwner = floor_requests_queue.shift();
        }
*/
        //floor owner changed
        onFloorOwnerChanged(newFloorOwner);
}



function onFloorOwnerChanged(newFloorOwner){
    current_floor_owner = newFloorOwner;



    //TODO: change lockings (if current user is me...)
    if(isItMyFloor() == true){

        $("#collaboration_controls_request_turn").text('Release Floor');
        //alert("You have Got the Floor");
        $("#collaboration_controls_request_turn").prop('disabled', false);
        $("#collaboration_controls_request_turn").css('background-color', 'salmon');
        //as I have got the floor... unlock every para settings for me to work...
        unlockParamsSettings();
    }else{
        //as its not this user's turn... lock all the param settings...
        lockParamsSettings();
    }




    //update current owner and floor requests queue
    updateUI_floorInformation();

}


//lock the UIs (setting params) from changing for this user...
function lockParamsSettings(){
    $(".setting_param").prop("disabled", true);
}
//unlock the UIs (setting params) from changing for this user...
function unlockParamsSettings(){
    $(".setting_param").prop("disabled", false);
}




//update the ui showing new floor owner and floor requests queue
function updateUI_floorInformation(){

    //update ui: current floor owner
    if(isItMyFloor() == true)$("#collaboration_controls_current_floor_owner").text("Current Floor Owner: Me");
    else $("#collaboration_controls_current_floor_owner").text("Current Floor Owner: " + getNameForAnEmail(current_floor_owner) );


    workflow_id = 'workflow_turn_id_1';
    //requestor =

    $.ajax({
        type: "POST",
        cache: false,
        url: "/locking_turn_get_request_queue/",
        data: 'workflow_id=' + workflow_id,
        success: function (option) {
            floor_requests_queue = option['floor_requests_queue'];
            //update ui: floor requests queue
            $("#collaboration_controls_floor_requests_queue").text("Floor Requests Queue: ");
            for(var i=0;i < floor_requests_queue.length; i++){
                //append this user to the end of ui
                $("#collaboration_controls_floor_requests_queue").append("<i>" + getNameForAnEmail(floor_requests_queue[i]) +"</i>");

                //extra: show arrow for intuition
                if(i != floor_requests_queue.length - 1)$("#collaboration_controls_floor_requests_queue").append(" => ");
            }

        },
        error: function (xhr, status, error) {
            alert("Some Error Occured while adding Request.");
        }

    });


/*
    //update ui: floor requests queue
    $("#collaboration_controls_floor_requests_queue").text("Floor Requests Queue: ");
    for(var i=0;i < floor_requests_queue.length; i++){
        //append this user to the end of ui
        $("#collaboration_controls_floor_requests_queue").append("<i>" + getNameForAnEmail(floor_requests_queue[i]) +"</i>");

        //extra: show arrow for intuition
        if(i != floor_requests_queue.length - 1)$("#collaboration_controls_floor_requests_queue").append(" => ");
    }
*/

}






//add the newly obtained client details to the list (e.g. like phonebook)
function addNewClientToAllOccupantsDetails(newClientDetails){
    all_occupants_details.push(newClientDetails);
}


function addToChatRoomConversation(telegram){
  // Escape html special characters, then add linefeeds.
  var content = telegram.msg;
  var sender = telegram.sender;
  content = content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  content = content.replace(/\n/g, "<br />");

  sender = "<strong>" + sender + "</strong>";

  var previous_messages = $("#chatRoom_all_msg").html();

  $("#chatRoom_all_msg").html(previous_messages + sender + ": " +content + "<br/>");

}


//update online status based on the available clients
function updateOnlineStatusOfClients(all_occupants_details){
    //first every user's status label to offline
    $(".online_status").text(' (Offline) ').css('color', '#C0C0C0');

    //then update the online status based on logged in clients.
    for(var i=0; i<all_occupants_details.length; i++){
        var userEmail = all_occupants_details[i].email;
        $('#online_status_'+convertEmailToID(userEmail)).text(' (Online) ').css('color', '#0f0');
    }
}


//update the audio call buttons labels for the corresponding user
//i.e. replace easyrtcid to human readable names
function updateAudioCallerBtnLabels(all_occupants_details){
    //then update the online status based on logged in clients.
    for(var i=0; i<all_occupants_details.length; i++){
        var easyrtcID = all_occupants_details[i].easyrtcid;
        $('#btn_audio_call_'+easyrtcID).text(getNameForAnEasyRTCid(easyrtcID));
    }

}





function convertEmailToID(email){
    //an email to be id, must not contain some special characters
    //TODO: currently removed occurance of any . or @ by _ need to handle other special characters too
    return email.replace(/\.|@/g, '_');
}





function connect() {
    easyrtc.setSocketUrl(":8080");
    easyrtc.setPeerListener(onMessageRecieved);
    easyrtc.setRoomOccupantListener(userLoggedInListener);
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);


    //For Audio Streaming
    //console.log("Connecting Audio Strm. Service");
  //easyrtc.enableAudio(true);
  //easyrtc.enableVideo(true);
  //easyrtc.enableDataChannels(true);

  easyrtc.enableAudio(true);
  easyrtc.enableVideo(true);
  easyrtc.enableDataChannels(true);

/*
    easyrtc.initMediaSource(
        function(){    // success callback
          //easyrtc.connect("easyrtc.audioOnly", loginSuccess, loginFailure);
        },
        function(errorCode, errmesg){
          easyrtc.showError(errorCode, errmesg);
        }  // failure callback
    );*/

}



//callback function, called upon new client connection or disconnection
function userLoggedInListener (roomName, occupants, isPrimary) {
    //update the global occupants list for this user.
    all_occupants_list = occupants;

    //as this callback method is also called on any user disconnection...
    //remove any 'zombie' easyrtc id from 'all_occupants_details' variable
    removeZombieClientsFromOccupantsDetails(occupants);

    //update the online/offline status as per the new list.
    //this update is important for someone leaves the connection.
    updateOnlineStatusOfClients(all_occupants_details);

    //spawn telepointers for the logged in users.
    spawnTelepointers(occupants);

    //inform my email, name along with easyrtc id, which is later used for different tracking
    informMyDetailsToAllOtherClients(occupants);

    //notifyAll('disconnected', "Hello");


    //FOR VIDEO STRM
  clearConnectList();
  var otherClientDiv = document.getElementById("otherClients");
  for(var easyrtcid in occupants) {
    var button = document.createElement("button");
    button.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      };
    }(easyrtcid);
    var label = document.createTextNode("Call " + getNameForAnEasyRTCid( easyrtc.idToName(easyrtcid) ) );
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }





}


//TMP:: FOR AUDIO CHK START
/*function disable(domId) {
  document.getElementById(domId).disabled = "disabled";
}


function enable(domId) {
  document.getElementById(domId).disabled = "";
}




function terminatePage() {
  easyrtc.disconnect();
}


function hangup() {
  easyrtc.hangupAll();
  disable("hangupButton");
}


function clearConnectList() {
  otherClientDiv = document.getElementById("otherClients");
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }

}




function audio_performCall(otherEasyrtcid) {
  easyrtc.hangupAll();



  easyrtc.enableVideo(false);
  easyrtc.enableVideoReceive(false);

  var acceptedCB = function(accepted, caller) {
    if( !accepted ) {
      easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(caller) + " was rejected");
      enable("audio_otherClients");
    }
  };
  var successCB = function() {
    enable("hangupButton");
  };
  var failureCB = function() {
    enable("otherClients");
  };
  easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
}







function disconnect() {
  document.getElementById("iam").innerHTML = "logged out";
  easyrtc.disconnect();
  console.log("disconnecting from server");
  enable("connectButton");
  // disable("disconnectButton");
  clearConnectList();
}


easyrtc.setStreamAcceptor( function(easyrtcid, stream) {
  var audio = document.getElementById("callerAudio");
  easyrtc.setVideoObjectSrc(audio,stream);
  enable("hangupButton");
});


easyrtc.setOnStreamClosed( function (easyrtcid) {
  easyrtc.setVideoObjectSrc(document.getElementById("callerAudio"), "");
  disable("hangupButton");
});


easyrtc.setAcceptChecker(function(easyrtcid, callback) {
  document.getElementById("acceptCallBox").style.display = "block";
  if( easyrtc.getConnectionCount() > 0 ) {
    document.getElementById("acceptCallLabel").textContent = "Drop current call and accept new from " + getNameForAnEasyRTCid( easyrtcid ) + " ?";
  }
  else {
    document.getElementById("acceptCallLabel").textContent = "Accept incoming call from " + getNameForAnEasyRTCid( easyrtcid ) + " ?";
  }
  var acceptTheCall = function(wasAccepted) {
    document.getElementById("acceptCallBox").style.display = "none";
    if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
      easyrtc.hangupAll();
    }
    callback(wasAccepted);
  };
  document.getElementById("callAcceptButton").onclick = function() {
    acceptTheCall(true);
  };
  document.getElementById("callRejectButton").onclick =function() {
    acceptTheCall(false);
  };
} );*/
//TMP:: FOR AUDIO CHK END












//TMP: FOR AUDIO+VIDEO STARTS

$("#applyVideoSetting").on('click', function(){
  easyrtc.enableAudio(document.getElementById("shareAudio").checked);
  easyrtc.enableVideo(document.getElementById("shareVideo").checked);
  easyrtc.enableDataChannels(true);
});


var haveSelfVideo = false;
function disable(domId) {
  document.getElementById(domId).disabled = "disabled";
}
function enable(domId) {
  document.getElementById(domId).disabled = "";
}
function addSinkButton(label, deviceId){
   let button = document.createElement("button");
   button.innerText = label?label:deviceId;
   button.onclick = function() {
    easyrtc.setAudioOutput( document.getElementById("callerVideo"), deviceId);
   }
   document.getElementById("audioSinkButtons").appendChild(button);
}
function hangup() {
  easyrtc.hangupAll();
  disable("hangupButton");
}
function clearConnectList() {
  var otherClientDiv = document.getElementById("otherClients");
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
}
function convertListToButtons (roomName, occupants, isPrimary) {
  clearConnectList();
  var otherClientDiv = document.getElementById("otherClients");
  for(var easyrtcid in occupants) {
    var button = document.createElement("button");
    button.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      };
    }(easyrtcid);
    var label = document.createTextNode("Call " + easyrtc.idToName(easyrtcid));
    button.appendChild(label);
    otherClientDiv.appendChild(button);
  }
}
function setUpMirror() {
  if( !haveSelfVideo) {
    var selfVideo = document.getElementById("selfVideo");
    easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
    selfVideo.muted = true;
    haveSelfVideo = true;
  }
}
function performCall(otherEasyrtcid) {
  easyrtc.hangupAll();
  var acceptedCB = function(accepted, easyrtcid) {
    if( !accepted ) {
      easyrtc.showError("CALL-REJECTEd", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
      enable("otherClients");
    }
  };
  var successCB = function() {
    if( easyrtc.getLocalStream()) {
      setUpMirror();
    }
    enable("hangupButton");
  };
  var failureCB = function() {
    enable("otherClients");
  };
//alert("Attempting to call...!");
  easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
  enable("hangupButton");
}
function loginSuccess(easyrtcid) {
  disable("connectButton");
  enable("disconnectButton");
  enable("otherClients");
  selfEasyrtcid = easyrtcid;
  document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
  easyrtc.showError("noerror", "logged in");
}
function loginFailure(errorCode, message) {
  easyrtc.showError(errorCode, message);
}
function disconnect() {
  easyrtc.disconnect();
  document.getElementById("iam").innerHTML = "logged out";
  enable("connectButton");
  disable("disconnectButton");
  easyrtc.clearMediaStream( document.getElementById("selfVideo"));
  easyrtc.setVideoObjectSrc(document.getElementById("selfVideo"),"");
  easyrtc.closeLocalMediaStream();
  easyrtc.setRoomOccupantListener( function(){});
  clearConnectList();
}
easyrtc.setStreamAcceptor( function(easyrtcid, stream) {
  setUpMirror();
  var video = document.getElementById("callerVideo");
  easyrtc.setVideoObjectSrc(video,stream);
  enable("hangupButton");
});
easyrtc.setOnStreamClosed( function (easyrtcid) {
  easyrtc.setVideoObjectSrc(document.getElementById("callerVideo"), "");
  disable("hangupButton");
});
var callerPending = null;
easyrtc.setCallCancelled( function(easyrtcid){
  if( easyrtcid === callerPending) {
    document.getElementById("acceptCallBox").style.display = "none";
    callerPending = false;
  }
});
easyrtc.setAcceptChecker(function(easyrtcid, callback) {
  document.getElementById("acceptCallBox").style.display = "block";
  callerPending = easyrtcid;
  if( easyrtc.getConnectionCount() > 0 ) {
    document.getElementById("acceptCallLabel").innerHTML = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
  }
  else {
    document.getElementById("acceptCallLabel").innerHTML = "Accept incoming call from " + easyrtc.idToName(easyrtcid) + " ?";
  }
  var acceptTheCall = function(wasAccepted) {
    document.getElementById("acceptCallBox").style.display = "none";
    if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
      easyrtc.hangupAll();
    }
    callback(wasAccepted);
    callerPending = null;
  };
  document.getElementById("callAcceptButton").onclick = function() {
    acceptTheCall(true);
  };
  document.getElementById("callRejectButton").onclick =function() {
    acceptTheCall(false);
  };
} );
//TMP: FOR AUDIO+VIDEO ENDS

















//removes any invalid ids (the users of whom have left/disconnect)
//from the server. the passed occupants is the updated list of easyrctid
//the occupants_details are updated (removed the invalids) accordingly
function removeZombieClientsFromOccupantsDetails(occupants){
    var temp_occupants_details = [];

    for(var i=0;i < all_occupants_details.length; i++){
        var aClient = all_occupants_details[i];

        var isValid = 0;

        for(aEasyrtcid in occupants){
            if(aEasyrtcid == aClient.easyrtcid){
                isValid = 1; //this client is still on the list and online (connected and valid)
                break;
            }
        }

        //add the valid client to the temporary updated list
        if(isValid ==1){
            temp_occupants_details.push(aClient);
        }

    }

    //finally assign the temp new occupants details as the updated occupants details.
    all_occupants_details = temp_occupants_details;


}





//inform all other clients about my details: name, email, easyrtcid
//these additional info along with easyrtcid (which is available in
//'all_occupants_list') are used for mapping (e.g. which easyrtcid
//is for which emails and so on)
function informMyDetailsToAllOtherClients(occupants){
    var myInfo = {'email': $("#user_email").text(), 'easyrtcid': selfEasyrtcid, 'name': $("#user_name").text()};

    //notify all other clients for email for corresponding easyrtcid
    notifyAll('inform_my_details_to_all_other_clients', myInfo);
}



//returns the corresponding name for a given email id
function getNameForAnEmail(clientEmail) {
  for (var i = 0; i < all_occupants_details.length; i++) {
    if (all_occupants_details[i].email == clientEmail) return all_occupants_details[i].name;
  }

  //own email id is not available in all_occupants_details...
  //so return own user_name in that case...
  if(clientEmail == user_email)return user_name;

  //the email not found...
  return "NONE";
}








//returns the corresponding name for a given easyRTCid
function getNameForAnEasyRTCid(easyrtcID) {
  for (var i = 0; i < all_occupants_details.length; i++) {
    if (all_occupants_details[i].easyrtcid == easyrtcID) return all_occupants_details[i].name;
  }

  //own email id is not available in all_occupants_details...
  //so return own user_name in that case...
  if(selfEasyrtcid == easyrtcID)return user_name;

  //the email not found...
  return "NONE";
}




//get easyrtcid for an email
function getEasyRtcidFromEmail(userEmail){
    //console.log('User Email ==>' + userEmail);
    for(var i=0; i<all_occupants_details.length; i++){
        //convert both to the same format for comparison
        if($.trim(convertEmailToID( all_occupants_details[i].email )) == $.trim(convertEmailToID(userEmail)))return all_occupants_details[i].easyrtcid;
        //console.log("->"+all_occupants_details[i].email + "<->" + all_occupants_details[i].easyrtcid);
    }

    if( $.trim(convertEmailToID(user_email)) == $.trim(convertEmailToID(userEmail)))return selfEasyrtcid;

    return 'NONE';
}





//spawn the telepointers for the passed occupants
function spawnTelepointers(occupants){

    //==================================================
    //spawn the telepointers for all the connected users.
    //==================================================
    var telepointer_spawn_point = document.getElementById('telepointer_spawn_point');
    //first remove any existing telepointer for a fresh start
    while (telepointer_spawn_point.hasChildNodes()) {
        telepointer_spawn_point.removeChild(telepointer_spawn_point.lastChild);
    }
    //and then create elements for occupants with corresponding easyrtcid
    for(var easyrtcid in occupants) {
            var ele = document.createElement("div");
            ele.setAttribute("id","telepointer_name_"+easyrtcid);

            ele.style.color = "#000";
            ele.style.backgroundColor =  "#fff";
            ele.style.boxShadow = "2px 2px 3px grey";
            //ele.setAttribute("class","inner");
            //ele.innerHTML="hi "+easyrtcid;
            telepointer_spawn_point.appendChild(ele);
    }
}












//update the telepointer for the other clients
//the 'content' should contain the required info for telepointer update
//along with other client easyrtcid; which is used for selecting the specific
//element from dom
function updateTelepointer(content){
    //telepointer was spawned according to the easyrtc id.
    //telepointer selected first and then updatee the css for rendering
    $('#telepointer_name_'+content.rtcid).css({position:'absolute',left:parseInt(content.left), top:parseInt(content.top)});
    if($('#telepointer_name_'+content.rtcid).text()=="")$('#telepointer_name_'+content.rtcid).html(content.user_name);

}








function sendStuffWS(otherEasyrtcid) {
    var text = document.getElementById('sendMessageText').value;
    if(text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
    addToConversation("Me", "message", text);
    document.getElementById('sendMessageText').value = "";
}







function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    console.log("My EasyRTCID: " + easyrtcid);
    //document.getElementById("iam").innerHTML = "I am " + easyrtcid;
}







function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


//========================================================
//===================== EASYRTC CODE ENDS ================
//========================================================




















//========================================================
//================== WORKFLOW CONTROL CODE STARTS ========
//========================================================


    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });


//==========================================================================
//============= NOISE REMOVAL STARTS =======================================
//==========================================================================

//source code in pre tag... toggle show/hide
$(document).on('click', ".code_show_hide", function () {//here
    $(this).siblings('.pre_highlighted_code').children(".highlighted_code").toggle(1000);
});

$(document).on('click', ".documentation_show_hide", function () {//here
    $(this).siblings('.documentation').toggle(300);
});

$(document).on('click', ".settings_show_hide" ,function () {//here
    $(this).siblings('.settings').toggle(300);
});

$(document).on('click', ".btn_edit_code" ,function () {//here
    $(this).siblings('.edit_code').toggle(1000);
});

$(document).on('change', ".setting_param" ,function () {//here
    //alert("you changed my value");
    //var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    //alert(prev_code);
    //$(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
    $(this).siblings(".setting_param").each(function () {
        //alert($(this).val());
        var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
        $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(this).val());
    });
    var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(this).val());

    //alert("Change Triggered...!!!");

    //get module id and param information for change in the remote clients
    //var myPar = $(this).closest(".module");
    //alert(myPar.attr('id'));
    //alert($(this).index("#" + myPar.attr('id') + "  .setting_param"));

    //inform of this change to all the other clients...
    if(isItMyFloor() == true){
        var myParent = $(this).closest(".module");
        var elementInfo = "#" + myParent.attr('id') + "  .setting_param";
        var paramIndex = $(this).index(elementInfo);
        var newParamValue = $(this).val();
        var changeInfo = {"elementInfo": elementInfo, "paramIndex": paramIndex, "newParamValue": newParamValue};
        notifyAll("moduleSettingsChanged", changeInfo);
    }

});



//FOR DAG UPDATE
//Module parent change...
$(document).on('change', ".setting_param_parent" ,function () {//here

    //this Module id
    var thisModuleID = $(this).closest(".module").attr('id'); //of format module_id_n
    var thisModuleIndex = thisModuleID.split('_')[2]; //n from the format module_id_n

    //THis module ID (for workflow tree)
    var thisModuleID = "Module_"+thisModuleIndex;//for workflow tree

    //New parent ID
    var newParentSelected = $(this).val(); // module_1='/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/Module_1.txt'
    var fileNameIndex = newParentSelected.lastIndexOf("/") + 1;
    var filename = newParentSelected.substr(fileNameIndex); // Module_1.txt'
    var newParentModuleID = filename.split('.')[0];  // Module_1


    //alert("This -> " + thisModuleID);
    //alert("Parent -> " + newParentModuleID);

    //update the workflow tree
    workflow.changeParent(thisModuleID, newParentModuleID, workflow.traverseDF);

     //redraw the workflow structure based on this update
     redrawWorkflowStructure();




    //alert(thisModuleID);


    //myPar.attr('id');
    //var parentIndex = $(this).index("#" + myPar.attr('id') + "  .setting_param_parent");

});
















$("#run_pipeline").click(function () {
    $("#pr_status").html("<span style='color:orange'>Running Pipeline...</span>");

    var sourceCode = ''
    $('textarea').each(
        function () {
            //alert($(this).val());
            sourceCode = sourceCode + "\n" +$(this).val();
        }
    );

    //encode the source code for any special characters like '+' , '/' etc
    sourceCode = encodeURIComponent(String(sourceCode));

    //alert(sourceCode);

    //send the code for running in pythoncom
    $.ajax({
        type: "POST",
        cache: false,
        url: "/pythoncom/",
        data: 'textarea_source_code=' + sourceCode,
        success: function (option) {

            //alert(option);
            get_workflow_outputs_list('test_workflow');
            $("#pr_status").html("<span style='color:green'>Pipeline Completed Running Successfully.</span>");

            alert('Pipeline Completed Running Successfully.');

        },
        error: function (xhr, status, error) {
            //alert(xhr.responseText);
            $("#pr_status").html("<span style='color:red'>Pipeline Running Failed!!!</span>");
        }

    });




});


$("#save_pipeline").click(function () {
    var pipelineName = $("#save_pipeline_name").val();



    //alert($("#img_processing_screen").html());
    //var workflowToSave = encodeURIComponent(String($("#img_processing_screen").clone()))

    //update the DOM
    $('#img_processing_screen input').each(function(){
	    $(this).attr('value', $(this).val());
    });


    $('#img_processing_screen select').each(function(){
	    $(this).find('option:selected').attr('selected', 'selected');
    });


    var workflowToSave = encodeURIComponent(String($("#img_processing_screen").html()))


/*
    var sourceCode = ''
    $('textarea').each(
        function () {
            //alert($(this).val());
            sourceCode = sourceCode + $(this).val();
        }
    );

    //encode the source code for any special characters like '+' , '/' etc
    sourceCode = encodeURIComponent(String(sourceCode));


    //alert(sourceCode);
*/
    $.ajax({
        type: "POST",
        cache: false,
        url: "/save_pipeline/",
        data: 'textarea_source_code=' + workflowToSave + '&pipelineName='+pipelineName,
        success: function (option) {
            alert('Workflow Saved Successfully.');

            $("#savedWorkflows").append("    <li><a href='#' class='aSavedWorkflow' id='" + pipelineName + ".wc'>" + pipelineName + ".wc</a></li>       ");

        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });




});

$(".design_pipeline_menu").click(function () {
    alert($(this).attr('title'));
});

$("#design_pipelines_menu_rgb2gray_id").click(function () {
    var module_name = ''
    var documentation = ''
    var moduleSourceCode_settings = ''
    var moduleSourceCode_main = ''
    var moduleSourceCode_html = ''

    $.ajax({
        type: "POST",
        cache: false,
        url: "/get_module_details",
        data: 'p_module_key=' + 'rgb2gray',
        success: function (option) {

            module_name = option.module_name
            documentation = option.documentation
            moduleSourceCode_settings = option.moduleSourceCode_settings
            moduleSourceCode_main = option.moduleSourceCode_main
            moduleSourceCode_html = option.moduleSourceCode_html
            user_role = option.user_role

            user_role_based_edit = ''
            if (user_role == 'image_researcher') {
                user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a> | <a style="font-size:12px;color:#000000;" href="#" > Contact Author </a>';
            }




            //append new module to the pipeline...
            $("#img_processing_screen").append(
                '<div style="background-color:#FFFFFF;width:100%">' +

            '<!-- Documentation -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
              ' ' + module_name + '<hr/>' +
               ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                '<div class="documentation" style="background-color:#888888;display:none;font-size:14px;">' + documentation +'</div>' +
            '</div>' +


            '<!-- Settings -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
             '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
             '   <div class="settings" style="background-color:#888888;display:none;font-size:14px;">' + moduleSourceCode_html + '</div>' +
            '</div>' +


            '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
            '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>'+ user_role_based_edit +

             '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
              '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
               '         <p style="color:#000000;">Main Implementation: </p>' +
                '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                '</div>' +

               ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
               ' ' +
            moduleSourceCode_main + '</code></pre>' +

           ' </div>' +

            '</div>'


        );//end of append


            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });//end of ajax





});



function getNextUniqueModuleID(){

    return unique_module_id;
}

function updateNextUniqueModuleID(){
    unique_module_id = unique_module_id + 1;
}



    //bio test starts
$("#design_pipelines_menu_biodatacleaning_id").click(function () {

    //allowed iff the user has the floor currently...
    if(isItMyFloor() == true){
        var newModuleID = getNextUniqueModuleID();
        var newModuleName = 'biodatacleaning';
        addModuleToPipeline(newModuleID, newModuleName);

        //prepare the next valid unique module id
        updateNextUniqueModuleID();

        //add the module to all remote clients as well...
        var moduleInfo = {"newModuleID": newModuleID, "newModuleName": newModuleName};
        notifyAll("remote_module_addition", moduleInfo);
    }

});



//adds the module to the pipeline. moduleID is unique throughout the whole pipeline
//moduleName is the name of the module like: rgb2gray, medianFilter and so on
function addModuleToPipeline(moduleID, moduleName){

        var module_name = ''
        var documentation = ''
        var moduleSourceCode_settings = ''
        var moduleSourceCode_main = ''
        var moduleSourceCode_html = ''

        $.ajax({
            type: "POST",
            cache: false,
            url: "/get_module_details",
            data: 'p_module_key=' + moduleName,
            success: function (option) {
                //alert("@ success");
                module_name = option.module_name
                documentation = option.documentation
                moduleSourceCode_settings = option.moduleSourceCode_settings
                moduleSourceCode_main = option.moduleSourceCode_main
                moduleSourceCode_html = option.moduleSourceCode_html
                user_role = option.user_role

                user_role_based_edit = ''
                if (user_role == 'image_researcher') {
                    user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a> | <a style="font-size:12px;color:#000000;" href="#" > Contact Author </a>';
                }




                //append new module to the pipeline...
                $("#img_processing_screen").append(
                    '<div style="background-color:#EEE;width:100%;display:none;" class="module" id="module_id_'+ moduleID +'">' +

                '<!-- Documentation -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                  ' ' + module_name +  ' (Module ' + moduleID + ')'+ '<hr/>' +
                   ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                    '<div class="documentation" style="background-color:#DDDDDD;display:none;font-size:14px;">' + documentation + '</div>' +
                '</div>' +


                '<!-- Settings -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                 '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
                 '   <div class="settings" style="background-color:#DDDDDD;display:none;font-size:14px;">' + moduleSourceCode_html +
                        '<input type="hidden" class="setting_param " size="45" id="module_id_'+ moduleID +'_output_destination" />'+
                    '</div>' +
                '</div>' +


                '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
                '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' + user_role_based_edit +

                 '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
                  '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
                   '         <p style="color:#000000;">Main Implementation: </p>' +
                    '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                    '</div>' +

                   ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
                   ' ' +
                moduleSourceCode_main + '</code></pre>' +

               ' </div>' +

                '</div>'


            );//end of append

            $("#module_id_"+ moduleID + "_output_destination").val("output_destination = '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/Module_" + moduleID + "'").trigger('change');




            //Update the DAG
            var newWorkflowModule = workflow.add("Module_"+moduleID, "Module_0", workflow.traverseDF);
            newWorkflowModule.nodeName = moduleName;
            redrawWorkflowStructure();






            if(isItMyFloor() == false)lockParamsSettings();

                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });


            },
            error: function (xhr, status, error) {
                alert(xhr.responseText);
            }

        });//end of ajax


}





//handling any pipeline module addition on click using
//class for generalisation
$(document).on("click", ".pipeline_modules" ,function(){
    //alert($(this).attr("id"));

    //allowed iff the user has the floor currently...
    if(isItMyFloor() == true){
        var newModuleID = getNextUniqueModuleID();
        var newModuleName = $(this).attr("id"); //'biodatacleaning';
        addModuleToPipeline(newModuleID, newModuleName);

        //prepare the next valid unique module id
        updateNextUniqueModuleID();

        //add the module to all remote clients as well...
        var moduleInfo = {"newModuleID": newModuleID, "newModuleName": newModuleName};
        notifyAll("remote_module_addition", moduleInfo);
    }

});






//Load saved workflow
$(document).on("click", ".aSavedWorkflow" ,function(){

    	var savedWorkflowName = $(this).attr("id");

    	$.ajax({
		type: "POST",
		cache: false,
		url: "/get_saved_workflow",
		data: "workflow_id="+savedWorkflowName,
		success: function (option) {
            $("#img_processing_screen").html(option.savedWorkflow)

            $("#img_processing_screen input").trigger('change');

		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}

    	});

});





$("#design_pipelines_menu_biocalc_id").click(function () {
    var module_name = ''
    var documentation = ''
    var moduleSourceCode_settings = ''
    var moduleSourceCode_main = ''
    var moduleSourceCode_html = ''

    $.ajax({
        type: "POST",
        cache: false,
        url: "/get_module_details",
        data: 'p_module_key=' + 'biocalc',
        success: function (option) {

            module_name = option.module_name
            documentation = option.documentation
            moduleSourceCode_settings = option.moduleSourceCode_settings
            moduleSourceCode_main = option.moduleSourceCode_main
            moduleSourceCode_html = option.moduleSourceCode_html
            user_role = option.user_role

            user_role_based_edit = ''
            if (user_role == 'image_researcher') {
                user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a>';
            }




            //append new module to the pipeline...
            $("#img_processing_screen").append(
                '<div style="background-color:#EEE;width:100%">' +

            '<!-- Documentation -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
              ' ' + module_name + '<hr/>' +
               ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                '<div class="documentation" style="background-color:#888888;display:none;font-size:14px;">' + documentation + '</div>' +
            '</div>' +


            '<!-- Settings -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
             '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
             '   <div class="settings" style="background-color:#888888;display:none;font-size:14px;">' + moduleSourceCode_html + '</div>' +
            '</div>' +


            '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
            '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' + user_role_based_edit +

             '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
              '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
               '         <p style="color:#000000;">Main Implementation: </p>' +
                '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                '</div>' +

               ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
               ' ' +
            moduleSourceCode_main + '</code></pre>' +

           ' </div>' +

            '</div>'


        );//end of append


            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });//end of ajax





});






    //bio test ends







//Signup
$('#signup_btn').click(function () {
    //alert("Looks like you want to create an account...");
    $.ajax({
        type: "POST",
        cache: false,
        url: "/p2irc_signup/",
        data: $("#signup_form").serialize(),
        success: function (option) {
            alert('Account Created Successfully...');
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});











//========================================================
//================== WORKFLOW CONTROL CODE ENDS ==========
//========================================================




















/*

Copyright (c) 2009 Anant Garg (anantgarg.com | inscripts.com)

This script may be used for non-commercial purposes only. For any
commercial purposes, please contact the author at
anant.garg@inscripts.com

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

var windowFocus = true;
var username;
var chatHeartbeatCount = 0;
var minChatHeartbeat = 1000;
var maxChatHeartbeat = 33000;
var chatHeartbeatTime = minChatHeartbeat;
var originalTitle;
var blinkOrder = 0;

var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();
var chatBoxes = new Array();

//$(document).ready(function(){
	originalTitle = document.title;
	//startChatSession();

	$([window, document]).blur(function(){
		windowFocus = false;
	}).focus(function(){
		windowFocus = true;
		document.title = originalTitle;
	});
//});

function restructureChatBoxes() {
	align = 0;
	for (x in chatBoxes) {
		chatboxtitle = chatBoxes[x];

		if ($("#chatbox_"+chatboxtitle).css('display') != 'none') {
			if (align == 0) {
				$("#chatbox_"+chatboxtitle).css('right', '20px');
			} else {
				width = (align)*(225+7)+20;
				$("#chatbox_"+chatboxtitle).css('right', width+'px');
			}
			align++;
		}
	}
}


//createChatBox('golamMostaeen', false);
function createChatBox(chatboxtitle,minimizeChatBox, displayTitle='User Name') {
	if ($("#chatbox_"+chatboxtitle).length > 0) {
		if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
			$("#chatbox_"+chatboxtitle).css('display','block');
			restructureChatBoxes();
		}
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
		return;
	}

	$(" <div />" ).attr("id","chatbox_"+chatboxtitle)
	.addClass("chatbox")
	.html('<div class="chatboxhead"><div class="chatboxtitle">'+displayTitle+'</div><div class="chatboxoptions"><a style="font-size: 9px;" href="javascript:void(0)" class="chatBoxCall" chatboxtitle="'+ chatboxtitle +'">Call  </a> <a href="javascript:void(0)" class="minimizeChatBox" chatboxtitle="'+chatboxtitle+'">-</a> <a href="javascript:void(0)" class="closeChatBox" chatboxtitle="'+chatboxtitle+'">X</a></div><br clear="all"/></div><div class="chatboxcontent"></div><div class="chatboxinput"><textarea class="chatboxtextarea" chatboxtitle="'+chatboxtitle+'"></textarea></div>')
	.appendTo($( "body" ));

	$("#chatbox_"+chatboxtitle).css('bottom', '0px');

	chatBoxeslength = 0;

	for (x in chatBoxes) {
		if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
			chatBoxeslength++;
		}
	}

	if (chatBoxeslength == 0) {
		$("#chatbox_"+chatboxtitle).css('right', '20px');
	} else {
		width = (chatBoxeslength)*(225+7)+20;
		$("#chatbox_"+chatboxtitle).css('right', width+'px');
	}

	chatBoxes.push(chatboxtitle);

/*
	if (minimizeChatBox == 1) {
		minimizedChatBoxes = new Array();

		if ($.cookie('chatbox_minimized')) {
			minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
		}
		minimize = 0;
		for (j=0;j<minimizedChatBoxes.length;j++) {
			if (minimizedChatBoxes[j] == chatboxtitle) {
				minimize = 1;
			}
		}

		if (minimize == 1) {
			$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
			$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
		}
	}
*/
	chatboxFocus[chatboxtitle] = false;

	$("#chatbox_"+chatboxtitle+" .chatboxtextarea").blur(function(){
		chatboxFocus[chatboxtitle] = false;
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").removeClass('chatboxtextareaselected');
	}).focus(function(){
		chatboxFocus[chatboxtitle] = true;
		newMessages[chatboxtitle] = false;
		$('#chatbox_'+chatboxtitle+' .chatboxhead').removeClass('chatboxblink');
		$("#chatbox_"+chatboxtitle+" .chatboxtextarea").addClass('chatboxtextareaselected');
	});

	$("#chatbox_"+chatboxtitle).click(function() {
		if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') != 'none') {
			$("#chatbox_"+chatboxtitle+" .chatboxtextarea").focus();
		}
	});

	$("#chatbox_"+chatboxtitle).show();
}


function chatHeartbeat(){

	var itemsfound = 0;

	if (windowFocus == false) {

		var blinkNumber = 0;
		var titleChanged = 0;
		for (x in newMessagesWin) {
			if (newMessagesWin[x] == true) {
				++blinkNumber;
				if (blinkNumber >= blinkOrder) {
					document.title = x+' says...';
					titleChanged = 1;
					break;
				}
			}
		}

		if (titleChanged == 0) {
			document.title = originalTitle;
			blinkOrder = 0;
		} else {
			++blinkOrder;
		}

	} else {
		for (x in newMessagesWin) {
			newMessagesWin[x] = false;
		}
	}

	for (x in newMessages) {
		if (newMessages[x] == true) {
			if (chatboxFocus[x] == false) {
				//FIXME: add toggle all or none policy, otherwise it looks funny
				$('#chatbox_'+x+' .chatboxhead').toggleClass('chatboxblink');
			}
		}
	}

	$.ajax({
	  url: "chat.php?action=chatheartbeat",
	  cache: false,
	  dataType: "json",
	  success: function(data) {

		$.each(data.items, function(i,item){
			if (item)	{ // fix strange ie bug

				chatboxtitle = item.f;

				if ($("#chatbox_"+chatboxtitle).length <= 0) {
					createChatBox(chatboxtitle);
				}
				if ($("#chatbox_"+chatboxtitle).css('display') == 'none') {
					$("#chatbox_"+chatboxtitle).css('display','block');
					restructureChatBoxes();
				}

				if (item.s == 1) {
					item.f = username;
				}

				if (item.s == 2) {
					$("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxinfo">'+item.m+'</span></div>');
				} else {
					newMessages[chatboxtitle] = true;
					newMessagesWin[chatboxtitle] = true;
					$("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+item.f+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+item.m+'</span></div>');
				}

				$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
				itemsfound += 1;
			}
		});

		chatHeartbeatCount++;

		if (itemsfound > 0) {
			chatHeartbeatTime = minChatHeartbeat;
			chatHeartbeatCount = 1;
		} else if (chatHeartbeatCount >= 10) {
			chatHeartbeatTime *= 2;
			chatHeartbeatCount = 1;
			if (chatHeartbeatTime > maxChatHeartbeat) {
				chatHeartbeatTime = maxChatHeartbeat;
			}
		}

		//setTimeout('chatHeartbeat();',chatHeartbeatTime);
	}});
}

function closeChatBox(chatboxtitle) {
	$('#chatbox_'+chatboxtitle).css('display','none');
	restructureChatBoxes();



}

function toggleChatBoxGrowth(chatboxtitle) {
	if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') == 'none') {

		$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','block');
		$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','block');
		$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
	} else {

		$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
		$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
	}

}



function addToChat(fromID, fromName, msg){
    $("#chatbox_" +fromID +" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+ fromName +':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+msg+'</span></div>');
}





function checkChatBoxInputKey(event,chatboxtextarea,chatboxtitle) {

	if(event.keyCode == 13 && event.shiftKey == 0)  {
		message = $(chatboxtextarea).val();
		message = message.replace(/^\s+|\s+$/g,"");

		$(chatboxtextarea).val('');
		$(chatboxtextarea).focus();
		$(chatboxtextarea).css('height','44px');
		if (message != '') {

				message = message.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
				$("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+user_name+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+message+'</span></div>');
				$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);



                sendP2pTextMsg(chatboxtitle, message);


		}
		chatHeartbeatTime = minChatHeartbeat;
		chatHeartbeatCount = 1;

		return false;
	}

	var adjustedHeight = chatboxtextarea.clientHeight;
	var maxHeight = 94;

	if (maxHeight > adjustedHeight) {
		adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
		if (maxHeight)
			adjustedHeight = Math.min(maxHeight, adjustedHeight);
		if (adjustedHeight > chatboxtextarea.clientHeight)
			$(chatboxtextarea).css('height',adjustedHeight+8 +'px');
	} else {
		$(chatboxtextarea).css('overflow','auto');
	}

}

function startChatSession(){
	$.ajax({
	  url: "chat.php?action=startchatsession",
	  cache: false,
	  dataType: "json",
	  success: function(data) {

		username = data.username;

		$.each(data.items, function(i,item){
			if (item)	{ // fix strange ie bug

				chatboxtitle = item.f;

				if ($("#chatbox_"+chatboxtitle).length <= 0) {
					createChatBox(chatboxtitle,1);
				}

				if (item.s == 1) {
					item.f = username;
				}

				if (item.s == 2) {
					$("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxinfo">'+item.m+'</span></div>');
				} else {
					$("#chatbox_"+chatboxtitle+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+item.f+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+item.m+'</span></div>');
				}
			}
		});

		for (i=0;i<chatBoxes.length;i++) {
			chatboxtitle = chatBoxes[i];
			$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
			setTimeout('$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);', 100); // yet another strange ie bug
		}

	//setTimeout('chatHeartbeat();',chatHeartbeatTime);

	}});
}

/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */





function chatWith(chatuser, displayTitle) {
	createChatBox(chatuser, 1, displayTitle);
	$("#chatbox_"+chatuser+" .chatboxtextarea").focus();
}


$(".userThumb").on('click', function(){
    chatWith($(this).attr('userEmail'), $(this).attr('userName'));
    //alert($(this).attr('userEmail'));
});

$(document).on('keydown', ".chatboxtextarea" ,function(event){//here
    checkChatBoxInputKey(event, this, $(this).attr('chatboxtitle'));
    //alert($(this).attr('chatboxtitle'));
});

$(document).on('click',".closeChatBox", function(){//here
    closeChatBox($(this).attr('chatboxtitle'));
});

$(document).on('click', ".minimizeChatBox" ,function(){//here
    toggleChatBoxGrowth($(this).attr('chatboxtitle'));
});

$(document).on('click',".chatBoxCall" ,function(){//here
    //alert("Call->" + $(this).attr('chatboxtitle') + "<-");
    //alert("EasyRTCid->"+getEasyRtcidFromEmail($.trim($(this).attr('chatboxtitle')))+"<-");
    performCall(getEasyRtcidFromEmail( $.trim($(this).attr('chatboxtitle')) ));
});













//======================================================
//= WORKFLOW Visualization AND Outputs STARTS ==========
//======================================================
function get_workflow_outputs_list(workflow_id){
	var thisWorkflowID = workflow_id;

	//get the ouput list via async call
    	$.ajax({
		type: "POST",
		cache: false,
		url: "/get_workflow_outputs_list/",
		data: "workflow_id="+thisWorkflowID,
		success: function (option) {
			$("#workflow_outputs").html("");
			for(var i=0;i<option['workflow_outputs_list'].length;i++){
				var k = i+1;
				//$("#workflow_outputs").html("");
				$("#workflow_outputs").append("<a href='/file_download?workflow_id=" + thisWorkflowID +"&file_id=" + option['workflow_outputs_list'][i]+"' class='a_workflow_output' id='"+option['workflow_outputs_list'][i] +"'>"  + option['workflow_outputs_list'][i] + "</a><br/>");
			}
	    		
		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}

    	});


}

get_workflow_outputs_list('test_workflow');




//AJAX file upload
$('#upload-file-btn').click(function() {
        var form_data = new FormData($('#upload-file')[0]);
        $.ajax({
            type: 'POST',
            url: '/uploadajax',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function(data) {
                console.log('Success!');
                alert("dataset upload success");
            },
        });
});



$('#add_tool_plugin').click(function(){
            var formdata = new FormData(); //FormData object
            //console.log($("#form_tool_plugin"));
            //console.log($("#id_tool_p_doc")[0].files[0].name);
            formdata.append('tool_name_inp', $("#id_tool_name_inp").val());
            formdata.append('tool_doc', $("#id_tool_plugin_doc")[0].files[0], $("#id_tool_plugin_doc")[0].files[0].name);
            formdata.append('tool_script', $("#id_tool_plugin_script")[0].files[0], $("#id_tool_plugin_script")[0].files[0].name);
            formdata.append('tool_setting', $("#id_tool_plugin_setting")[0].files[0], $("#id_tool_plugin_setting")[0].files[0].name);
            formdata.append('tool_setting_ui', $("#id_tool_plugin_ui")[0].files[0], $("#id_tool_plugin_ui")[0].files[0].name);


        //console.log(form_data);
        $.ajax({
            type: 'POST',
            url: '/uploader',
            data: formdata,
            contentType: false,
            cache: false,
            processData: false,
            async: false,
            success: function(data) {
                //console.log('Success!');
                $("#bio_tools").append('<li><a href="#" class="pipeline_modules" id="' + $("#id_tool_name_inp").val() +'"> '+ $("#id_tool_name_inp").val() +'</a></li>');
                alert("Tool Plugged-in Successfully.");
            },
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}
        });

});



/*
$(".a_workflow_output").live('click', function(){
	var output_id = $(this).attr('id');
	var thisWorkflowID = 'test_workflow';
	//alert(output_id);
	//let user download the selected file
    	$.ajax({
		type: "GET",
		cache: false,
		url: "/file_download/",
		data: "workflow_id="+thisWorkflowID+'&file_id='+output_id,
		success: function (option) {
	    		alert("Done");
		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}
    	});
});
*/




//======================================================
//= WORKFLOW Visualization AND Outputs ENDS ============
//======================================================







////////////////////////////////////////////////////////////////////////
/////////// TMPORARY: FOR USER STUDY //////////////////////////////////
//////////////////////////////////////////////////////////////////////


$("#test_pipeline").click(function () {

    	var savedWorkflowName = 'mySavedPipeline.gom';

    	$.ajax({
		type: "POST",
		cache: false,
		url: "/get_saved_workflow",
		data: "workflow_id="+savedWorkflowName,
		success: function (option) {
            $("#img_processing_screen").html(option.savedWorkflow)

            $("#img_processing_screen input").trigger('change');

		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}

    	});


});
















});


