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


//alert("Doc Loaded");


//TODO: NEED TO MAKE IT RELATIVE
var WORKFLOW_OUTPUTS_PATH = '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/';
//TODO: GET IT FROM USER (WORKFLOW NAME FIELD)
var THIS_WORKFLOW_NAME = 'test_workflow';



























































//========================================================
//================ ALL INITIALIZATION CODES STARTS =======
//========================================================

    //connect and login to the easyrtc node server.
    connect();


    //get the user required information from the DOM
    user_name = $("#user_name").text();
    user_email = $("#user_email").text();


    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::JOINED");


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
        case "remote_module_addition":
            onWorkflowModuleAdditionRequest(content.whoAdded, content.newModuleID, content.newModuleName);
            break;
        case "node_access_request":
            //var requestInfo ={"nodeID":nodeID, "requestedBy":user_email};
            onNodeAccessRequest(content.requestedBy, content.nodeID);
            break;
        case "node_access_release":
            onNodeAccessRelease(content.nodeID, content.requestedBy)
            break;
        case "parentChanged":
            onModuleParentChange(content.moduleID, content.newParentID, content.parentIndex);
            break;
        case "moduleSettingsChanged":
            onModuleSettingsChanged(content);
            break;
        case "workflow_obj_new_link_drawn":
            addNewLinkToWorkflowObject(content);
            break;
        case "workflow_obj_selection_moved":
            workflowObjSelectionMoved(content);
            break;
        case "workflow_obj_selection_node_delete":
            workflowObjRemoveNode(content);
            break;
        case "workflow_obj_selection_link_delete":
            workflowObjRemoveLink(content);
            break;

    }
}



