var all_occupants_list = ""; //list of easyrtcid of all the logged in clients
var all_occupants_details = []; //list of logged in clients along with email, name and corresponding easyrtcid
var selfEasyrtcid = ""; //my own easyrtc id

//user info required for rtc
var user_name = "";
var user_email = "";



//IMPORTANT
//this id remain unique throughout the pipeline for a module
var unique_module_id = 1;

//all the node access requests are kept in the Q to serve as FIFO
var nodeAccessRequestsQueue = [];

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












//========================================================
//===================== COLLABORATION CODE STARTS ========
//========================================================

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



        //Collaborative white board
    var canvas = document.getElementById("mycanvas");
    var context = canvas.getContext('2d');

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;

    function addClick(x, y, dragging) {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
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


    function redraw() {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

      context.strokeStyle = "#df4b26";
      context.lineJoin = "round";
      context.lineWidth = 3;

      for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
          context.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
          context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();
        context.stroke();
      }
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

    $("#id_workflow_tree_view").click("on", function(){
        $("#tree-simple").toggle(750);
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
            break;
        case "disconnected":
            alert("Disconnected : " + content);
            break;
        case "chat_room_msg":
            addToChatRoomConversation(content);
            break;
        case "remote_module_addition":
            onWorkflowModuleAdditionRequest(content.whoAdded, content.newModuleID, content.newModuleName);
            break;
        case "node_access_request":
            //var requestInfo ={"nodeID":nodeID, "requestedBy":user_email};
            onNodeAccessRequest(content.requestedBy, content.nodeID);
            break;
        case "node_access_release":
            onNodeAccessRelease(content.nodeID, content.requestedBy);
            break;
        case "parentChanged":
            onModuleParentChange(content.moduleID, content.newParentID, content.parentIndex);
	    //show notification to all other clients based on setting.
            if(content.showNotification == true){
                alert("Incoming Datalink for "+content.moduleID + " changed to "+content.newParentID + " by other users.");
            }
            break;
        case "paramSettingChanged":
            //var changeInfo = {"moduleID": myPar.attr('id'), "newSettingValue":$(this).val(), "paramSettingIndex":paramSettingIndex};
            onParamSettingChange(content.moduleID, content.newSettingValue, content.paramSettingIndex);
            break;
        case "lockIndividualParamSetting":
            //lockInfo = {"moduleID": myPar.attr('id'), "paramSettingIndex":paramSettingIndex};
            lockOnlyIndividualParamSetting(content.moduleID, content.paramSettingIndex);
            break;
        case "unlockIndividualParamSetting":
            unlockOnlyIndividualParamSetting(content.moduleID, content.paramSettingIndex);
            break;

    }
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
}


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
    //document.getElementById("iam").innerHTML = "I am " + easyrtcid;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

//========================================================
//===================== EASYRTC CODE ENDS ================
//========================================================



















//========================================================
//============= WORKFLOW CONTROL CODE STARTS =============
//========================================================

  //tree implementation starts

  //node construct
  function Node(data) {
    this.data = data;
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
        "HTMLclass": nodeClass,
        "text" : {
          "name": "A Module",
          "node_id": all_nodes[i].data
        }
      }
    }else{
      aNode = {
        "HTMLclass": nodeClass,
        "text" : {
          //"name": "A Module",
          "node_id": all_nodes[i].data
        }
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
  var workflow = new Tree("workflow");



//source code in pre tag... toggle show/hides
$(".code_show_hide").live('click', function () {
    $(this).siblings('.pre_highlighted_code').children(".highlighted_code").toggle(1000);
});

$(".documentation_show_hide").live('click', function () {
    $(this).siblings('.documentation').toggle(300);
});

$(".settings_show_hide").live('click', function () {
    $(this).siblings('.settings').toggle(300);
});

$(".btn_edit_code").live('click',function () {
    $(this).siblings('.edit_code').toggle(1000);
});



var previousVal;
$(".setting_param_parent").live("focus", function(){
  	//console.log($(this).val());
    //alert("focused...");
  	//storing previous value to switch back to it in case user does not have permission for the
  	//specified change.
    previousVal = $(this).val();
}).live('change',function () {
    //alert("you changed my value");
    //var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    //alert(prev_code);
    //$(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
    $(this).siblings(".setting_param").each(function () {
        //alert($(this).val());
        var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
        $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    });
    var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());



    //get module id and param information for change in the remote clients
    var myPar = $(this).closest(".module");
    //myPar.attr('id');
    var parentIndex = $(this).index("#" + myPar.attr('id') + "  .setting_param_parent");

    //alert(parentIndex);
    //alert("parent changed...");

    //inform of this change to all the other clients...

    var newParent = workflow.getNode($(this).val(), workflow.traverseDF);

    if(newParent.isLocked == false){
        $(this).val(previousVal);
        alert("No Access to the Specified Module. Please Request for its Access First and Try ...");
    }else if(newParent.isLocked==true && newParent.currentOwner != user_email){
        $(this).val(previousVal);
        alert("The specified module is NOT Accessable currently. Locked by " + newParent.currentOwner);
    }else{
        //workflow.changeParent(myPar.attr('id'), $(this).val(), workflow.traverseDF);
        //redrawWorkflowStructure();
        onModuleParentChange(myPar.attr('id'), $(this).val());


       //get the user choice on notification showing on this datalink change...
      	var showNotification = false;
        if($("#" + myPar.attr('id') + " .action_for_datalink_change").val() == "ntifyAll")showNotification = true;
        else showNotification = false;


        var changeInfo = {"moduleID": myPar.attr('id'), "newParentID":$(this).val(), 					"parentIndex":parentIndex,"showNotification":showNotification};
         notifyAll("parentChanged", changeInfo);
    }




});






//param settings change
$(".setting_param").live("focus", function(){
    var myPar = $(this).closest(".module");
    var paramSettingIndex = $(this).index("#" + myPar.attr('id') + "  .setting_param");
    var lockInfo = {"moduleID": myPar.attr('id'), "paramSettingIndex":paramSettingIndex};

    notifyAll("lockIndividualParamSetting", lockInfo);

    previousVal = $(this).val();
}).live('change',function () {
    //alert("you changed my value");
    //var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    //alert(prev_code);
    //$(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
    $(this).siblings(".setting_param").each(function () {
        //alert($(this).val());
        var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
        $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    });
    var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());



    //get module id and param information for change in the remote clients
    var myPar = $(this).closest(".module");
    //myPar.attr('id');
    var paramSettingIndex = $(this).index("#" + myPar.attr('id') + "  .setting_param");

    var changeInfo = {"moduleID": myPar.attr('id'), "newSettingValue":$(this).val(), "paramSettingIndex":paramSettingIndex};
    notifyAll("paramSettingChanged", changeInfo);


}).live("blur", function(){
    var myPar = $(this).closest(".module");
    var paramSettingIndex = $(this).index("#" + myPar.attr('id') + "  .setting_param");
    var unlockInfo = {"moduleID": myPar.attr('id'), "paramSettingIndex":paramSettingIndex};

    notifyAll("unlockIndividualParamSetting", unlockInfo);

});




function lockOnlyIndividualParamSetting(moduleID, paramSettingIndex){
    $("#"+moduleID+" .setting_param").eq(parseInt(paramSettingIndex)).prop('disabled', true);
}

function unlockOnlyIndividualParamSetting(moduleID, paramSettingIndex){
    $("#"+moduleID+" .setting_param").eq(parseInt(paramSettingIndex)).prop('disabled', false);
}



function onParamSettingChange(moduleID, newSettingValue, paramSettingIndex){
    $("#"+moduleID+" .setting_param").eq(parseInt(paramSettingIndex)).val(newSettingValue);
}






function onModuleParentChange(moduleID, newParentID, parentIndex){
        //change the view on this client...
        $("#"+moduleID+" .setting_param_parent").eq(parseInt(parentIndex)).val(newParentID);

        //change the object strcuture
        workflow.changeParent(moduleID, newParentID, workflow.traverseDF);

        //redraw the workflow structure based on this update
        redrawWorkflowStructure();
}


//lock all the param settings for the provided moduleID
function lockParamsSettings(moduleToLock){
    //select all the param settings for the module descendants...
    $("#"+moduleToLock+" .setting_param").prop("disabled", true);
    //alert("disabled");
}


//unlock the param settings of the provided module id
function unlockParamsSettings(moduleToUnlock){
    //select all the param settings for the module descendants...
    $("#"+moduleToUnlock+" .setting_param").prop("disabled", false);
}



//change the request btn state for the use of the client
function changeRequestBtnState(moduleID, newText, isDisabled, isVisible){
    $("#"+moduleID+" .node_floor_req").text(newText);
    $("#"+moduleID+" .node_floor_req").prop('disabled', isDisabled);

    if(isVisible == true)$("#"+moduleID+" .node_floor_req").show();
    else $("#"+moduleID+" .node_floor_req").hide();
}


//this node and its descendants has been locked by other client
//so lock these nodes for this client and also change request btn state for later request by this client
function updateView_lockThisNodeAndDescendants(parentNodeData){
    var theNode = workflow.getNode(parentNodeData, workflow.traverseDF);
    workflow.traverseDF_FromNode(theNode, function(node){
          lockParamsSettings(node.data);

          //change node access btn... so he can request the access for the node later
          changeRequestBtnState(node.data, "Request Node Access", false, true);
    });
}