function onModuleSettingsChanged(changeInfo){
    if(changeInfo.isResourceDiscoveryField==true){
        discoverResources($(changeInfo.elementInfo).eq(changeInfo.paramIndex), $(changeInfo.elementInfo).eq(changeInfo.paramIndex).attr('referenceVariable'), THIS_WORKFLOW_NAME);

        //On any pending AJAX Request Success...
        $(document).ajaxSuccess(function() {
            $(changeInfo.elementInfo).eq(changeInfo.paramIndex).val(changeInfo.newParamValue).change();

  /*
            //changed the corresponding source (it was previously on change triggering, modified to reduce ajax call)
            $(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
            $(changeInfo.elementInfo).eq(changeInfo.paramIndex).siblings(".setting_param").each(function () {
                //alert($(this).val());
                var prev_code = $(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
                $(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(changeInfo.elementInfo).eq(changeInfo.paramIndex).val());
            });
            var prev_code = $(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
            $(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(changeInfo.elementInfo).eq(changeInfo.paramIndex).val());
*/
            //alert($(changeInfo.elementInfo).eq(changeInfo.paramIndex).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val());


            //alert("Ajax Success...");
        });

    }else{ //no dynamic resource discovery in this field

        //simply change the attribute
        $(changeInfo.elementInfo).eq(changeInfo.paramIndex).val(changeInfo.newParamValue).change();
    }



    //alert("Remote Module Setting Changed !!! + New Val::" + changeInfo.newParamValue);
    //$("#module_id_1 .setting_param").eq(changeInfo.paramIndex).val("test");
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
    //document.getElementById("iam").innerHTML = "I am " + easyrtcid;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

//========================================================
//===================== EASYRTC CODE ENDS ================
//========================================================



















//========================================================
//================ GO CODES STARTS =======================
//========================================================
    //$('#myDiagramDiv').css('height', $(window).height());
    /*$(window).resize(function(){
        $('#myDiagramDiv').css('height', $(window).height());
    });*/

    myDiagram='';
    //function init() {

    var $$ = go.GraphObject.make;

    myDiagram =
      $$(go.Diagram, "myDiagramDiv",
        {
          initialContentAlignment: go.Spot.Center,
          initialAutoScale: go.Diagram.UniformToFill,

          "undoManager.isEnabled": true
        }
      );
 	myDiagram.grid.visible = true;
    // when the document is modified, add a "*" to the title and enable the "Save" button
    /*myDiagram.addDiagramListener("Modified", function(e) {
      var button = document.getElementById("SaveButton");
      if (button) button.disabled = !myDiagram.isModified;
      var idx = document.title.indexOf("*");
      if (myDiagram.isModified) {
        if (idx < 0) document.title += "*";
      } else {
        if (idx >= 0) document.title = document.title.substr(0, idx);
      }
    });*/


  // validate if the linking modules have the same (compatible) data type
  function validateSameDataTypeOfModulesAndNodeAccessibility(fromnode, fromport, tonode, toport) {
    //portID => port_identifier(portDataType)
    //var portOneDataType = fromport.portId.split('(')[fromport.portId.split('(').length - 1]; // portDataType)
    //portOneDataType = portOneDataType.split(')')[0]; // portDataType

    //var portTwoDataType = toport.portId.split('(')[toport.portId.split('(').length - 1]; // portDataType)
    //portTwoDataType = portTwoDataType.split(')')[0]; // portDataType

    var portOneDataType = fromport.portId.split('.')[fromport.portId.split('.').length - 1];
    var portTwoDataType = toport.portId.split('.')[toport.portId.split('.').length - 1];


    //if(portOneDataType == portTwoDataType)return true; //the linking datatype is same, so allow

    //alert("From Node: => " + fromnode.data.key);
    var fromNode = myDiagram.findNodeForKey(fromnode.data.key);
    var toNode = myDiagram.findNodeForKey(tonode.data.key);

    //(fromNode.data.currentOwner == toNode.data.currentOwner) &&

    //check if this user has the access to both connecting nodes and also matches the datatypes.
    if( (fromNode.data.currentOwner == toNode.data.currentOwner) && fromNode.data.currentOwner==user_email  && (portOneDataType == portTwoDataType) )return true;

    return false;

  }







  // validate if the linking modules have the same (compatible) data type
  myDiagram.toolManager.linkingTool.linkValidation = validateSameDataTypeOfModulesAndNodeAccessibility;



    function makePort(portDataType, portIdentifier, leftside) {
      var port = $$(go.Shape, "Rectangle",
                   {
                     fill: "#FF5733", stroke: null,
                     desiredSize: new go.Size(8, 8),
                     //portId: portDataType,  // declare this object to be a "port"
                     toMaxLinks: 1,  // don't allow more than one link into a port
                     cursor: "pointer"  // show a different cursor to indicate potential link point
                   });

      var lab = $$(go.TextBlock, portIdentifier + ' ('+ portDataType +') ',  // the name of the port
                  { font: "8pt sans-serif", stroke: "black", maxSize: new go.Size(130, 40),margin: 0 });

      var panel =$$(go.Panel, "Horizontal",
                    { margin: new go.Margin(2, 0) });

      // set up the port/panel based on which side of the node it will be on
      if (leftside) {
        port.toSpot = go.Spot.Left;
        port.toLinkable = true;
        port.portId = portIdentifier + '.'+ portDataType;
        port.fill = 'orange';
        lab.margin = new go.Margin(1, 0, 0, 1);
        panel.alignment = go.Spot.TopLeft;
        panel.add(port);
        panel.add(lab);
      } else {
        port.fromSpot = go.Spot.Right;
        port.fromLinkable = true;
        port.portId = portIdentifier+ '.'+ portDataType;
        lab.margin = new go.Margin(1, 1, 0, 0);
        panel.alignment = go.Spot.TopRight;
        panel.add(lab);
        panel.add(port);
      }
      return panel;
    }
        function makeTemplate(typename, icon, background, inports, outports) {
            var node = $$(go.Node, "Spot", {
                contextMenu:     // define a context menu for each node
              $$(go.Adornment, "Vertical",  // that has one button
                $$("ContextMenuButton",
                  $$(go.TextBlock, "Lock This Sub-workflow"),
                  { click: lockSubWorkflow }),
                $$("ContextMenuButton",
                  $$(go.TextBlock, "Unlock This Sub-workflow"),
                  { click: unlockSubWorkflow }),
                $$("ContextMenuButton",
                  $$(go.TextBlock, "Lock Info"),
                  { click: getThisLockInfo })
                // more ContextMenuButtons would go here
              )  // end Adornment
            , copyable:false}, new go.Binding("movable", "allowNodeMovability"), new go.Binding("deletable", "allowNodeDeletion"),
          $$(go.Panel, "Auto",
            { width: 290, height: 130},
            $$(go.Shape, "RoundedRectangle",
              {
                fill: background, stroke: "black", strokeWidth: 2,
                spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
              }, new go.Binding("fill", "lockStatus")),
            $$(go.Panel, "Table",
              $$(go.TextBlock,
                {
                  row: 0,
                  margin: 3,
                  maxSize: new go.Size(150, 40),
                  stroke: "black",
                  font: "bold 11pt sans-serif"
                },
                new go.Binding("text", "name").makeTwoWay()),
              $$(go.Picture, icon,
                { row: 1, width: 55, height: 55 }),
                $$(go.TextBlock,
                {
                  row: 2,
                  margin: 3,
                  maxSize: new go.Size(150, NaN),
                  stroke: "black",
                  font: "bold 8pt sans-serif"
                },
                new go.Binding("text", "module_id").makeTwoWay())
            ),
              $$(go.Shape, "Circle",
                { row: 3, fill: "white", strokeWidth: 0, name: "jobStatus", width: 13, height: 13 })
          ),
          $$(go.Panel, "Vertical",
            {
              alignment: go.Spot.Left,
              alignmentFocus: new go.Spot(0, 0.5, -8, 0)
            },
            inports),
          $$(go.Panel, "Vertical",
            {
              alignment: go.Spot.Right,
              alignmentFocus: new go.Spot(1, 0.5, 8, 0)
            },
            outports)
        );
      myDiagram.nodeTemplateMap.add(typename, node);
    }

    makeTemplate("Project","images/55x55.png", "white",
                 [makePort("xml","Potential Clones", true)],
                 [makePort("xml", "XML ",false)]);



    myDiagram.linkTemplate =
      $$(go.Link,
        {
          routing: go.Link.AvoidsNodes, corner: 10,
          relinkableFrom: false, relinkableTo: false, curve: go.Link.JumpGap
        }, new go.Binding("deletable", "allowLinkDeletion"),
        $$(go.Shape, { stroke: "#00bfff", name:"datalink", strokeWidth: 2.5 }),
        $$(go.Shape, { stroke: "#00bfff", name:"datalinkArrow", fill: "#00bfff",  toArrow: "Standard" })
      );

    load();


  // Show the diagram's model in JSON format that the user may edit
  function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
  }
  function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
  }

  function addNewLinkToWorkflowObject(newLinkInformation){
    myDiagram.startTransaction("add link");
        var newlink = { from: newLinkInformation.from, frompid: newLinkInformation.frompid, to: newLinkInformation.to, topid:newLinkInformation.topid};
        myDiagram.model.addLinkData(newlink);
    myDiagram.commitTransaction("add link");

    //on remote linking, disable the link deletion permission
    myDiagram.startTransaction("lock_unlock_link");
        var startNode = myDiagram.findNodeForKey(newLinkInformation.from);//the start node for this link
        if(startNode.data.currentOwner != user_email){ //confirming this node is not owned by this user
            var link_it = startNode.findLinksOutOf();
            while (link_it.next()) {//for double check remove permission for the outgoing links
                var link = link_it.value;
                myDiagram.model.setDataProperty(link.data, "allowLinkDeletion", false);
            }
        }
    myDiagram.startTransaction("lock_unlock_link");


  }


   function workflowObjSelectionMoved(selectionNewLocationInfo){
     myDiagram.startTransaction('selection moved');
     var movedNode = myDiagram.findNodeForKey(selectionNewLocationInfo.key);
     movedNode.location = new go.Point(selectionNewLocationInfo.x, selectionNewLocationInfo.y);
     myDiagram.commitTransaction('selection moved');
   }


   function workflowObjRemoveNode(nodeInfoForRemoval){
     myDiagram.startTransaction('node removed');
     var nodeTargetedForDeletion = myDiagram.findNodeForKey(nodeInfoForRemoval.key);
     myDiagram.remove(nodeTargetedForDeletion);
     myDiagram.commitTransaction('node removed');
   }


    function workflowObjRemoveLink(linkInfoForRemoval){
         var linksTargetedForDeletion = myDiagram.findLinksByExample({ 'from': linkInfoForRemoval.from, 'frompid': linkInfoForRemoval.frompid, 'to': linkInfoForRemoval.to, 'topid':linkInfoForRemoval.topid});

        for (var iter = linksTargetedForDeletion; iter.next(); ) {
            aLink = iter.value;
            myDiagram.startTransaction('link removed');
            myDiagram.remove(aLink);
            myDiagram.commitTransaction('link removed');
        }

    }




  //init();
  // create the Overview and initialize it to show the main Diagram
  var myOverview =
    $$(go.Overview, "myDiagramOverview",
      { observed: myDiagram });
    myOverview.grid.visible = false;


  //turn off undo/redo
  myDiagram.model.undoManager.isEnabled = false;
  //make the diagram read only
  //myDiagram.isReadOnly = true;

  myDiagram.contextMenu =
    $$(go.Adornment, "Vertical",
      // no binding, always visible button:
      $$("ContextMenuButton",
        $$(go.TextBlock, "Toggle Grid View"),
        { click: function(e, obj) {
            myDiagram.grid.visible = !myDiagram.grid.visible;
        } })
    );