//This client has got the access for the node and its descendants
//so unlock the nodes.... and change the request btn state as well
function updateView_unlockThisNodeAndDescendants(parentNodeData){
    var theNode = workflow.getNode(parentNodeData, workflow.traverseDF);
    workflow.traverseDF_FromNode(theNode, function(node){
          unlockParamsSettings(node.data);

          //change node access btn...
          //this client is currently using these nodes... so change state for release node Access
          //hide it for all the children nodes
          changeRequestBtnState(node.data, "Release Node Access", true, false);
    });

    //only for the parent show/able the release node access btn
    changeRequestBtnState(parentNodeData, "Release Node Access", false, true);

}

$(".action_for_datalink_change").live("change", function() {

    var parentModuleID = $(this).closest(".module").attr('id');
    var reqBtn = $("#"+parentModuleID+ " .reqSubworkflowLock");
    reqBtn.hide();
    if($(this).val() == "reqSubworkflowLock"){
    		reqBtn.show();
    }
});


//adds the module to the pipeline. moduleID is unique throughout the whole pipeline
//moduleName is the name of the module like: rgb2gray, medianFilter and so on
function addModuleToPipeline(whoAdded, moduleID, moduleName){

        var module_name = ''
        var documentation = ''
        var moduleSourceCode_settings = ''
        var moduleSourceCode_main = ''
        var moduleSourceCode_html = ''

        var nodeAccessText;
        if(whoAdded == user_email)nodeAccessText = "Release Node Access";
        else nodeAccessText = "Request Node Access";

        $.ajax({
            type: "POST",
            cache: false,
            url: "/get_module_details",
            data: 'p_module_key=' + moduleName,
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


                //'<button class="node_floor_req" style="float:right;margin:5px;font-size:13px;">'+ nodeAccessText +'</button>'+

                //append new module to the pipeline...
                $("#img_processing_screen").append(
                    '<div style="background-color:#EEE;width:100%" class="module" id="module_id_'+ moduleID +'">' +

                '<!-- Documentation -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                  ' ' + module_name + ' (Module ' + moduleID + ')'+


                    '<select class="action_for_datalink_change" style="float:right;font-size:14px;margin-top:3px;">'+
                    '    <option value="noAction">None</option>'+
                    '   <option value="ntifyAll">Notify Others on Change</option>'+
                    '    <option value="reqSubworkflowLock">Request Subworkflow Locking</option>'+
                    '</select>'+
                    '<button class="reqSubworkflowLock" style="float:right;margin-right:2px;display:none;font-size:14px;margin-top:3px;">'+
                    '    Request Subworkflow Locking'+
                    '</button> '+



                  '<hr/>' +
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

            //if I did not added this module... lock the param settings...
            /*if(whoAdded != user_email){
                var modID = "module_id_"+moduleID;
                lockParamsSettings(modID);
            }*/

                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });


            },
            error: function (xhr, status, error) {
                alert(xhr.responseText);
            }

        });//end of ajax


}


function getNextUniqueModuleID(){

    return unique_module_id;
}

function updateNextUniqueModuleID(){

    unique_module_id = unique_module_id + 1;
}

//removes a passed request from the waiting queue
//called when someone gets access from the queue
function removeRequestFromQueue(requestInfo){
    for(var i=0;i<nodeAccessRequestsQueue.length; i++){
        if(nodeAccessRequestsQueue[i].nodeID == requestInfo.nodeID && nodeAccessRequestsQueue[i].requestedBy == requestInfo.requestedBy){
            nodeAccessRequestsQueue.splice(i,1);
        }
    }
}


//informs if a request is already in the queue
function isTheRequestAlreadyInQueue(requestInfo){
    for(var i=0;i<nodeAccessRequestsQueue.length; i++){
        if(nodeAccessRequestsQueue[i].nodeID == requestInfo.nodeID && nodeAccessRequestsQueue[i].requestedBy == requestInfo.requestedBy){
            return true;
        }
    }

    return false;
}



//iterate over the node access requests
//and dispatch any node request if possible.
function dispatchNodeRequests(){
    for(var i=0;i<nodeAccessRequestsQueue.length; i++){
        var requestInfo = nodeAccessRequestsQueue[i];

        if(workflow.isNodeFloorAvailable(requestInfo.nodeID, workflow.traverseDF)==true){
            //the node access is now attainable... request to self
            onNodeAccessRequest(requestInfo.requestedBy, requestInfo.nodeID);

            //also inform all other clients
            var reqInfo ={"nodeID":requestInfo.nodeID, "requestedBy":requestInfo.requestedBy};
            notifyAll("node_access_request", reqInfo);
        }
    }
}