//===========================>>>>>>>>>>>>>>>>>>>>>>>>
// Diagram Events Start
//===========================>>>>>>>>>>>>>>>>>>>>>>>>

  //show the corresponding module details on any module click
  //TODO: UNCOMMENT WHEN LOCK DEBUGGING IS DONE
  /*myDiagram.addDiagramListener("ObjectSingleClicked",
      function(e) {
        var part = e.subject.part;
        if (!(part instanceof go.Link)) {
            var clickedModuleID = part.data.key; // Module_1
            //clickedModuleID = clickedModuleID.split('_')[1]; // 1
            $(".module").hide();
            $("#"+clickedModuleID).show();
        }
      }
  );*/


    //show the corresponding module details on any module click
  myDiagram.addDiagramListener("ObjectDoubleClicked",
      function(e) {
        var part = e.subject.part;
        if (!(part instanceof go.Link)) {
            var clickedModuleID = part.data.key; // Module_1
            //clickedModuleID = clickedModuleID.split('_')[1]; // 1
            $(".module").hide();
            $("#"+clickedModuleID).show();

            $("#modal_module_configs").css('display', 'block');
        }
      }
  );







  //remove all corresponding module details on background click
  /*myDiagram.addDiagramListener("BackgroundSingleClicked",
      function(e) {
        //$(".module").hide();
        $("#modal_module_configs").css('display', 'none');
      }
  );*/

$(document).on('click', '.close', function(){
    //alert('close clicked');
    $("#modal_module_configs").css('display', 'none');
    $("#myModal").css('display', 'none');

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::MODAL_CLOSED");
});


  //attempting Workflow Diagram Part (link/node) deletion.
  myDiagram.addDiagramListener("SelectionDeleting",
      function(e) {
        //alert("SelectionDeleting");
        for (var iter = myDiagram.selection.iterator; iter.next(); ) {
            var part = iter.value;
            if (part instanceof go.Node) {
                //alert(part.data.key);
                var nodeInfoForRemoval = {'key':part.data.key};
                //delete operation is only successful if this is the current owner.
                //inform other client if only this user is allowed to
                if(part.data.currentOwner == user_email)
                    notifyAll("workflow_obj_selection_node_delete",nodeInfoForRemoval);
            }
            if (part instanceof go.Link) {
                //alert(part.data.from);
                //alert(part.data.topid);
                 var thisPortInput = part.data.to + '_NO_INPUT_SOURCE_SELECTED_' + part.data.topid;
                 var referenceVariable = part.data.topid.split('.')[part.data.topid.split('.').length - 2];
                 thisPortInput = referenceVariable + '="' + WORKFLOW_OUTPUTS_PATH + THIS_WORKFLOW_NAME + '/' +thisPortInput + '"';

                 $("#"+part.data.to + ' .' + referenceVariable).val(thisPortInput).trigger('change');

                //alert("from data ->" +part.data.from);
                var fromNode = myDiagram.findNodeForKey(part.data.from);
                var toNode = myDiagram.findNodeForKey(part.data.to);


                //alert("Deleting Link... From Owner:" + fromNode.data.currentOwner + " To Owner: " + toNode.data.currentOwner);
                //only allow and send this info in case its current owner (both from/to)...
                if(fromNode.data.currentOwner == user_email && toNode.data.currentOwner == user_email){
                    var linkInfoForRemoval = {'from': part.data.from, 'frompid': part.data.frompid, 'to': part.data.to, 'topid': part.data.topid};
                    notifyAll("workflow_obj_selection_link_delete",linkInfoForRemoval);
                }
            }
        }
      }
  );

  //event called on creating new link on the workflow object
  myDiagram.addDiagramListener("LinkDrawn",
      function(e) {
        var part = e.subject.part;
        if (part instanceof go.Link) {
            //alert("Linked From: "+ part.data.from + " To: " + part.data.to);

            //$("#module_id_1 ."+part.data.topid).val("var='this should be new value'");
            //var toModuleId = part.data.to.split('_')[1]; // ie., x in Module_x
            //toModuleId = '#module_id_'+ toModuleId;

            var toPortClass = part.data.topid.split('.')[part.data.topid.split('.').length - 2];
            //var fromPortClass = part.data.frompid.split('.')[part.data.frompid.split('.').length - 2];
            //toPortClass = ' .' + toPortClass;

            $('#'+part.data.to +' .'+toPortClass).val(toPortClass+"='"+ WORKFLOW_OUTPUTS_PATH + THIS_WORKFLOW_NAME + '/' + part.data.from+'_'+part.data.frompid+"'").trigger('change');


            //alert("To " + part.data.to);
            //alert(part.data.topid.split('(')[part.data.topid.split('(').length - 2]);

            var newLinkInformation = {'from': part.data.from, 'frompid': part.data.frompid, 'to': part.data.to, 'topid': part.data.topid};
            notifyAll("workflow_obj_new_link_drawn", newLinkInformation);

        }
      }
  );

  //event called on selection (Node) changes...
  myDiagram.addDiagramListener("SelectionMoved",
      function(e) {
        //alert("Selection Moved");
        for (var iter = myDiagram.selection.iterator; iter.next(); ) {
            var part = iter.value;
            if (part instanceof go.Node) {
                //alert(part.data.key + " x: " + part.location.x + " y: " + part.location.y);
                var nodeNewLocationInformation = {'key': part.data.key, 'x':part.location.x, 'y':part.location.y};
                notifyAll('workflow_obj_selection_moved', nodeNewLocationInformation);
            }
        }

      }
  );





  function lockSubWorkflow(e, obj) {
    var node = obj.part.adornedPart;  // the Node with the context menu
    //alert("Sub-workflow Lock => " + node.data.currentOwner);

    //update the self state
    onNodeAccessRequest(user_email, node.data.key);



    //inform all other clients of this node access
    var requestInfo ={"nodeID":node.data.key, "requestedBy":user_email};
    notifyAll("node_access_request", requestInfo);



    /*
    // compute and remember the distance of each node from the BEGIN node
    distances = findDistances(node);

    // show the distance on each node
    var it = distances.iterator;
    while (it.next()) {
      var n = it.key;
      var dist = it.value;
      console.log(n.data.key +  " => " +  dist);
      //myDiagram.model.setDataProperty(n.data, "distance", dist);
      if(dist != Infinity){
        myDiagram.startTransaction("changed color");
        myDiagram.model.setDataProperty(n.data, "lockStatus", "lightgreen");
        myDiagram.commitTransaction("changed color");
      }


    }*/

  }


  function unlockSubWorkflow(e, obj) {
        var node_id =  obj.part.adornedPart.data.key;
        if(onNodeAccessRelease(node_id, user_email)==true){
            //inform all other clients of this node release
            var requestInfo ={"nodeID":node_id, "requestedBy":user_email};
            notifyAll("node_access_release", requestInfo);

            //on this event change... try dispatching eligible requests
            dispatchNodeRequests();

        }else{
            alert("Could not Release Child Node Access. Please remove the parent node access First!");
        }

  }



  function getThisLockInfo(e, obj) {
    var node = obj.part.adornedPart;  // the Node with the context menu
    //alert("Lock Info => " + node.data.key);
  }



/*
  myDiagram.model.addChangedListener(function(e) {
    if (e.isTransactionFinished) {

      var tx = e.newValue;
      window.console.log(tx);
      //if (tx instanceof go.Transaction && window.console) {
        //window.console.log(tx.name);
        tx.changes.each(function(c) {
          if (c.model) window.console.log("  " + c.toString());
        });
      //}
    }
  });*/
//===========================>>>>>>>>>>>>>>>>>>>>>>>>
// Diagram Events Ends
//===========================>>>>>>>>>>>>>>>>>>>>>>>>


// Returns a Map of Nodes with distance values from the given source Node.
  // Assumes all links are unidirectional.
  function findDistances(source) {
    var diagram = source.diagram;
    // keep track of distances from the source node
    var distances = new go.Map(go.Node, "number");
    // all nodes start with distance Infinity
    var nit = diagram.nodes;
    while (nit.next()) {
      var n = nit.value;
      distances.add(n, Infinity);
    }
    // the source node starts with distance 0
    distances.add(source, 0);
    // keep track of nodes for which we have set a non-Infinity distance,
    // but which we have not yet finished examining
    var seen = new go.Set(go.Node);
    seen.add(source);

    // keep track of nodes we have finished examining;
    // this avoids unnecessary traversals and helps keep the SEEN collection small
    var finished = new go.Set(go.Node);
    while (seen.count > 0) {
      // look at the unfinished node with the shortest distance so far
      var least = leastNode(seen, distances);
      var leastdist = distances.getValue(least);
      // by the end of this loop we will have finished examining this LEAST node
      seen.remove(least);
      finished.add(least);
      // look at all Links connected with this node
      var it = least.findLinksOutOf();
      while (it.next()) {
        var link = it.value;
        var neighbor = link.getOtherNode(least);
        // skip nodes that we have finished
        if (finished.contains(neighbor)) continue;
        var neighbordist = distances.getValue(neighbor);
        // assume "distance" along a link is unitary, but could be any non-negative number.
        var dist = leastdist + 1;  //Math.sqrt(least.location.distanceSquaredPoint(neighbor.location));
        if (dist < neighbordist) {
          // if haven't seen that node before, add it to the SEEN collection
          if (neighbordist === Infinity) {
            seen.add(neighbor);
          }
          // record the new best distance so far to that node
          distances.add(neighbor, dist);
        }
      }
    }

    return distances;
  }

  // This helper function finds a Node in the given collection that has the smallest distance.
  function leastNode(coll, distances) {
    var bestdist = Infinity;
    var bestnode = null;
    var it = coll.iterator;
    while (it.next()) {
      var n = it.value;
      var dist = distances.getValue(n);
      if (dist < bestdist) {
        bestdist = dist;
        bestnode = n;
      }
    }
    return bestnode;
  }