//some of the nodes were released
function onNodeAccessRelease(nodeID, releasedBy){
    var theNode = workflow.getNode(nodeID, workflow.traverseDF);
    if(theNode){
        if(theNode.parent.isLocked == true)throw new Error('Could not Release Child Node. Must release the parent node first.!');
        //unlock the node and its descendants....
        workflow.unlockThisNodeAndDescendants(theNode.data, workflow.traverseDF);

        //update the view... lock its view
        updateView_lockThisNodeAndDescendants(nodeID);

        //update the workflow structure view
        redrawWorkflowStructure();

        //the nodes released successfully.
        return true;

    }else{
        throw new Error('Node does not exist to Release!!!');
    }

    //update the workflow structure view
    redrawWorkflowStructure();

    return false;
}


//someone requested access to a node
function onNodeAccessRequest(requestedBy, nodeID){

    //if the requested node floor is available, give access to the requester
    if(workflow.isNodeFloorAvailable(nodeID, workflow.traverseDF) == true){
        //lock this and all its descendants node for the requested client
        workflow.lockThisNodeAndDescendants(requestedBy, nodeID, workflow.traverseDF);

        //alert("onNodeAccessRequest: " + requestedBy);
        //if this client was the requester, unlock parent and disencedants requested nodes
        if(requestedBy == user_email){
            updateView_unlockThisNodeAndDescendants(nodeID);//unlock for this client
        }else{
            updateView_lockThisNodeAndDescendants(nodeID);//lock this node and its descendants for this client.
        }


        //in case the request was waiting the queue... remove it
        var requestInfo ={"nodeID":nodeID, "requestedBy":requestedBy};
        removeRequestFromQueue(requestInfo);

    }
    //node is not currently accessable (locked by someone else), add the request to the queue
    else{
        var requestInfo ={"nodeID":nodeID, "requestedBy":requestedBy};
        //push the request to the queue if does not already exist in the queue
        if(isTheRequestAlreadyInQueue(requestInfo) == false){
            nodeAccessRequestsQueue.push(requestInfo);
        }

    }

    //update the workflow structure view
    redrawWorkflowStructure();
}



$(".node_floor_req").live("click", function(){
    var myPar = $(this).closest(".module");
    var node_id = myPar.attr('id');

    if($(this).text() == "Request Node Access"){
        $(this).prop('disabled', true);
        $(this).text("Requested");


        //update the self state
        onNodeAccessRequest(user_email, node_id);



        //inform all other clients of this node access
        var requestInfo ={"nodeID":node_id, "requestedBy":user_email};
        notifyAll("node_access_request", requestInfo);



    }
    else if($(this).text() == "Release Node Access"){
        if(onNodeAccessRelease(node_id, user_email)==true){
            //inform all other clients of this node release
            var requestInfo ={"nodeID":node_id, "requestedBy":user_email};
            notifyAll("node_access_release", requestInfo);

            //on this event change... try dispatching eligible requests
            dispatchNodeRequests();

        }else{
            alert("Could not Release Child Node Access. Please remove the parent node access First!");
        }


    }else{
        throw new Error("Error Requesting Node Access!");
    }




});


//this function is invoked on new module addition request
function onWorkflowModuleAdditionRequest(whoAdded, moduleID, moduleName){

    if(getNextUniqueModuleID() != moduleID){
        throw new Error('Synchronization Problem. Module IDs are not consistent over the network !!!');
    }else{
        //if synchronization is ok... add this node to the workflow
        addModuleToPipeline(whoAdded,moduleID, moduleName);

        //add the node to the workflow tree, default parent is 'workflow'
        var addedNode = workflow.add("module_id_"+moduleID, "workflow", workflow.traverseDF);
        //by default the newly added node/module is locked by its creater (unless he releases it)
        lockNode(addedNode, whoAdded);


        //prepare the next valid unique module id
        updateNextUniqueModuleID();

        //finally redraw the workflow structure (tree view)
        redrawWorkflowStructure();
    }
}




    //bio test starts
$("#design_pipelines_menu_biodatacleaning_id").click(function () {

        var newModuleID = getNextUniqueModuleID();
        var newModuleName = 'biodatacleaning';

        //add the module to self...
        onWorkflowModuleAdditionRequest(user_email, newModuleID, newModuleName);


        //add the module to all remote clients as well...
        var moduleInfo = {"whoAdded":user_email,"newModuleID": newModuleID, "newModuleName": newModuleName};
        notifyAll("remote_module_addition", moduleInfo);


});


$("#design_pipelines_menu_biocalc_id").click(function () {

       //alert("Bio Calc..."); 

});






//========================================================
//============= WORKFLOW CONTROL CODE ENDS ===============
//========================================================





















});