//========================================================
//================ GO CODES ENDS =========================
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
  Tree.prototype.isNodeFloorAvailable = function(nodeData, requestedBy, traversal) {
/*  var theNode = this.getNode(nodeData, traversal);
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
*/

    var node = myDiagram.findNodeForKey(nodeData);
    // compute and remember the distance of each node from the BEGIN node
    var distances3 = findDistances(node);

    var nodeFloorAvailability = true;


    // show the distance on each node
    var it3 = distances3.iterator;
    while (it3.next()) {
          var n = it3.key;
          var dist = it3.value;

          //myDiagram.model.setDataProperty(n.data, "distance", dist);
          if(dist != Infinity){
            //myDiagram.startTransaction("changed color");
            //myDiagram.model.setDataProperty(n.data, "lockStatus", "lightgreen");
            //myDiagram.commitTransaction("changed color");

            //if any of the locked node in the subworkflow is not locked by this owner
            //the node floor is not available
            if( (n.data.isLocked == 'True') && (n.data.currentOwner != requestedBy) )nodeFloorAvailability = false;
            //console.log(n.data.key +  " => " +  n.data.currentOwner);
          }
   }

    return nodeFloorAvailability;

  }

  //someone has got the access to this node, so lock it and all its descendants
  Tree.prototype.lockThisNodeAndDescendants = function(newOwner, nodeData,  traversal) {
    /*var theNode = this.getNode(nodeData, traversal);
    this.traverseDF_FromNode(theNode, function(node){
         //use helper function to load this node for the corresponding user
         lockNode(node, newOwner);
    });*/


        var node = myDiagram.findNodeForKey(nodeData);
        // compute and remember the distance of each node from the BEGIN node
        var distances4 = findDistances(node);


        // show the distance on each node
        var it4 = distances4.iterator;
        while (it4.next()) {
              var n = it4.key;
              var dist = it4.value;

               //alert(n.data.key);

              //myDiagram.model.setDataProperty(n.data, "distance", dist);
              if(dist != Infinity){


                    myDiagram.startTransaction("changed color");
                        myDiagram.model.setDataProperty(n.data, "isLocked", "True");
                        myDiagram.model.setDataProperty(n.data, "currentOwner", newOwner);

                        if(newOwner == user_email)myDiagram.model.setDataProperty(n.data, "lockStatus", "lightgreen");
                        else myDiagram.model.setDataProperty(n.data, "lockStatus", "#FFB2B2");
                    myDiagram.commitTransaction("changed color");
              }
        }

  }




  //someone has released the access to this node, so UNLOCK it and all its descendants
  Tree.prototype.unlockThisNodeAndDescendants = function(releasedBy,  nodeData,  traversal) {
    /*var theNode = this.getNode(nodeData, traversal);
    this.traverseDF_FromNode(theNode, function(node){
         //use the helper function to unlock the node.
         unlockNode(node);
    });*/



    var node = myDiagram.findNodeForKey(nodeData);
    // compute and remember the distance of each node from the BEGIN node
    var distances5 = findDistances(node);


    myDiagram.startTransaction("unlock node");
        // show the distance on each node
        var it5 = distances5.iterator;
        while (it5.next()) {
              var n = it5.key;
              var dist = it5.value;

               //alert(n.data.key);

              //myDiagram.model.setDataProperty(n.data, "distance", dist);
              if(dist != Infinity){
                    myDiagram.model.setDataProperty(n.data, "isLocked", "False");
                    myDiagram.model.setDataProperty(n.data, "currentOwner", "NULL");
                    //if(newOwner == user_email)myDiagram.model.setDataProperty(n.data, "lockStatus", "lightgreen");
                    //else myDiagram.model.setDataProperty(n.data, "lockStatus", "#FFB2B2");
                    //myDiagram.model.setDataProperty(n.data, "lockStatus", "white");
              }
        }
    myDiagram.commitTransaction("unlock node");

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





//create parent workflow at the starting
var workflow = new Tree("workflow_root");

//source code in pre tag... toggle show/hide
$(document).on('click', ".code_show_hide", function () {//here
    $(this).siblings('.pre_highlighted_code').children(".highlighted_code").toggle(1000);
});

$(document).on('click', ".documentation_show_hide", function () {//here
    $(this).siblings('.documentation').toggle(300);

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::DOCUMENTATION_TOGGLED");
});

$(document).on('click', ".settings_show_hide" ,function () {//here
    $(this).siblings('.settings').toggle(300);
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::SETTINGS_TOGGLED");
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
    //if(isItMyFloor() == true){

    //var node = myDiagram.findNodeForKey(nodeData);

    var myParent = $(this).closest(".module");

    var node = myDiagram.findNodeForKey(myParent.attr('id'));


    if(node != null) {
        //this user is the owner of this particular node
        if(node.data.currentOwner == user_email){
            var elementInfo = "#" + myParent.attr('id') + "  .setting_param";
            var paramIndex = $(this).index(elementInfo);
            var newParamValue = $(this).val();
            var changeInfo = {"elementInfo": elementInfo, "paramIndex": paramIndex, "newParamValue": newParamValue, "isResourceDiscoveryField": $(this).hasClass('enableResourceDiscovery') };
            notifyAll("moduleSettingsChanged", changeInfo);
        }

    } //alert(node.data.currentOwner);




    //}

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::SETTINGS_CHANGED");

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

//For Dynamic Resource Discovery
$(document).on("focus",".enableResourceDiscovery", function(){

    $(this).html('');

    discoverResources(this, $(this).attr('referenceVariable'), THIS_WORKFLOW_NAME);
    /*$(this).append($('<option>', {
            value: $(this).attr('referenceVariable'),
            text: 'My option'
    }));*/

});





function discoverResources(domElement,referenceVariable,workflow_id){
	var thisWorkflowID = workflow_id;

	//get the ouput list via async call
    	$.ajax({
		type: "POST",
		cache: false,
		url: "/get_workflow_outputs_list/",
		data: "workflow_id="+thisWorkflowID,
		success: function (option) {
			//$("#workflow_outputs").html("");
			for(var i=0;i<option['workflow_outputs_list'].length;i++){
				//var k = i+1;
				//$("#workflow_outputs").html("");
				$(domElement).append($('<option>', {
                    value: referenceVariable+'="'+WORKFLOW_OUTPUTS_PATH+workflow_id+'/'+option['workflow_outputs_list'][i]+'"',
                    text: option['workflow_outputs_list'][i]
                }));

				//$("#workflow_outputs").append("<a href='/file_download?workflow_id=" + thisWorkflowID +"&file_id=" + option['workflow_outputs_list'][i]+"' class='a_workflow_output' id='"+option['workflow_outputs_list'][i] +"'>"  + option['workflow_outputs_list'][i] + "</a><br/>");
			}

		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}

    	});


}


var jobStatus_activeNode = '';//IMPORTANT for job status SHOWING

ref_getJobStatus = '';
function getJobStatus(){

    var thisWorkflowID = 'test_workflow';
    $.ajax({
    type: "POST",
    cache: false,
    url: "/workflow_get_job_states/",
    data: "workflow_id="+thisWorkflowID,
    success: function (option) {
        //alert(option.jobStates);
        for(var i=0;i<option.jobStates.length;i++){

            var jobNode = myDiagram.findNodeForKey(option.jobStates[i]['jobID']);
            jobNodeShape = jobNode.findObject("jobStatus");

            if(parseInt(option.jobStates[i]['jobStatus']) == 0){
                jobNodeShape.fill = "#FFFFFF";
            }else if(parseInt(option.jobStates[i]['jobStatus']) == 1){
                jobNodeShape.fill = "#FF8C00";
                jobStatus_activeNode = jobNodeShape;

            }else if(parseInt(option.jobStates[i]['jobStatus']) == 2){
                jobNodeShape.fill = "#008800";
            }else{
                jobNodeShape.fill = "#880000";
            }
        }
    },
    error: function (xhr, status, error) {
            alert(xhr.responseText);
    }

    });

}

ref_showJobStatus = ''
var odd = false;
function showJobStatus(){
    if(odd == false){
        jobStatus_activeNode.height = 15;
        jobStatus_activeNode.width = 15;
        odd = true;
    }
    else{
        jobStatus_activeNode.height = 13;
        jobStatus_activeNode.width = 13;
        odd = false;
    }
}




$("#run_workflowNEW").click(function(){
    //alert("new workflow run");

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::RUN_WORKFLOW");

    //ref_getAndShowJobStatus = setInterval(getAndShowJobStatus, 500);

    $("#pr_status").html("<span style='color:orange'>Running Pipeline...</span>");
    //$(this).prop("disabled", true);

    var jobDefinition = [];

    $('.module').each(function(){
        var thisModID = $(this).attr('id');
        var dataDependecnyList = [];
        var sourceCode = '';

        $('#'+thisModID+' .module_input').each(function(){
            //alert($(this).val().split('=')[1]);
            dataDependecnyList.push($(this).val().split('=')[1]);
        });

        $('#'+thisModID+' textarea').each(function(){
            sourceCode = sourceCode + "\n" +$(this).val();
        });
        //sourceCode = encodeURIComponent(String(sourceCode));

        var thisJobDefinition = {'moduleID': thisModID, 'dataDependecnyList': dataDependecnyList, 'sourceCode': sourceCode};

        jobDefinition.push(thisJobDefinition);

    });


    //alert(JSON.stringify(jobDefinition));
    $.ajax({
        type: "POST",
        cache: false,
        url: "/workflow_job_manager/",
        data: JSON.stringify({ 'jobDefinition' : jobDefinition }),
        dataType: "json",
        contentType: 'application/json;charset=UTF-8',
        success: function (option) {

            //alert(option);
            //get_workflow_outputs_list('test_workflow');
            //$("#pr_status").html("<span style='color:green'>Pipeline Completed Running Successfully.</span>");

            //alert('Success');
            //alert(option);
            get_workflow_outputs_list('test_workflow');
            $("#pr_status").html("<span style='color:green;background-color:yellow;'>Pipeline Completed Running Successfully.</span>");

            //
            //$(this).prop("disabled", false);

            clearInterval(ref_getJobStatus);
            clearInterval(ref_showJobStatus);

            getJobStatus();
            showJobStatus();

            alert('Pipeline Completed Running Successfully.');

        },
        error: function (xhr, status, error) {
            //alert(xhr.responseText);
            //clearInterval(ref_getAndShowJobStatus);
            //$(this).prop("disabled", false);
            $("#pr_status").html("<span style='color:red'>Pipeline Running Failed!!!</span>");
        }

    });


    ref_getAndShowJobStatus = setInterval(getJobStatus, 500);
    ref_showJobStatus = setInterval(showJobStatus, 300);


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
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@UserStudy
    //console.log('@USER_STUDY::'+$.trim(user_email)+"::WORKFLOW_SAVED");

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


function onModuleParentChange(moduleID, newParentID, parentIndex){
        //change the view on this client...
        $("#"+moduleID+" .setting_param_parent").eq(parseInt(parentIndex)).val(newParentID);

        //change the object strcuture
        workflow.changeParent(moduleID, newParentID, workflow.traverseDF);

        //redraw the workflow structure based on this update
       // redrawWorkflowStructure();
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
    /*var theNode = workflow.getNode(parentNodeData, workflow.traverseDF);
    workflow.traverseDF_FromNode(theNode, function(node){
          lockParamsSettings(node.data);

          //change node access btn... so he can request the access for the node later
          changeRequestBtnState(node.data, "Request Node Access", false, true);
    });*/


    var node = myDiagram.findNodeForKey(parentNodeData);
    // compute and remember the distance of each node from the BEGIN node
    var distances2 = findDistances(node);

    var nodeFloorAvailability = true;

    myDiagram.startTransaction("nodeReadOnly");
        // show the distance on each node
        var it2 = distances2.iterator;
        while (it2.next()) {
              var n = it2.key;
              var dist = it2.value;

              //myDiagram.model.setDataProperty(n.data, "distance", dist);
              if(dist != Infinity){
                //alert("@updateView_lockThisNodeAndDescendants");
                    //alert("READONLY =>" + n.data.key);
                    myDiagram.model.setDataProperty(n.data, "allowNodeMovability", false);
                    myDiagram.model.setDataProperty(n.data, "allowNodeDeletion", false);

                    if(n.data.currentOwner == "NULL")myDiagram.model.setDataProperty(n.data, "lockStatus", "white");//currently no one owns this node
                    else myDiagram.model.setDataProperty(n.data, "lockStatus", "#FFB2B2");//someone has the access to this node

                    var it = n.findLinksOutOf();
                    while (it.next()) {
                        var link = it.value;
                        //alert("link data => " + link.data);
                        //alert("link key => " + link.key);
                        myDiagram.model.setDataProperty(link.data, "allowLinkDeletion", false);
                    }

                //if any of the locked node in the subworkflow is not locked by this owner
                //the node floor is not available
                //if( (n.data.isLocked == 'True') && (n.data.currentOwner != requestedBy) )nodeFloorAvailability = false;
                //console.log(n.data.key +  " => " +  n.data.currentOwner);
              }
        }

   myDiagram.commitTransaction("nodeReadOnly");


}




//This client has got the access for the node and its descendants
//so unlock the nodes.... and change the request btn state as well
function updateView_unlockThisNodeAndDescendants(parentNodeData){
    /*var theNode = workflow.getNode(parentNodeData, workflow.traverseDF);
    workflow.traverseDF_FromNode(theNode, function(node){
          unlockParamsSettings(node.data);

          //change node access btn...
          //this client is currently using these nodes... so change state for release node Access
          //hide it for all the children nodes
          changeRequestBtnState(node.data, "Release Node Access", true, false);
    });

    //only for the parent show/able the release node access btn
    changeRequestBtnState(parentNodeData, "Release Node Access", false, true);*/



    var node = myDiagram.findNodeForKey(parentNodeData);
    // compute and remember the distance of each node from the BEGIN node
    var distances6 = findDistances(node);

    var nodeFloorAvailability = true;

    myDiagram.startTransaction("nodeReadWrite");
    // show the distance on each node
    var it6 = distances6.iterator;
    while (it6.next()) {
          var n = it6.key;
          var dist = it6.value;

          //myDiagram.model.setDataProperty(n.data, "distance", dist);
          if(dist != Infinity){
            //alert("@updateView_lockThisNodeAndDescendants");
                //alert("READONLY =>" + n.data.key);
                myDiagram.model.setDataProperty(n.data, "allowNodeMovability", true);
                myDiagram.model.setDataProperty(n.data, "allowNodeDeletion", true);

                //if(n.data.currentOwner == "NULL")myDiagram.model.setDataProperty(n.data, "lockStatus", "white");//currently no one owns this node
                //else myDiagram.model.setDataProperty(n.data, "lockStatus", "#FFB2B2");//someone has the access to this node

                //currently owned by this user...
                myDiagram.model.setDataProperty(n.data, "lockStatus", "lightgreen");


                var it = n.findLinksOutOf();
                while (it.next()) {
                    var link = it.value;
                    //alert("link data => " + link.data);
                    //alert("link key => " + link.key);
                    myDiagram.model.setDataProperty(link.data, "allowLinkDeletion", true);
                }

            //if any of the locked node in the subworkflow is not locked by this owner
            //the node floor is not available
            //if( (n.data.isLocked == 'True') && (n.data.currentOwner != requestedBy) )nodeFloorAvailability = false;
            //console.log(n.data.key +  " => " +  n.data.currentOwner);
          }
   }

   myDiagram.commitTransaction("nodeReadWrite");









}





//adds the module to the pipeline. moduleID is unique throughout the whole pipeline
//moduleName is the name of the module like: rgb2gray, medianFilter and so on
function addModuleToPipeline(whoAdded, moduleID, moduleName){

        var module_name = '';
        var documentation = '';
        var moduleSourceCode_settings = '';
        var moduleSourceCode_main = '';
        var moduleSourceCode_html = '';

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

                //Parse the givn XML for tool definition
                var xmlDoc = $.parseXML( moduleSourceCode_html );
                var $xml_tool_definition = $(xmlDoc);

                //the tool configuration.
                //TODO: add the input port info.
                var tool_configs = $xml_tool_definition.find("toolConfigurations");
                tool_configs = tool_configs.html();



                var tool_documentation = $xml_tool_definition.find("toolDocumentation");
                tool_documentation = tool_documentation.html();


                var ioInformation = '';

                var $toolInput = $xml_tool_definition.find("toolInput");

                $toolInput.each(function(){

                    var label = $(this).find('label').text(),
                        dataFormat = $(this).find('dataFormat').text(),
                        referenceVariable = $(this).find('referenceVariable').text();

                        ioInformation +=  '<input type="text" style="display:none;" class="setting_param module_input '+ referenceVariable + '" ' + ' size="45"/>';


                });


                var $toolOutput = $xml_tool_definition.find("toolOutput");

                $toolOutput.each(function(){

                    var label = $(this).find('label').text(),
                        dataFormat = $(this).find('dataFormat').text(),
                        referenceVariable = $(this).find('referenceVariable').text();

                    //var thisPortOutput = 'module_id_' + moduleID + '_' + referenceVariable+'.' + dataFormat;
                    //var thisPortOutputPath = referenceVariable + '="' + thisPortOutput + '"';

                    ioInformation += '<input type="text" style="display:none;" class="setting_param module_output '+ referenceVariable + '" size="45"/>';


                });







//Parse the givn XML
//var xmlDoc = $.parseXML( xml );

//var $xml = $(xmlDoc);

  // Find Person Tag
//var $person = $xml.find("toolConfigurations");


                //append new module to the pipeline...
                $("#img_processing_screen").append(
                    '<div style="background-color:#EEE;width:100%;" class="module" id="module_id_'+ moduleID +'">' +

                '<!-- Documentation -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                  ' ' + module_name +  ' (Module ' + moduleID + ')'+ '<hr/>' +
                   ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                    '<div class="documentation" style="background-color:#DDDDDD;display:none;font-size:14px;">' + tool_documentation + '</div>' +
                '</div>' +


                '<!-- Settings -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                 '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
                 '   <div class="settings" style="background-color:#DDDDDD;font-size:14px;">' + tool_configs + '<br/>' + ioInformation +
                        '<input type="hidden" class="setting_param " size="45" id="module_id_'+ moduleID +'_output_destination" />'+
                    '</div>' +
                '</div>' +


                '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
                '    <a style="display:none;font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' + user_role_based_edit +

                 '   <div class="edit_code" style="background-color:#888888;font-size:14px;display:none;">' +
                  '          <textarea rows=7 cols=150 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
                   '         <p style="color:#000000;">Main Implementation: </p>' +
                    '        <textarea rows=10 cols=150>' + moduleSourceCode_main + '</textarea>' +
                    '</div>' +

                   ' <pre style="background-color:#333333;width:100%;display:none;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
                   ' ' +
                moduleSourceCode_main + '</code></pre>' +

               ' </div>' +

                '</div>'


            );//end of append




            //if I did not added this module... lock the param settings...
            if(whoAdded != user_email){
                var modID = "module_id_"+moduleID;
                lockParamsSettings(modID);
            }




            $("#module_id_"+ moduleID + "_output_destination").val("output_destination = '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/Module_" + moduleID + "'").trigger('change');











            var listOfInputPorts = [];
            var listOfOutputPorts = [];



             //input port definition
            var $toolInput = $xml_tool_definition.find("toolInput");

            $toolInput.each(function(){

                var label = $(this).find('label').text(),
                    dataFormat = $(this).find('dataFormat').text(),
                    referenceVariable = $(this).find('referenceVariable').text();

                //$("#ProfileList" ).append('<li>' +label+ ' - ' +dataFormat+ ' - ' + idn +'</li>');

                var aNewInputPort = makePort(dataFormat,referenceVariable,true);
                listOfInputPorts.push(aNewInputPort);



                 var thisPortInput = 'module_id_' + moduleID + '_NO_INPUT_SOURCE_SELECTED_.' + dataFormat;
                 thisPortInput = referenceVariable + '="' + WORKFLOW_OUTPUTS_PATH + THIS_WORKFLOW_NAME + '/' +thisPortInput + '"';

                 $("#module_id_"+moduleID + ' .' + referenceVariable).val(thisPortInput).trigger('change');

            });





             //output port definition
            var $toolOutput = $xml_tool_definition.find("toolOutput");

            $toolOutput.each(function(){

                var label = $(this).find('label').text(),
                    dataFormat = $(this).find('dataFormat').text(),
                    referenceVariable = $(this).find('referenceVariable').text();

                //$("#ProfileList" ).append('<li>' +label+ ' - ' +dataFormat+ ' - ' + idn +'</li>');

                var aNewOutputPort = makePort(dataFormat,referenceVariable,false);
                listOfOutputPorts.push(aNewOutputPort);


                 var thisPortOutput = 'module_id_' + moduleID + '_' + referenceVariable+'.' + dataFormat;
                 thisPortOutput = referenceVariable + '="' + WORKFLOW_OUTPUTS_PATH + THIS_WORKFLOW_NAME + '/' +thisPortOutput + '"';

                 $("#module_id_"+moduleID + ' .' + referenceVariable).val(thisPortOutput).trigger('change');

            });





            makeTemplate(moduleName,"images/55x55.png", "white",
                 listOfInputPorts,
                 listOfOutputPorts);






            //Update the DAG
            //var newWorkflowModule = workflow.add("module_id_"+moduleID, "workflow_root", workflow.traverseDF);
            //newWorkflowModule.nodeName = moduleName;
            //redrawWorkflowStructure();


            //alert("Add");
            myDiagram.startTransaction("add node");
            // have the Model add the node data
            var newnode = {"key":"module_id_" + moduleID, "type":moduleName, "name":moduleName, "module_id": "Module "+moduleID, "isLocked":"True", "currentOwner": whoAdded};
            myDiagram.model.addNodeData(newnode);
            // locate the node initially where the parent node is
            //diagram.findNodeForData(newnode).location = node.location;
            // and then add a link data connecting the original node with the new one
            //var newlink = { from: node.data.key, to: newnode.key };
            //diagram.model.addLinkData(newlink);
            // finish the transaction -- will automatically perform a layout
            myDiagram.commitTransaction("add node");


            var addedNode = myDiagram.findNodeForKey("module_id_" + moduleID);

            myDiagram.startTransaction("change color");
                if(whoAdded == user_email)myDiagram.model.setDataProperty(addedNode.data, "lockStatus", "lightgreen");
                else myDiagram.model.setDataProperty(addedNode.data, "lockStatus", "#FFB2B2");
            myDiagram.commitTransaction("change color");


            if(whoAdded == user_email){
                updateView_unlockThisNodeAndDescendants("module_id_" + moduleID);//unlock for this client
            }else{
                updateView_lockThisNodeAndDescendants("module_id_" + moduleID);//lock this node and its descendants for this client.
            }



            //if(isItMyFloor() == false)lockParamsSettings();

                /*$('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });*/


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

        if(workflow.isNodeFloorAvailable(requestInfo.nodeID, requestInfo.requestedBy, workflow.traverseDF)==true){
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
    /*var theNode = workflow.getNode(nodeID, workflow.traverseDF);
    if(theNode){
        if(theNode.parent.isLocked == true)throw new Error('Could not Release Child Node. Must release the parent node first.!');
        //unlock the node and its descendants....
        workflow.unlockThisNodeAndDescendants(theNode.data, workflow.traverseDF);

        //update the view... lock its view
        updateView_lockThisNodeAndDescendants(nodeID);

        //update the workflow structure view
        //redrawWorkflowStructure();

        //the nodes released successfully.
        return true;

    }else{
        throw new Error('Node does not exist to Release!!!');
    }

    //update the workflow structure view
    //redrawWorkflowStructure();

    return false;
    */



    workflow.unlockThisNodeAndDescendants(releasedBy, nodeID, workflow.traverseDF);

    //update the view... lock its view
    updateView_lockThisNodeAndDescendants(nodeID);


    return true;
}


//someone requested access to a node
function onNodeAccessRequest(requestedBy, nodeID){

    //if the requested node floor is available, give access to the requester
    if(workflow.isNodeFloorAvailable(nodeID, requestedBy, workflow.traverseDF) == true){
        //alert("Node Access Available...");
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
    //redrawWorkflowStructure();
}


/*
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
*/

//this function is invoked on new module addition request
function onWorkflowModuleAdditionRequest(whoAdded, moduleID, moduleName){

    if(getNextUniqueModuleID() != moduleID){
        throw new Error('Synchronization Problem. Module IDs are not consistent over the network !!!');
    }else{
        //if synchronization is ok... add this node to the workflow
        addModuleToPipeline(whoAdded,moduleID, moduleName);

        //add the node to the workflow tree, default parent is 'workflow_root'
        var addedNode = workflow.add("module_id_"+moduleID, "workflow_root", workflow.traverseDF);
        //by default the newly added node/module is locked by its creater (unless he releases it)
        lockNode(addedNode, whoAdded);


        //prepare the next valid unique module id
        updateNextUniqueModuleID();

        //finally redraw the workflow structure (tree view)
        //redrawWorkflowStructure();
    }
}




$(document).on("click", ".pipeline_modules" ,function(){
        //alert("New Module");
        //@@@@@@@@@@@@@@@@@@@@@@@@@@@
        //@UserStudy
        //console.log('@USER_STUDY::'+$.trim(user_email)+"::MODULE_ADDED");

        var newModuleID = getNextUniqueModuleID();
        var newModuleName = $(this).attr("id"); //'biodatacleaning';

        //add the module to self...
        onWorkflowModuleAdditionRequest(user_email, newModuleID, newModuleName);


        //add the module to all remote clients as well...
        var moduleInfo = {"whoAdded":user_email, "newModuleID": newModuleID, "newModuleName": newModuleName};
        notifyAll("remote_module_addition", moduleInfo);


});








//========================================================
//============= WORKFLOW CONTROL CODE ENDS ===============
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
				var thisFileName = option['workflow_outputs_list'][i];
				var visulaizationLink = '';
				if(thisFileName.split('.').length>0){
				    var thisFileType = thisFileName.split('.')[thisFileName.split('.').length - 1];
				    if(thisFileType == 'html' || thisFileType == 'htm' || thisFileType == 'xml' || thisFileType == 'txt' || thisFileType == 'java' || thisFileType == 'token'){//currently supported file types for visualization.
				        visulaizationLink = "<a style='color:white;font-size:11px;' href='#' class='output_vis' viewid='"+ option['workflow_outputs_list'][i] +"'> (View) </a>";
				    }
				}



				$("#workflow_outputs").append(visulaizationLink + "<a href='/file_download?workflow_id=" + thisWorkflowID +"&file_id=" + option['workflow_outputs_list'][i]+"' class='a_workflow_output' id='"+option['workflow_outputs_list'][i] +"'>"  + option['workflow_outputs_list'][i] + "</a><br/>");
			}

		},
		error: function (xhr, status, error) {
	    		alert(xhr.responseText);
		}

    	});


}

get_workflow_outputs_list('test_workflow');

function showTab(tabID){

    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabID).style.display = "block";
    //evt.currentTarget.className += " active";
    document.getElementById(tabID).click();
}



$(document).on('click', '.output_vis', function(){
    $("#tool_vis_file_title").text(">>Loading...");

    $('.tool_vis_content').hide();

    var fileName = $(this).attr('viewid');

    showTab('tool_vis');

    $("#myModal").css('display', 'block');

    var fileType = fileName.split('.')[fileName.split('.').length - 1];

    $.ajax({
        type: "POST",
        cache: false,
        url: "/load_output_for_visualization",
        data: 'fileName=' + fileName,
        success: function (option) {
            $("#tool_vis_file_title").text(">>" + fileName);

            if(fileType=='png' || fileType=='jpg'){
                $("#pre_id").hide();
                $("#tool_vis_image").attr('src', 'data:image/png;base64,' + option.output );
                $("#tool_vis_image").show();
            }
            else if(fileType=='xml' || fileType=='txt' || fileType=='java' || fileType=='token'){
                $("#tool_vis_txt").text(option.output);
                $('pre code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
                $("#pre_id").show();
                $("#tool_vis_txt").show();
            }
            else if(fileType=='htm' || fileType=='html'){
                $("#pre_id").hide();
                $("#tool_vis_iframe").attr('src', 'data:text/html;charset=utf-8,' + encodeURIComponent(option.output));
                $("#tool_vis_iframe").show();
            }


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });



});




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
